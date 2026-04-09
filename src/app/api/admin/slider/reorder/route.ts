import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Slider from '@/models/Slider';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const { sliders } = await request.json();

    if (!Array.isArray(sliders)) {
      return NextResponse.json(
        { error: 'Geçersiz veri formatı' },
        { status: 400 }
      );
    }

    await connectDB();

    const updates = sliders.map((id: string, index: number) =>
      Slider.findByIdAndUpdate(id, { order: index })
    );

    await Promise.all(updates);

    return NextResponse.json({ message: 'Sıralama başarıyla güncellendi' });
  } catch (error) {
    console.error('Slider sıralama hatası:', error);
    return NextResponse.json(
      { error: 'Sıralama güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
