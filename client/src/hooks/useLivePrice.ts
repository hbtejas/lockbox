import { useEffect, useState } from 'react';
import { http } from '../api/http';

export interface PriceUpdate {
  symbol: string;
  price: number;
  changePercent: number;
  volume: number;
  at: string;
}

export function useLivePrice(symbol?: string) {
  const [latestQuote, setLatestQuote] = useState<PriceUpdate | null>(null);

  useEffect(() => {
    if (!symbol) return;
    const normalizedSymbol = symbol.toUpperCase();
    
    let isMounted = true;

    const fetchPrice = async () => {
      try {
        const response = await http.get(`/stocks/${normalizedSymbol}/quote`);
        const data = response.data.data;
        if (isMounted && data) {
          setLatestQuote({
            symbol: data.symbol,
            price: data.price,
            changePercent: data.changePercent,
            volume: data.volume,
            at: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error('Failed to fetch live price', err);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol]);

  return latestQuote;
}

export function useAllLivePrices() {
  const [prices, setPrices] = useState<Record<string, PriceUpdate>>({});

  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      try {
        const response = await http.get('/market/all-stocks');
        const data = response.data.data;
        if (isMounted && data && Array.isArray(data)) {
          const newPrices: Record<string, PriceUpdate> = {};
          data.forEach((d: any) => {
            newPrices[d.symbol] = {
              symbol: d.symbol,
              price: d.price,
              changePercent: d.changePercent,
              volume: d.volume,
              at: new Date().toISOString()
            };
          });
          setPrices(newPrices);
        }
      } catch (err) {
        console.error('Failed to fetch all live prices', err);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return prices;
}
