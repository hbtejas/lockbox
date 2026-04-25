const crypto = require('crypto')
const Anthropic = require('@anthropic-ai/sdk')
const PortfolioModel = require('../models/Portfolio')
const StockModel = require('../models/Stock')
const AiAnalysisModel = require('../models/AiAnalysis')
const { env } = require('../config/env')
const { getCache, setCache } = require('../config/redis')
const LiveMarketService = require('./liveMarketService')

const MODEL_NAME = 'claude-sonnet-4-20250514'

const anthropic = env.anthropicApiKey
  ? new Anthropic({
      apiKey: env.anthropicApiKey,
    })
  : null

function round(value, decimals = 2) {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function cleanJsonText(text) {
  return String(text ?? '')
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim()
}

function safeJsonParse(text) {
  const cleaned = cleanJsonText(text)
  if (!cleaned) {
    throw new Error('Empty AI response')
  }
  return JSON.parse(cleaned)
}

async function callClaudeJson({ systemPrompt, userPrompt, maxTokens = 2000 }) {
  if (!anthropic) {
    return { json: null, tokensUsed: 0 }
  }

  const message = await anthropic.messages.create({
    model: MODEL_NAME,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const responseText = asArray(message.content)
    .filter((item) => item.type === 'text')
    .map((item) => item.text)
    .join('\n')

  const parsed = safeJsonParse(responseText)
  const tokensUsed = Number(message.usage?.input_tokens ?? 0) + Number(message.usage?.output_tokens ?? 0)

  return { json: parsed, tokensUsed }
}

function computeRiskLabel(score) {
  if (score <= 2) return 'Very Low'
  if (score <= 4) return 'Low'
  if (score <= 6.5) return 'Moderate'
  if (score <= 8.5) return 'High'
  return 'Very High'
}

function computeRiskColor(score) {
  if (score <= 2) return 'green'
  if (score <= 4) return 'yellow'
  if (score <= 6.5) return 'orange'
  if (score <= 8.5) return 'red'
  return 'darkred'
}

function sentimentFromScore(score) {
  if (score <= -0.6) return 'Bearish'
  if (score <= -0.2) return 'Slightly Bearish'
  if (score < 0.2) return 'Neutral'
  if (score < 0.6) return 'Slightly Bullish'
  return 'Bullish'
}

function verdictFromScore(score) {
  if (score > 0.7) return 'Strong Buy'
  if (score > 0.35) return 'Buy'
  if (score > -0.2) return 'Hold'
  if (score > -0.55) return 'Sell'
  return 'Strong Sell'
}

function priorityRank(priority) {
  const order = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  }
  return order[priority] ?? 3
}

function normalizeSuggestions(suggestions) {
  return asArray(suggestions)
    .map((suggestion) => ({
      id: suggestion.id || crypto.randomUUID(),
      type: suggestion.type || 'watch',
      priority: suggestion.priority || 'medium',
      title: suggestion.title || 'Portfolio review suggestion',
      description: suggestion.description || 'Review this recommendation before your next rebalance cycle.',
      affectedStocks: asArray(suggestion.affectedStocks),
      suggestedAction: suggestion.suggestedAction || '',
      expectedImpact: suggestion.expectedImpact || '',
      confidenceScore: clamp(Number(suggestion.confidenceScore ?? 0.5), 0, 1),
    }))
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority))
}

function mergePortfolioRiskResult(base, aiResult) {
  if (!aiResult || typeof aiResult !== 'object') {
    return base
  }

  return {
    ...base,
    ...aiResult,
    overallRiskScore: clamp(Number(aiResult.overallRiskScore ?? base.overallRiskScore), 1, 10),
    diversificationScore: clamp(Number(aiResult.diversificationScore ?? base.diversificationScore), 0, 100),
    concentrationRisk: asArray(aiResult.concentrationRisk).length > 0 ? aiResult.concentrationRisk : base.concentrationRisk,
    sectorExposure: asArray(aiResult.sectorExposure).length > 0 ? aiResult.sectorExposure : base.sectorExposure,
    strengths: asArray(aiResult.strengths).length > 0 ? aiResult.strengths : base.strengths,
    weaknesses: asArray(aiResult.weaknesses).length > 0 ? aiResult.weaknesses : base.weaknesses,
    opportunities: asArray(aiResult.opportunities).length > 0 ? aiResult.opportunities : base.opportunities,
    threats: asArray(aiResult.threats).length > 0 ? aiResult.threats : base.threats,
    aiSuggestions: normalizeSuggestions(asArray(aiResult.aiSuggestions).length > 0 ? aiResult.aiSuggestions : base.aiSuggestions),
    rebalancePlan: aiResult.rebalancePlan ?? base.rebalancePlan,
    riskMetrics: {
      ...base.riskMetrics,
      ...(aiResult.riskMetrics ?? {}),
    },
    riskLevel: aiResult.riskLevel || computeRiskLabel(Number(aiResult.overallRiskScore ?? base.overallRiskScore)),
    riskColor: aiResult.riskColor || computeRiskColor(Number(aiResult.overallRiskScore ?? base.overallRiskScore)),
  }
}

function getLatestFinancial(symbol) {
  const rows = StockModel.getFinancials(symbol, 'Q')
    .slice()
    .sort((a, b) => new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime())

  const latest = rows[0] ?? null
  const previous = rows[1] ?? null

  const revenueGrowthYoy =
    latest?.revenue && previous?.revenue && previous.revenue !== 0
      ? ((Number(latest.revenue) - Number(previous.revenue)) / Number(previous.revenue)) * 100
      : null

  return {
    latest,
    revenueGrowthYoy,
  }
}

