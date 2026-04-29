import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export function useAlerts(enabled: boolean = true) {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ['alerts', user?.id],
    enabled: enabled && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateAlert() {
  const qc   = useQueryClient();
  const user = useAuthStore((s) => s.user);
  return useMutation({
    mutationFn: async (alert: {
      symbol: string;
      alertType: 'price_above' | 'price_below' | 'change_pct';
      triggerValue: number;
    }) => {
      const { data, error } = await supabase
        .from('alerts')
        .insert({ 
          user_id: user!.id, 
          symbol: alert.symbol,
          alert_type: alert.alertType,
          trigger_value: alert.triggerValue
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });
}

export function useToggleAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      // Toggle logic
      const { data: current } = await supabase.from('alerts').select('is_active').eq('id', id).single();
      if (!current) return;

      const { error } = await supabase
        .from('alerts')
        .update({ is_active: !current.is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });
}

export function useDeleteAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });
}
