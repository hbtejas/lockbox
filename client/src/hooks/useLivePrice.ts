import { useEffect, useState } from 'react'
import { getSocketClient } from '../realtime/socketClient'

export interface PriceUpdate {
  symbol: string
  price: number
  changePercent: number
  volume: number
  at: string
}

export function useLivePrice(symbol?: string) {
  const [latestQuote, setLatestQuote] = useState<PriceUpdate | null>(null)

  useEffect(() => {
    const socket = getSocketClient()

    const onPriceUpdate = (updates: PriceUpdate[]) => {
      if (symbol) {
        const match = updates.find((pkg) => pkg.symbol === symbol.toUpperCase())
        if (match) {
          setLatestQuote(match)
        }
      } else {
        // If no symbol provided, we might want the whole batch (for monitor page)
        // This is handled by useAllLivePrices
      }
    }

    socket.on('price:update', onPriceUpdate)

    return () => {
      socket.off('price:update', onPriceUpdate)
    }
  }, [symbol])

  return latestQuote
}

export function useAllLivePrices() {
  const [prices, setPrices] = useState<Record<string, PriceUpdate>>({})

  useEffect(() => {
    const socket = getSocketClient()

    const onPriceUpdate = (updates: PriceUpdate[]) => {
      setPrices((prev) => {
        const next = { ...prev }
        updates.forEach((u) => {
          next[u.symbol] = u
        })
        return next
      })
    }

    socket.on('price:update', onPriceUpdate)

    return () => {
      socket.off('price:update', onPriceUpdate)
    }
  }, [])

  return prices
}
