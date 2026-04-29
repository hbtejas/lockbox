'use client';

import React, { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Star, Bell, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWatchlist } from '@/hooks/useWatchlist';

interface StockTableProps {
  stocks: any[];
  onSelect: (stock: any) => void;
}

export function VirtualizedStockTable({ stocks, onSelect }: StockTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const { isWatched, toggleWatchlist } = useWatchlist();

  const rowVirtualizer = useVirtualizer({
    count: stocks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 10,
  });

  return (
    <div className="bg-[#111118]/50 border border-[#1e1e2e] rounded-3xl overflow-hidden glass">
      <div className="grid grid-cols-7 px-6 py-4 border-b border-[#1e1e2e] text-[10px] font-black text-gray-500 uppercase tracking-widest bg-black/20">
        <div className="col-span-2">Company</div>
        <div className="text-right">Price</div>
        <div className="text-right">Change</div>
        <div className="text-right">Volume</div>
        <div className="text-right hidden lg:block">52W High/Low</div>
        <div className="text-right">Actions</div>
      </div>
      
      <div
        ref={parentRef}
        className="h-[600px] overflow-auto scrollbar-thin"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const stock = stocks[virtualRow.index];
            const isPositive = stock.regularMarketChangePercent >= 0;

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className={cn(
                  "absolute top-0 left-0 w-full grid grid-cols-7 items-center px-6 py-4 border-b border-[#1e1e2e]/50 hover:bg-white/[0.02] transition-all group cursor-pointer",
                  isPositive ? "hover:bg-green-500/[0.02]" : "hover:bg-red-500/[0.02]"
                )}
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                onClick={() => onSelect(stock)}
              >
                <div className="col-span-2 flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs",
                    isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {stock.symbol.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm group-hover:text-indigo-400 transition-colors">{stock.symbol.split('.')[0]}</h4>
                    <p className="text-[10px] text-gray-500 font-medium truncate w-32">{stock.shortName}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-sm number-font">₹{stock.regularMarketPrice.toLocaleString('en-IN')}</p>
                </div>

                <div className="text-right">
                  <div className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black",
                    isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(stock.regularMarketChangePercent).toFixed(2)}%
                  </div>
                </div>

                <div className="text-right text-xs text-gray-500 font-medium number-font">
                  {(stock.regularMarketVolume / 100000).toFixed(1)}L
                </div>

                <div className="text-right hidden lg:block">
                  <div className="flex flex-col gap-1 items-end">
                    <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500"
                        style={{ width: `${((stock.regularMarketPrice - stock.fiftyTwoWeekLow) / (stock.fiftyTwoWeekHigh - stock.fiftyTwoWeekLow)) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between w-24 text-[8px] font-bold text-gray-600">
                      <span>L</span>
                      <span>H</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex items-center justify-end gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleWatchlist(stock.symbol); }}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      isWatched(stock.symbol) ? "bg-yellow-500/10 text-yellow-500" : "bg-white/5 text-gray-500 hover:text-gray-200"
                    )}
                  >
                    <Star className={cn("w-4 h-4", isWatched(stock.symbol) && "fill-current")} />
                  </button>
                  <button className="p-2 rounded-xl bg-white/5 text-gray-500 hover:text-gray-200 transition-all">
                    <Bell className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
