import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Portfolio from '@/models/Portfolio';
import connectDB from '@/lib/mongoose';
import slugify from 'slugify';

/**
 * GET /api/admin/portfolio - List all portfolio items for admin
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

    const portfolioItems = await Portfolio.find()
      .sort({ createdAt: -1 });

    return NextResponse.json(portfolioItems);
  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    return NextResponse.json(
      { success: false, error: 'Portfolyo öğeleri yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/portfolio - Create a new portfolio item
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

    if (!body.slug && body.title) {
      const slugBase = slugify(body.title, { lower: true, strict: true, replacement: '-' });
      body.slug = `${slugBase}-${Date.now()}`;
    }

    const portfolio = new Portfolio({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await portfolio.save();

    return NextResponse.json(
      { success: true, data: portfolio },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating portfolio item:', error);

    if (error?.code === 'P2002' || error?.message?.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'Bu isimde bir portfolyo öğesi zaten mevcut' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Portfolyo öğesi oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
