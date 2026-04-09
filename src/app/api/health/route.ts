import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const buildVersion = 'v2-prisma-only';
  try {
    const result = await prisma.$queryRaw`SELECT 1 as ok`;

    return NextResponse.json({
      status: 'healthy',
      buildVersion,
      timestamp: new Date().toISOString(),
      platform: process.env.VERCEL ? 'vercel' : 'local',
      region: process.env.VERCEL_REGION || 'unknown',
      database: 'connected',
      dbResult: result,
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      buildVersion,
      timestamp: new Date().toISOString(),
      platform: process.env.VERCEL ? 'vercel' : 'local',
      region: process.env.VERCEL_REGION || 'unknown',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      errorName: error instanceof Error ? error.constructor.name : typeof error,
    }, { status: 500 });
  }
}

// Vercel için edge runtime kullanmıyoruz - MongoDB ile uyumsuz
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/*
async function checkYouTubeAPIHealth() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  
  if (!apiKey || !channelId) {
    return { status: 'not configured', message: 'YouTube API key or channel ID not set' };
  }
  
  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?key=${apiKey}&id=${channelId}&part=snippet`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    
    if (!response.ok) {
      return { status: 'unreachable', message: 'YouTube API is not accessible' };
    }
    
    const data = await response.json();
    const videoCount = data.items[0]?.snippet?.title ? 1 : 0;
    
    return { status: 'ok', message: `YouTube API is accessible, ${videoCount} video(s) found` };
  } catch (error) {
    console.error("YouTube health check failed:", error);
    return { status: 'error', message: 'YouTube health check failed' };
  }
}
*/