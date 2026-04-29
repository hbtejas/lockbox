// /components/SectorHeatmap.tsx
'use client'

import React, { useMemo } from 'react';
import { useMarketStore } from '@/store/marketStore';
import { getSectorPerformance } from '@/lib/marketUtils';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/Skeleton';

export function SectorHeatmap() {
  const { stocks } = useMarketStore();
  
  const sectors = useMemo(() => getSectorPerformance(stocks), [stocks]);

  const getColor = (change: number) => {
    if (change > 2) return 'bg-[#16a34a] text-white';
    if (change > 1) return 'bg-[#22c55e] text-white';
    if (change > 0) return 'bg-[#86efac] text-black';
    if (change > -1) return 'bg-[#fca5a5] text-black';
    if (change > -2) return 'bg-[#ef4444] text-white';
    return 'bg-[#dc2626] text-white';
  };

  if (stocks.length === 0) return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-24 rounded-[28px]" />)}
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {sectors.map((data) => (
        <div 
          key={data.name}
          className={cn(
            "p-5 rounded-[28px] transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between aspect-square md:aspect-auto md:h-32",
            getColor(data.avgChange)
          )}
        >
          <div>
            <h4 className="text-[9px] font-black uppercase tracking-widest opacity-80">{data.name}</h4>
            <p className="text-xl font-black number-font mt-1">{data.avgChange.toFixed(2)}%</p>
          </div>
          <div className="flex justify-between items-center opacity-80">
            <span className="text-[9px] font-black">{data.advances} ▲</span>
            <span className="text-[9px] font-black">{data.declines} ▼</span>
          </div>
        </div>
      ))}
    </div>
  );
}
