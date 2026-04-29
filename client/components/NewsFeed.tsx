// /components/NewsFeed.tsx
'use client'

import React from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Globe, ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { SkeletonCard } from './ui/Skeleton';

export function NewsFeed() {
  const { data, isLoading } = useSWR('/api/news', fetcher, {
    refreshInterval: 300000 // 5 minutes
  });

  if (isLoading || !data) return (
    <div className="space-y-8">
      {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
    </div>
  );

  const news = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-8">
      {news.map((item: any, i: number) => (
        <a 
          key={i}
          href={item.link} 
          target="_blank" 
          className="glass p-8 rounded-[40px] border-border hover:border-accent/30 transition-all group flex gap-8 items-start relative overflow-hidden"
        >
          <div className="w-24 h-24 bg-base rounded-3xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-500">
            <Globe className="w-8 h-8 text-muted group-hover:text-accent transition-colors" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-[9px] font-black text-accent uppercase tracking-[0.2em]">{item.publisher}</span>
              <div className="flex items-center gap-2 text-[9px] font-bold text-muted uppercase tracking-widest">
                <Clock className="w-3 h-3" />
                {format(item.providerPublishTime * 1000, 'HH:mm')}
              </div>
            </div>
            <h4 className="text-lg font-black leading-tight text-white group-hover:text-accent transition-colors duration-300">{item.title}</h4>
            <div className="flex items-center gap-2 text-[9px] font-black text-muted uppercase tracking-widest group-hover:text-white transition-colors">
              Read Full Story <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>
          <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
             <ShieldCheck className="w-4 h-4 text-accent/20" />
          </div>
        </a>
      ))}

      {news.length === 0 && (
        <div className="glass p-12 rounded-[40px] border-border border-dashed text-center space-y-4">
          <Clock className="w-8 h-8 text-muted mx-auto" />
          <p className="text-[10px] font-black text-muted uppercase tracking-widest">No news available at the moment</p>
        </div>
      )}
    </div>
  );
}
