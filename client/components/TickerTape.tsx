// /components/TickerTape.tsx
'use client'

import React from 'react';
import { useMarketStore } from '@/store/marketStore';
import { cn } from '@/lib/utils';

export function TickerTape() {
  const { stocks, indices, openChart } = useMarketStore();

  if (stocks.length === 0) return (
    <div className="h-10 bg-card border-b border-border overflow-hidden flex items-center px-4">
      <div className="flex gap-8 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-4 w-32 bg-white/5 rounded" />
        ))}
      </div>
    </div>
  );

  const items = [...indices, ...stocks.slice(0, 50)];
  // Duplicate for seamless loop
  const displayItems = [...items, ...items];

  return (
    <div className="h-10 bg-card border-b border-border overflow-hidden relative group">
      <div className="flex animate-marquee hover:[animation-play-state:paused] whitespace-nowrap items-center h-full">
        {displayItems.map((item: any, i) => {
          const isIndex = !!item.name;
          const symbol = isIndex ? item.symbol : item.symbol;
          const name = isIndex ? item.name : item.symbol.split('.')[0];
          const price = (isIndex ? item.price : item.regularMarketPrice) ?? 0;
          const changePercent = (isIndex ? item.changePercent : item.regularMarketChangePercent) ?? 0;
          const isPositive = changePercent >= 0;

          return (
            <div 
              key={`${symbol}-${i}`}
              onClick={() => !isIndex && openChart(item)}
              className="flex items-center gap-2 px-6 border-r border-border h-full cursor-pointer hover:bg-white/5 transition-colors"
            >
              <span className="font-black text-[10px] tracking-widest text-muted">{name}</span>
              <span className="font-bold text-xs number-font">₹{price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              <span className={cn(
                "text-[10px] font-black",
                isPositive ? "text-gain" : "text-loss"
              )}>
                {isPositive ? '▲' : '▼'} {Math.abs(changePercent || 0).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
