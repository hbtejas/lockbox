// /lib/marketUtils.ts

import { formatInTimeZone } from 'date-fns-tz';
import { MARKET_HOURS } from './constants';
import type { StockQuote, PortfolioSummary, SectorData } from '@/types';
import { SECTOR_MAP } from './constants';

export const isMarketOpen = (): boolean => {
  const now = new Date();
  const istDateStr = formatInTimeZone(now, MARKET_HOURS.timezone, 'yyyy-MM-dd HH:mm:ss');
  const istDate = new Date(istDateStr);
  const day = istDate.getDay();
  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();

  // Weekend check
  if (day === 0 || day === 6) return false;

  const currentTimeInMinutes = hours * 60 + minutes;
  const openTimeInMinutes = MARKET_HOURS.open.hour * 60 + MARKET_HOURS.open.minute;
  const closeTimeInMinutes = MARKET_HOURS.close.hour * 60 + MARKET_HOURS.close.minute;

  return currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes <= closeTimeInMinutes;
};

export const formatPrice = (price: number | undefined | null): string => {
  if (price === undefined || price === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(price);
};

export const formatChange = (change: number | undefined | null, percent: number | undefined | null): string => {
  if (change === undefined || change === null || percent === undefined || percent === null) return '—';
  const sign = change >= 0 ? '+' : '';
  return `${sign}${formatPrice(change)} (${sign}${percent.toFixed(2)}%)`;
};

export const formatVolume = (volume: number | undefined | null): string => {
  if (volume === undefined || volume === null) return '—';
  if (volume >= 10000000) return `${(volume / 10000000).toFixed(2)} Cr`;
  if (volume >= 100000) return `${(volume / 100000).toFixed(2)} L`;
  return volume.toLocaleString('en-IN');
};

export const formatMarketCap = (cap: number | undefined | null): string => {
  if (cap === undefined || cap === null) return '—';
  if (cap >= 1000000000000) return `₹${(cap / 1000000000000).toFixed(2)} T`;
  return `₹${(cap / 10000000).toFixed(0)} Cr`;
};

export const getChangeColor = (change: number | undefined | null): string => {
  if (change === undefined || change === null || change === 0) return 'text-muted';
  return change > 0 ? 'text-gain' : 'text-loss';
};

export const getBgColor = (change: number | undefined | null): string => {
  if (change === undefined || change === null || change === 0) return 'bg-muted/10';
  return change > 0 ? 'bg-gain/10' : 'bg-loss/10';
};

export const calculatePortfolioSummary = (
  holdings: any[], 
  stocks: StockQuote[]
): PortfolioSummary => {
  let totalInvested = 0;
  let currentValue = 0;
  let dayPnL = 0;

  holdings.forEach(h => {
    const stock = stocks.find(s => s.symbol === h.symbol);
    const ltp = stock?.regularMarketPrice || h.buyPrice;
    const prevClose = stock?.regularMarketPreviousClose || h.buyPrice;
    
    totalInvested += h.quantity * h.buyPrice;
    currentValue += h.quantity * ltp;
    dayPnL += h.quantity * (ltp - prevClose);
  });

  const totalPnL = currentValue - totalInvested;
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
  const denominator = currentValue - dayPnL;
  const dayPnLPercent = denominator > 0 ? (dayPnL / denominator) * 100 : 0;

  return {
    totalInvested,
    currentValue,
    totalPnL,
    totalPnLPercent,
    dayPnL,
    dayPnLPercent
  };
};

export const getSectorPerformance = (stocks: StockQuote[]): SectorData[] => {
  return Object.entries(SECTOR_MAP).map(([name, symbols]) => {
    const sectorStocks = stocks.filter(s => symbols.includes(s.symbol));
    if (sectorStocks.length === 0) return { name, stocks: [], avgChange: 0, advances: 0, declines: 0, totalMarketCap: 0 };

    const avgChange = sectorStocks.length > 0 
      ? sectorStocks.reduce((acc, s) => acc + (s.regularMarketChangePercent || 0), 0) / sectorStocks.length 
      : 0;
    const advances = sectorStocks.filter(s => s.regularMarketChangePercent > 0).length;
    const declines = sectorStocks.length - advances;
    const totalMarketCap = sectorStocks.reduce((acc, s) => acc + (s.marketCap || 0), 0);

    return {
      name,
      stocks: symbols,
      avgChange,
      advances,
      declines,
      totalMarketCap
    };
  }).sort((a, b) => b.totalMarketCap - a.totalMarketCap);
};
