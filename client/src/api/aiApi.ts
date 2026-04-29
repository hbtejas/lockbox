import { http } from './http'
import type {
  AIHistoryItem,
  MarketInsight,
  ParsedScreenerQuery,
  PortfolioChatMessage,
  PortfolioChatResponse,
  PortfolioRiskAnalysis,
  StockAnalysis,
} from '../types/ai'

export interface PortfolioRiskApiPayload {
  analysis: PortfolioRiskAnalysis
  cached: boolean
}

export async function fetchPortfolioRiskAnalysis(
  portfolioId: string,
  options?: { refresh?: boolean },
): Promise<PortfolioRiskApiPayload> {
  const params = options?.refresh ? { refresh: '1' } : undefined
  const { data } = await http.get(`/ai/portfolio/${portfolioId}/risk`, { params })
  return {
    analysis: data.data,
    cached: Boolean(data.cached),
  }
}

export async function fetchStockAIAnalysis(symbol: string): Promise<StockAnalysis> {
  const { data } = await http.get(`/ai/stock/${symbol}`)
  return data.data
}

export async function fetchMarketInsight(): Promise<MarketInsight> {
  const { data } = await http.get('/ai/market/insight')
  return data.data
}

export async function fetchPortfolioChatHistory(portfolioId: string): Promise<PortfolioChatMessage[]> {
  const { data } = await http.get(`/ai/portfolio/${portfolioId}/chat/history`)
  return data.data
}

export async function sendPortfolioChatMessage(payload: {
  portfolioId: string
  message: string
  history: Array<{ role: 'user' | 'assistant'; content: string }>
}): Promise<PortfolioChatResponse> {
  const { data } = await http.post(`/ai/portfolio/${payload.portfolioId}/chat`, {
    message: payload.message,
    history: payload.history,
  })
  return data.data
}

export async function parseNaturalLanguageScreener(query: string): Promise<ParsedScreenerQuery> {
  const { data } = await http.post('/ai/screener/parse', { query })
  return data.data
}

export async function fetchAIHistory(): Promise<AIHistoryItem[]> {
  const { data } = await http.get('/ai/history')
  return data.data
}
