import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Category from '@/models/Category';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import slugify from 'slugify';

/**
 * GET /api/admin/categories - List all categories for admin
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

    const categories = await Category.find().sort({ name: 1 });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Kategoriler yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/categories - Create a new category
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

    if (!body.slug && body.name) {
      body.slug = slugify(body.name, { lower: true, strict: true, replacement: '-' });
    }

    const category = new Category({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await category.save();

    return NextResponse.json(
      { success: true, data: category },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating category:', error);

    if (error?.code === 'P2002' || error?.message?.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'Bu isimde bir kategori zaten mevcut' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Kategori oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
