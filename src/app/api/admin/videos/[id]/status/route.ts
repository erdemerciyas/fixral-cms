import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Video from "@/models/Video";
import { withFxRevalidate } from '@/lib/fx-revalidate';
async function PUT__handler(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json();
    
    if (!status || !['visible', 'draft', 'hidden'].includes(status)) {
      return NextResponse.json({ error: "Geçerli bir durum belirtin" }, { status: 400 });
    }

    const video = await Video.findByIdAndUpdate(
      params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!video) {
      return NextResponse.json({ error: "Video bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({
      message: `Video ${status === 'visible' ? 'yayınlandı' : status === 'draft' ? 'taslağa alındı' : 'pasif yapıldı'}`,
      video
    });

  } catch (error: any) {
    console.error("Error updating video status:", error);
    return NextResponse.json(
      { error: "Video durumu güncellenirken hata oluştu", details: error.message },
      { status: 500 }
    );
  }
}

// Panel → site canlı tazeleme (redesign 2026)
export const PUT = withFxRevalidate(PUT__handler);
