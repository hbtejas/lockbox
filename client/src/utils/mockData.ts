import dayjs from 'dayjs'
import type {
  AlertRule,
  CompanyOverview,
  FinancialRow,
  IdeaRow,
  IndexPerformance,
  MacroIndicator,
  PortfolioHolding,
  PortfolioSummary,
  PricePoint,
  RawMaterial,
  ShareholdingRow,
  TimelineEvent,
  WatchlistItem,
} from '../types/domain'

export const mockCompanies: CompanyOverview[] = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    exchange: 'NSE',
    sector: 'Energy',
    industry: 'Oil & Gas',
    currentPrice: 2968.4,
    changePercent: 1.92,
    marketCap: 2005000000000,
    peRatio: 24.1,
    pbRatio: 2.2,
    dividendYield: 0.34,
    beta: 1.06,
    week52High: 3120,
    week52Low: 2221,
    description:
      'Reliance Industries is one of Indias largest conglomerates with businesses across energy, retail, telecom, and digital services.',
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    exchange: 'NSE',
    sector: 'Information Technology',
    industry: 'IT Services',
    currentPrice: 4255,
    changePercent: -0.72,
    marketCap: 1542000000000,
    peRatio: 29.3,
    pbRatio: 12.6,
    dividendYield: 1.18,
    beta: 0.84,
    week52High: 4595,
    week52Low: 3311,
    description: 'TCS provides IT services, consulting, and business solutions globally.',
  },
  {
    symbol: 'HAL',
    name: 'Hindustan Aeronautics Ltd',
    exchange: 'NSE',
    sector: 'Aviation',
    industry: 'Aerospace & Defence',
    currentPrice: 4572,
    changePercent: 2.67,
    marketCap: 305000000000,
    peRatio: 34.8,
    pbRatio: 10.1,
    dividendYield: 0.6,
    beta: 1.1,
    week52High: 4898,
    week52Low: 1688,
    description: 'HAL is a leading aerospace and defence company manufacturing aircraft and systems.',
  },
  {
    symbol: 'SUNPHARMA',
    name: 'Sun Pharmaceutical Industries',
    exchange: 'NSE',
    sector: 'Pharmaceuticals',
    industry: 'Drug Manufacturers',
    currentPrice: 1628,
    changePercent: 0.41,
    marketCap: 391000000000,
    peRatio: 35.2,
    pbRatio: 6.1,
    dividendYield: 0.8,
    beta: 0.75,
    week52High: 1708,
    week52Low: 1092,
    description: 'Sun Pharma is one of the largest specialty generic pharmaceutical companies in India.',
  },
]

export const mockIndices: IndexPerformance[] = [
  { indexName: 'TJI Aviation', sector: 'Aviation', oneDay: 0.9, oneWeek: 2.2, oneMonth: 6.1, sixMonths: 18.4, oneYear: 27.8 },
  { indexName: 'TJI EMS', sector: 'Electronics', oneDay: 0.6, oneWeek: 1.5, oneMonth: 4.2, sixMonths: 12.6, oneYear: 22.2 },
  { indexName: 'TJI Chemicals', sector: 'Chemicals', oneDay: -0.4, oneWeek: 0.8, oneMonth: 2.6, sixMonths: 8.2, oneYear: 11.1 },
  { indexName: 'TJI Defence', sector: 'Defence', oneDay: 1.4, oneWeek: 3.8, oneMonth: 9.2, sixMonths: 28.1, oneYear: 45.4 },
  { indexName: 'TJI Renewables', sector: 'Renewables', oneDay: -1.1, oneWeek: -2.9, oneMonth: -5.4, sixMonths: 4.7, oneYear: 9.8 },
  { indexName: 'TJI Textiles', sector: 'Textiles', oneDay: -0.7, oneWeek: -1.3, oneMonth: -2.5, sixMonths: -4.1, oneYear: -8.6 },
]

export const mockIdeaRows: IdeaRow[] = [
  { company: 'HAL', ticker: 'HAL', metric: 'Promoter buy Rs 145 Cr', marketCap: 305000000000 },
  { company: 'ABB India', ticker: 'ABB', metric: 'Capex announced Rs 820 Cr', marketCap: 156000000000 },
  { company: 'Bharat Electronics', ticker: 'BEL', metric: 'Whale buying +2.8%', marketCap: 194000000000 },
  { company: 'Persistent Systems', ticker: 'PERSISTENT', metric: 'Strong fundamentals ROCE 33%', marketCap: 102000000000 },
  { company: 'JSW Energy', ticker: 'JSWENERGY', metric: 'M&A pipeline expanded', marketCap: 112000000000 },
  { company: 'KPIT Tech', ticker: 'KPITTECH', metric: 'Trending on social volume', marketCap: 41000000000 },
]

