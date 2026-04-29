// /app/api/chart/[symbol]/route.ts
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '1d';
    const interval = searchParams.get('interval') || '2m';
    const symbol = params.symbol;

    if (!symbol) return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}&includePrePost=false`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 0 }
    });

    if (!res.ok) throw new Error('Failed to fetch chart data');

    const json = await res.json();
    const chart = json.chart.result?.[0];

    if (!chart) return NextResponse.json([]);

    const timestamps = chart.timestamp || [];
    const quotes = chart.indicators.quote[0];
    const { open, high, low, close, volume } = quotes;

    const data = timestamps.map((ts: number, i: number) => ({
      timestamp: ts * 1000,
      open: open[i] ?? close[i],
      high: high[i] ?? close[i],
      low: low[i] ?? close[i],
      close: close[i],
      volume: volume[i] ?? 0,
    })).filter((d: any) => d.close !== null && d.close !== undefined);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
