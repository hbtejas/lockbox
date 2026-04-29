import type { PaginatedResponse } from '../types/domain'
import { http } from './http'

export interface ScreenerResultRow {
  company: string
  ticker: string
  sector: string
  marketCap: number
  peRatio: number
  roce: number
  revenueGrowth: number
  promoterHolding: number
}

export interface ScreenerPayload {
  query: string
  columns: string[]
  page?: number
  limit?: number
}

export async function filterScreener(payload: ScreenerPayload): Promise<PaginatedResponse<ScreenerResultRow>> {
  const { data } = await http.post('/screener/filter', payload)
  return data
}

export async function fetchPopularQueries(): Promise<string[]> {
  const { data } = await http.get('/screener/popular-queries')
  return data.data
}

export async function saveQuery(query: string): Promise<void> {
  await http.post('/screener/save-query', { query })
}

export async function fetchSavedQueries(): Promise<string[]> {
  const { data } = await http.get('/screener/saved-queries')
  return data.data
}