const basePrice = 2700
export const mockPriceSeries: PricePoint[] = Array.from({ length: 180 }).map((_, index) => {
  const date = dayjs().subtract(179 - index, 'day').format('YYYY-MM-DD')
  const drift = Math.sin(index / 12) * 65 + index * 1.4
  const close = Number((basePrice + drift).toFixed(2))
  return {
    date,
    open: Number((close - 8).toFixed(2)),
    high: Number((close + 15).toFixed(2)),
    low: Number((close - 18).toFixed(2)),
    close,
    volume: 1200000 + index * 1800,
  }
})

export const mockFinancialsQuarterly: FinancialRow[] = [
  { period: 'Q4 FY25', revenue: 267000, netProfit: 18800, ebitda: 41200, eps: 13.8, roce: 18.2, roe: 11.1 },
  { period: 'Q3 FY25', revenue: 261120, netProfit: 17560, ebitda: 39950, eps: 13.1, roce: 17.6, roe: 10.9 },
  { period: 'Q2 FY25', revenue: 255780, netProfit: 16820, ebitda: 38510, eps: 12.6, roce: 17.1, roe: 10.6 },
  { period: 'Q1 FY25', revenue: 248330, netProfit: 16020, ebitda: 37110, eps: 12.2, roce: 16.8, roe: 10.2 },
]

export const mockFinancialsAnnual: FinancialRow[] = [
  { period: 'FY25', revenue: 1034200, netProfit: 69200, ebitda: 154100, eps: 51.7, roce: 17.4, roe: 10.8 },
  { period: 'FY24', revenue: 982300, netProfit: 65020, ebitda: 146850, eps: 48.3, roce: 16.7, roe: 10.2 },
  { period: 'FY23', revenue: 915440, netProfit: 59870, ebitda: 136290, eps: 44.8, roce: 16.1, roe: 9.8 },
  { period: 'FY22', revenue: 852720, netProfit: 55180, ebitda: 128100, eps: 41.6, roce: 15.4, roe: 9.2 },
]

export const mockShareholding: ShareholdingRow[] = [
  { quarter: 'Jun-24', promoter: 50.3, fii: 24.8, dii: 13.1, mutualFunds: 8.2, retail: 11.8 },
  { quarter: 'Sep-24', promoter: 50.2, fii: 25.1, dii: 13.3, mutualFunds: 8.3, retail: 11.4 },
  { quarter: 'Dec-24', promoter: 50.1, fii: 25.6, dii: 13.4, mutualFunds: 8.4, retail: 10.9 },
  { quarter: 'Mar-25', promoter: 50.1, fii: 26.2, dii: 13.9, mutualFunds: 8.6, retail: 10.2 },
]

export const mockScreenerRows = mockCompanies.map((company, index) => ({
  company: company.name,
  ticker: company.symbol,
  sector: company.sector,
  marketCap: company.marketCap,
  peRatio: company.peRatio,
  roce: 16 + index * 3.2,
  revenueGrowth: 11 + index * 2.4,
  promoterHolding: 48 + index * 4,
}))

export const mockPortfolioHoldings: PortfolioHolding[] = [
  { id: 1, symbol: 'RELIANCE', quantity: 40, avgBuyPrice: 2450, buyDate: '2024-06-14', currentPrice: 2968.4 },
  { id: 2, symbol: 'TCS', quantity: 22, avgBuyPrice: 3890, buyDate: '2024-02-21', currentPrice: 4255 },
  { id: 3, symbol: 'HAL', quantity: 18, avgBuyPrice: 3220, buyDate: '2023-11-09', currentPrice: 4572 },
]

export const mockPortfolioSummary: PortfolioSummary = {
  totalInvested: 523620,
  currentValue: 586100,
  pnl: 62480,
  pnlPercent: 11.93,
  dayGain: 3280,
}

export const mockWatchlist: WatchlistItem[] = [
  {
    symbol: 'RELIANCE',
    company: 'Reliance Industries',
    sector: 'Energy',
    price: 2968.4,
    changePercent: 1.92,
    volume: 3091290,
    peRatio: 24.1,
    marketCap: 2005000000000,
  },
  {
    symbol: 'TCS',
    company: 'TCS',
    sector: 'Information Technology',
    price: 4255,
    changePercent: -0.72,
    volume: 1182030,
    peRatio: 29.3,
    marketCap: 1542000000000,
  },
  {
    symbol: 'HAL',
    company: 'Hindustan Aeronautics',
    sector: 'Aviation',
    price: 4572,
    changePercent: 2.67,
    volume: 986210,
    peRatio: 34.8,
    marketCap: 305000000000,
  },
  {
    symbol: 'SUNPHARMA',
    company: 'Sun Pharma',
    sector: 'Pharmaceuticals',
    price: 1628,
    changePercent: 0.41,
    volume: 732100,
    peRatio: 35.2,
    marketCap: 391000000000,
  },
]

