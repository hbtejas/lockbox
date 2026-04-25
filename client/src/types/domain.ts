export type PlanTier = 'free' | 'premium'

export interface UserProfile {
  id: string
  name: string
  email: string
  plan: PlanTier
  createdAt?: string
  lastSignIn?: string
}

export interface PricePoint {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface CompanyOverview {
  symbol: string
  name: string
  exchange: 'NSE' | 'BSE'
  sector: string
  industry: string
  currentPrice: number
  changePercent: number
  marketCap: number
  peRatio: number
  pbRatio: number
  dividendYield: number
  beta: number
  week52High: number
  week52Low: number
  description: string
}

export interface FinancialRow {
  period: string
  revenue: number
  netProfit: number
  ebitda: number
  eps: number
  roce: number
  roe: number
}

export interface ShareholdingRow {
  quarter: string
  promoter: number
  fii: number
  dii: number
  mutualFunds: number
  retail: number
}

export interface IndexPerformance {
  indexName: string
  sector: string
  oneDay: number
  oneWeek: number
  oneMonth: number
  sixMonths: number
  oneYear: number
}

export interface PortfolioHolding {
  id: number
  symbol: string
  quantity: number
  avgBuyPrice: number
  buyDate: string
  currentPrice: number
}

export interface PortfolioSummary {
  totalInvested: number
  currentValue: number
  pnl: number
  pnlPercent: number
  dayGain: number
}

export interface WatchlistItem {
  symbol: string
  company: string
  sector: string
  price: number
  changePercent: number
  volume: number
  peRatio: number
  marketCap: number
}

export interface AlertRule {
  id: number
  symbol: string
  alertType: 'price_above' | 'price_below' | 'volume_spike' | 'week_52_high' | 'week_52_low' | 'rsi'
  triggerValue: number
  isActive: boolean
  triggeredAt: string | null
}

export interface IdeaRow {
  company: string
  ticker: string
  metric: string
  marketCap: number
}

export interface MacroIndicator {
  name: string
  category: string
  date: string
  value: number
  unit: string
}

export interface RawMaterial {
  name: string
  category: string
  date: string
  price: number
  oneDayChange: number
  oneWeekChange: number
  oneMonthChange: number
}

export interface TimelineEvent {
  id: string
  symbol: string
  title: string
  summary: string
  source: string
  url: string
  type: 'filing' | 'news' | 'concall' | 'results' | 'tweet' | 'price-alert'
  publishedAt: string
  isRead: boolean
}

export interface PaginatedResponse<T> {
  page: number
  limit: number
  total: number
  data: T[]
}
