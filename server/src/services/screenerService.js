const { companies, popularScreenerQueries } = require('../data/sampleData')

const StockModel = require('../models/Stock')

const metricMap = {
  'market cap': 'marketCap',
  marketcap: 'marketCap',
  market_cap_cr: 'marketCap',
  revenue: 'revenueGrowth',
  revenue_growth_yoy: 'revenueGrowth',
  'net profit': 'netProfitGrowth',
  roce: 'roce',
  roe: 'roe',
  'p/e ratio': 'peRatio',
  pe: 'peRatio',
  'pe ratio': 'peRatio',
  pe_ratio: 'peRatio',
  'p/b ratio': 'pbRatio',
  'pb ratio': 'pbRatio',
  pb_ratio: 'pbRatio',
  'debt/equity': 'debtToEquity',
  'debt to equity': 'debtToEquity',
  debt_to_equity: 'debtToEquity',
  eps: 'eps',
  'dividend yield': 'dividendYield',
  dividend_yield: 'dividendYield',
  'promoter holding': 'promoterHolding',
  promoter_holding: 'promoterHolding',
  'promoter holding change': 'promoterHoldingChange',
  'fii holding': 'fiiHolding',
  fii_holding: 'fiiHolding',
  'fii holding change': 'fiiHoldingChange',
  'dii holding': 'diiHolding',
  'dii holding change': 'diiHoldingChange',
  'qoq revenue growth': 'qoqRevenueGrowth',
  'yoy revenue growth': 'revenueGrowth',
  'sales growth 5yr': 'salesGrowth5Yr',
  'operating margin': 'netMargin', // approximate
  'cash from operations': 'cashFromOperations',
  'cash flow operations': 'cashFromOperations',
  'capex/net block': 'capexNetBlock',
  capex: 'capex',
  'free cash flow': 'freeCashFlow',
  free_cash_flow: 'freeCashFlow',
  net_margin: 'netMargin',
  rsi: 'rsi',
  'sma 50': 'sma50',
  'sma 200': 'sma200',
  volume: 'volume',
  sector: 'sector',
}

function buildScreenerRows() {
  return companies.map((company) => {
    const financials = StockModel.getFinancials(company.symbol, 'Q')
      .slice()
      .sort((a, b) => new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime())
    
    const latestFin = financials[0] || {}
    const prevFin = financials[1] || {}

    const shareholding = StockModel.getShareholding(company.symbol)
      .slice()
      .sort((a, b) => new Date(b.quarter).getTime() - new Date(a.quarter).getTime())
      
    const latestSh = shareholding[0] || {}

    const revGrowth = latestFin.revenue && prevFin.revenue && prevFin.revenue > 0
      ? ((latestFin.revenue - prevFin.revenue) / prevFin.revenue) * 100
      : 10
      
    const profitGrowth = latestFin.netProfit && prevFin.netProfit && prevFin.netProfit > 0
      ? ((latestFin.netProfit - prevFin.netProfit) / prevFin.netProfit) * 100
      : 8

    const roce = latestFin.roce ? latestFin.roce * 100 : 15

    // Product Engineering: Decision-making metrics
    const score = Math.round(
      (roce > 20 ? 3 : roce > 12 ? 1.5 : 0) +
      (revGrowth > 15 ? 2.5 : revGrowth > 8 ? 1.2 : 0) +
      (company.peRatio < 25 ? 2 : company.peRatio < 45 ? 1 : 0) +
      (latestFin.debtToEquity < 0.5 ? 2.5 : latestFin.debtToEquity < 1 ? 1 : 0)
    )

    const insights = []
    if (roce > 25 && revGrowth > 20) insights.push('Growth Compounder')
    if (company.peRatio < 15) insights.push('Value Play')
    if (latestFin.debtToEquity > 1.5) insights.push('High Leverage')
    if (revGrowth < 0) insights.push('Declining Revenue')
    if (latestSh.promoterHolding > 70) insights.push('Skin in the Game')

    return {
      company: company.name,
      ticker: company.symbol,
      sector: company.sector,
      marketCap: company.marketCap / 10000000,
      peRatio: company.peRatio,
      pbRatio: company.pbRatio,
      roce,
      roe: latestFin.roe ? latestFin.roe * 100 : 15,
      netMargin: latestFin.netMargin ? latestFin.netMargin * 100 : 10,
      revenueGrowth: revGrowth,
      netProfitGrowth: profitGrowth,
      debtToEquity: latestFin.debtToEquity || 0.4,
      eps: latestFin.eps || 12,
      dividendYield: company.dividendYield || 0.5,
      promoterHolding: latestSh.promoterHolding || 50,
      score, // 1-10 decision score
      insights, // Actionable labels
      rsi: 30 + Math.random() * 40,
      volume: 1000000 + Math.random() * 5000000,
    }
  })
}

function normalizeQuery(query) {
  return query.replace(/\s+/g, ' ').trim().toLowerCase()
}

function parseClauses(query) {
  const normalized = normalizeQuery(query)
  const split = normalized.split(/\s+(and|or)\s+/i)
  const clauses = []

  for (let index = 0; index < split.length; index += 2) {
    const clause = split[index]
    const connector = split[index + 1]?.toUpperCase() ?? null

    const match = clause.match(/(.+?)\s*(>=|<=|>|<|=)\s*(['"].+?['"]|[\w\d.]+)/)
    if (!match) {
      continue
    }

    const rawMetric = match[1].trim()
    const operator = match[2]
    const rawValue = match[3].trim()
    const metric = metricMap[rawMetric]

    if (!metric) {
      continue
    }

    // Handle quoted or unquoted string values
    const stringMatch = rawValue.match(/^['"](.+)['"]$/)
    const value = stringMatch ? stringMatch[1] : (isNaN(Number(rawValue)) ? rawValue : Number(rawValue))

    clauses.push({ metric, operator, value, connector })
  }

  return clauses
}

function evaluateClause(row, clause) {
  const actual = row[clause.metric]
  
  if (typeof clause.value === 'string') {
    const term = clause.value.toLowerCase()
    const actualStr = String(actual ?? '').toLowerCase()
    if (clause.operator === '=') return actualStr === term
    return false
  }

  if (typeof actual !== 'number') {
    return false
  }

  if (clause.operator === '>') return actual > clause.value
  if (clause.operator === '<') return actual < clause.value
  if (clause.operator === '>=') return actual >= clause.value
  if (clause.operator === '<=') return actual <= clause.value
  return actual === clause.value
}

function runScreenerQuery(query) {
  const rows = buildScreenerRows()
  const clauses = parseClauses(query)

  if (clauses.length === 0) {
    return rows
  }

  return rows.filter((row) => {
    let result = evaluateClause(row, clauses[0])
    for (let index = 1; index < clauses.length; index += 1) {
      const clause = clauses[index]
      const previousConnector = clauses[index - 1].connector ?? 'AND'
      const clauseResult = evaluateClause(row, clause)

      if (previousConnector === 'OR') {
        result = result || clauseResult
      } else {
        result = result && clauseResult
      }
    }
    return result
  })
}

module.exports = {
  buildScreenerRows,
  runScreenerQuery,
  popularScreenerQueries,
}
