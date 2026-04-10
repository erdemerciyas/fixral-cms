import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import connectDB from '../../../../../lib/mongoose';
import Slider from '../../../../../models/Slider';

// GET /api/admin/slider/[id] - Tek slider getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const { id } = params;

    await connectDB();
    
    const slider = await Slider.findById(id);
    if (!slider) {
      return NextResponse.json(
        { error: 'Slider bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(slider);
  } catch (error) {
    console.error('Slider getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Slider getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/slider/[id] - Slider güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();

    const {
      title, 
      subtitle, 
      description, 
      buttonText, 
      buttonLink, 
      badge, 
      imageType, 
      imageUrl, 
      order,
      duration,
      isActive 
    } = body;

    await connectDB();

    const existing = await Slider.findById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Slider bulunamadı' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {
      title: title?.trim() || existing.title,
      subtitle: subtitle?.trim() || existing.subtitle,
      description: description?.trim() || existing.description,
      buttonText: buttonText?.trim() || existing.buttonText || 'Daha Fazla',
      buttonLink: buttonLink !== undefined ? buttonLink.trim() : (existing.buttonLink || '/contact'),
      badge: badge?.trim() || existing.badge || 'Yenilik',
      imageType: imageType || existing.imageType || 'url',
      imageUrl: imageUrl?.trim() || existing.imageUrl,
      order: order !== undefined ? Number(order) : existing.order,
      duration: duration ? Number(duration) : (existing.duration || 5000),
      isActive: isActive !== undefined ? isActive : existing.isActive,
      updatedBy: session.user.email || 'admin',
    };

    const slider = await Slider.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!slider) {
      return NextResponse.json(
        { error: 'Slider bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(slider);
  } catch (error) {
    console.error('Slider güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Slider güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST /api/admin/slider/[id] - Slider durumunu değiştir
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();

    await connectDB();

    const updateData: Record<string, unknown> = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const slider = await Slider.findByIdAndUpdate(id, updateData, { new: true });
    if (!slider) {
      return NextResponse.json(
        { error: 'Slider bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(slider);
  } catch (error) {
    console.error('Slider durumu güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Slider durumu güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/slider/[id] - Slider sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const { id } = params;
    
    await connectDB();
    
    const slider = await Slider.findByIdAndDelete(id);
    if (!slider) {
      return NextResponse.json(
        { error: 'Slider bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Slider başarıyla silindi'
    });
  } catch (error) {
    console.error('Slider silinirken hata:', error);
    return NextResponse.json(
      { error: 'Slider silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}