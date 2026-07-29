import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

/**
 * GET /api/admin/users - List all users for admin
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

    const users = await User.find({}, '-password').sort({ createdAt: -1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users - Create a new user
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

    const body = await req.json();

    if (!body.password || typeof body.password !== 'string' || body.password.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Şifre gereklidir' },
        { status: 400 }
      );
    }

    // Prisma adapter'ında pre-save hook yok; şifre burada hash'lenmeli
    const user = new User({
      ...body,
      email: typeof body.email === 'string' ? body.email.trim().toLowerCase() : body.email,
      password: await bcrypt.hash(body.password, 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    return NextResponse.json(
      { success: true, data: safeUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
