import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export function useWatchlists(enabled: boolean = true) {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ['watchlists', user?.id],
    enabled: enabled && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('watchlists')
        .select(`
          *,
          items:watchlist_items(
            *,
            company:companies(name, sector, exchange),
            quote:live_prices(price, change_pct, volume)
          )
        `)
        .eq('user_id', user!.id);
      
      if (error) throw error;
      
      // Map to camelCase for the UI
      return (data || []).map(w => ({
        ...w,
        items: (w.items || []).map((item: any) => ({
          id: item.id,
          symbol: item.symbol,
          company: item.company?.name || item.symbol,
          sector: item.company?.sector,
          exchange: item.company?.exchange,
          price: item.quote?.price || 0,
          changePercent: item.quote?.change_pct || 0,
          volume: item.quote?.volume || 0,
          // Placeholder metrics for detailed view
          peRatio: 0, 
          marketCap: 0
        }))
      }));
    },
  });
}

export function useCreateWatchlist() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('watchlists')
        .insert({ user_id: user!.id, name })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlists'] }),
  });
}

export function useAddWatchlistStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ watchlistId, symbol }: { watchlistId: string; symbol: string }) => {
      const { error } = await supabase
        .from('watchlist_items')
        .insert({ watchlist_id: watchlistId, symbol });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlists'] }),
  });
}

export function useRemoveWatchlistStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ watchlistId, symbol }: { watchlistId: string; symbol: string }) => {
      const { error } = await supabase
        .from('watchlist_items')
        .delete()
        .eq('watchlist_id', watchlistId)
        .eq('symbol', symbol);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlists'] }),
  });
}
