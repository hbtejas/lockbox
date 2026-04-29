import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface PriceUpdate {
  symbol: string;
  price: number;
  changePercent: number;
  volume: number;
  at: string;
}

export function useLivePrice(symbol?: string) {
  const [latestQuote, setLatestQuote] = useState<PriceUpdate | null>(null);

  useEffect(() => {
    if (!symbol) return;

    const normalizedSymbol = symbol.toUpperCase();

    // 1. Fetch initial price from Supabase
    const fetchInitial = async () => {
      const { data } = await supabase
        .from('live_prices')
        .select('*')
        .eq('symbol', normalizedSymbol)
        .single();
      
      if (data) {
        setLatestQuote({
          symbol: data.symbol,
          price: data.price,
          changePercent: data.change_pct,
          volume: data.volume,
          at: data.updated_at
        });
      }
    };
    fetchInitial();

    // 2. Subscribe to realtime updates
    const channel = supabase
      .channel(`live-price-${normalizedSymbol}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'live_prices',
          filter: `symbol=eq.${normalizedSymbol}`,
        },
        (payload) => {
          const data = payload.new;
          setLatestQuote({
            symbol: data.symbol,
            price: data.price,
            changePercent: data.change_pct,
            volume: data.volume,
            at: data.updated_at
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [symbol]);

  return latestQuote;
}

export function useAllLivePrices() {
  const [prices, setPrices] = useState<Record<string, PriceUpdate>>({});

  useEffect(() => {
    // 1. Fetch all current prices
    const fetchAll = async () => {
      const { data } = await supabase.from('live_prices').select('*');
      if (data) {
        const initialMap: Record<string, PriceUpdate> = {};
        data.forEach(d => {
          initialMap[d.symbol] = {
            symbol: d.symbol,
            price: d.price,
            changePercent: d.change_pct,
            volume: d.volume,
            at: d.updated_at
          };
        });
        setPrices(initialMap);
      }
    };
    fetchAll();

    // 2. Subscribe to all changes in live_prices
    const channel = supabase
      .channel('all-live-prices')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_prices',
        },
        (payload) => {
          const data = payload.new as any;
          if (!data || !data.symbol) return;
          
          setPrices((prev) => ({
            ...prev,
            [data.symbol]: {
              symbol: data.symbol,
              price: data.price,
              changePercent: data.change_pct,
              volume: data.volume,
              at: data.updated_at
            }
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return prices;
}
