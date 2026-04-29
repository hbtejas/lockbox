// /app/api/news/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=Indian%20Stock%20Market&newsCount=12`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 300 }
    });

    if (!res.ok) throw new Error('Failed to fetch news');

    const json = await res.json();
    const news = (json.news || []).map((item: any) => ({
      title: item.title,
      publisher: item.publisher,
      link: item.link,
      providerPublishTime: item.providerPublishTime,
      thumbnail: item.resolutions?.[0]?.url || null,
    }));

    return NextResponse.json(news);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
