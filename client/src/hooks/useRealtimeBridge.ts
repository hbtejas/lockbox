import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { PortfolioResponse } from '../api/portfolioApi'
import type { WatchlistResponse } from '../api/watchlistApi'
import { getSocketClient } from '../realtime/socketClient'
import type { CompanyOverview, WatchlistItem } from '../types/domain'

type LivePriceRow = {
  symbol: string
  price: number
  changePercent: number
  volume: number
  at: string
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
      price: update.price,
      changePercent: update.changePercent,
      volume: update.volume,
    }
  })
}

function recalculatePortfolioSummary(portfolio: PortfolioResponse): PortfolioResponse {
  const totalInvested = portfolio.holdings.reduce((sum, holding) => sum + holding.quantity * holding.avgBuyPrice, 0)
  const currentValue = portfolio.holdings.reduce((sum, holding) => sum + holding.quantity * holding.currentPrice, 0)
  const pnl = currentValue - totalInvested

  return {
    ...portfolio,
    summary: {
      totalInvested,
      currentValue,
      pnl,
      pnlPercent: totalInvested > 0 ? (pnl / totalInvested) * 100 : 0,
      dayGain: pnl * 0.03,
    },
  }
}

export function useRealtimeBridge(enabled = true) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled) {
      return
    }

    const socket = getSocketClient()

    const onPriceUpdate = (payload: LivePriceRow[] | LivePriceRow) => {
      const updates = Array.isArray(payload) ? payload : [payload]
      const updateMap = new Map(updates.map((entry) => [entry.symbol, entry]))

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
            const update = updateMap.get(holding.symbol)
            if (!update) {
              return holding
            }

            return {
              ...holding,
              currentPrice: update.price,
            }
          })

          return recalculatePortfolioSummary({
            ...portfolio,
            holdings,
          })
        }),
      )

      const companyQueries = queryClient.getQueriesData<CompanyOverview>({
        queryKey: ['company-overview'],
      })

      companyQueries.forEach(([queryKey, company]) => {
        if (!company) {
          return
        }

        const symbol = String(queryKey[1] ?? '').toUpperCase()
        const update = updateMap.get(symbol)

        if (!update) {
          return
        }

        queryClient.setQueryData<CompanyOverview>(queryKey, {
          ...company,
          currentPrice: update.price,
          changePercent: update.changePercent,
        })
      })
    }

    const onTimelineUpdate = () => {
      void queryClient.invalidateQueries({ queryKey: ['timeline'] })
    }

    const onResultsUpdate = () => {
      void queryClient.invalidateQueries({ queryKey: ['results'] })
      void queryClient.invalidateQueries({ queryKey: ['results-summary'] })
    }

    socket.on('price:update', onPriceUpdate)
    socket.on('timeline:update', onTimelineUpdate)
    socket.on('results:update', onResultsUpdate)

    return () => {
      socket.off('price:update', onPriceUpdate)
      socket.off('timeline:update', onTimelineUpdate)
      socket.off('results:update', onResultsUpdate)
    }
  }, [enabled, queryClient])
}
