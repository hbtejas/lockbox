import { useQuery } from '@tanstack/react-query'
import {
  fetchCompanyResults,
  fetchCompanyOverview,
  fetchFinancials,
  fetchNews,
  fetchPeers,
  fetchShareholding,
  fetchStockPrices,
} from '../api/stockApi'

export function useCompanyOverview(symbol: string) {
  return useQuery({
    queryKey: ['company-overview', symbol],
    queryFn: () => fetchCompanyOverview(symbol),
    enabled: Boolean(symbol),
  })
}

export function useStockPrices(symbol: string, period: string) {
  return useQuery({
    queryKey: ['stock-prices', symbol, period],
    queryFn: () => fetchStockPrices(symbol, period),
    enabled: Boolean(symbol),
  })
}

export function useFinancials(symbol: string, type: string) {
  return useQuery({
    queryKey: ['financials', symbol, type],
    queryFn: () => fetchFinancials(symbol, type),
    enabled: Boolean(symbol),
  })
}

export function useShareholding(symbol: string) {
  return useQuery({
    queryKey: ['shareholding', symbol],
    queryFn: () => fetchShareholding(symbol),
    enabled: Boolean(symbol),
  })
}

export function usePeers(symbol: string) {
  return useQuery({
    queryKey: ['peers', symbol],
    queryFn: () => fetchPeers(symbol),
    enabled: Boolean(symbol),
  })
}

export function useNews(symbol: string) {
  return useQuery({
    queryKey: ['stock-news', symbol],
    queryFn: () => fetchNews(symbol),
    enabled: Boolean(symbol),
  })
}

export function useCompanyResults(symbol: string) {
  return useQuery({
    queryKey: ['stock-results', symbol],
    queryFn: () => fetchCompanyResults(symbol),
    enabled: Boolean(symbol),
  })
}
