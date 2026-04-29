// /components/GlobalMarkets.tsx
'use client'

import React from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { cn } from '@/lib/utils';
import { Globe, TrendingUp, TrendingDown } from 'lucide-react';

export function GlobalMarkets() {
  const { data, isLoading } = useSWR('/api/global', fetcher, {
    refreshInterval: 60000 // 1 minute
  });

  if (isLoading || !data) return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="w-48 h-16 bg-card animate-pulse rounded-2xl shrink-0" />
      ))}
    </div>
  );

  const markets = Array.isArray(data) ? data : [];

  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
      {markets.map((m: any) => {
        const isPositive = m.regularMarketChangePercent >= 0;
        return (
          <div key={m.symbol} className="glass px-6 py-4 rounded-2xl border-border flex items-center gap-4 shrink-0 hover:border-accent/30 transition-all cursor-pointer">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-muted uppercase tracking-widest">{m.shortName}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black number-font">{m.regularMarketPrice.toLocaleString()}</span>
                <span className={cn(
                  "text-[9px] font-bold flex items-center gap-0.5",
                  isPositive ? "text-gain" : "text-loss"
                )}>
                  {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {m.regularMarketChangePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
