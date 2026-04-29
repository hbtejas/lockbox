// /hooks/useMarketData.ts
'use client'

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { useMarketStore } from '@/store/marketStore';
import { useEffect } from 'react';

export function useMarketData() {
  const { refreshInterval, setStocks, setIndices, setError, checkAlerts } = useMarketStore();

  const { data, error, isLoading, mutate } = useSWR(
    '/api/quotes',
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      onSuccess: (data: any) => {
        if (data?.stocks) setStocks(data.stocks);
        if (data?.indices) setIndices(data.indices);
        checkAlerts();
      },
      onError: (err: any) => setError(err.message),
    }
  );

  return { data, error, isLoading, refresh: mutate };
}

export function useStocks() {
  const stocks = useMarketStore((state) => state.stocks);
  const isLoading = useMarketStore((state) => state.isLoading);
  return { stocks, isLoading };
}

export function useIndices() {
  const indices = useMarketStore((state) => state.indices);
  return { indices };
}

export function useNews() {
  const { data, error, isLoading } = useSWR('/api/news', fetcher, {
    refreshInterval: 300000, // 5 minutes
  });
  return { news: Array.isArray(data) ? data : [], error, isLoading };
}

export function useChartData(symbol: string, range: string = '1d') {
  const { data, error, isLoading } = useSWR(
    symbol ? `/api/chart/${symbol}?range=${range}` : null,
    fetcher,
    { refreshInterval: 60000 } // 1 minute
  );
  
  const chart = (data && typeof data === 'object' && !Array.isArray(data)) ? data : {} as any;

  const formattedData = (chart.timestamps || []).map((ts: number, i: number) => ({
    timestamp: ts * 1000, // convert to ms if needed, but chart expects seconds usually. Actually lightweight-charts expects seconds for Unix time.
    open: chart.open?.[i] || 0,
    high: chart.high?.[i] || 0,
    low: chart.low?.[i] || 0,
    close: chart.close?.[i] || 0,
    volume: chart.volume?.[i] || 0,
  }));

  return { data: formattedData, error, isLoading };
}
