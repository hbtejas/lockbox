import type { PortfolioHolding, PortfolioSummary } from '../types/domain'
import { http } from './http'

export interface PortfolioResponse {
  id: string
  name: string
  isDefault: boolean
  holdings: PortfolioHolding[]
  summary: PortfolioSummary
}

export async function fetchPortfolios(): Promise<PortfolioResponse[]> {
  const { data } = await http.get('/portfolio')
  return data.data
}

export async function createPortfolio(name: string): Promise<PortfolioResponse> {
  const { data } = await http.post('/portfolio', { name })
  return data.data
}

export async function addHolding(
  portfolioId: string,
  payload: {
    symbol: string
    quantity: number
    avgBuyPrice: number
    buyDate: string
  },
): Promise<void> {
  await http.post(`/portfolio/${portfolioId}/holdings`, payload)
}

export async function fetchPortfolioPerformance(portfolioId: string): Promise<Array<{ date: string; value: number; benchmark: number }>> {
  const { data } = await http.get(`/portfolio/${portfolioId}/performance`)
  return data.data
}
