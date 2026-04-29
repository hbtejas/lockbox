// /app/api/quotes/route.ts
import { NextResponse } from 'next/server';
import { NSE_SYMBOLS, INDEX_SYMBOLS, SECTOR_MAP, INDEX_NAMES } from '@/lib/constants';

export async function GET() {
  try {
    const symbols = [...NSE_SYMBOLS, ...INDEX_SYMBOLS].join(',');
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,regularMarketDayHigh,regularMarketDayLow,regularMarketOpen,regularMarketPreviousClose,fiftyTwoWeekHigh,fiftyTwoWeekLow,marketCap,trailingPE,averageDailyVolume3Month,shortName,longName`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 0 }
    });

    if (!res.ok) throw new Error('Failed to fetch from Yahoo Finance');

    const json = await res.json();
    const result = json?.quoteResponse?.result || [];

    if (result.length === 0) {
       return NextResponse.json({ stocks: [], indices: [], timestamp: new Date().toISOString() });
    }

    const stocks = result
      .filter((s: any) => s && !INDEX_SYMBOLS.includes(s.symbol))
      .map((s: any) => {
        let sector = 'Other';
        for (const [sec, syms] of Object.entries(SECTOR_MAP)) {
          if (syms.includes(s.symbol)) {
            sector = sec;
            break;
          }
        }
        return {
          symbol: s.symbol,
          shortName: s.shortName || s.longName || s.symbol,
          longName: s.longName || s.shortName || s.symbol,
          regularMarketPrice: s.regularMarketPrice ?? 0,
          regularMarketChange: s.regularMarketChange ?? 0,
          regularMarketChangePercent: s.regularMarketChangePercent ?? 0,
          regularMarketVolume: s.regularMarketVolume ?? 0,
          regularMarketDayHigh: s.regularMarketDayHigh ?? 0,
          regularMarketDayLow: s.regularMarketDayLow ?? 0,
          regularMarketOpen: s.regularMarketOpen ?? 0,
          regularMarketPreviousClose: s.regularMarketPreviousClose ?? 0,
          fiftyTwoWeekHigh: s.fiftyTwoWeekHigh ?? 0,
          fiftyTwoWeekLow: s.fiftyTwoWeekLow ?? 0,
          marketCap: s.marketCap ?? 0,
          trailingPE: s.trailingPE ?? null,
          averageDailyVolume3Month: s.averageDailyVolume3Month ?? 0,
          sector,
          previousClose: s.regularMarketPreviousClose ?? 0,
        };
      });

    const indices = result
      .filter((s: any) => INDEX_SYMBOLS.includes(s.symbol))
      .map((s: any) => ({
        symbol: s.symbol,
        name: INDEX_NAMES[s.symbol] || s.shortName,
        price: s.regularMarketPrice ?? 0,
        change: s.regularMarketChange ?? 0,
        changePercent: s.regularMarketChangePercent ?? 0,
        high: s.regularMarketDayHigh ?? 0,
        low: s.regularMarketDayLow ?? 0,
        open: s.regularMarketOpen ?? 0,
        previousClose: s.regularMarketPreviousClose ?? 0,
      }));

    return NextResponse.json({ stocks, indices, timestamp: new Date().toISOString() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stocks: [], indices: [] }, { status: 200 });
  }
}
