import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongoose';
import { authOptions } from '@/lib/auth';
import Category from '@/models/Category';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET - Tüm kategorileri getir
export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find({}).sort({ name: 1 });

    return NextResponse.json(categories, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Kategori getirme hatası:', error);
    return NextResponse.json(
      { error: 'Kategoriler getirilemedi' },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// POST - Yeni kategori ekle
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    await connectDB();
    const data = await request.json();

    if (!data.name || !data.slug) {
      return NextResponse.json(
        { error: 'İsim ve slug alanları zorunludur' },
        { status: 400 }
      );
    }

    const existingCategory = await Category.findOne({ slug: data.slug });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Bu slug zaten kullanılıyor' },
        { status: 400 }
      );
    }

    const created = await Category.create({
      ...data,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: 'Kategori başarıyla eklendi', id: created._id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Kategori ekleme hatası:', error);
    return NextResponse.json(
      { error: 'Kategori eklenemedi' },
      { status: 500 }
    );
  }
}
