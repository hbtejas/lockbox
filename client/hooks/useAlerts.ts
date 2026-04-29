'use client';

import { useState, useEffect } from 'react';

const ALERTS_KEY = 'lockbox_alerts';

export interface Alert {
  id: string;
  symbol: string;
  type: 'above' | 'below' | 'change';
  value: number;
  active: boolean;
  triggeredAt?: number;
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(ALERTS_KEY);
    if (saved) {
      setAlerts(JSON.parse(saved));
    }
  }, []);

  const addAlert = (alert: Omit<Alert, 'id' | 'active'>) => {
    const newAlert = { ...alert, id: Math.random().toString(36).substr(2, 9), active: true };
    const updated = [...alerts, newAlert];
    setAlerts(updated);
    localStorage.setItem(ALERTS_KEY, JSON.stringify(updated));
    
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const removeAlert = (id: string) => {
    const updated = alerts.filter(a => a.id !== id);
    setAlerts(updated);
    localStorage.setItem(ALERTS_KEY, JSON.stringify(updated));
  };

  const toggleAlert = (id: string) => {
    const updated = alerts.map(a => a.id === id ? { ...a, active: !a.active } : a);
    setAlerts(updated);
    localStorage.setItem(ALERTS_KEY, JSON.stringify(updated));
  };

  return { alerts, addAlert, removeAlert, toggleAlert };
}
