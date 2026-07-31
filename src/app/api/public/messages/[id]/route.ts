import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Message from '@/models/Message';

// GET /api/messages/[id] - Tek mesaj getir
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const { id } = params;

    const message = await Message.findById(id);
    if (!message) {
      return NextResponse.json(
        { error: 'Mesaj bulunamadı' },
        { status: 404 }
      );
    }

    // Mesajı okundu olarak işaretle
    if (!message.isRead) {
      await Message.findByIdAndUpdate(id, {
        isRead: true,
        readAt: new Date(),
        status: message.status === 'new' ? 'read' : message.status
      });
    }
    
    return NextResponse.json(message);
  } catch (error) {
    console.error('Mesaj getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Mesaj getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

interface MessageUpdateRequest {
  isRead?: boolean;
  status?: string;
}

// PUT /api/messages/[id] - Mesaj durumunu güncelle
export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: MessageUpdateRequest = await request.json();
    
    const message = await Message.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    );
    
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    
    return NextResponse.json(message);
    
  } catch (error) {
    console.error('Message update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update message' 
    }, { status: 500 });
  }
}

// PATCH /api/messages/[id] - Mesaj durumunu güncelle
export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const { id } = params;
    
    const body = await request.json();
    const { status } = body;
    
    const updateData: { status: string; isRead?: boolean; repliedAt?: Date; readAt?: Date } = { status };
    
    // Status'a göre otomatik isRead ve timestamp güncellemeleri
    if (status === 'replied') {
      updateData.isRead = true;
      updateData.repliedAt = new Date();
    } else if (status === 'read') {
      updateData.isRead = true;
      updateData.readAt = new Date();
    }
    
    const message = await Message.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!message) {
      return NextResponse.json(
        { error: 'Mesaj bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(message);
  } catch (error) {
    console.error('Mesaj durumu güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Mesaj durumu güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE /api/messages/[id] - Mesajı sil
export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const { id } = params;
    
    const message = await Message.findByIdAndDelete(id);
    if (!message) {
      return NextResponse.json(
        { error: 'Mesaj bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Mesaj başarıyla silindi'
    });
  } catch (error) {
    console.error('Mesaj silinirken hata:', error);
    return NextResponse.json(
      { error: 'Mesaj silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 