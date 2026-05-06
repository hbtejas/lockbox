// /store/marketStore.ts

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ── Local types for the legacy market store ──
interface StockQuote {
  symbol: string
  regularMarketPrice: number
  regularMarketChangePercent: number
  regularMarketPreviousClose?: number
  marketCap?: number
}

interface IndexData {
  symbol: string
  name: string
  value: number
  change: number
  changePercent: number
}

interface Alert {
  id: string
  symbol: string
  condition: 'above' | 'below' | 'change_above' | 'change_below'
  targetValue: number
  isActive: boolean
  isTriggered: boolean
  triggeredAt?: string
  triggeredPrice?: number
  createdAt?: string
}

interface Holding {
  id: string
  symbol: string
  quantity: number
  buyPrice: number
}

type Theme = 'light' | 'dark'

interface LockboxNotification {
  id: string
  message: string
  isRead: boolean
  createdAt: string
}

interface User {
  id: string
  name: string
  email: string
}

interface MarketState {
  // Auth
  user: User | null
  setUser: (user: User | null) => void

  // Data
  stocks: StockQuote[]
  indices: IndexData[]
  watchlist: string[]
  portfolio: Holding[]
  alerts: Alert[]
  notifications: LockboxNotification[]
  lastUpdated: string | null
  isLoading: boolean
  error: string | null
  theme: Theme
  refreshInterval: number
  selectedStock: StockQuote | null
  isChartOpen: boolean

  // Actions
  setStocks: (stocks: StockQuote[]) => void
  setIndices: (indices: IndexData[]) => void
  
  // Watchlist
  setWatchlist: (symbols: string[]) => void
  addToWatchlist: (symbol: string) => Promise<void>
  removeFromWatchlist: (symbol: string) => Promise<void>
  isInWatchlist: (symbol: string) => boolean
  
  // Portfolio
  setPortfolio: (holdings: Holding[]) => void
  addHolding: (holding: Omit<Holding, 'id'>) => Promise<void>
  removeHolding: (id: string) => Promise<void>
  updateHolding: (id: string, updates: Partial<Holding>) => Promise<void>
  
  // Alerts
  setAlerts: (alerts: Alert[]) => void
  addAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'isTriggered'>) => Promise<void>
  removeAlert: (id: string) => Promise<void>
  triggerAlert: (id: string, price: number) => Promise<void>
  
  // Notifications
  setNotifications: (notifications: LockboxNotification[]) => void
  markNotificationRead: (id: string) => Promise<void>
  markAllNotificationsRead: () => Promise<void>

  // UI
  setTheme: (theme: Theme) => void
  setRefreshInterval: (ms: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  openChart: (stock: StockQuote) => void
  closeChart: () => void
  checkAlerts: () => void
}

