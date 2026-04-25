import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addHolding,
  createPortfolio,
  fetchPortfolioPerformance,
  fetchPortfolios,
} from '../api/portfolioApi'

export function usePortfolios(enabled = true) {
  return useQuery({
    queryKey: ['portfolios'],
    queryFn: fetchPortfolios,
    enabled,
  })
}

export function usePortfolioPerformance(portfolioId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['portfolio-performance', portfolioId],
    queryFn: () => fetchPortfolioPerformance(portfolioId ?? ''),
    enabled: Boolean(portfolioId) && enabled,
  })
}

export function useCreatePortfolio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => createPortfolio(name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['portfolios'] })
    },
  })
}

export function useAddHolding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      portfolioId: string
      symbol: string
      quantity: number
      avgBuyPrice: number
      buyDate: string
    }) =>
      addHolding(payload.portfolioId, {
        symbol: payload.symbol,
        quantity: payload.quantity,
        avgBuyPrice: payload.avgBuyPrice,
        buyDate: payload.buyDate,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['portfolios'] })
    },
  })
}
