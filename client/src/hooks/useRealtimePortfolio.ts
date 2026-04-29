import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export function useRealtimePortfolio(portfolioId?: string) {
  const qc   = useQueryClient();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user || !portfolioId) return;

    const channel = supabase
      .channel(`portfolio-${portfolioId}`)
      .on(
        'postgres_changes',
        {
          event:  '*',
          schema: 'public',
          table:  'portfolio_holdings',
          filter: `portfolio_id=eq.${portfolioId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ['portfolio', portfolioId] });
          qc.invalidateQueries({ queryKey: ['portfolio', 'holdings', portfolioId] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, portfolioId, qc]);
}
