// /hooks/useChartData.ts
'use client'

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import type { TimeRange, ChartDataPoint } from '@/types';

export function useChartData(symbol: string | undefined, range: TimeRange) {
  const intervalMap: Record<TimeRange, string> = {
    '1d': '2m', '5d': '15m', '1mo': '1h',
    '3mo': '1d', '6mo': '1d', '1y': '1d',
    '5y': '1wk', 'max': '1mo'
  };

  const { data, error, isLoading } = useSWR<ChartDataPoint[] | null>(
    symbol ? `/api/chart/${symbol}?range=${range}&interval=${intervalMap[range]}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return { data, error, isLoading };
}
