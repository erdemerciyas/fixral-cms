import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Service from '@/models/Service';
import slugify from 'slugify';

// GET /api/services/[id] - Belirli bir servisi getir
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
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
export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const imageUrl = body.image || '';

    const updateData: Record<string, any> = {
      ...body,
      image: imageUrl,
    };

    if (body.title && !body.slug) {
      const slugBase = slugify(body.title, { lower: true, strict: true, replacement: '-' });
      updateData.slug = `${slugBase}-${Date.now()}`;
    }

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
export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 401 }
      );
    }

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
