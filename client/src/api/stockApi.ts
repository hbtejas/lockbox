import type {
  CompanyOverview,
  FinancialRow,
  IndexPerformance,
  MacroIndicator,
  PaginatedResponse,
  PricePoint,
  RawMaterial,
  ShareholdingRow,
  TimelineEvent,
  WatchlistItem,
} from '../types/domain'
import { http } from './http'

export interface PeerRow {
  symbol: string
  name: string
  peRatio: number
  pbRatio: number
  dividendYield: number
}

export interface ResultCalendarRow {
  id: string
  symbol: string
  name: string
  resultDate: string
  period: string
  resultType: string
  hasConcall: boolean
  concallTime: string | null
  estimateRevenue: number
  actualRevenue: number
  estimatePat: number
  actualPat: number
  estimateEps: number
  actualEps: number
  sector: string
  marketCapCategory: string
}

export interface ResultsSummary {
  upcomingResultsToday: number
  concallsToday: number
  totalUpcoming: number
}

export interface NewsItem {
  id: string
  symbol: string
  title: string
  summary: string
  source: string
  url: string
  type: string
  publishedAt: string
}

function normalizePercent(value: number) {
  if (Math.abs(value) <= 1) {
    return value * 100
  }
  return value
}

export async function searchStocks(query: string): Promise<WatchlistItem[]> {
  const { data } = await http.get('/stocks/search', { params: { q: query } })
  return data.data
}

export async function fetchCompanyOverview(symbol: string): Promise<CompanyOverview> {
  const { data } = await http.get(`/stocks/${symbol}`)
  return data.data
}

export async function fetchStockPrices(symbol: string, period = '1y'): Promise<PricePoint[]> {
  const { data } = await http.get(`/stocks/${symbol}/price`, { params: { period } })
  return data.data
}

export async function fetchFinancials(symbol: string, type = 'quarterly'): Promise<FinancialRow[]> {
  const { data } = await http.get(`/stocks/${symbol}/financials`, { params: { type } })
  return data.data.map((row: {
    period?: string
    periodEnd?: string
    period_end?: string
    revenue: number
    netProfit: number
    net_profit?: number
    ebitda: number
    eps: number
    roce: number
    roe: number
  }) => ({
    period: row.period ?? row.periodEnd ?? row.period_end ?? '-',
    revenue: Number(row.revenue ?? 0),
    netProfit: Number(row.netProfit ?? row.net_profit ?? 0),
    ebitda: Number(row.ebitda ?? 0),
    eps: Number(row.eps ?? 0),
    roce: Number(normalizePercent(Number(row.roce ?? 0))),
    roe: Number(normalizePercent(Number(row.roe ?? 0))),
  }))
}

export async function fetchShareholding(symbol: string): Promise<ShareholdingRow[]> {
  const { data } = await http.get(`/stocks/${symbol}/shareholding`)
  return data.data.map((row: {
    quarter: string
    promoter?: number
    promoterHolding?: number
    promoter_holding?: number
    fii?: number
    fiiHolding?: number
    fii_holding?: number
    dii?: number
    diiHolding?: number
    dii_holding?: number
    mutualFunds?: number
    mutualFundHolding?: number
    mutual_fund_holding?: number
    retail?: number
    retailHolding?: number
    retail_holding?: number
  }) => ({
    quarter: row.quarter,
    promoter: Number(row.promoter ?? row.promoterHolding ?? row.promoter_holding ?? 0),
    fii: Number(row.fii ?? row.fiiHolding ?? row.fii_holding ?? 0),
    dii: Number(row.dii ?? row.diiHolding ?? row.dii_holding ?? 0),
    mutualFunds: Number(row.mutualFunds ?? row.mutualFundHolding ?? row.mutual_fund_holding ?? 0),
    retail: Number(row.retail ?? row.retailHolding ?? row.retail_holding ?? 0),
  }))
}

export async function fetchPeers(symbol: string): Promise<PeerRow[]> {
  const { data } = await http.get(`/stocks/${symbol}/peers`)
  return data.data.map((row: {
    symbol: string
    name: string
    peRatio?: number
    pe_ratio?: number
    pbRatio?: number
    pb_ratio?: number
    dividendYield?: number
    dividend_yield?: number
  }) => ({
    symbol: row.symbol,
    name: row.name,
    peRatio: Number(row.peRatio ?? row.pe_ratio ?? 0),
    pbRatio: Number(row.pbRatio ?? row.pb_ratio ?? 0),
    dividendYield: Number(row.dividendYield ?? row.dividend_yield ?? 0),
  }))
}

