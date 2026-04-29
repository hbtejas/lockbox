import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export function usePortfolios(enabled: boolean = true) {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ['portfolios', user?.id],
    enabled: enabled && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*, holdings:portfolio_holdings(*, companies(name, sector))')
        .eq('user_id', user!.id)
        .order('created_at');
      if (error) throw error;
      
      // Calculate summary for each portfolio
      return (data || []).map(p => {
        const holdings = p.holdings || [];
        const totalInvested = holdings.reduce((sum, h) => sum + (h.avg_buy_price * h.quantity), 0);
        // Note: currentValue would ideally come from live_prices join, 
        // but for now we calculate a placeholder or mock.
        const currentValue = totalInvested * 1.1; // 10% gain mock
        
        return {
          ...p,
          summary: {
            totalInvested,
            currentValue,
            totalPnL: currentValue - totalInvested,
            pnlPercent: totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0,
            holdingCount: holdings.length
          }
        };
      });
    },
  });
}

export function useCreatePortfolio() {
  const qc   = useQueryClient();
  const user = useAuthStore((s) => s.user);
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('portfolios')
        .insert({ user_id: user!.id, name })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolios'] }),
  });
}

export function usePortfolioPerformance(portfolioId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['portfolio-performance', portfolioId],
    enabled: enabled && !!portfolioId,
    queryFn: async () => {
      // Mock performance data for now
      const days = 30;
      return Array.from({ length: days }).map((_, i) => ({
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: 100 + Math.random() * 20 + i * 0.5,
        benchmark: 100 + Math.random() * 10 + i * 0.3,
      }));
    },
  });
}

export function useAddHolding(portfolioId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (holding: {
      symbol: string;
      quantity: number;
      avg_buy_price: number;
      buy_date?: string;
    }) => {
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .insert({ portfolio_id: portfolioId, ...holding })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolios'] }),
  });
}

export function useDeleteHolding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (holdingId: number) => {
      const { error } = await supabase
        .from('portfolio_holdings')
        .delete()
        .eq('id', holdingId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolios'] }),
  });
}
