import { v2 as cloudinary } from 'cloudinary';
import { logger } from '@/core/lib/logger';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Add validation
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  logger.error('Cloudinary configuration missing in lib', 'ERROR', {
    cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
    api_key: !!process.env.CLOUDINARY_API_KEY,
    api_secret: !!process.env.CLOUDINARY_API_SECRET,
  });
}

export const uploadImage = async (file: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: 'portfolio'
    });

    return result.secure_url;
  } catch (error) {
    // Image upload error
    logger.error('Cloudinary image upload failed in lib', 'ERROR', { error });
    throw new Error('Resim yüklenemedi');
  }
};

export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    // Image delete error
    logger.error('Cloudinary image delete failed in lib', 'ERROR', { error });
    throw new Error('Resim silinemedi');
  }
};

// 3D Model upload fonksiyonu
export const upload3DModel = async (file: string, fileName: string): Promise<{ url: string; publicId: string; size: number }> => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: 'fixral_3d_models',
      resource_type: 'raw',
      public_id: fileName,
      use_filename: true,
      unique_filename: false,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      size: result.bytes,
    };
  } catch (error) {
    logger.error('Cloudinary 3D model upload failed in lib', 'ERROR', { error });
    throw new Error('3D model yüklenemedi');
  }
};

// 3D Model silme fonksiyonu
export const delete3DModel = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  } catch (error) {
    logger.error('Cloudinary 3D model delete failed in lib', 'ERROR', { error });
    throw new Error('3D model silinemedi');
  }
};

// 3D Model listesi alma fonksiyonu
export const list3DModels = async (): Promise<any[]> => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'fixral_3d_models/',
      resource_type: 'raw',
      max_results: 100,
    });

    return result.resources;
  } catch (error) {
    logger.error('Cloudinary 3D models list failed in lib', 'ERROR', { error });
    throw new Error('3D model listesi alınamadı');
  }
};

/**
 * News Module Cloudinary Functions
 */

export interface NewsImageUploadOptions {
  folder?: string;
  width?: number;
  height?: number;
  crop?: string;
}

/**
 * Upload news featured image with responsive variants
 */
export const uploadNewsImage = async (
  file: string,
  options: NewsImageUploadOptions = {}
): Promise<{ url: string; publicId: string; altText: string }> => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: options.folder || 'fixral_news',
      transformation: [
        {
          width: options.width || 1200,
          height: options.height || 630,
          crop: options.crop || 'fill',
          quality: 'auto',
          fetch_format: 'auto',
        },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      altText: result.original_filename || 'News article image',
    };
  } catch (error) {
    logger.error('Cloudinary news image upload failed', 'CLOUDINARY', { error });
    throw new Error('News image upload failed');
  }
};

/**
 * Delete news image
 */
export const deleteNewsImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error('Cloudinary news image delete failed', 'CLOUDINARY', { error });
    throw new Error('News image delete failed');
  }
};

/**
 * Generate responsive image URL for news
 */
export const getResponsiveNewsImageUrl = (publicId: string, width: number, height: number): string => {
  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto',
  });
};

/**
 * Backup helpers — full account listing & buffer re-upload
 */

export interface BackupCloudinaryResource {
  public_id: string;
  secure_url: string;
  resource_type: 'image' | 'video' | 'raw';
  format?: string;
  bytes: number;
  created_at: string;
}

/**
 * List ALL resources of a given type using Admin API cursor pagination
 */
export const listAllCloudinaryResources = async (
  resourceType: 'image' | 'video' | 'raw'
): Promise<BackupCloudinaryResource[]> => {
  const all: BackupCloudinaryResource[] = [];
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
      for (const r of result.resources) {
        all.push({
          public_id: r.public_id,
          secure_url: r.secure_url,
          resource_type: resourceType,
          format: r.format,
          bytes: r.bytes || 0,
          created_at: r.created_at,
        });
      }
    }
    nextCursor = result.next_cursor;
    page += 1;
  } while (nextCursor && page < MAX_PAGES);

  return all;
};

/**
 * Upload a raw buffer back to Cloudinary preserving the original public_id
 * (used by backup restore so existing DB URLs keep working)
 */
export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  publicId: string,
  resourceType: 'image' | 'video' | 'raw'
): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: resourceType,
        overwrite: true,
        invalidate: true,
      },
      (error) => (error ? reject(error) : resolve())
    );
    stream.end(buffer);
  });
};

export const isCloudinaryConfigured = (): boolean =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

/**
 * Generate Cloudinary upload signature for client-side uploads
 */
export const generateUploadSignature = (timestamp: number): { signature: string; timestamp: number } => {
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: 'fixral_news',
    },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
  };
};