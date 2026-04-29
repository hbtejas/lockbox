import { NextResponse } from 'next/server';

const INDICES = [
  { symbol: '^NSEI', name: 'NIFTY 50' },
  { symbol: '^BSESN', name: 'SENSEX' },
  { symbol: '^NSEBANK', name: 'NIFTY BANK' },
  { symbol: '^CNXIT', name: 'NIFTY IT' },
];

export async function GET() {
  try {
    const results = await Promise.all(
      INDICES.map(async (index) => {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${index.symbol}?interval=1d&range=1d`,
          { 
            next: { revalidate: 60 },
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          }
        );
        const data = await response.json();
        const result = data?.chart?.result?.[0];
        if (!result) return null;

        const quote = result.indicators?.quote?.[0];
        const meta = result.meta;
        if (!quote || !meta) return null;

        const high = quote.high || [];
        const low = quote.low || [];
        const open = quote.open || [];
        const close = quote.close || [];

        const filteredHigh = high.filter((h: any) => h != null);
        const filteredLow = low.filter((l: any) => l != null);

        return {
          symbol: index.symbol,
          name: index.name,
          price: meta.regularMarketPrice || 0,
          change: (meta.regularMarketPrice || 0) - (meta.chartPreviousClose || 0),
          changePercent: meta.chartPreviousClose ? (((meta.regularMarketPrice || 0) - meta.chartPreviousClose) / meta.chartPreviousClose) * 100 : 0,
          high: filteredHigh.length > 0 ? Math.max(...filteredHigh) : (meta.regularMarketPrice || 0),
          low: filteredLow.length > 0 ? Math.min(...filteredLow) : (meta.regularMarketPrice || 0),
          open: open.find((o: any) => o != null) || meta.regularMarketPrice || 0,
          sparkline: close.filter((c: any) => c != null),
        };
      })
    );

    const filteredResults = results.filter(r => r !== null);
    return NextResponse.json(filteredResults, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch market indices', details: error.message }, { status: 500 });
  }
}
