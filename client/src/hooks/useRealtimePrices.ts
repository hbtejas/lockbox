import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Call this hook once at the Dashboard layout level.
// It subscribes to live_prices changes and invalidates TanStack Query caches.
export function useRealtimePrices(symbols?: string[]) {
  const qc = useQueryClient();

  const handlePriceChange = useCallback((payload: any) => {
    const row = payload.new as { symbol: string; price: number; change: number; change_pct: number };
    // Update any query that contains this symbol's price data
    qc.setQueriesData({ queryKey: ['price', row.symbol] }, row);
    qc.invalidateQueries({ queryKey: ['market', 'overview'] });
    qc.invalidateQueries({ queryKey: ['portfolio', 'performance'] });
  }, [qc]);

  useEffect(() => {
    let filter = 'live_prices';
    // Optionally filter to only the symbols we care about
    const channel = supabase
      .channel('live-prices')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'live_prices' },
        handlePriceChange
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [handlePriceChange]);
}