function getLatestShareholding(symbol) {
  const rows = StockModel.getShareholding(symbol)
    .slice()
    .sort((a, b) => new Date(b.quarter).getTime() - new Date(a.quarter).getTime())

  const latest = rows[0] ?? null
  const previous = rows[1] ?? null

  return {
    latest,
    promoterChange:
      latest?.promoterHolding != null && previous?.promoterHolding != null
        ? Number(latest.promoterHolding) - Number(previous.promoterHolding)
        : null,
  }
}

async function getPortfolioContext(userId, portfolioId) {
  const portfolios = await PortfolioModel.listByUserId(userId)
  const portfolio = portfolios.find((item) => item.id === portfolioId)

  if (!portfolio) {
    throw new Error('Portfolio not found')
  }

  if (!portfolio.holdings || portfolio.holdings.length === 0) {
    throw new Error('Portfolio not found or empty')
  }

  const holdings = portfolio.holdings.map((holding) => {
    const symbol = String(holding.symbol ?? '').toUpperCase()
    const company = StockModel.getCompanyBySymbol(symbol)
    const quote = LiveMarketService.getLiveQuote(symbol)
    const { latest: financial, revenueGrowthYoy } = getLatestFinancial(symbol)

    const averageBuy = Number(holding.avgBuyPrice ?? holding.avg_buy_price ?? 0)
    const quantity = Number(holding.quantity ?? 0)
    const currentPrice = Number(quote?.price ?? company?.currentPrice ?? averageBuy)
    const investedValue = quantity * averageBuy
    const currentValue = quantity * currentPrice
    const pnl = currentValue - investedValue
    const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0

    const news = StockModel.getNews(symbol)
      .slice(0, 3)
      .map((item) => item.title)

    return {
      symbol,
      companyName: company?.name ?? symbol,
      sector: company?.sector ?? 'Unknown',
      industry: company?.industry ?? 'Unknown',
      marketCapCat: company?.marketCapCategory ?? 'unknown',
      quantity,
      avgBuyPrice: averageBuy,
      currentPrice,
      investedValue,
      currentValue,
      pnl,
      pnlPercent,
      roce: financial?.roce != null ? Number(financial.roce) * 100 : null,
      roe: financial?.roe != null ? Number(financial.roe) * 100 : null,
      debtToEquity: financial?.debtToEquity != null ? Number(financial.debtToEquity) : null,
      netMargin: financial?.netMargin != null ? Number(financial.netMargin) * 100 : null,
      revenueGrowthYoy: revenueGrowthYoy != null ? Number(revenueGrowthYoy) : null,
      peRatio: company?.peRatio != null ? Number(company.peRatio) : null,
      pbRatio: company?.pbRatio != null ? Number(company.pbRatio) : null,
      beta: company?.beta != null ? Number(company.beta) : null,
      week52High: company?.week52High != null ? Number(company.week52High) : null,
      week52Low: company?.week52Low != null ? Number(company.week52Low) : null,
      dayChange: quote?.changePercent != null ? Number(quote.changePercent) : Number(company?.changePercent ?? 0),
      recentNews: news,
    }
  })

  const totalInvested = holdings.reduce((sum, item) => sum + item.investedValue, 0)
  const totalCurrentValueRaw = holdings.reduce((sum, item) => sum + item.currentValue, 0)
  const totalCurrentValue = totalCurrentValueRaw > 0 ? totalCurrentValueRaw : Math.max(totalInvested, 1)
  const totalPnL = totalCurrentValue - totalInvested
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

  const holdingsWithWeight = holdings.map((holding) => ({
    ...holding,
    portfolioWeight: (holding.currentValue / totalCurrentValue) * 100,
  }))

  const sectorMap = {}
  holdingsWithWeight.forEach((holding) => {
    const sector = holding.sector || 'Unknown'
    if (!sectorMap[sector]) {
      sectorMap[sector] = { weight: 0, stocks: [], value: 0 }
    }
    sectorMap[sector].weight += holding.portfolioWeight
    sectorMap[sector].stocks.push(holding.symbol)
    sectorMap[sector].value += holding.currentValue
  })

  const mcapBreakdown = {}
  holdingsWithWeight.forEach((holding) => {
    const bucket = holding.marketCapCat || 'unknown'
    mcapBreakdown[bucket] = (mcapBreakdown[bucket] ?? 0) + holding.portfolioWeight
  })

  const topHoldings = holdingsWithWeight.slice().sort((a, b) => b.portfolioWeight - a.portfolioWeight).slice(0, 5)
  const worstPerformers = holdingsWithWeight
    .filter((holding) => holding.pnlPercent < -10)
    .sort((a, b) => a.pnlPercent - b.pnlPercent)
    .slice(0, 3)

  const highRiskHoldings = holdingsWithWeight.filter(
    (holding) =>
      (holding.debtToEquity != null && holding.debtToEquity > 1.5) ||
      (holding.peRatio != null && holding.peRatio > 80) ||
      (holding.week52Low != null && holding.currentPrice < holding.week52Low * 1.1),
  )

  return {
    portfolio,
    holdingsWithWeight,
    totalInvested,
    totalCurrentValue,
    totalPnL,
    totalPnLPercent,
    sectorMap,
    mcapBreakdown,
    topHoldings,
    worstPerformers,
    highRiskHoldings,
  }
}

