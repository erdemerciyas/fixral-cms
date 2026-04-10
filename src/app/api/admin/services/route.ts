import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Service from '@/models/Service';
import connectDB from '@/lib/mongoose';
import slugify from 'slugify';

/**
 * GET /api/admin/services - List all services for admin
 */
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const services = await Service.find()
      .sort({ order: 1, createdAt: -1 });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/services - Create a new service
 */
export async function POST(req: NextRequest) {
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

    if (!body.title?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Başlık alanı zorunludur' },
        { status: 400 }
      );
    }

    const slugBase = slugify(body.title, { lower: true, strict: true, replacement: '-' });
    const slug = body.slug || `${slugBase}-${Date.now()}`;

    const service = new Service({
      ...body,
      slug,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await service.save();

    return NextResponse.json(
      { success: true, data: service },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating service:', error);

    if (error?.code === 'P2002' || error?.message?.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'Bu isimde bir hizmet zaten mevcut' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Hizmet oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/services - Batch update service order
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const items: { id: string; order: number }[] = await req.json();
    await connectDB();

    const updatePromises = items.map((item) =>
      Service.findByIdAndUpdate(item.id, { order: item.order }, { new: true })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true, message: 'Sıralama güncellendi' });
  } catch (error) {
    console.error('Error updating service order:', error);
    return NextResponse.json(
      { success: false, error: 'Sıralama güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
