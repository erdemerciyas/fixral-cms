import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Portfolio from '@/models/Portfolio';
import connectDB from '@/lib/mongoose';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const result = await Portfolio.findOneAndUpdate(
      { 'models3D._id': id },
      { $pull: { models3D: { _id: id } } },
      { new: true }
    );

    if (!result) {
      const resultByPublicId = await Portfolio.findOneAndUpdate(
        { 'models3D.publicId': id },
        { $pull: { models3D: { publicId: id } } },
        { new: true }
      );

      if (!resultByPublicId) {
        return NextResponse.json({ error: 'Model bulunamadı' }, { status: 404 });
      }
    }

    return NextResponse.json({ message: 'Model başarıyla silindi' });
  } catch (error) {
    console.error('Model silinirken hata:', error);
    return NextResponse.json(
      { error: 'Model silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
