import { NextResponse } from "next/server";
import Video from "@/models/Video";
import connectDB from "@/lib/mongoose";

export async function GET() {
  try {
    await connectDB();

    // Get all videos with valid channelId
    const videos = await Video.find({
      channelId: { $ne: "" },
    }).select("channelId channelName channelUrl");

    // Group by channelId in JS
    const channelMap = new Map<string, { channelId: string; channelName: string; channelUrl: string; videoCount: number }>();

    for (const video of videos) {
      const cid = video.channelId;
      if (!cid) continue;
      if (channelMap.has(cid)) {
        channelMap.get(cid)!.videoCount++;
      } else {
        channelMap.set(cid, {
          channelId: cid,
          channelName: video.channelName || "",
          channelUrl: video.channelUrl || "",
          videoCount: 1,
        });
      }
    }

    const channels = Array.from(channelMap.values()).sort((a, b) => b.videoCount - a.videoCount);

    return NextResponse.json(channels);
  } catch (error: any) {
    console.error("Error fetching channels:", error);
    return NextResponse.json(
      { error: "Failed to fetch channels", details: error.message },
      { status: 500 }
    );
  }
}
