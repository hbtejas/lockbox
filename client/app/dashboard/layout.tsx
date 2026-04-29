// /app/dashboard/layout.tsx
'use client'

import React, { useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TickerTape } from '@/components/TickerTape';
import { CommandPalette } from '@/components/CommandPalette';
import { ChartModal } from '@/components/ChartModal';
import { useMarketStore } from '@/store/marketStore';
import { useMarketData } from '@/hooks/useMarketData';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { socketService } from '@/lib/socket';
import { MobileNav } from '@/components/MobileNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isChartOpen = useMarketStore((state) => state.isChartOpen);
  const { setStocks, checkAlerts } = useMarketStore();
  
  // Initialize market data fetching
  useMarketData();

  useEffect(() => {
    // Initialize socket connection
    const socket = socketService.connect();
    
    socket.on('price:update', (updates: any[]) => {
      const currentStocks = useMarketStore.getState().stocks;
      if (!currentStocks || currentStocks.length === 0) return;

      const updatedStocks = currentStocks.map(stock => {
        const update = Array.isArray(updates) ? updates.find(u => u.symbol === stock.symbol) : null;
        if (update) {
          return {
            ...stock,
            regularMarketPrice: update.price ?? stock.regularMarketPrice,
            regularMarketChangePercent: update.changePercent ?? stock.regularMarketChangePercent,
            regularMarketVolume: update.volume ?? stock.regularMarketVolume,
          };
        }
        return stock;
      });
      
      setStocks(updatedStocks);
      checkAlerts();
    });

    // Request notification permission on mount
    if (typeof window !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      socket.off('price:update');
    };
  }, [setStocks, checkAlerts]);

  return (
    <div className="flex h-screen overflow-hidden bg-base">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TickerTape />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      
      <CommandPalette />
      <MobileNav />
      {isChartOpen && <ChartModal />}
    </div>
  );
}
