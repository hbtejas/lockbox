// /app/api/movers/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/quotes`, { cache: 'no-store' });
    const data = await response.json();
    const stocks = Array.isArray(data?.stocks) ? data.stocks : [];

    const gainers = stocks.length > 0 ? [...stocks]
      .sort((a, b) => b.regularMarketChangePercent - a.regularMarketChangePercent)
      .slice(0, 5) : [];

    const losers = stocks.length > 0 ? [...stocks]
      .sort((a, b) => a.regularMarketChangePercent - b.regularMarketChangePercent)
      .slice(0, 5) : [];

    const active = stocks.length > 0 ? [...stocks]
      .sort((a, b) => b.regularMarketVolume - a.regularMarketVolume)
      .slice(0, 5) : [];

    return NextResponse.json({ gainers, losers, active });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
