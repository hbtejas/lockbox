import { useQuery } from '@tanstack/react-query';
import { http } from '../api/http';
import { supabase } from '../lib/supabase'; // Kept for results summary if needed

export function useLivePrices(symbols?: string[]) {
  return useQuery({
    queryKey: ['live-prices', symbols?.join(',')],
    refetchInterval: 15_000,
    queryFn: async () => {
      // If no specific symbols, fetch all stocks to keep the UI populated
      const { data } = await http.get('/market/all-stocks');
      const stocks = data.data;
      if (symbols && symbols.length > 0) {
        return stocks.filter((s: any) => symbols.includes(s.symbol));
      }
      return stocks;
    },
  });
}

export function useCompanySearch(query: string) {
  return useQuery({
    queryKey: ['company-search', query],
    enabled: query.length > 1,
    queryFn: async () => {
      const { data } = await http.get(`/stocks/search?q=${encodeURIComponent(query)}`);
      return data.data;
    },
  });
}

export function useMarketIndices() {
  return useQuery({
    queryKey: ['market-indices'],
    refetchInterval: 15_000,
    queryFn: async () => {
      const { data } = await http.get('/market/indices');
      return data.data.map((d: any) => ({
        name: d.name,
        shortName: d.shortName,
        value: d.price,
        change: d.change,
        changePercent: d.changePercent,
      }));
    },
  });
}

export function useMarketGainers() {
  return useQuery({
    queryKey: ['market-gainers'],
    queryFn: async () => {
      const { data } = await http.get('/market/gainers');
      return data.data;
    },
  });
}

export function useMarketLosers() {
  return useQuery({
    queryKey: ['market-losers'],
    queryFn: async () => {
      const { data } = await http.get('/market/losers');
      return data.data;
    },
  });
}

export function useMarketMostActive() {
  return useQuery({
    queryKey: ['market-most-active'],
    queryFn: async () => {
      const { data } = await http.get('/market/most-active');
      return data.data;
    },
  });
}

export function useStockOverview(symbol: string) {
  return useQuery({
    queryKey: ['stock-overview', symbol],
    enabled: !!symbol,
    queryFn: async () => {
      const { data } = await http.get(`/stocks/${symbol}`);
      return data.data;
    },
  });
}

export function useStockHistory(symbol: string, period = '1y') {
  return useQuery({
    queryKey: ['stock-history', symbol, period],
    enabled: !!symbol,
    queryFn: async () => {
      const { data } = await http.get(`/stocks/${symbol}/price?period=${period}`);
      return data.data;
    },
  });
}

export function useResultsSummary() {
  return useQuery({
    queryKey: ['results-summary'],
    queryFn: async () => {
      return {
        upcomingResultsToday: 0,
        concallsToday: 0,
        totalUpcoming: 0
      };
    },
  });
}
