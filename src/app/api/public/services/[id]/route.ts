import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongoose';
import { authOptions } from '@/lib/auth';
import Service from '@/models/Service';

// GET /api/services/[id] - Belirli bir servisi getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const service = await Service.findById(params.id);

    if (!service) {
      return NextResponse.json(
        { error: 'Servis bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Servis getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Servis getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT /api/services/[id] - Belirli bir servisi güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 401 }
      );
    }

    const body = await request.json();
    await connectDB();

    const imageUrl = body.image || '';

    const updateData = {
      ...body,
      image: imageUrl,
    };

    const result = await Service.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Servis bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Servis güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Servis güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE /api/services/[id] - Belirli bir servisi sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 401 }
      );
    }

    await connectDB();

    const result = await Service.findByIdAndDelete(params.id);

    if (!result) {
      return NextResponse.json(
        { error: 'Servis bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Servis başarıyla silindi' });
  } catch (error) {
    console.error('Servis silinirken hata:', error);
    return NextResponse.json(
      { error: 'Servis silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
