import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import News from '@/models/News';
import connectDB from '@/lib/mongoose';
import slugify from 'slugify';

/**
 * GET /api/admin/news - List all news articles for admin
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

    const news = await News.find()
      .sort({ createdAt: -1 });

    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { success: false, error: 'Haberler yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/news - Create a new news article
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

    let titleForSlug = body.title;
    if (!titleForSlug && body.translations) {
      for (const trans of Object.values(body.translations) as any[]) {
        if (trans?.title) { titleForSlug = trans.title; break; }
      }
    }

    const slugBase = slugify(titleForSlug || 'haber', { lower: true, strict: true, replacement: '-' });
    const slug = body.slug || `${slugBase}-${Date.now()}`;

    const news = new News({
      ...body,
      slug,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await news.save();

    return NextResponse.json(
      { success: true, data: news },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating news:', error);

    if (error?.code === 'P2002' || error?.message?.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'Bu başlıkta bir haber zaten mevcut' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Haber oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
