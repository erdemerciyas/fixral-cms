import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import News from '@/models/News';
import slugify from 'slugify';
import { withFxRevalidate } from '@/lib/fx-revalidate';

/**
 * GET /api/admin/news/[id] - Get single news article
 */
export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

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
async function PUT__handler(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

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
async function DELETE__handler(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

// Panel → site canlı tazeleme (redesign 2026)
export const PUT = withFxRevalidate(PUT__handler);
export const DELETE = withFxRevalidate(DELETE__handler);
