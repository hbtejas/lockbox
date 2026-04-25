export interface ConcentrationRisk {
  type: 'stock' | 'sector' | 'market_cap' | 'theme'
  name: string
  currentWeight: number
  recommendedMax: number
  riskLevel: 'low' | 'medium' | 'high'
  message: string
}

export interface SectorExposure {
  sector: string
  weight: number
  stockCount: number
  riskComment: string
}

export interface AISuggestion {
  id: string
  type: 'reduce' | 'increase' | 'add' | 'remove' | 'rebalance' | 'watch' | 'diversify'
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  affectedStocks?: string[]
  suggestedAction?: string
  expectedImpact?: string
  confidenceScore: number
}

export interface RebalanceStep {
  symbol: string
  action: 'buy' | 'sell'
  currentWeight: number
  targetWeight: number
  estimatedShares: number
  estimatedValue: number
  reason: string
}

export interface RebalancePlan {
  trigger: string
  steps: RebalanceStep[]
  estimatedBrokerage: number
  estimatedTax: number
}

export interface RiskMetrics {
  beta: number
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
  valueAtRisk: number
  correlationToNifty: number
  debtExposure: number
  smallMicroCapExposure: number
}

export interface PortfolioRiskAnalysis {
  overallRiskScore: number
  riskLevel: 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High'
  riskColor: 'green' | 'yellow' | 'orange' | 'red' | 'darkred'
  diversificationScore: number
  concentrationRisk: ConcentrationRisk[]
  sectorExposure: SectorExposure[]
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
  aiSuggestions: AISuggestion[]
  rebalancePlan: RebalancePlan | null
  riskMetrics: RiskMetrics
  generatedAt: string | Date
  tokensUsed: number
}

export interface StockAnalysis {
  symbol: string
  companyName: string
  aiSummary: string
  sentimentScore: number
  sentimentLabel: 'Bearish' | 'Slightly Bearish' | 'Neutral' | 'Slightly Bullish' | 'Bullish'
  keyRisks: string[]
  keyOpportunities: string[]
  analystVerdict: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell'
  priceTarget: number | null
  confidenceLevel: 'Low' | 'Medium' | 'High'
  newsImpact: string
  fundamentalStrength: number
  generatedAt: string | Date
}

export interface SectorOutlook {
  sector: string
  outlook: 'Bullish' | 'Neutral' | 'Bearish'
  reasons: string[]
}

export interface MarketInsight {
  marketMood: 'Fearful' | 'Cautious' | 'Neutral' | 'Optimistic' | 'Euphoric'
  moodScore: number
  topThemes: string[]
  topRisks: string[]
  keyOpportunities: string[]
  sectorOutlook: SectorOutlook[]
  weeklyOutlook: string
  generatedAt: string | Date
}

export interface PortfolioChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt?: string
}

export interface PortfolioChatResponse {
  reply: string
  suggestedFollowUps: string[]
}

export interface ParsedScreenerQuery {
  filters: Array<{
    metric: string
    operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'between'
    value: number
    value2?: number | null
  }>
  logic: string
  explanation: string
}

export interface AIHistoryItem {
  id: string
  type: string
  portfolioId?: string | null
  symbol?: string | null
  tokensUsed: number
  model?: string
  createdAt: string
}
