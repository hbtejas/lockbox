import type { WatchlistItem } from '../types/domain'
import { http } from './http'

export interface WatchlistResponse {
  id: string
  name: string
  items: WatchlistItem[]
}

export async function fetchWatchlists(): Promise<WatchlistResponse[]> {
  const { data } = await http.get('/watchlist')
  return data.data
}

export async function createWatchlist(name: string): Promise<void> {
  await http.post('/watchlist', { name })
}

export async function addStockToWatchlist(watchlistId: string, symbol: string): Promise<void> {
  await http.post(`/watchlist/${watchlistId}/stocks`, {
    symbol: symbol.toUpperCase(),
  })
}

export async function removeStockFromWatchlist(watchlistId: string, symbol: string): Promise<void> {
  await http.delete(`/watchlist/${watchlistId}/stocks/${symbol.toUpperCase()}`)
}
