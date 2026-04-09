import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongoose';
import { authOptions } from '@/lib/auth';
import Category from '@/models/Category';
import Portfolio from '@/models/Portfolio';

// GET - Tekil kategoriyi getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const category = await Category.findById(params.id);

    if (!category) {
      return NextResponse.json(
        { error: 'Kategori bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Kategori getirme hatası:', error);
    return NextResponse.json(
      { error: 'Kategori getirilemedi' },
      { status: 500 }
    );
  }
}

// PUT - Kategoriyi güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const existingCategory = await Category.findOne({
      _id: { $ne: params.id },
      slug: data.slug,
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Bu slug zaten kullanılıyor' },
        { status: 400 }
      );
    }

    const result = await Category.updateOne(
      { _id: params.id },
      {
        $set: {
          name: data.name,
          slug: data.slug,
          description: data.description,
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Kategori bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Kategori başarıyla güncellendi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Kategori güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Kategori güncellenemedi' },
      { status: 500 }
    );
  }
}

// DELETE - Kategoriyi sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    await connectDB();

    const portfolioCount = await Portfolio.countDocuments({ category: params.id });

    if (portfolioCount > 0) {
      return NextResponse.json(
        { error: 'Bu kategori portfolyo öğeleri tarafından kullanılıyor ve silinemiyor' },
        { status: 400 }
      );
    }

    const result = await Category.deleteOne({ _id: params.id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Kategori bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Kategori başarıyla silindi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Kategori silme hatası:', error);
    return NextResponse.json(
      { error: 'Kategori silinemedi' },
      { status: 500 }
    );
  }
}
