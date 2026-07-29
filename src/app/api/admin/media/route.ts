export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { withSecurity, SecurityConfigs } from '../../../../lib/security-middleware';

interface CloudinaryResource {
  public_id: string;
  display_name?: string;
  secure_url: string;
  bytes: number;
  format?: string;
  resource_type: string;
  created_at: string;
  width?: number;
  height?: number;
  asset_folder?: string;
}

interface MediaItem {
  _id?: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  uploader?: string;
  source?: 'cloudinary' | 'local';
  publicId?: string;
  folder: string;
  resourceType: string;
  width?: number;
  height?: number;
  format?: string;
}

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Raw dosyalar için uzantıya göre mime tipi tahmini
const RAW_MIME_MAP: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip: 'application/zip',
  stl: 'model/stl',
  obj: 'model/obj',
  glb: 'model/gltf-binary',
  gltf: 'model/gltf+json',
  json: 'application/json',
  txt: 'text/plain',
};

function resolveMimeType(resource: CloudinaryResource): string {
  const format = (resource.format || resource.public_id.split('.').pop() || '').toLowerCase();
  if (resource.resource_type === 'image') return `image/${format || 'jpeg'}`;
  if (resource.resource_type === 'video') return `video/${format || 'mp4'}`;
  return RAW_MIME_MAP[format] || 'application/octet-stream';
}

function resolveFolder(publicId: string): string {
  const idx = publicId.lastIndexOf('/');
  return idx === -1 ? '' : publicId.substring(0, idx);
}

// Belirtilen resource_type için TÜM kayıtları next_cursor ile sayfalayarak çeker
async function fetchAllResources(resourceType: 'image' | 'video' | 'raw'): Promise<CloudinaryResource[]> {
  const all: CloudinaryResource[] = [];
  let nextCursor: string | undefined;
  let page = 0;
  const MAX_PAGES = 20; // güvenlik sınırı: 20 x 500 = 10.000 kayıt / tip

  do {
    const result = await cloudinary.api.resources({
      resource_type: resourceType,
      type: 'upload',
      max_results: 500,
      next_cursor: nextCursor,
    });

    if (Array.isArray(result.resources)) {
      all.push(...result.resources);
    }
    nextCursor = result.next_cursor;
    page += 1;
  } while (nextCursor && page < MAX_PAGES);

  return all;
}

// GET - List ALL media files from Cloudinary (image + video + raw, full pagination)
export const GET = withSecurity(SecurityConfigs.admin)(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    // Opsiyonel klasör kapsaması: ?folder=fixral/portfolio
    const folderFilter = (searchParams.get('folder') || '').replace(/\/+$/, '');

    const resourceTypes: Array<'image' | 'video' | 'raw'> = ['image', 'video', 'raw'];
    const settled = await Promise.allSettled(resourceTypes.map(fetchAllResources));

    const resources: CloudinaryResource[] = [];
    settled.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        resources.push(...result.value);
      } else {
        console.error(`[Media] Cloudinary ${resourceTypes[index]} listing failed:`, result.reason);
      }
    });

    const mediaItems: MediaItem[] = [];

    for (const resource of resources) {
      const folder = resolveFolder(resource.public_id);

      if (folderFilter && folder !== folderFilter && !folder.startsWith(`${folderFilter}/`)) {
        continue;
      }

      const fileName = resource.display_name || resource.public_id.split('/').pop() || resource.public_id;

      mediaItems.push({
        _id: resource.public_id,
        filename: fileName,
        originalName: fileName,
        url: resource.secure_url,
        size: resource.bytes || 0,
        mimeType: resolveMimeType(resource),
        uploadedAt: new Date(resource.created_at),
        uploader: 'cloudinary',
        source: 'cloudinary',
        publicId: resource.public_id,
        folder,
        resourceType: resource.resource_type,
        width: resource.width,
        height: resource.height,
        format: resource.format,
      });
    }

    mediaItems.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return NextResponse.json({
      items: mediaItems,
      totalCount: mediaItems.length,
      baseFolder: process.env.CLOUDINARY_FOLDER || 'personal-blog',
    });
  } catch (error) {
    console.error('❌ Media listing error:', error);
    return NextResponse.json({ error: 'Failed to list media files' }, { status: 500 });
  }
});

// DELETE - Delete selected media files
export const DELETE = withSecurity(SecurityConfigs.admin)(async (request: NextRequest) => {
  try {
    const { mediaIds } = await request.json();

    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      return NextResponse.json({ error: 'No media IDs provided' }, { status: 400 });
    }

    const deletedFiles: string[] = [];
    const errors: string[] = [];

    for (const mediaId of mediaIds) {
      try {
        // Cloudinary'den sil
        // Try different resource types since we might not know the exact type
        const resourceTypes = ['image', 'video', 'raw'];
        let deletionResult: any = { result: 'not found' };

        for (const type of resourceTypes) {
          try {
            const result = await cloudinary.uploader.destroy(mediaId, {
              resource_type: type,
              invalidate: true
            });

            if (result.result === 'ok') {
              deletionResult = result;
              break; // Stop if deleted successfully
            }
          } catch (innerError) {
            console.error(`Failed to delete as ${type}:`, innerError);
          }
        }

        if (deletionResult.result === 'ok' || deletionResult.result === 'not found') {
          deletedFiles.push(mediaId);
        } else {
          errors.push(`Failed to delete from Cloudinary: ${mediaId}`);
        }
      } catch (error) {
        console.error(`Error deleting file ${mediaId}:`, error);
        errors.push(`Failed to delete: ${mediaId}`);
      }
    }

    return NextResponse.json({
      success: true,
      deletedFiles,
      errors,
      message: `${deletedFiles.length} file(s) deleted successfully`
    });

  } catch (error) {
    console.error('Media deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete media files' }, { status: 500 });
  }
});
