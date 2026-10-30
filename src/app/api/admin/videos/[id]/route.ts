import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Video from "@/models/Video";
import { withFxRevalidate } from '@/lib/fx-revalidate';
async function DELETE__handler(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const video = await Video.findById(params.id);
    if (!video) {
      return NextResponse.json({ error: "Video bulunamadı" }, { status: 404 });
    }

    // Delete the video
    await Video.findByIdAndDelete(params.id);

    // No need to update channel count since we don't have Channel model anymore

    return NextResponse.json({
      message: "Video başarıyla silindi",
      videoTitle: video.title
    });

  } catch (error: any) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { error: "Video silinirken hata oluştu", details: error.message },
      { status: 500 }
    );
  }
}

async function PUT__handler(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    // Yalnızca panelden düzenlenebilen alanlar kabul edilir
    const updateData: Record<string, unknown> = {};
    if (typeof body.title === 'string') {
      if (!body.title.trim()) return NextResponse.json({ error: 'Başlık boş olamaz' }, { status: 400 });
      updateData.title = body.title.trim();
    }
    if (typeof body.description === 'string') updateData.description = body.description;
    if (body.type === 'normal' || body.type === 'short') updateData.type = body.type;
    if (body.status !== undefined) {
      if (!['visible', 'draft', 'hidden'].includes(body.status)) return NextResponse.json({ error: 'Geçersiz durum' }, { status: 400 });
      updateData.status = body.status;
    }
    if (Array.isArray(body.tags)) updateData.tags = body.tags.filter((t: unknown) => typeof t === 'string' && t.trim()).map((t: string) => t.trim());
    if (body.publishedAt !== undefined) {
      const d = body.publishedAt ? new Date(body.publishedAt) : null;
      if (d && isNaN(d.getTime())) return NextResponse.json({ error: 'Geçersiz tarih' }, { status: 400 });
      updateData.publishedAt = d;
    }

    const video = await Video.findByIdAndUpdate(
      params.id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    if (!video) {
      return NextResponse.json({ error: "Video bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(video);

  } catch (error: any) {
    console.error("Error updating video:", error);
    return NextResponse.json(
      { error: "Video güncellenirken hata oluştu", details: error.message },
      { status: 500 }
    );
  }
}

// Panel → site canlı tazeleme (redesign 2026)
export const PUT = withFxRevalidate(PUT__handler);
export const DELETE = withFxRevalidate(DELETE__handler);
