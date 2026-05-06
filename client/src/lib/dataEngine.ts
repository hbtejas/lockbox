// /lib/dataEngine.ts
// Lightweight data sync engine – no external dependencies beyond the market store

import { useMarketStore } from '../store/marketStore'

class DataEngine {
  private static instance: DataEngine
  private updateInterval: ReturnType<typeof setInterval> | null = null

  private constructor() {}

  public static getInstance(): DataEngine {
    if (!DataEngine.instance) {
      DataEngine.instance = new DataEngine()
    }
    return DataEngine.instance
  }

  public start() {
    if (this.updateInterval) return

    this.updateInterval = setInterval(() => {
      this.syncMarketData()
    }, 5000)

    console.log('[DataEngine] Market engine started')
  }

  public stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  private async syncMarketData() {
    try {
      const response = await fetch('/api/quotes')
      const data = await response.json()

      if (data.stocks) {
        useMarketStore.getState().setStocks(data.stocks)
      }
      if (data.indices) {
        useMarketStore.getState().setIndices(data.indices)
      }
    } catch (error) {
      console.error('Data sync failed:', error)
    }
  }
}

export const dataEngine = DataEngine.getInstance()