function buildHeuristicPortfolioRisk(context) {
  const { holdingsWithWeight, sectorMap, mcapBreakdown, topHoldings, highRiskHoldings, totalPnLPercent } = context

  const hhi = holdingsWithWeight.reduce((sum, holding) => {
    const weight = holding.portfolioWeight / 100
    return sum + weight * weight
  }, 0)

  const diversificationScore = clamp(round((1 - hhi) * 120, 0), 0, 100)

  const debtExposure = round(
    holdingsWithWeight
      .filter((holding) => holding.debtToEquity != null && holding.debtToEquity > 1)
      .reduce((sum, holding) => sum + holding.portfolioWeight, 0),
    2,
  )

  const smallMicroCapExposure = round(
    holdingsWithWeight
      .filter((holding) => ['small', 'micro'].includes(String(holding.marketCapCat).toLowerCase()))
      .reduce((sum, holding) => sum + holding.portfolioWeight, 0),
    2,
  )

  const weightedBetaNumerator = holdingsWithWeight.reduce(
    (sum, holding) => sum + (holding.beta ?? 1) * holding.portfolioWeight,
    0,
  )
  const portfolioBeta = round(weightedBetaNumerator / 100, 2)

  const topHoldingWeight = topHoldings[0]?.portfolioWeight ?? 0
  const topSectorWeight = Math.max(
    ...Object.values(sectorMap).map((entry) => Number(entry.weight ?? 0)),
    0,
  )

  let overallRiskScore = 3.5
  if (topHoldingWeight > 35) overallRiskScore += 2
  else if (topHoldingWeight > 25) overallRiskScore += 1.2

  if (topSectorWeight > 55) overallRiskScore += 1.4
  else if (topSectorWeight > 40) overallRiskScore += 0.8

  if (debtExposure > 25) overallRiskScore += 1
  if (smallMicroCapExposure > 25) overallRiskScore += 0.8
  if (highRiskHoldings.length >= 2) overallRiskScore += 0.8
  if (totalPnLPercent < -12) overallRiskScore += 0.6

  overallRiskScore = clamp(round(overallRiskScore, 1), 1, 10)

  const concentrationRisk = []

  if (topHoldingWeight > 20) {
    concentrationRisk.push({
      type: 'stock',
      name: topHoldings[0].symbol,
      currentWeight: round(topHoldingWeight, 1),
      recommendedMax: 20,
      riskLevel: topHoldingWeight > 30 ? 'high' : 'medium',
      message: `${topHoldings[0].symbol} is over-allocated relative to a balanced portfolio.`,
    })
  }

  const topSector = Object.entries(sectorMap).sort((a, b) => b[1].weight - a[1].weight)[0]
  if (topSector && topSector[1].weight > 35) {
    concentrationRisk.push({
      type: 'sector',
      name: topSector[0],
      currentWeight: round(topSector[1].weight, 1),
      recommendedMax: 35,
      riskLevel: topSector[1].weight > 50 ? 'high' : 'medium',
      message: `${topSector[0]} concentration increases event risk if the sector corrects.`,
    })
  }

  if ((mcapBreakdown.large ?? 0) < 35) {
    concentrationRisk.push({
      type: 'market_cap',
      name: 'Large Cap Buffer',
      currentWeight: round(mcapBreakdown.large ?? 0, 1),
      recommendedMax: 50,
      riskLevel: 'medium',
      message: 'Increasing high-quality large caps can reduce portfolio volatility during drawdowns.',
    })
  }

  const sectorExposure = Object.entries(sectorMap).map(([sector, entry]) => ({
    sector,
    weight: round(entry.weight, 1),
    stockCount: entry.stocks.length,
    riskComment:
      entry.weight > 40
        ? 'This sector dominates your portfolio and should be monitored closely.'
        : entry.weight < 10
          ? 'This is a small allocation and has limited impact on overall risk.'
          : 'Exposure is meaningful but still manageable with periodic rebalancing.',
  }))

  const strengths = [
    topHoldings.length >= 5 ? 'Portfolio has exposure across multiple businesses.' : 'Holdings are easy to track and monitor.',
    totalPnLPercent >= 0 ? 'Current portfolio is in net profit territory.' : 'Losses are visible early, enabling timely risk controls.',
    debtExposure < 15 ? 'Debt-heavy exposure is relatively contained.' : 'Some cyclical allocation can support upside in risk-on markets.',
  ]

  const weaknesses = [
    topHoldingWeight > 25
      ? `Top position ${topHoldings[0].symbol} accounts for ${round(topHoldingWeight, 1)}% of portfolio.`
      : 'No immediate single-stock concentration breach found.',
    topSectorWeight > 40 ? 'Sector concentration is elevated and may amplify drawdowns.' : 'Sector diversification can still be improved.',
    smallMicroCapExposure > 20
      ? 'Small/micro cap exposure is high for a core portfolio.'
      : 'Defensive allocation is relatively low for volatile phases.',
  ]

  const opportunities = [
    'Add at least one defensive sector allocation to smooth market cycles.',
    'Use staggered rebalancing to reduce concentration without timing risk.',
  ]

  const threats = [
    'FII outflows and risk-off sentiment can pressure concentrated portfolios quickly.',
    'If rates stay higher for longer, high-valuation pockets may correct sharply.',
  ]

  const aiSuggestions = normalizeSuggestions([
    topHoldingWeight > 25
      ? {
          type: 'reduce',
          priority: topHoldingWeight > 35 ? 'critical' : 'high',
          title: `Reduce ${topHoldings[0].symbol} concentration`,
          description: `${topHoldings[0].symbol} is above the preferred single-stock allocation and can drive outsized downside if momentum reverses.`,
          affectedStocks: [topHoldings[0].symbol],
          suggestedAction: `Trim ${topHoldings[0].symbol} gradually until allocation is near 20%.`,
          expectedImpact: 'Reduces single-stock drawdown risk and improves capital flexibility.',
          confidenceScore: 0.84,
        }
      : null,
    {
      type: 'diversify',
      priority: 'high',
      title: 'Diversify into underrepresented sectors',
      description: 'Current allocation can be balanced by adding non-correlated sectors with resilient earnings profiles.',
      affectedStocks: [],
      suggestedAction: 'Add 1-2 quality names from defensive sectors over staggered entries.',
      expectedImpact: 'Improves diversification score and lowers portfolio volatility.',
      confidenceScore: 0.78,
    },
    highRiskHoldings.length > 0
      ? {
          type: 'watch',
          priority: 'medium',
          title: 'Monitor high-risk valuation/debt exposures',
          description: 'A few holdings show elevated leverage, stretched valuation, or technical weakness near 52-week lows.',
          affectedStocks: highRiskHoldings.slice(0, 5).map((holding) => holding.symbol),
          suggestedAction: 'Set alert thresholds and review thesis if fundamentals weaken further.',
          expectedImpact: 'Prevents slow-moving risk build-up from turning into a large drawdown.',
          confidenceScore: 0.73,
        }
      : null,
  ].filter(Boolean))

  let rebalancePlan = null
  if (topHoldingWeight > 28) {
    const targetWeight = 20
    const excessWeight = topHoldingWeight - targetWeight
    const sellValue = (excessWeight / 100) * context.totalCurrentValue
    const estimatedShares = Math.max(1, Math.round(sellValue / topHoldings[0].currentPrice))

    rebalancePlan = {
      trigger: `${topHoldings[0].symbol} exceeds recommended weight for risk-balanced positioning.`,
      steps: [
        {
          symbol: topHoldings[0].symbol,
          action: 'sell',
          currentWeight: round(topHoldingWeight, 1),
          targetWeight,
          estimatedShares,
          estimatedValue: round(estimatedShares * topHoldings[0].currentPrice, 2),
          reason: 'Reduce concentration and recycle capital into underrepresented sectors.',
        },
      ],
      estimatedBrokerage: round(Math.max(40, sellValue * 0.002), 2),
      estimatedTax: round(Math.max(0, sellValue * 0.01), 2),
    }
  }

  const riskMetrics = {
    beta: portfolioBeta,
    volatility: round(12 + Math.max(0, topHoldingWeight - 20) * 0.22 + Math.max(0, topSectorWeight - 30) * 0.12, 2),
    sharpeRatio: round(clamp(0.5 + totalPnLPercent / 30 - overallRiskScore / 20, -1, 2), 2),
    maxDrawdown: round(-(8 + overallRiskScore * 2.4), 2),
    valueAtRisk: round(clamp(1 + overallRiskScore * 0.25, 0.5, 6), 2),
    correlationToNifty: round(clamp(0.55 + (portfolioBeta - 1) * 0.2, 0, 1), 2),
    debtExposure,
    smallMicroCapExposure,
  }

  return {
    overallRiskScore,
    riskLevel: computeRiskLabel(overallRiskScore),
    riskColor: computeRiskColor(overallRiskScore),
    diversificationScore,
    concentrationRisk,
    sectorExposure,
    strengths,
    weaknesses,
    opportunities,
    threats,
    aiSuggestions,
    rebalancePlan,
    riskMetrics,
  }
}

