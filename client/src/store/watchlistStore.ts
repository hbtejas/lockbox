import { create } from 'zustand'
import type { WatchlistItem } from '../types/domain'

interface WatchlistState {
  items: WatchlistItem[]
  setItems: (items: WatchlistItem[]) => void
  upsertItem: (item: WatchlistItem) => void
  removeItem: (symbol: string) => void
}

export const useWatchlistStore = create<WatchlistState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  upsertItem: (item) =>
    set((state) => {
      const existing = state.items.find((entry) => entry.symbol === item.symbol)
      if (!existing) {
        return { items: [item, ...state.items] }
      }
      return {
        items: state.items.map((entry) => (entry.symbol === item.symbol ? item : entry)),
      }
    }),
  removeItem: (symbol) =>
    set((state) => ({
      items: state.items.filter((entry) => entry.symbol !== symbol),
    })),
}))
