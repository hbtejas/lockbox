// /types/index.ts

export interface StockQuote {
  symbol: string
  shortName: string
  longName: string
  regularMarketPrice: number
  regularMarketChange: number
  regularMarketChangePercent: number
  regularMarketVolume: number
  regularMarketDayHigh: number
  regularMarketDayLow: number
  regularMarketOpen: number
  regularMarketPreviousClose: number
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
  marketCap: number
  trailingPE: number | null
  averageDailyVolume3Month: number
  sector: string
  previousClose: number
}

export interface IndexData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  previousClose: number
}

export interface ChartDataPoint {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface NewsItem {
  title: string
  publisher: string
  link: string
  providerPublishTime: number
  thumbnail?: string
}

export interface Holding {
  id: string
  symbol: string
  shortName: string
  quantity: number
  buyPrice: number
  buyDate: string
  broker: string
  notes?: string
}

export interface Alert {
  id: string
  symbol: string
  shortName: string
  condition: 'above' | 'below' | 'change_above' | 'change_below'
  targetValue: number
  currentPrice: number
  isTriggered: boolean
  triggeredAt?: string
  triggeredPrice?: number
  createdAt: string
  isActive?: boolean
}

export interface PortfolioSummary {
  totalInvested: number
  currentValue: number
  totalPnL: number
  totalPnLPercent: number
  dayPnL: number
  dayPnLPercent: number
}

export interface OptionContract {
  strike: number
  callLTP: number
  callOI: number
  callOIChange: number
  callVolume: number
  callIV: number
  putLTP: number
  putOI: number
  putOIChange: number
  putVolume: number
  putIV: number
  isATM: boolean
}

export interface SectorData {
  name: string
  stocks: string[]
  avgChange: number
  advances: number
  declines: number
  totalMarketCap: number
}

export type TimeRange = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y' | 'max'
export type ChartType = 'candlestick' | 'line' | 'area'
export type SortDirection = 'asc' | 'desc'
export type Theme = 'dark' | 'light'

// --- NEW AUTH & AI TYPES ---

export type Role = 'USER' | 'PREMIUM' | 'ADMIN' | 'SUPERADMIN';

export interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface AIChat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: AIMessage[];
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success' | 'warning';
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  details?: string;
  createdAt: string;
  ipAddress?: string;
}