async function analyzePortfolioRisk(userId, portfolioId, options = {}) {
  const forceRefresh = Boolean(options.forceRefresh)
  const cacheKey = `ai:portfolio:risk:${portfolioId}`
  if (!forceRefresh) {
    const cached = await getCache(cacheKey)
    if (cached) {
      return {
        ...cached,
        generatedAt: new Date(cached.generatedAt),
      }
    }
  }

  const context = await getPortfolioContext(userId, portfolioId)
  const heuristicResult = buildHeuristicPortfolioRisk(context)

  const systemPrompt =
    'You are an expert Indian equity portfolio risk analyst. Return only valid JSON matching the requested schema. No markdown.'

  const userPrompt = `Analyze this portfolio and return JSON only:\n\n${JSON.stringify(
    {
      portfolioName: context.portfolio.name,
      holdingsCount: context.holdingsWithWeight.length,
      totalInvested: round(context.totalInvested, 2),
      totalCurrentValue: round(context.totalCurrentValue, 2),
      totalPnLPercent: round(context.totalPnLPercent, 2),
      holdings: context.holdingsWithWeight.map((holding) => ({
        symbol: holding.symbol,
        companyName: holding.companyName,
        sector: holding.sector,
        marketCapCategory: holding.marketCapCat,
        portfolioWeight: round(holding.portfolioWeight, 2),
        pnlPercent: round(holding.pnlPercent, 2),
        debtToEquity: holding.debtToEquity,
        peRatio: holding.peRatio,
        beta: holding.beta,
        dayChange: round(holding.dayChange, 2),
      })),
      sectorBreakdown: context.sectorMap,
      marketCapBreakdown: context.mcapBreakdown,
      topHoldings: context.topHoldings.map((holding) => ({
        symbol: holding.symbol,
        weight: round(holding.portfolioWeight, 2),
      })),
      highRiskSymbols: context.highRiskHoldings.map((holding) => holding.symbol),
      targetSchema: {
        overallRiskScore: 'number(1-10)',
        riskLevel: 'Very Low|Low|Moderate|High|Very High',
        riskColor: 'green|yellow|orange|red|darkred',
        diversificationScore: 'number(0-100)',
        concentrationRisk: 'array',
        sectorExposure: 'array',
        strengths: 'string[]',
        weaknesses: 'string[]',
        opportunities: 'string[]',
        threats: 'string[]',
        aiSuggestions: 'array',
        rebalancePlan: 'object|null',
        riskMetrics: {
          beta: 'number',
          volatility: 'number',
          sharpeRatio: 'number',
          maxDrawdown: 'number',
          valueAtRisk: 'number',
          correlationToNifty: 'number(0-1)',
          debtExposure: 'number',
          smallMicroCapExposure: 'number',
        },
      },
    },
    null,
    2,
  )}`

  let tokensUsed = 0
  let result = heuristicResult

  try {
    const aiResponse = await callClaudeJson({
      systemPrompt,
      userPrompt,
      maxTokens: 2500,
    })

    tokensUsed = aiResponse.tokensUsed
    result = mergePortfolioRiskResult(heuristicResult, aiResponse.json)
  } catch {
    result = heuristicResult
  }

  const finalResult = {
    ...result,
    aiSuggestions: normalizeSuggestions(result.aiSuggestions),
    generatedAt: new Date(),
    tokensUsed,
  }

  await setCache(cacheKey, finalResult, 15 * 60)

  await AiAnalysisModel.createAnalysis({
    userId,
    portfolioId,
    type: 'PORTFOLIO_RISK',
    result: JSON.stringify(finalResult),
    tokensUsed,
    model: MODEL_NAME,
  }).catch(() => null)

  return finalResult
}

