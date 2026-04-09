import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '../../../../lib/mongoose';
import { authOptions } from '../../../../lib/auth';
import bcrypt from 'bcryptjs';
import { withSecurity, SecurityConfigs } from '../../../../lib/security-middleware';
import User from '../../../../models/User';

export const POST = withSecurity(SecurityConfigs.admin)(async (request: Request) => {
  try {
    const session = await getServerSession(authOptions);
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Mevcut şifre ve yeni şifre gerekli' },
        { status: 400 }
      );
    }

    const email = session?.user?.email as string | undefined;
    if (!email) {
      return NextResponse.json(
        { error: 'Oturum bilgisi eksik' },
        { status: 500 }
      );
    }

    await connectDB();

    const admin = await User.findOne({ email });

    if (!admin) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await User.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    return NextResponse.json(
      { message: 'Şifre başarıyla güncellendi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Şifre değiştirme hatası:', error);
    return NextResponse.json(
      { error: 'Şifre değiştirme işlemi başarısız' },
      { status: 500 }
    );
  }
});
