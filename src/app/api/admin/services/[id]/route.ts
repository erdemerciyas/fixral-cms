import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Service from '@/models/Service';
import connectDB from '@/lib/mongoose';
import slugify from 'slugify';

/**
 * GET /api/admin/services/[id] - Get single service
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const service = await Service.findById(params.id);

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Hizmet bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { success: false, error: 'Hizmet yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/services/[id] - Update service
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();

    const updateData: Record<string, any> = { ...body, updatedAt: new Date() };

    if (body.title && !body.slug) {
      const slugBase = slugify(body.title, { lower: true, strict: true, replacement: '-' });
      updateData.slug = `${slugBase}-${Date.now()}`;
    }

    const service = await Service.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    );

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Hizmet bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { success: false, error: 'Hizmet güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/services/[id] - Delete service
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const service = await Service.findByIdAndDelete(params.id);

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Hizmet bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Hizmet başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { success: false, error: 'Hizmet silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