function buildStockFallback(company, livePrice, latestFinancial, keyNews) {
  const qualityScore = clamp(
    round(
      (Number(company?.peRatio ?? 20) < 35 ? 18 : 10) +
        (Number(company?.pbRatio ?? 4) < 5 ? 15 : 10) +
        (Number(latestFinancial?.roce ?? 0.12) * 100 > 15 ? 20 : 12) +
        (Number(latestFinancial?.roe ?? 0.1) * 100 > 12 ? 20 : 12) +
        (Number(latestFinancial?.debtToEquity ?? 0.8) < 1 ? 17 : 8) +
        (Number(company?.changePercent ?? 0) > 0 ? 8 : 5),
      0,
    ),
    0,
    100,
  )

  const sentimentScore = clamp(round((qualityScore - 50) / 65, 2), -1, 1)

  return {
    symbol: company.symbol,
    companyName: company.name,
    aiSummary: `${company.name} remains a ${company.sector} play with a mixed risk-reward profile. Current valuation and balance-sheet quality are acceptable for watchlist accumulation, but position sizing should account for market volatility. Use staggered entries and monitor quarterly margin trend before increasing exposure materially.`,
    sentimentScore,
    sentimentLabel: sentimentFromScore(sentimentScore),
    keyRisks: [
      'Valuation can compress if earnings growth slows.',
      'Sector-wide sentiment swings may impact short-term price behavior.',
      'Unexpected macro or regulatory changes can affect near-term returns.',
    ],
    keyOpportunities: [
      'Operational execution can improve earnings visibility over the next 2-3 quarters.',
      'Any broad market correction may offer better risk-adjusted entry levels.',
    ],
    analystVerdict: verdictFromScore(sentimentScore),
    priceTarget: livePrice?.price ? round(livePrice.price * 1.12, 2) : null,
    confidenceLevel: qualityScore >= 70 ? 'High' : qualityScore >= 55 ? 'Medium' : 'Low',
    newsImpact: keyNews.length > 0 ? 'Recent headlines suggest a neutral-to-positive near-term sentiment bias.' : 'No major near-term news catalyst detected.',
    fundamentalStrength: qualityScore,
  }
}

