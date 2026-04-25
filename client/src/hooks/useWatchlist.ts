import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addStockToWatchlist,
  createWatchlist,
  fetchWatchlists,
  removeStockFromWatchlist,
} from '../api/watchlistApi'

export function useWatchlists(enabled: boolean) {
  return useQuery({
    queryKey: ['watchlists'],
    queryFn: fetchWatchlists,
    enabled,
  })
}

export function useCreateWatchlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => createWatchlist(name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['watchlists'] })
    },
  })
}

export function useAddWatchlistStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { watchlistId: string; symbol: string }) =>
      addStockToWatchlist(payload.watchlistId, payload.symbol),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['watchlists'] })
    },
  })
}

export function useRemoveWatchlistStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { watchlistId: string; symbol: string }) =>
      removeStockFromWatchlist(payload.watchlistId, payload.symbol),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['watchlists'] })
    },
  })
}
