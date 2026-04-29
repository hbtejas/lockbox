import { useMutation, useQuery } from '@tanstack/react-query'
import {
  fetchPopularQueries,
  fetchSavedQueries,
  filterScreener,
  saveQuery,
  type ScreenerPayload,
} from '../api/screenerApi'

export function usePopularScreenerQueries() {
  return useQuery({
    queryKey: ['screener-popular-queries'],
    queryFn: fetchPopularQueries,
  })
}

export function useSavedScreenerQueries(enabled: boolean) {
  return useQuery({
    queryKey: ['screener-saved-queries'],
    queryFn: fetchSavedQueries,
    enabled,
  })
}

export function useScreenerFilter() {
  return useMutation({
    mutationFn: (payload: ScreenerPayload) => filterScreener(payload),
  })
}

export function useSaveScreenerQuery() {
  return useMutation({
    mutationFn: (query: string) => saveQuery(query),
  })
}
