// /lib/dataEngine.ts
import { useMarketStore } from '../store/marketStore';
import type { StockQuote, IndexData } from '../types';
import { toast } from 'react-hot-toast';

class DataEngine {
  private static instance: DataEngine;
  private socket: any = null;
  private updateInterval: any = null;

  private constructor() {}

  public static getInstance(): DataEngine {
    if (!DataEngine.instance) {
      DataEngine.instance = new DataEngine();
    }
    return DataEngine.instance;
  }

  public start() {
    if (this.updateInterval) return;

    // Simulate real-time updates for now, or connect to WS if available
    this.updateInterval = setInterval(() => {
      this.syncMarketData();
    }, 5000);

    toast.success('Market engine started', {
      icon: '🚀',
      style: {
        background: '#111118',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.1)'
      }
    });
  }

  public stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private async syncMarketData() {
    try {
      const response = await fetch('/api/quotes');
      const data = await response.json();
      
      if (data.stocks) {
        useMarketStore.getState().setStocks(data.stocks);
      }
      if (data.indices) {
        useMarketStore.getState().setIndices(data.indices);
      }
    } catch (error) {
      console.error('Data sync failed:', error);
    }
  }
}

export const dataEngine = DataEngine.getInstance();
