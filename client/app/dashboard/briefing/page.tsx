// /app/dashboard/briefing/page.tsx
'use client'

import React, { useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useMarketStore } from '@/store/marketStore';
import { useNews } from '@/hooks/useMarketData';
import { 
  Sparkles, TrendingUp, TrendingDown, 
  Calendar, Zap, Bell, Shield, 
  ArrowRight, Globe, BarChart2 
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { SkeletonCard } from '@/components/ui/Skeleton';

export default function MorningBriefingPage() {
  const { stocks, indices } = useMarketStore();
  const { news, isLoading: newsLoading } = useNews();

  const recap = useMemo(() => {
    const nifty = indices.find(i => i.symbol === '^NSEI');
    const sensex = indices.find(i => i.symbol === '^BSESN');
    const topGainer = stocks.sort((a, b) => b.regularMarketChangePercent - a.regularMarketChangePercent)[0];
    const topLoser = stocks.sort((a, b) => a.regularMarketChangePercent - b.regularMarketChangePercent)[0];

    return { nifty, sensex, topGainer, topLoser };
  }, [stocks, indices]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Morning Brief</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter">The Market Pulse</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Market Sentiment */}
          <div className="glass p-10 rounded-[48px] border-white/5 space-y-8">
            <h3 className="text-xl font-black flex items-center gap-4">
              <Globe className="w-6 h-6 text-indigo-400" />
              Global Sentiment
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Nifty 50</p>
                <p className="text-xl font-black number-font">₹{recap.nifty?.price.toLocaleString()}</p>
                <p className={cn("text-[10px] font-black", (recap.nifty?.changePercent ?? 0) >= 0 ? "text-green-500" : "text-red-500")}>
                  {(recap.nifty?.changePercent ?? 0).toFixed(2)}%
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sensex</p>
                <p className="text-xl font-black number-font">₹{recap.sensex?.price.toLocaleString()}</p>
                <p className={cn("text-[10px] font-black", (recap.sensex?.changePercent ?? 0) >= 0 ? "text-green-500" : "text-red-500")}>
                  {(recap.sensex?.changePercent ?? 0).toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-3xl space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Bullish Outlook</span>
              </div>
              <p className="text-xs font-bold text-gray-300 leading-relaxed">
                Strong momentum in IT and Banking sectors following positive US economic data. FII flows remaining steady.
              </p>
            </div>
          </div>

          {/* Top Movers */}
          <div className="glass p-10 rounded-[48px] border-white/5 space-y-8">
            <h3 className="text-xl font-black flex items-center gap-4">
              <Zap className="w-6 h-6 text-yellow-400" />
              Actionable Insight
            </h3>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl">
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Top Gainer</p>
                  <p className="font-black text-white">{recap.topGainer?.symbol.split('.')[0]}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-500 font-black number-font">+{recap.topGainer?.regularMarketChangePercent.toFixed(2)}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl">
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Top Loser</p>
                  <p className="font-black text-white">{recap.topLoser?.symbol.split('.')[0]}</p>
                </div>
                <div className="text-right">
                  <p className="text-red-500 font-black number-font">{recap.topLoser?.regularMarketChangePercent.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top News Stories */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black tracking-tighter flex items-center gap-4">
            <Bell className="w-6 h-6 text-indigo-400" />
            Top Stories
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {newsLoading ? [1, 2, 3].map(i => <SkeletonCard key={i} />) : 
              news.slice(0, 3).map((item: any, i: number) => (
              <a 
                key={i}
                href={item.link} 
                target="_blank" 
                className="glass p-8 rounded-[40px] border-white/5 hover:border-white/10 transition-all group flex gap-8 items-start"
              >
                <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center shrink-0">
                  <Globe className="w-8 h-8 text-gray-700 group-hover:text-indigo-400 transition-colors" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{item.publisher}</span>
                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{format(item.providerPublishTime * 1000, 'HH:mm')}</span>
                  </div>
                  <h4 className="text-lg font-black leading-tight text-white group-hover:text-indigo-400 transition-colors">{item.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-white transition-colors">
                    Read Story <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Closing Quote */}
        <div className="p-12 bg-indigo-600 rounded-[56px] text-center space-y-6 relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <Shield className="w-12 h-12 text-white/40 mx-auto" />
            <p className="text-2xl font-black text-white italic">"Investing is not about beating others. It's about controlling yourself."</p>
            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">— Benjamin Graham</p>
          </div>
          <BarChart2 className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5" />
        </div>
      </div>
    </DashboardLayout>
  );
}