export async function fetchNews(symbol: string): Promise<NewsItem[]> {
  const { data } = await http.get(`/stocks/${symbol}/news`)
  return data.data.map((row: {
    id: string | number
    symbol: string
    title: string
    summary: string
    source: string
    url: string
    type: string
    publishedAt: string
    published_at?: string
  }) => ({
    id: String(row.id),
    symbol: row.symbol,
    title: row.title,
    summary: row.summary,
    source: row.source,
    url: row.url,
    type: row.type,
    publishedAt: row.publishedAt ?? row.published_at ?? new Date().toISOString(),
  }))
}

export async function fetchCompanyResults(symbol: string): Promise<ResultCalendarRow[]> {
  const { data } = await http.get(`/stocks/${symbol}/results`)
  return data.data.map((row: {
    id?: string | number
    symbol: string
    name?: string
    resultDate: string
    resultType?: string
    period?: string
    hasConcall?: boolean
    concallTime?: string
    estimateRevenue?: number
    actualRevenue?: number
    estimatePat?: number
    actualPat?: number
    estimateEps?: number
    actualEps?: number
    sector?: string
    marketCapCategory?: string
  }) => ({
    id: String(row.id ?? `${row.symbol}-${row.resultDate}-${row.period ?? 'period'}`),
    symbol: row.symbol,
    name: row.name ?? row.symbol,
    resultDate: row.resultDate,
    period: row.period ?? '-',
    resultType: row.resultType ?? 'quarterly',
    hasConcall: Boolean(row.hasConcall),
    concallTime: row.concallTime ?? null,
    estimateRevenue: Number(row.estimateRevenue ?? 0),
    actualRevenue: Number(row.actualRevenue ?? 0),
    estimatePat: Number(row.estimatePat ?? 0),
    actualPat: Number(row.actualPat ?? 0),
    estimateEps: Number(row.estimateEps ?? 0),
    actualEps: Number(row.actualEps ?? 0),
    sector: row.sector ?? '',
    marketCapCategory: row.marketCapCategory ?? '',
  }))
}

export async function fetchMarketIndices(): Promise<IndexPerformance[]> {
  const { data } = await http.get('/market/indices')
  return data.data
}

export async function fetchGainers(): Promise<WatchlistItem[]> {
  const { data } = await http.get('/market/gainers')
  return data.data
}

export async function fetchLosers(): Promise<WatchlistItem[]> {
  const { data } = await http.get('/market/losers')
  return data.data
}

export async function fetchMostActive(): Promise<WatchlistItem[]> {
  const { data } = await http.get('/market/most-active')
  return data.data
}

export async function fetchHeatmap(): Promise<WatchlistItem[]> {
  const { data } = await http.get('/market/heatmap')
  return data.data
}

export async function fetchMacroIndicators(): Promise<MacroIndicator[]> {
  const { data } = await http.get('/macro')
  return data.data
}

export async function fetchRawMaterials(): Promise<RawMaterial[]> {
  const { data } = await http.get('/raw-materials')
  return data.data
}

export async function fetchTimeline(
  symbols: string[],
  types: string[],
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<TimelineEvent>> {
  const { data } = await http.get('/timeline', {
    params: {
      symbols: symbols.join(','),
      types: types.join(','),
      page,
      limit,
    },
  })

  return {
    ...data,
    data: data.data.map((row: {
      id: string | number
      symbol: string
      title: string
      summary: string
      source: string
      url: string
      type: TimelineEvent['type']
      publishedAt?: string
      published_at?: string
      isRead?: boolean
      is_read?: boolean
    }) => ({
      id: String(row.id),
      symbol: row.symbol,
      title: row.title,
      summary: row.summary,
      source: row.source,
      url: row.url,
      type: row.type,
      publishedAt: row.publishedAt ?? row.published_at ?? new Date().toISOString(),
      isRead: Boolean(row.isRead ?? row.is_read),
    })),
  }
}

export async function fetchResults(
  params: {
    sector?: string
    marketCapCategory?: string
    fromDate?: string
    toDate?: string
    page?: number
    limit?: number
  } = {},
): Promise<PaginatedResponse<ResultCalendarRow>> {
  const { data } = await http.get('/results', { params })

  return {
    ...data,
    data: data.data.map((row: ResultCalendarRow) => ({
      id: String(row.id),
      symbol: row.symbol,
      name: row.name,
      resultDate: row.resultDate,
      period: row.period,
      resultType: row.resultType,
      hasConcall: Boolean(row.hasConcall),
      concallTime: row.concallTime,
      estimateRevenue: Number(row.estimateRevenue),
      actualRevenue: Number(row.actualRevenue),
      estimatePat: Number(row.estimatePat),
      actualPat: Number(row.actualPat),
      estimateEps: Number(row.estimateEps),
      actualEps: Number(row.actualEps),
      sector: row.sector,
      marketCapCategory: row.marketCapCategory,
    })),
  }
}

export async function fetchResultsSummary(): Promise<ResultsSummary> {
  const { data } = await http.get('/results/summary')
  return data.data
}
