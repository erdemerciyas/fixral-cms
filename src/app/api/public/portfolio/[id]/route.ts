import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongoose';
import { authOptions } from '@/lib/auth';
import Portfolio from '@/models/Portfolio';
import Category from '@/models/Category';

const DEFAULT_IMAGE = 'https://picsum.photos/800/600?grayscale';
const DEFAULT_DETAIL_IMAGES = [
  'https://picsum.photos/800/600?random=1&grayscale',
  'https://picsum.photos/800/600?random=2&grayscale',
  'https://picsum.photos/800/600?random=3&grayscale'
];

// GET - Tekil portfolyo öğesini getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const portfolio = await Portfolio.findById(params.id);

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolyo öğesi bulunamadı' },
        { status: 404 }
      );
    }

    // Attach category info if available
    const result = portfolio.toObject ? portfolio.toObject() : { ...portfolio };
    if (result.category) {
      const cat = await Category.findById(result.category);
      if (cat) result.categoryData = cat;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Portfolyo detay getirme hatası:', error);
    return NextResponse.json(
      { error: 'Portfolyo detayı getirilemedi' },
      { status: 500 }
    );
  }
}

// PUT - Portfolyo öğesini güncelle
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

    if (!data.title || !data.description) {
      return NextResponse.json(
        { error: 'Başlık ve açıklama zorunludur' },
        { status: 400 }
      );
    }

    // Validate categories
    if (data.categoryIds && Array.isArray(data.categoryIds) && data.categoryIds.length > 0) {
      const catCount = await Category.countDocuments({ _id: { $in: data.categoryIds } });
      if (catCount !== data.categoryIds.length) {
        return NextResponse.json(
          { error: 'Geçersiz kategori ID\'si bulundu' },
          { status: 400 }
        );
      }
    } else if (data.categoryId) {
      const cat = await Category.findById(data.categoryId);
      if (!cat) {
        return NextResponse.json(
          { error: 'Geçersiz kategori ID\'si' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'En az bir kategori seçmelisiniz' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {
      title: data.title,
      slug: data.slug,
      description: data.description,
      coverImage: data.coverImage || DEFAULT_IMAGE,
      images: data.images && data.images.length > 0 && data.images[0] ? data.images : DEFAULT_DETAIL_IMAGES,
      technologies: data.technologies,
      client: data.client || '',
      completionDate: data.completionDate || '',
      models3D: data.models3D || null,
      order: typeof data.order === 'number' ? data.order : 0,
      projectUrl: data.projectUrl || '',
      githubUrl: data.githubUrl || '',
      featured: data.featured,
      externalUrl: data.externalUrl,
    };

    if (data.translations) {
      updateData.translations = data.translations;
    }

    if (data.categoryIds && Array.isArray(data.categoryIds) && data.categoryIds.length > 0) {
      updateData.category = data.categoryIds[0];
      updateData.categoryIds = data.categoryIds;
    } else if (data.categoryId) {
      updateData.category = data.categoryId;
      updateData.categoryIds = [data.categoryId];
    }

    const result = await Portfolio.updateOne(
      { _id: params.id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Portfolyo öğesi bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Portfolyo öğesi başarıyla güncellendi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Portfolyo öğesi güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Portfolyo öğesi güncellenemedi' },
      { status: 500 }
    );
  }
}

// DELETE - Portfolyo öğesini sil
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

    const result = await Portfolio.deleteOne({ _id: params.id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Portfolyo öğesi bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Portfolyo öğesi başarıyla silindi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Portfolyo öğesi silme hatası:', error);
    return NextResponse.json(
      { error: 'Portfolyo öğesi silinemedi' },
      { status: 500 }
    );
  }
}
