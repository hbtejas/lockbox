'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useStocks } from '@/hooks/useMarketData';
import { VirtualizedStockTable } from '@/components/dashboard/VirtualizedStockTable';
import { Star, Download, Search, LayoutGrid } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function WatchlistPage() {
  const { watchlist } = useWatchlist();
  const { stocks, isLoading } = useStocks();

  const watchedStocks = useMemo(() => {
    if (!stocks || !Array.isArray(stocks) || !Array.isArray(watchlist)) return [];
    return stocks.filter((s: any) => watchlist.includes(s.symbol));
  }, [stocks, watchlist]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">My Watchlist</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2">Personalized list of monitored stocks</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">
              <LayoutGrid className="w-4 h-4" /> Grid View
            </button>
          </div>
        </div>

        {watchedStocks.length > 0 ? (
          <div className="space-y-6">
            {isLoading ? <Skeleton className="h-[600px] rounded-3xl" /> : 
              <VirtualizedStockTable stocks={watchedStocks} onSelect={() => {}} />
            }
          </div>
        ) : (
          <div className="glass h-[400px] rounded-[40px] flex items-center justify-center border-dashed border-white/10">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-10 h-10 text-yellow-500" />
              </div>
              <h3 className="text-xl font-black">Your watchlist is empty</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">Add stocks to your watchlist by clicking the star icon in the market movers table.</p>
              <Link href="/dashboard" className="inline-block bg-indigo-600 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">
                Browse Market
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