export const useMarketStore = create<MarketState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),

      stocks: [],
      indices: [],
      watchlist: [],
      portfolio: [],
      alerts: [],
      notifications: [],
      lastUpdated: null,
      isLoading: false,
      error: null,
      theme: 'dark',
      refreshInterval: 30000,
      selectedStock: null,
      isChartOpen: false,

      setStocks: (stocks) => set({ stocks, lastUpdated: new Date().toISOString() }),
      setIndices: (indices) => set({ indices }),
      
      setWatchlist: (watchlist) => set({ watchlist }),
      addToWatchlist: async (symbol) => {
        const { watchlist, user } = get()
        if (watchlist.includes(symbol)) return
        
        // Optimistic update
        set({ watchlist: [...watchlist, symbol] })
        
        if (user) {
          try {
            await fetch('/api/user/watchlist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ symbol })
            })
          } catch (e) {
            console.error('Failed to sync watchlist', e)
          }
        }
      },
      removeFromWatchlist: async (symbol) => {
        const { watchlist, user } = get()
        set({ watchlist: watchlist.filter(s => s !== symbol) })
        
        if (user) {
          try {
            await fetch(`/api/user/watchlist/${symbol}`, { method: 'DELETE' })
          } catch (e) {
            console.error('Failed to sync watchlist', e)
          }
        }
      },
      isInWatchlist: (symbol) => get().watchlist.includes(symbol),

      setPortfolio: (portfolio) => set({ portfolio }),
      addHolding: async (holding) => {
        const { user } = get()
        if (user) {
          const res = await fetch('/api/user/portfolio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(holding)
          })
          const newHolding = await res.json()
          set((state) => ({ portfolio: [...state.portfolio, newHolding] }))
        } else {
          set((state) => ({ 
            portfolio: [...state.portfolio, { ...holding, id: Math.random().toString(36).substr(2, 9) }] 
          }))
        }
      },
      removeHolding: async (id) => {
        const { user } = get()
        set((state) => ({ portfolio: state.portfolio.filter(h => h.id !== id) }))
        if (user) {
          await fetch(`/api/user/portfolio/${id}`, { method: 'DELETE' })
        }
      },
      updateHolding: async (id, updates) => {
        const { user } = get()
        set((state) => ({
          portfolio: state.portfolio.map(h => h.id === id ? { ...h, ...updates } : h)
        }))
        if (user) {
          await fetch(`/api/user/portfolio/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          })
        }
      },

      setAlerts: (alerts) => set({ alerts }),
      addAlert: async (alert) => {
        const { user } = get()
        if (user) {
          const res = await fetch('/api/user/alerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alert)
          })
          const newAlert = await res.json()
          set((state) => ({ alerts: [...state.alerts, newAlert] }))
        } else {
          set((state) => ({ 
            alerts: [...state.alerts, { 
              ...alert, 
              id: Math.random().toString(36).substr(2, 9), 
              createdAt: new Date().toISOString(), 
              isTriggered: false 
            }] 
          }))
        }
      },
      removeAlert: async (id) => {
        const { user } = get()
        set((state) => ({ alerts: state.alerts.filter(a => a.id !== id) }))
        if (user) {
          await fetch(`/api/user/alerts/${id}`, { method: 'DELETE' })
        }
      },
      triggerAlert: async (id, price) => {
        set((state) => ({
          alerts: state.alerts.map(a => a.id === id ? { 
            ...a, 
            isTriggered: true, 
            triggeredAt: new Date().toISOString(), 
            triggeredPrice: price 
          } : a)
        }))
        const { user } = get()
        if (user) {
          await fetch(`/api/user/alerts/${id}/trigger`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ price })
          })
        }
      },

      setNotifications: (notifications) => set({ notifications }),
      markNotificationRead: async (id) => {
        const { user } = get()
        set((state) => ({
          notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
        }))
        if (user) {
          await fetch(`/api/user/notifications/${id}`, { method: 'PATCH' })
        }
      },
      markAllNotificationsRead: async () => {
        const { user } = get()
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, isRead: true }))
        }))
        if (user) {
          await fetch('/api/user/notifications', { method: 'PATCH' })
        }
      },

      setTheme: (theme) => {
        set({ theme });
        if (typeof window !== 'undefined') {
          if (theme === 'dark') document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
        }
      },
      setRefreshInterval: (ms) => set({ refreshInterval: ms }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      openChart: (stock) => set({ selectedStock: stock, isChartOpen: true }),
      closeChart: () => set({ selectedStock: null, isChartOpen: false }),
      checkAlerts: () => {
        const { stocks, alerts, triggerAlert } = get();
        alerts.forEach(alert => {
          if (alert.isTriggered || !alert.isActive) return;
          const stock = stocks.find(s => s.symbol === alert.symbol);
          if (!stock) return;

          const price = stock.regularMarketPrice;
          let triggered = false;

          if (alert.condition === 'above' && price >= alert.targetValue) triggered = true;
          if (alert.condition === 'below' && price <= alert.targetValue) triggered = true;
          if (alert.condition === 'change_above' && stock.regularMarketChangePercent >= alert.targetValue) triggered = true;
          if (alert.condition === 'change_below' && stock.regularMarketChangePercent <= alert.targetValue) triggered = true;

          if (triggered) {
            triggerAlert(alert.id, price);
            if (typeof window !== 'undefined' && globalThis.Notification?.permission === 'granted') {
              new globalThis.Notification(`🔔 ${alert.symbol}`, {
                body: `${alert.condition.replace('_', ' ')} ₹${alert.targetValue} — Now ₹${price}`,
                icon: '/favicon.ico'
              });
            }
          }
        });
      }
    }),
    {
      name: 'lockbox-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        watchlist: state.watchlist, 
        portfolio: state.portfolio, 
        alerts: state.alerts, 
        theme: state.theme, 
        refreshInterval: state.refreshInterval 
      }),
    }
  )
)
