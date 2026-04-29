// /app/api/global/route.ts
import { NextResponse } from 'next/server';
import { GLOBAL_SYMBOLS } from '@/lib/constants';

export async function GET() {
  try {
    const symbols = GLOBAL_SYMBOLS.join(',');
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 300 }
    });

    if (!res.ok) throw new Error('Failed to fetch global data');

    const json = await res.json();
    const result = (json.quoteResponse.result || []).map((s: any) => ({
      symbol: s.symbol,
      shortName: s.shortName || s.longName,
      regularMarketPrice: s.regularMarketPrice ?? 0,
      regularMarketChangePercent: s.regularMarketChangePercent ?? 0,
      marketState: s.marketState,
    }));

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
