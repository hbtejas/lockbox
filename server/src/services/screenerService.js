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
  pe_ratio: 'peRatio',
  'p/b ratio': 'pbRatio',
  pb_ratio: 'pbRatio',
  'debt/equity': 'debtToEquity',
  debt_to_equity: 'debtToEquity',
  eps: 'eps',
  'dividend yield': 'dividendYield',
  dividend_yield: 'dividendYield',
  'promoter holding': 'promoterHolding',
  promoter_holding: 'promoterHolding',
  'fii holding': 'fiiHolding',
  fii_holding: 'fiiHolding',
  'dii holding': 'diiHolding',
  'qoq revenue growth': 'qoqRevenueGrowth',
  'yoy revenue growth': 'revenueGrowth',
  'cash from operations': 'cashFromOperations',
  'capex/net block': 'capexNetBlock',
  'free cash flow': 'freeCashFlow',
  free_cash_flow: 'freeCashFlow',
  net_margin: 'netMargin',
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

    return {
      company: company.name,
      ticker: company.symbol,
      sector: company.sector,
      marketCap: company.marketCap / 10000000, // convert to Cr
      peRatio: company.peRatio,
      pbRatio: company.pbRatio,
      roce: latestFin.roce ? latestFin.roce * 100 : 15,
      roe: latestFin.roe ? latestFin.roe * 100 : 15,
      netMargin: latestFin.netMargin ? latestFin.netMargin * 100 : 10,
      revenueGrowth: revGrowth,
      netProfitGrowth: profitGrowth,
      debtToEquity: latestFin.debtToEquity || 0.4,
      eps: latestFin.eps || 12,
      dividendYield: company.dividendYield || 0.5,
      promoterHolding: latestSh.promoterHolding || 50,
      fiiHolding: latestSh.fiiHolding || 20,
      diiHolding: latestSh.diiHolding || 10,
      qoqRevenueGrowth: revGrowth,
      yoyRevenueGrowth: revGrowth, // Simplification
      cashFromOperations: latestFin.operatingCashFlow || 10000,
      capexNetBlock: 0.15,
      freeCashFlow: latestFin.freeCashFlow || 5000,
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

    const match = clause.match(/(.+?)\s*(>=|<=|>|<|=)\s*([\d.]+)/)
    if (!match) {
      continue
    }

    const rawMetric = match[1].trim()
    const operator = match[2]
    const value = Number(match[3])
    const metric = metricMap[rawMetric]

    if (!metric || Number.isNaN(value)) {
      continue
    }

    clauses.push({ metric, operator, value, connector })
  }

  return clauses
}

function evaluateClause(row, clause) {
  const actual = row[clause.metric]
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
