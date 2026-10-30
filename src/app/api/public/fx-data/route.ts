/** Public: FIXRAL site verisi (panel + varsayılanlar birleşik). Önbellek 60 sn, panel kaydında anında tazelenir. */
import { NextResponse } from 'next/server';
import { getFxData } from '@/lib/fx-data-server';

export const revalidate = 60;

export async function GET() {
  const data = await getFxData();
  return NextResponse.json(data, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
}
