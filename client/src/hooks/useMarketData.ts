import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useLivePrices(symbols?: string[]) {
  return useQuery({
    queryKey: ['live-prices', symbols?.join(',')],
    refetchInterval: 15_000,  // fallback polling every 15s if realtime fails
    queryFn: async () => {
      let q = supabase.from('live_prices').select('*');
      if (symbols?.length) q = q.in('symbol', symbols);
      const { data, error } = await q.order('symbol');
      if (error) throw error;
      return data;
    },
  });
}

export function useCompanySearch(query: string) {
  return useQuery({
    queryKey: ['company-search', query],
    enabled: query.length > 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('symbol, name, sector, exchange')
        .or(`symbol.ilike.%${query}%,name.ilike.%${query}%`)
        .eq('is_active', true)
        .limit(10);
      if (error) throw error;
      return data;
    },
  });
}

export function useMarketIndices() {
  return useQuery({
    queryKey: ['market-indices'],
    queryFn: async () => {
      // Mock or fetch from a specific table if exists
      return [
        { name: 'NIFTY 50', value: 22450.75, change: 120.3, changePercent: 0.54 },
        { name: 'SENSEX', value: 73850.20, change: 450.1, changePercent: 0.61 },
        { name: 'NIFTY BANK', value: 48200.50, change: -150.2, changePercent: -0.31 },
      ];
    },
  });
}

export function useResultsSummary() {
  return useQuery({
    queryKey: ['results-summary'],
    queryFn: async () => {
      const { count: upcomingResultsToday } = await supabase
        .from('results_calendar')
        .select('*', { count: 'exact', head: true })
        .eq('result_date', new Date().toISOString().split('T')[0]);
      
      return {
        upcomingResultsToday: upcomingResultsToday || 0,
        concallsToday: 0,
        totalUpcoming: 0
      };
    },
  });
}