async function analyzeStock(symbol, userId = null) {
  const normalizedSymbol = String(symbol ?? '').toUpperCase()
  const cacheKey = `ai:stock:${normalizedSymbol}`
  const cached = await getCache(cacheKey)

  if (cached) {
    return {
      ...cached,
      generatedAt: new Date(cached.generatedAt),
    }
  }

  const company = StockModel.getCompanyBySymbol(normalizedSymbol)
  if (!company) {
    throw new Error(`Company ${normalizedSymbol} not found`)
  }

  const livePrice = LiveMarketService.getLiveQuote(normalizedSymbol)
  const { latest: latestFinancial, revenueGrowthYoy } = getLatestFinancial(normalizedSymbol)
  const { latest: shareholding, promoterChange } = getLatestShareholding(normalizedSymbol)
  const news = StockModel.getNews(normalizedSymbol).slice(0, 5)

  const fallback = buildStockFallback(company, livePrice, latestFinancial, news)

  const prompt = `Analyze this Indian stock and return JSON only.\n\n${JSON.stringify(
    {
      symbol: normalizedSymbol,
      company: {
        name: company.name,
        sector: company.sector,
        industry: company.industry,
        marketCapCategory: company.marketCapCategory,
      },
      marketData: {
        currentPrice: livePrice?.price ?? company.currentPrice,
        dayChange: livePrice?.changePercent ?? company.changePercent,
        week52High: company.week52High,
        week52Low: company.week52Low,
      },
      financials: {
        roce: latestFinancial?.roce != null ? Number(latestFinancial.roce) * 100 : null,
        roe: latestFinancial?.roe != null ? Number(latestFinancial.roe) * 100 : null,
        debtToEquity: latestFinancial?.debtToEquity != null ? Number(latestFinancial.debtToEquity) : null,
        netMargin: latestFinancial?.netMargin != null ? Number(latestFinancial.netMargin) * 100 : null,
        revenueGrowthYoy,
      },
      valuation: {
        peRatio: company.peRatio,
        pbRatio: company.pbRatio,
        dividendYield: company.dividendYield,
      },
      shareholding: {
        promoterHolding: shareholding?.promoterHolding ?? null,
        fiiHolding: shareholding?.fiiHolding ?? null,
        promoterChange,
      },
      recentNews: news.map((item) => item.title),
      targetSchema: {
        symbol: normalizedSymbol,
        companyName: company.name,
        aiSummary: 'string',
        sentimentScore: 'number(-1 to 1)',
        sentimentLabel: 'Bearish|Slightly Bearish|Neutral|Slightly Bullish|Bullish',
        keyRisks: 'string[]',
        keyOpportunities: 'string[]',
        analystVerdict: 'Strong Buy|Buy|Hold|Sell|Strong Sell',
        priceTarget: 'number|null',
        confidenceLevel: 'Low|Medium|High',
        newsImpact: 'string',
        fundamentalStrength: 'number(0-100)',
      },
    },
    null,
    2,
  )}`

  let result = fallback
  let tokensUsed = 0

  try {
    const aiResponse = await callClaudeJson({
      systemPrompt: 'You are an Indian equity analyst. Return strict JSON only.',
      userPrompt: prompt,
      maxTokens: 1200,
    })

    tokensUsed = aiResponse.tokensUsed
    result = {
      ...fallback,
      ...(aiResponse.json ?? {}),
      sentimentScore: clamp(Number(aiResponse.json?.sentimentScore ?? fallback.sentimentScore), -1, 1),
      sentimentLabel: aiResponse.json?.sentimentLabel || fallback.sentimentLabel,
      analystVerdict: aiResponse.json?.analystVerdict || fallback.analystVerdict,
      fundamentalStrength: clamp(Number(aiResponse.json?.fundamentalStrength ?? fallback.fundamentalStrength), 0, 100),
      keyRisks: asArray(aiResponse.json?.keyRisks).length > 0 ? aiResponse.json.keyRisks : fallback.keyRisks,
      keyOpportunities:
        asArray(aiResponse.json?.keyOpportunities).length > 0
          ? aiResponse.json.keyOpportunities
          : fallback.keyOpportunities,
    }
  } catch {
    result = fallback
  }

  const finalResult = {
    ...result,
    generatedAt: new Date(),
  }

  await setCache(cacheKey, finalResult, 30 * 60)

  if (userId) {
    await AiAnalysisModel.createAnalysis({
      userId,
      symbol: normalizedSymbol,
      type: 'STOCK_ANALYSIS',
      result: JSON.stringify(finalResult),
      tokensUsed,
      model: MODEL_NAME,
    }).catch(() => null)
  }

  return finalResult
}

function buildMarketInsightFallback() {
  const rows = LiveMarketService.getLiveMarketRows()
  const advancing = rows.filter((row) => row.changePercent >= 0).length
  const declining = rows.length - advancing
  const moodScore = clamp(round((advancing / Math.max(rows.length, 1)) * 100, 0), 0, 100)

  return {
    marketMood: moodScore < 30 ? 'Fearful' : moodScore < 45 ? 'Cautious' : moodScore < 60 ? 'Neutral' : moodScore < 75 ? 'Optimistic' : 'Euphoric',
    moodScore,
    topThemes: [
      'Domestic flows remain supportive for quality large caps.',
      'Selective rotation into defensives amid global volatility.',
      'Earnings resilience driving stock-specific opportunities.',
    ],
    topRisks: [
      'Global risk-off moves can trigger short-term drawdowns.',
      'Sticky inflation can delay policy easing.',
      'Currency and commodity volatility may pressure margins.',
    ],
    keyOpportunities: [
      'Use dips to accumulate high-quality leaders in staggered fashion.',
      'Blend cyclical and defensive exposures for better risk-adjusted returns.',
    ],
    sectorOutlook: [
      { sector: 'Banking', outlook: 'Bullish', reasons: ['Credit growth remains healthy', 'Balance sheets are stronger than prior cycles'] },
      { sector: 'Information Technology', outlook: 'Neutral', reasons: ['Demand visibility is improving gradually', 'Valuations require selective entries'] },
      { sector: 'Pharmaceuticals', outlook: 'Bullish', reasons: ['Defensive earnings profile', 'Export tailwinds in select segments'] },
      { sector: 'Metals', outlook: 'Bearish', reasons: ['Global demand uncertainty', 'Commodity volatility remains elevated'] },
    ],
    weeklyOutlook:
      'Markets may stay range-bound with stock-specific moves dominating broad index direction. Focus on risk-managed allocation, avoid over-concentration, and use phased entries in fundamentally strong businesses.',
  }
}