export const mockAlerts: AlertRule[] = [
  {
    id: 1,
    symbol: 'RELIANCE',
    alertType: 'price_above',
    triggerValue: 3000,
    isActive: true,
    triggeredAt: null,
  },
  {
    id: 2,
    symbol: 'TCS',
    alertType: 'price_below',
    triggerValue: 4100,
    isActive: false,
    triggeredAt: dayjs().subtract(2, 'day').toISOString(),
  },
]

export const mockMacroIndicators: MacroIndicator[] = [
  { name: 'GDP Growth Rate', category: 'Growth', date: '2026-03-31', value: 7.1, unit: '%' },
  { name: 'CPI Inflation', category: 'Inflation', date: '2026-03-01', value: 4.8, unit: '%' },
  { name: 'WPI Inflation', category: 'Inflation', date: '2026-03-01', value: 2.1, unit: '%' },
  { name: 'RBI Repo Rate', category: 'Monetary', date: '2026-03-15', value: 6.5, unit: '%' },
  { name: 'Forex Reserves', category: 'External', date: '2026-03-20', value: 648.3, unit: 'USD Bn' },
  { name: 'India PMI Manufacturing', category: 'Production', date: '2026-03-01', value: 58.3, unit: 'Index' },
  { name: 'India PMI Services', category: 'Production', date: '2026-03-01', value: 57.2, unit: 'Index' },
  { name: 'IIP Growth', category: 'Production', date: '2026-02-01', value: 5.4, unit: '%' },
  { name: 'FII Net Flow', category: 'Flows', date: '2026-03-31', value: 2.1, unit: 'USD Bn' },
  { name: 'Current Account Deficit', category: 'External', date: '2025-12-31', value: 1.2, unit: '% of GDP' },
]

export const mockRawMaterials: RawMaterial[] = [
  { name: 'Brent Crude', category: 'Energy', date: '2026-04-22', price: 86.4, oneDayChange: 1.2, oneWeekChange: -0.8, oneMonthChange: 2.4 },
  { name: 'Natural Gas', category: 'Energy', date: '2026-04-22', price: 2.9, oneDayChange: -0.6, oneWeekChange: 3.2, oneMonthChange: 8.1 },
  { name: 'Steel HRC', category: 'Metals', date: '2026-04-22', price: 568, oneDayChange: 0.7, oneWeekChange: 1.1, oneMonthChange: 5.4 },
  { name: 'Copper', category: 'Metals', date: '2026-04-22', price: 9150, oneDayChange: 1.1, oneWeekChange: 4.2, oneMonthChange: 9.8 },
  { name: 'Gold', category: 'Metals', date: '2026-04-22', price: 2354, oneDayChange: -0.4, oneWeekChange: 1.7, oneMonthChange: 6.8 },
  { name: 'Cotton', category: 'Agri', date: '2026-04-22', price: 82.3, oneDayChange: 0.2, oneWeekChange: -0.9, oneMonthChange: -2.1 },
  { name: 'Wheat', category: 'Agri', date: '2026-04-22', price: 6.4, oneDayChange: -0.1, oneWeekChange: 0.5, oneMonthChange: 2.2 },
  { name: 'Urea', category: 'Chemicals', date: '2026-04-22', price: 452, oneDayChange: 0.8, oneWeekChange: 1.5, oneMonthChange: 4.4 },
]

export const mockTimelineEvents: TimelineEvent[] = Array.from({ length: 32 }).map((_, index) => ({
  id: `timeline-${index + 1}`,
  symbol: index % 2 === 0 ? 'RELIANCE' : 'TCS',
  title: index % 3 === 0 ? 'Board approves capex expansion' : 'Quarterly update released',
  summary:
    index % 3 === 0
      ? 'The company approved an additional growth capex with phased deployment over 3 years.'
      : 'Management commentary indicates stable demand and operational momentum.',
  source: index % 2 === 0 ? 'NSE Filing' : 'Business Standard',
  url: 'https://example.com/event',
  type: (['filing', 'news', 'concall', 'results', 'tweet', 'price-alert'] as const)[index % 6],
  publishedAt: dayjs().subtract(index * 3, 'hour').toISOString(),
  isRead: index % 4 === 0,
}))

export const popularScreenerQueries = [
  'ROCE > 20 AND Market Cap > 500 AND Promoter Holding > 50',
  'Net Profit Growth > 15 AND Debt/Equity < 0.5',
  'Small Cap Consistent Compounders',
  'FII Holding Increasing for 3 Quarters',
  'Cash from Operations > Net Profit',
  'Free Cash Flow Positive and PE < 25',
]
