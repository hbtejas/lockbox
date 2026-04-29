// /components/StockTable.tsx
'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useVirtual } from 'react-virtual';
import { Search, Star, TrendingUp, TrendingDown, ChevronUp, ChevronDown, BarChart4 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StockQuote } from '@/types';
import { useMarketStore } from '@/store/marketStore';
import { formatPrice, formatVolume, getChangeColor } from '@/lib/marketUtils';
import { Badge, PercentageBadge } from './ui/Badge';

interface StockTableProps {
  stocks: StockQuote[];
  onSelect?: (stock: StockQuote) => void;
}

export function StockTable({ stocks, onSelect }: StockTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof StockQuote; direction: 'asc' | 'desc' }>({ key: 'marketCap', direction: 'desc' });
  const [selectedSector, setSelectedSector] = useState('All');
  const { watchlist, addToWatchlist, removeFromWatchlist, openChart } = useMarketStore();

  const parentRef = useRef<HTMLDivElement>(null);

  const filteredStocks = useMemo(() => {
    return stocks
      .filter(s => 
        (selectedSector === 'All' || s.sector === selectedSector) &&
        (s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
         s.shortName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => {
        const valA = a[sortConfig.key] ?? 0;
        const valB = b[sortConfig.key] ?? 0;
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [stocks, searchQuery, selectedSector, sortConfig]);

  const rowVirtualizer = useVirtual({
    size: filteredStocks.length,
    parentRef,
    estimateSize: React.useCallback(() => 60, []),
    overscan: 10,
  });

  const handleSort = (key: keyof StockQuote) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const sectors = ['All', ...Array.from(new Set(stocks.map(s => s.sector)))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-[32px] border border-border">
        <div className="relative flex-1 w-full max-w-md group">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" />
          <input 
            type="text" 
            placeholder="Search symbols or company name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-base border border-border rounded-2xl pl-12 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-accent transition-all shadow-2xl"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
          {sectors.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSector(s)}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                selectedSector === s ? "bg-accent text-white shadow-lg shadow-accent/20" : "bg-base text-muted hover:text-white border border-border"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-[40px] border-border overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Header */}
            <div className="grid grid-cols-[60px_40px_1fr_120px_140px_120px_120px_100px] gap-4 px-8 py-6 border-b border-border text-[9px] font-black text-muted uppercase tracking-[0.2em]">
              <div className="cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('marketCap')}>Rank</div>
              <div></div>
              <div className="cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('shortName')}>Company</div>
              <div className="text-right cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('regularMarketPrice')}>Price</div>
              <div className="text-right cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('regularMarketChange')}>Day Change</div>
              <div className="text-right cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('regularMarketVolume')}>Volume</div>
              <div className="text-right cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('fiftyTwoWeekHigh')}>52W High</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Body */}
            <div 
              ref={parentRef}
              className="h-[600px] overflow-y-auto no-scrollbar relative"
            >
              <div
                style={{
                  height: `${rowVirtualizer.totalSize}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {rowVirtualizer.virtualItems.map((virtualRow) => {
                  const stock = filteredStocks[virtualRow.index];
                  const isWatchlisted = watchlist.includes(stock.symbol);

                  return (
                    <div
                      key={stock.symbol}
                      onClick={() => openChart(stock)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                      className="grid grid-cols-[60px_40px_1fr_120px_140px_120px_120px_100px] gap-4 px-8 items-center border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    >
                      <div className="text-xs font-black text-muted number-font">{virtualRow.index + 1}</div>
                      <div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            isWatchlisted ? removeFromWatchlist(stock.symbol) : addToWatchlist(stock.symbol);
                          }}
                          className={cn(
                            "transition-all",
                            isWatchlisted ? "text-yellow-500 scale-110" : "text-muted hover:text-white"
                          )}
                        >
                          <Star className={cn("w-4 h-4", isWatchlisted && "fill-current")} />
                        </button>
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-sm tracking-tight truncate group-hover:text-accent transition-colors">{stock.symbol.split('.')[0]}</p>
                        <p className="text-[10px] font-bold text-muted truncate uppercase tracking-widest">{stock.shortName}</p>
                      </div>
                      <div className="text-right font-black text-sm number-font">
                        {formatPrice(stock.regularMarketPrice)}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={cn("text-[10px] font-black number-font", getChangeColor(stock.regularMarketChange))}>
                          {stock.regularMarketChange && stock.regularMarketChange > 0 ? '+' : ''}
                          {(stock.regularMarketChange || 0).toFixed(2)}
                        </span>
                        <PercentageBadge value={stock.regularMarketChangePercent || 0} showIcon={false} />
                      </div>
                      <div className="text-right text-xs font-bold text-muted number-font">
                        {formatVolume(stock.regularMarketVolume)}
                      </div>
                      <div className="text-right text-xs font-bold text-muted number-font">
                        {formatPrice(stock.fiftyTwoWeekHigh)}
                      </div>
                      <div className="flex justify-end gap-2">
                        <button className="p-2 bg-white/5 rounded-xl text-muted group-hover:bg-accent group-hover:text-white transition-all">
                          <BarChart4 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
