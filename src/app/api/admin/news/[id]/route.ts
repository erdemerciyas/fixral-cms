import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import News from '@/models/News';
import connectDB from '@/lib/mongoose';
import slugify from 'slugify';

/**
 * GET /api/admin/news/[id] - Get single news article
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

    const news = await News.findById(params.id);

    if (!news) {
      return NextResponse.json(
        { success: false, error: 'Haber bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { success: false, error: 'Haber yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/news/[id] - Update news article
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

    let title = body.title || '';
    if (!title && body.translations) {
      for (const trans of Object.values(body.translations) as any[]) {
        if (trans?.title?.trim()) { title = trans.title; break; }
      }
    }
    if (title && !body.title) {
      body.title = title;
    }

    const updateData: Record<string, any> = { ...body, updatedAt: new Date() };

    if (title && !body.slug) {
      const slugBase = slugify(title, { lower: true, strict: true, replacement: '-' });
      updateData.slug = `${slugBase}-${Date.now()}`;
    }

    const news = await News.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    );

    if (!news) {
      return NextResponse.json(
        { success: false, error: 'Haber bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    console.error('Error updating news:', error);
    return NextResponse.json(
      { success: false, error: 'Haber güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/news/[id] - Delete news article
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

    const news = await News.findByIdAndDelete(params.id);

    if (!news) {
      return NextResponse.json(
        { success: false, error: 'Haber bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Haber başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json(
      { success: false, error: 'Haber silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
