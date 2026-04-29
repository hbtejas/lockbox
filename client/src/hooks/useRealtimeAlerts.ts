import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export function useRealtimeAlerts() {
  const qc   = useQueryClient();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`alerts-${user.id}`)
      .on(
        'postgres_changes',
        {
          event:  '*',
          schema: 'public',
          table:  'alerts',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          qc.invalidateQueries({ queryKey: ['alerts', user.id] });
          // Show browser notification if alert just triggered
          if (
            payload.eventType === 'UPDATE' &&
            payload.new?.triggered_at &&
            !payload.old?.triggered_at
          ) {
            if (Notification.permission === 'granted') {
              new Notification(`Alert Triggered: ${payload.new.symbol}`, {
                body: `Price ${payload.new.alert_type}: ₹${payload.new.trigger_value}`,
              });
            }
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, qc]);
}
