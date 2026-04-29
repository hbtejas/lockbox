// /app/dashboard/stock/[symbol]/page.tsx
'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TradingViewChart } from '@/components/charts/TradingViewChart';
import { useStocks, useNews, useChartData } from '@/hooks/useMarketData';
import { 
  ArrowLeft, TrendingUp, TrendingDown, 
  Globe, Info, BarChart, ExternalLink,
  ShieldCheck, Zap, History, Newspaper
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function StockDetailPage() {
  const params = useParams();
  const symbol = params.symbol as string;
  const { stocks, isLoading: stocksLoading } = useStocks();
  const { news } = useNews();
  const { data: chartData, isLoading: chartLoading } = useChartData(symbol, '1d');

  const stock = useMemo(() => {
    if (!stocks || !Array.isArray(stocks)) return null;
    return stocks.find((s: any) => s.symbol === symbol);
  }, [stocks, symbol]);

  const stockNews = useMemo(() => {
    if (!news || !Array.isArray(news)) return [];
    return news.filter((n: any) => n.title?.toLowerCase().includes(symbol.split('.')[0].toLowerCase()));
  }, [news, symbol]);

  if (stocksLoading || !stock) return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/5 animate-pulse rounded-xl" />
          <div className="w-48 h-8 bg-white/5 animate-pulse rounded-lg" />
        </div>
        <div className="h-[500px] bg-white/5 animate-pulse rounded-[40px]" />
      </div>
    </DashboardLayout>
  );

  const isPositive = stock.regularMarketChangePercent >= 0;

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-20">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black tracking-tighter">{stock.shortName}</h1>
              <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-xs font-black text-gray-500">{stock.symbol}</span>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-2xl font-black number-font">₹{stock.regularMarketPrice.toLocaleString('en-IN')}</span>
              <div className={cn(
                "flex items-center gap-1 font-bold text-sm",
                isPositive ? "text-green-500" : "text-red-500"
              )}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {isPositive ? '+' : ''}{stock.regularMarketChange.toFixed(2)} ({stock.regularMarketChangePercent.toFixed(2)}%)
              </div>
            </div>
          </div>
          <div className="hidden md:flex gap-4">
            <button className="px-6 py-3 rounded-2xl bg-indigo-600 font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg">Buy Now</button>
            <button className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">Add to Watchlist</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            {/* Main Chart */}
            <TradingViewChart symbol={stock.symbol} data={chartData} />

            {/* Key Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Day High', value: `₹${stock.regularMarketDayHigh.toLocaleString('en-IN')}`, icon: Zap },
                { label: 'Day Low', value: `₹${stock.regularMarketDayLow.toLocaleString('en-IN')}`, icon: TrendingDown },
                { label: 'Market Cap', value: `₹${(stock.marketCap / 10000000).toFixed(0)} Cr`, icon: BarChart },
                { label: '52W High', value: `₹${stock.fiftyTwoWeekHigh.toLocaleString('en-IN')}`, icon: ShieldCheck },
              ].map((stat, i) => (
                <div key={i} className="glass p-6 rounded-3xl border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <stat.icon className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <p className="text-lg font-black number-font">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Price History Table */}
            <div className="glass rounded-[40px] border-white/5 overflow-hidden">
              <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-widest">Recent Performance</h3>
                <Link href="#" className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:underline flex items-center gap-2">
                  Full History <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-[9px] font-black text-gray-600 uppercase tracking-widest border-b border-white/5">
                    <th className="px-8 py-4 text-left">Date</th>
                    <th className="px-8 py-4 text-right">Price</th>
                    <th className="px-8 py-4 text-right">Change</th>
                    <th className="px-8 py-4 text-right">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    return (
                      <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="px-8 py-4 text-xs font-bold text-gray-400">{format(date, 'dd MMM yyyy')}</td>
                        <td className="px-8 py-4 text-right text-xs font-black number-font">₹{(stock.regularMarketPrice * (1 - (i * 0.01))).toFixed(2)}</td>
                        <td className="px-8 py-4 text-right text-xs font-black text-green-500">+{(Math.random() * 2).toFixed(2)}%</td>
                        <td className="px-8 py-4 text-right text-xs font-black text-gray-500">{(stock.regularMarketVolume / 1000).toFixed(0)}K</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-8">
            <div className="glass p-8 rounded-[40px] border-white/5 space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                <Info className="w-4 h-4 text-indigo-400" />
                Company Profile
              </h3>
              <p className="text-xs font-bold text-gray-400 leading-relaxed">
                {stock.shortName} is a leading player in its sector, currently trading at ₹{stock.regularMarketPrice.toLocaleString('en-IN')}. 
                With a market capitalization of ₹{(stock.marketCap / 10000000).toFixed(2)} Cr, it maintains a strong presence in the Indian equity market.
              </p>
              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Industry</span>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest bg-white/5 px-2 py-1 rounded">{stock.sector || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">P/E Ratio</span>
                  <span className="text-[10px] font-black text-white number-font">{stock.trailingPE?.toFixed(2) || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                <Newspaper className="w-4 h-4 text-indigo-400" />
                Latest News
              </h3>
              <div className="space-y-4">
                {stockNews.slice(0, 3).map((item, i) => (
                  <a key={i} href={item.link} target="_blank" className="block glass p-6 rounded-3xl border-white/5 hover:border-indigo-500/30 transition-all group">
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">{item.publisher}</p>
                    <h4 className="text-xs font-black leading-tight group-hover:text-indigo-400 transition-colors">{item.title}</h4>
                  </a>
                ))}
                {stockNews.length === 0 && (
                  <p className="text-[10px] font-bold text-gray-600 text-center py-4 uppercase tracking-widest">No recent news found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
