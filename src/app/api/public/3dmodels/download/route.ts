import { NextRequest, NextResponse } from 'next/server';
import { createError, handleApiError } from '@/lib/errorHandler';

const ALLOWED_HOSTS = [
  'res.cloudinary.com',
  'cloudinary.com',
];

function isAllowedUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'https:') return false;
    return ALLOWED_HOSTS.some(host => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 255);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const filename = searchParams.get('filename');
    
    if (!url || !filename) {
      throw createError.validation('URL ve dosya adı gerekli');
    }

    if (!isAllowedUrl(url)) {
      throw createError.validation('Yalnızca Cloudinary URL\'leri desteklenmektedir');
    }

    const safeFilename = sanitizeFilename(filename);

    const response = await fetch(url);
    
    if (!response.ok) {
      throw createError.notFound('Dosya bulunamadı');
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Content-Length': buffer.byteLength.toString(),
      },
    });

  } catch (error) {
    return handleApiError(error as Error, request);
  }
}