function getSecondsUntilMidnightIST() {
  const now = new Date()
  const nowIst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
  const midnightIst = new Date(nowIst)
  midnightIst.setHours(24, 0, 0, 0)
  return Math.max(60, Math.floor((midnightIst.getTime() - nowIst.getTime()) / 1000))
}

async function getMarketInsight(userId = null) {
  const cacheKey = 'ai:market:insight:daily'
  const cached = await getCache(cacheKey)
  if (cached) {
    return {
      ...cached,
      generatedAt: new Date(cached.generatedAt),
    }
  }

  const latestNews = StockModel.newsFeed.slice(0, 12).map((item) => item.title)
  const sectorSnapshot = StockModel.sectorIndices.slice(0, 8)
  const fallback = buildMarketInsightFallback()

  let tokensUsed = 0
  let result = fallback

  const prompt = `Generate Indian stock market daily insight JSON only.\n\n${JSON.stringify(
    {
      latestNews,
      sectorSnapshot,
      targetSchema: {
        marketMood: 'Fearful|Cautious|Neutral|Optimistic|Euphoric',
        moodScore: 'number(0-100)',
        topThemes: 'string[]',
        topRisks: 'string[]',
        keyOpportunities: 'string[]',
        sectorOutlook: [{ sector: 'string', outlook: 'Bullish|Neutral|Bearish', reasons: 'string[]' }],
        weeklyOutlook: 'string',
      },
    },
    null,
    2,
  )}`

  try {
    const aiResponse = await callClaudeJson({
      systemPrompt: 'You are an Indian market strategist. Return strict JSON only.',
      userPrompt: prompt,
      maxTokens: 1500,
    })

    tokensUsed = aiResponse.tokensUsed
    result = {
      ...fallback,
      ...(aiResponse.json ?? {}),
      moodScore: clamp(Number(aiResponse.json?.moodScore ?? fallback.moodScore), 0, 100),
      topThemes: asArray(aiResponse.json?.topThemes).length > 0 ? aiResponse.json.topThemes : fallback.topThemes,
      topRisks: asArray(aiResponse.json?.topRisks).length > 0 ? aiResponse.json.topRisks : fallback.topRisks,
      keyOpportunities:
        asArray(aiResponse.json?.keyOpportunities).length > 0
          ? aiResponse.json.keyOpportunities
          : fallback.keyOpportunities,
      sectorOutlook:
        asArray(aiResponse.json?.sectorOutlook).length > 0 ? aiResponse.json.sectorOutlook : fallback.sectorOutlook,
      weeklyOutlook: aiResponse.json?.weeklyOutlook || fallback.weeklyOutlook,
    }
  } catch {
    result = fallback
  }

  const finalResult = {
    ...result,
    generatedAt: new Date(),
  }

  await setCache(cacheKey, finalResult, getSecondsUntilMidnightIST())

  if (userId) {
    await AiAnalysisModel.createAnalysis({
      userId,
      type: 'MARKET_INSIGHT',
      result: JSON.stringify(finalResult),
      tokensUsed,
      model: MODEL_NAME,
    }).catch(() => null)
  }

  return finalResult
}

function buildFallbackChatReply(context, userMessage) {
  const top = context.topHoldings[0]
  const lines = [
    `Based on your holdings, your largest risk driver is ${top?.symbol ?? 'portfolio concentration'}.`,
    'Use staggered rebalancing instead of all-at-once exits so you can manage timing and tax impact.',
    'Keep stop-loss or review thresholds for high-beta names and rebalance monthly.',
    '',
    '1. Which stock should I trim first?',
    '2. How much should I allocate to defensive sectors?',
    '3. What rebalancing plan minimizes tax impact?',
  ]

  if (String(userMessage).toLowerCase().includes('sell')) {
    lines[0] = `If you need to reduce risk now, trim ${top?.symbol ?? 'your largest position'} in small tranches and reallocate to underweight sectors.`
  }

  return lines.join('\n')
}

function extractFollowUps(reply) {
  const followUps = []
  const regex = /(?:^|\n)\s*(?:\d+\.|[-*•])\s*(.+\?)/g
  let match = regex.exec(reply)
  while (match) {
    followUps.push(match[1].trim())
    match = regex.exec(reply)
  }
  return followUps.slice(-3)
}

async function portfolioChat(userId, portfolioId, userMessage, conversationHistory) {
  const context = await getPortfolioContext(userId, portfolioId)
  const holdingsSummary = context.holdingsWithWeight
    .map((holding) => `${holding.symbol} (${round(holding.portfolioWeight, 1)}%)`)
    .join(', ')

  let reply = ''
  let tokensUsed = 0

  if (anthropic) {
    try {
      const response = await anthropic.messages.create({
        model: MODEL_NAME,
        max_tokens: 900,
        system: `You are an Indian stock market portfolio advisor. Keep responses concise and practical. Portfolio: ${holdingsSummary}. End with 2-3 follow-up questions.`,
        messages: [
          ...asArray(conversationHistory).slice(-10).map((item) => ({
            role: item.role === 'assistant' ? 'assistant' : 'user',
            content: String(item.content ?? ''),
          })),
          { role: 'user', content: userMessage },
        ],
      })

      reply = asArray(response.content)
        .filter((item) => item.type === 'text')
        .map((item) => item.text)
        .join('\n')

      tokensUsed = Number(response.usage?.input_tokens ?? 0) + Number(response.usage?.output_tokens ?? 0)
    } catch {
      reply = buildFallbackChatReply(context, userMessage)
    }
  } else {
    reply = buildFallbackChatReply(context, userMessage)
  }

  const suggestedFollowUps = extractFollowUps(reply)

  if (userId) {
    await AiAnalysisModel.createAnalysis({
      userId,
      portfolioId,
      type: 'PORTFOLIO_CHAT',
      result: JSON.stringify({ question: userMessage, reply }),
      tokensUsed,
      model: MODEL_NAME,
    }).catch(() => null)
  }

  return {
    reply,
    suggestedFollowUps:
      suggestedFollowUps.length > 0
        ? suggestedFollowUps
        : ['Which stock should I reduce first?', 'How can I lower risk without hurting returns?', 'Which sector should I add next?'],
  }
}

