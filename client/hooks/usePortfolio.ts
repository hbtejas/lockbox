'use client';

import { useState, useEffect } from 'react';

const PORTFOLIO_KEY = 'lockbox_portfolio';

export interface Holding {
  id: string;
  symbol: string;
  qty: number;
  buyPrice: number;
  buyDate: string;
}

export function usePortfolio() {
  const [holdings, setHoldings] = useState<Holding[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(PORTFOLIO_KEY);
    if (saved) {
      setHoldings(JSON.parse(saved));
    }
  }, []);

  const addHolding = (holding: Omit<Holding, 'id'>) => {
    const newHolding = { ...holding, id: Math.random().toString(36).substr(2, 9) };
    const updated = [...holdings, newHolding];
    setHoldings(updated);
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(updated));
  };

  const removeHolding = (id: string) => {
    const updated = holdings.filter(h => h.id !== id);
    setHoldings(updated);
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(updated));
  };

  return { holdings, addHolding, removeHolding };
}
