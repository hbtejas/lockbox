// /app/dashboard/page.tsx
'use client'

import React, { useMemo, useState, useEffect } from 'react';
import { useMarketStore } from '@/store/marketStore';
import { useMarketData } from '@/hooks/useMarketData';
import { format } from 'date-fns';
import { 
  Clock, Activity, Globe, Zap, BarChart4, 
  TrendingUp, TrendingDown, RefreshCcw, Search,
  ChevronRight, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton';
import { GlobalMarkets } from '@/components/GlobalMarkets';
import { SectorHeatmap } from '@/components/SectorHeatmap';
import { StockTable } from '@/components/StockTable';
import { Badge, PercentageBadge } from '@/components/ui/Badge';
import { formatPrice, isMarketOpen } from '@/lib/marketUtils';

export default function DashboardPage() {
  const { stocks, indices, isLoading, error, lastUpdated } = useMarketStore();
  const { refresh } = useMarketData();
  const [time, setTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const marketStatus = isMarketOpen();

  const gainers = useMemo(() => {
    if (!Array.isArray(stocks) || stocks.length === 0) return [];
    return [...stocks].sort((a, b) => b.regularMarketChangePercent - a.regularMarketChangePercent).slice(0, 5);
  }, [stocks]);

  const losers = useMemo(() => {
    if (!Array.isArray(stocks) || stocks.length === 0) return [];
    return [...stocks].sort((a, b) => a.regularMarketChangePercent - b.regularMarketChangePercent).slice(0, 5);
  }, [stocks]);

  return (
    <div className="space-y-12 pb-20">
      {/* SECTION A - Global Pulse */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center">
            <Globe className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Global Market Intelligence</span>
        </div>
        <GlobalMarkets />
      </section>

      {/* SECTION B - Header */}
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter">Market Overview</h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-2xl border border-border">
              <Clock className="w-4 h-4 text-accent" />
              <span className="number-font font-black text-sm tracking-widest">{time ? format(time, 'HH:mm:ss') : '--:--:--'} IST</span>
            </div>
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all",
              marketStatus ? "bg-gain/10 border-gain/20 text-gain" : "bg-loss/10 border-loss/20 text-loss"
            )}>
              <div className={cn("w-2 h-2 rounded-full animate-pulse", marketStatus ? "bg-gain" : "bg-loss")} />
              <span className="text-[10px] font-black uppercase tracking-widest">Market {marketStatus ? 'Live' : 'Closed'}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 w-full lg:w-auto no-scrollbar">
          {isLoading && stocks.length === 0 ? [1, 2, 3, 4].map(i => <SkeletonCard key={i} />) : 
            indices.map((idx) => (
              <div key={idx.symbol} className="glass p-6 rounded-[32px] min-w-[240px] border-border hover:border-accent/30 transition-all group cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black text-muted uppercase tracking-widest group-hover:text-accent transition-colors">{idx.name}</span>
                  <PercentageBadge value={idx.changePercent} />
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-black number-font tracking-tighter">{idx.price.toLocaleString('en-IN')}</p>
                  <p className={cn("text-[10px] font-bold number-font", idx.change >= 0 ? "text-gain" : "text-loss")}>
                    {idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* SECTION C - Sector Heatmap */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
            <BarChart4 className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Industrial Sector Breadth</span>
        </div>
        <SectorHeatmap />
      </section>

      {/* SECTION D - Movers & Main Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
        <div className="xl:col-span-3 space-y-12">
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-2xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-3xl font-black tracking-tighter">Live Market Feed</h2>
              </div>
              <button 
                onClick={() => refresh()}
                className={cn(
                  "p-3 rounded-2xl bg-card border border-border text-muted hover:text-white transition-all",
                  isLoading && "animate-spin"
                )}
              >
                <RefreshCcw className="w-4 h-4" />
              </button>
            </div>
            
            {isLoading && stocks.length === 0 ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
              </div>
            ) : (
              <StockTable stocks={stocks} />
            )}
          </section>
        </div>

        {/* Sidebar Components */}
        <div className="space-y-12">
          {/* Top Movers */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Daily Top Movers</h3>
            
            <div className="glass rounded-[40px] border-border overflow-hidden p-6 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gain">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Top Gainers</span>
                </div>
                {gainers.map(s => (
                  <div key={s.symbol} className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-all">
                    <span className="text-xs font-black">{s.symbol.split('.')[0]}</span>
                    <PercentageBadge value={s.regularMarketChangePercent} showIcon={false} />
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-loss">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Top Losers</span>
                </div>
                {losers.map(s => (
                  <div key={s.symbol} className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-all">
                    <span className="text-xs font-black">{s.symbol.split('.')[0]}</span>
                    <PercentageBadge value={s.regularMarketChangePercent} showIcon={false} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upgrade Card */}
          <div className="p-10 rounded-[48px] bg-accent relative overflow-hidden group cursor-pointer shadow-2xl shadow-accent/40 border border-white/10">
            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-2">
                <h4 className="text-3xl font-black leading-tight">Elevate Your Strategy</h4>
                <p className="text-indigo-100 text-sm font-medium leading-relaxed opacity-80">Advanced algorithmic signals and real-time F&O data.</p>
              </div>
              <button className="w-full bg-white text-accent py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest group-hover:scale-105 transition-all shadow-xl">Upgrade to Pro</button>
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl group-hover:bg-indigo-400/30 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
}
