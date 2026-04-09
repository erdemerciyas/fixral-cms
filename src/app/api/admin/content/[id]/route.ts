import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import News from "@/models/News";
import Service from "@/models/Service";
import Portfolio from "@/models/Portfolio";
import connectDB from "@/lib/mongoose";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const models = [News, Service, Portfolio];
    let deleted = false;

    for (const Model of models) {
      const result = await Model.findByIdAndDelete(id);
      if (result) {
        deleted = true;
        break;
      }
    }

    if (!deleted) {
      return NextResponse.json(
        { error: "İçerik bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "İçerik başarıyla silindi" });
  } catch (error) {
    console.error("Error deleting content:", error);
    return NextResponse.json(
      { error: "İçerik silinirken hata oluştu" },
      { status: 500 }
    );
  }
}
