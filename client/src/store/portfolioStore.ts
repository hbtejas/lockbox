import { create } from 'zustand'
import type { PortfolioResponse } from '../api/portfolioApi'

interface PortfolioState {
  portfolios: PortfolioResponse[]
  selectedPortfolioId: string | null
  setPortfolios: (portfolios: PortfolioResponse[]) => void
  selectPortfolio: (id: string | null) => void
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  portfolios: [],
  selectedPortfolioId: null,
  setPortfolios: (portfolios) =>
    set({
      portfolios,
      selectedPortfolioId: portfolios[0]?.id ?? null,
    }),
  selectPortfolio: (id) => set({ selectedPortfolioId: id }),
}))