const metricAliases = {
  market_cap_cr: ['market cap', 'marketcap', 'mcap'],
  pe_ratio: ['pe', 'p/e', 'pe ratio', 'p/e ratio'],
  pb_ratio: ['pb', 'p/b', 'pb ratio', 'p/b ratio'],
  roce: ['roce'],
  roe: ['roe'],
  net_margin: ['net margin', 'margin'],
  revenue_growth_yoy: ['revenue growth', 'sales growth', 'yoy growth'],
  debt_to_equity: ['debt', 'debt equity', 'debt/equity', 'd/e'],
  free_cash_flow: ['free cash flow', 'fcf'],
  promoter_holding: ['promoter holding', 'promoter'],
  fii_holding: ['fii holding', 'fii'],
  promoter_change: ['promoter change'],
  dividend_yield: ['dividend yield', 'yield'],
  current_ratio: ['current ratio'],
}

function inferMetricFromText(text) {
  const normalized = text.toLowerCase()
  const entries = Object.entries(metricAliases)
  for (const [metric, aliases] of entries) {
    if (aliases.some((alias) => normalized.includes(alias))) {
      return metric
    }
  }
  return null
}

function fallbackParseNaturalLanguageFilter(query) {
  const normalized = String(query ?? '').toLowerCase()

  const rangeMatch = normalized.match(/market\s*cap.*?between\s*(\d+(?:\.\d+)?)\s*(?:and|to)\s*(\d+(?:\.\d+)?)/)
  const operators = [
    { name: 'gte', pattern: /(above|greater than|more than|>=)\s*(\d+(?:\.\d+)?)/ },
    { name: 'lte', pattern: /(below|less than|under|<=)\s*(\d+(?:\.\d+)?)/ },
  ]

  const filters = []

  if (rangeMatch) {
    filters.push({
      metric: 'market_cap_cr',
      operator: 'between',
      value: Number(rangeMatch[1]),
      value2: Number(rangeMatch[2]),
    })
  }

  const metricCandidates = normalized.split(/and|,|with/).map((chunk) => chunk.trim())
  metricCandidates.forEach((chunk) => {
    const metric = inferMetricFromText(chunk)
    if (!metric) {
      return
    }

    for (const operator of operators) {
      const match = chunk.match(operator.pattern)
      if (match) {
        filters.push({
          metric,
          operator: operator.name,
          value: Number(match[2]),
          value2: null,
        })
        return
      }
    }

    const numberMatch = chunk.match(/(\d+(?:\.\d+)?)/)
    if (numberMatch) {
      filters.push({
        metric,
        operator: 'gte',
        value: Number(numberMatch[1]),
        value2: null,
      })
    }
  })

  if (filters.length === 0) {
    return {
      filters: [
        {
          metric: 'roce',
          operator: 'gte',
          value: 15,
          value2: null,
        },
      ],
      logic: 'AND',
      explanation: 'Defaulted to a quality baseline filter because the query could not be parsed precisely.',
    }
  }

  return {
    filters,
    logic: 'AND',
    explanation: `Parsed ${filters.length} condition${filters.length === 1 ? '' : 's'} from your natural language query.`,
  }
}

async function parseNaturalLanguageFilter(query, userId = null) {
  const cacheKey = `ai:screener:parse:${String(query ?? '').trim().toLowerCase()}`
  const cached = await getCache(cacheKey)
  if (cached) {
    return cached
  }

  const fallback = fallbackParseNaturalLanguageFilter(query)
  let tokensUsed = 0
  let result = fallback

  if (anthropic) {
    try {
      const aiResponse = await callClaudeJson({
        systemPrompt: 'Convert natural language stock screener requests into strict JSON filters. Return JSON only.',
        userPrompt: `Query: ${query}\nReturn {"filters":[{"metric":"...","operator":"gt|lt|gte|lte|eq|between","value":number,"value2":number|null}],"logic":"AND","explanation":"..."}`,
        maxTokens: 500,
      })

      tokensUsed = aiResponse.tokensUsed
      result = {
        filters: asArray(aiResponse.json?.filters).length > 0 ? aiResponse.json.filters : fallback.filters,
        logic: aiResponse.json?.logic || 'AND',
        explanation: aiResponse.json?.explanation || fallback.explanation,
      }
    } catch {
      result = fallback
    }
  }

  await setCache(cacheKey, result, 30 * 60)

  if (userId) {
    await AiAnalysisModel.createAnalysis({
      userId,
      type: 'SCREENER_PARSE',
      result: JSON.stringify({ query, ...result }),
      tokensUsed,
      model: MODEL_NAME,
    }).catch(() => null)
  }

  return result
}

module.exports = {
  analyzePortfolioRisk,
  analyzeStock,
  getMarketInsight,
  portfolioChat,
  parseNaturalLanguageFilter,
}
