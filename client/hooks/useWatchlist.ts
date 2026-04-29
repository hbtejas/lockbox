'use client';

import { useState, useEffect } from 'react';

const WATCHLIST_KEY = 'lockbox_watchlist';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(WATCHLIST_KEY);
    if (saved) {
      setWatchlist(JSON.parse(saved));
    }
  }, []);

  const toggleWatchlist = (symbol: string) => {
    let updated;
    if (watchlist.includes(symbol)) {
      updated = watchlist.filter(s => s !== symbol);
    } else {
      if (watchlist.length >= 20) {
        alert('Watchlist limit reached (max 20). Please remove some items first.');
        return;
      }
      updated = [...watchlist, symbol];
    }
    setWatchlist(updated);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
  };

  const isWatched = (symbol: string) => watchlist.includes(symbol);

  return { watchlist, toggleWatchlist, isWatched };
}
