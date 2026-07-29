import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur.' }, { status: 400 });
    }

    // Check existing
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'Bu e-posta adresi zaten kayıtlı.' }, { status: 409 });
    }

    // Şifre Prisma adapter'ında hook olmadığı için burada hash'lenmeli
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user',
    });

    return NextResponse.json({
      message: 'Kayıt başarılı.',
      user: { id: user._id, email: user.email, name: user.name }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration Error Details:', error);
    return NextResponse.json({
      error: error.message || 'Bir hata oluştu.',
      details: error.toString()
    }, { status: 500 });
  }
}