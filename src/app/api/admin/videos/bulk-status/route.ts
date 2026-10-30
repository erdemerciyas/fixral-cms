import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withFxRevalidate } from '@/lib/fx-revalidate';

/** Seçili videoların durumunu topluca değiştirir: visible (Yayında) · draft (Taslak) · hidden (Pasif) */
async function POST__handler(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { videoIds, status } = await req.json();

    if (!Array.isArray(videoIds) || videoIds.length === 0 || videoIds.some((id) => typeof id !== 'string')) {
      return NextResponse.json({ error: "Video ID'leri gereklidir" }, { status: 400 });
    }
    if (!['visible', 'draft', 'hidden'].includes(status)) {
      return NextResponse.json({ error: "Geçerli bir durum belirtin" }, { status: 400 });
    }

    const result = await prisma.videoRow.updateMany({ where: { id: { in: videoIds } }, data: { status } });

    return NextResponse.json({ message: `${result.count} video güncellendi`, updatedCount: result.count });
  } catch (error: unknown) {
    console.error("Error bulk updating video status:", error);
    return NextResponse.json({ error: "Video durumları güncellenirken hata oluştu" }, { status: 500 });
  }
}

// Panel → site canlı tazeleme (redesign 2026)
export const POST = withFxRevalidate(POST__handler);
