import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { PortfolioResponse } from '../api/portfolioApi'
import type { WatchlistResponse } from '../api/watchlistApi'
import type { CompanyOverview, WatchlistItem } from '../types/domain'

type LivePriceRow = {
  symbol: string
  price: number
  change_pct: number
  volume: number
  updated_at: string
}

function applyPriceUpdatesToRows(rows: WatchlistItem[] | undefined, updateMap: Map<string, LivePriceRow>) {
  if (!rows || rows.length === 0) {
    return rows
  }

  return rows.map((row) => {
    const update = updateMap.get(row.symbol)
    if (!update) {
      return row
    }

    return {
      ...row,
      price: Number(update.price),
      changePercent: Number(update.change_pct),
      volume: Number(update.volume),
    }
  })
}

function recalculatePortfolioSummary(portfolio: PortfolioResponse): PortfolioResponse {
  const totalInvested = portfolio.holdings.reduce((sum, holding) => sum + holding.quantity * holding.avgBuyPrice, 0)
  const currentValue = portfolio.holdings.reduce((sum, holding) => sum + holding.quantity * holding.currentPrice, 0)
  const pnl = currentValue - totalInvested
  
  const dayGain = portfolio.holdings.reduce((sum, h) => {
    const prevClose = h.currentPrice / (1 + (h.changePercent || 0) / 100);
    const priceChange = h.currentPrice - prevClose;
    return sum + (priceChange * h.quantity);
  }, 0);

  return {
    ...portfolio,
    summary: {
      totalInvested,
      currentValue,
      pnl,
      pnlPercent: totalInvested > 0 ? (pnl / totalInvested) * 100 : 0,
      dayGain,
      holdingCount: portfolio.holdings.length
    },
  }
}

export function useRealtimeBridge(enabled = true) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled) {
      return
    }

    const channel = supabase
      .channel('realtime-bridge')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'live_prices' },
        (payload) => {
          const update = payload.new as LivePriceRow
          const updateMap = new Map([[update.symbol, update]])

          queryClient.setQueryData<WatchlistItem[]>(['market-gainers'], (rows) => applyPriceUpdatesToRows(rows, updateMap))
          queryClient.setQueryData<WatchlistItem[]>(['market-losers'], (rows) => applyPriceUpdatesToRows(rows, updateMap))
          queryClient.setQueryData<WatchlistItem[]>(['market-active'], (rows) => applyPriceUpdatesToRows(rows, updateMap))
          queryClient.setQueryData<WatchlistItem[]>(['market-heatmap'], (rows) => applyPriceUpdatesToRows(rows, updateMap))

          queryClient.setQueryData<WatchlistResponse[]>(['watchlists'], (lists) =>
            lists?.map((list) => ({
              ...list,
              items: applyPriceUpdatesToRows(list.items, updateMap) ?? list.items,
            })),
          )

          queryClient.setQueryData<PortfolioResponse[]>(['portfolios'], (portfolios) =>
            portfolios?.map((portfolio) => {
              const holdings = portfolio.holdings.map((holding) => {
                const up = updateMap.get(holding.symbol)
                if (!up) return holding

                return {
                  ...holding,
                  currentPrice: Number(up.price),
                  changePercent: Number(up.change_pct),
                }
              })

              return recalculatePortfolioSummary({ ...portfolio, holdings })
            }),
          )

          const companyQueries = queryClient.getQueriesData<CompanyOverview>({
            queryKey: ['company-overview'],
          })

          companyQueries.forEach(([queryKey, company]) => {
            if (!company) return
            const symbol = String(queryKey[1] ?? '').toUpperCase()
            const up = updateMap.get(symbol)
            if (!up) return

            queryClient.setQueryData<CompanyOverview>(queryKey, {
              ...company,
              currentPrice: Number(up.price),
              changePercent: Number(up.change_pct),
            })
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'results_calendar' },
        () => {
          void queryClient.invalidateQueries({ queryKey: ['results'] })
          void queryClient.invalidateQueries({ queryKey: ['results-summary'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [enabled, queryClient])
}
