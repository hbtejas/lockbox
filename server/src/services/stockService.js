const axios = require('axios')
const { env } = require('../config/env')
const StockModel = require('../models/Stock')
const LiveMarketService = require('./liveMarketService')

const YahooFinance = require('yahoo-finance2').default
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

async function fetchYahooQuote(symbol) {
  try {
    const querySymbol = symbol.endsWith('.NS') || symbol.endsWith('.BO') ? symbol : `${symbol}.NS`
    const quote = await yahooFinance.quote(querySymbol)
    if (!quote) return null
    return {
      price: quote.regularMarketPrice,
      changePercent: quote.regularMarketChangePercent,
      name: quote.longName || quote.shortName || symbol,
      marketCap: quote.marketCap,
      volume: quote.regularMarketVolume,
      peRatio: quote.trailingPE,
      eps: quote.epsTrailingTwelveMonths,
      exchange: quote.exchange,
    }
  } catch {
    return null
  }
}

async function getCompanyOverview(symbol) {
  const normalizedSymbol = symbol.toUpperCase()
  let company = LiveMarketService.getCompanyOverviewWithLiveQuote(normalizedSymbol)

  // Fetch real-time data from Yahoo
  const liveQuote = await fetchYahooQuote(normalizedSymbol)

  // If the company isn't in our local DB but we found it on Yahoo, dynamically add it!
  if (!company && liveQuote) {
    const { companies, stockPrices, financials } = require('../data/sampleData')
    
    const newCompany = {
      symbol: normalizedSymbol,
      name: liveQuote.name,
      exchange: 'NSE',
      sector: 'Diversified',
      industry: 'Diversified',
      currentPrice: liveQuote.price,
      changePercent: liveQuote.changePercent,
      marketCap: liveQuote.marketCap || 10000000000,
      marketCapCategory: 'Mid Cap',
      peRatio: liveQuote.peRatio || 20,
      pbRatio: 2.5,
      dividendYield: 1.0,
      roe: 15.0,
      roce: 18.0,
      debtToEquity: 0.5,
      about: `${liveQuote.name} is a publicly traded company on the National Stock Exchange of India.`,
    }
    
    companies.push(newCompany)
    LiveMarketService.syncNewCompany(newCompany)
    
    // Add mock news for the new company
    const { newsFeed } = require('../data/sampleData')
    newsFeed.push({
      id: `news-${normalizedSymbol}-1`,
      symbol: normalizedSymbol,
      title: `${newCompany.name} Announces Strategic Expansion Plans`,
      summary: `${newCompany.name} has outlined a multi-year strategy to expand its footprint in the domestic market, focusing on digital transformation and operational efficiency.`,
      source: 'Financial Express',
      url: '#',
      publishedAt: dayjs().subtract(1, 'day').toISOString(),
    })
    newsFeed.push({
      id: `news-${normalizedSymbol}-2`,
      symbol: normalizedSymbol,
      title: `Analysts Bullish on ${normalizedSymbol} Post Quarterly Review`,
      summary: `Leading brokerages have maintained a 'Buy' rating on ${normalizedSymbol}, citing strong volume growth and margin sustainability.`,
      source: 'MoneyControl',
      url: '#',
      publishedAt: dayjs().subtract(3, 'day').toISOString(),
    })

    // Try to fetch some historical data
    try {
      const querySymbol = normalizedSymbol.endsWith('.NS') || normalizedSymbol.endsWith('.BO') ? normalizedSymbol : `${normalizedSymbol}.NS`
      const history = await yahooFinance.historical(querySymbol, {
        period1: dayjs().subtract(1, 'year').format('YYYY-MM-DD'),
      })
      
      if (history && history.length > 0) {
        const formattedHistory = history.map(h => ({
          symbol: normalizedSymbol,
          date: dayjs(h.date).format('YYYY-MM-DD'),
          open: h.open,
          high: h.high,
          low: h.low,
          close: h.close,
          volume: h.volume,
        }))
        stockPrices.push(...formattedHistory)
      }
    } catch (err) {
      console.warn(`Could not fetch historical data for ${normalizedSymbol}`, err)
    }

    // Add some mock financials so the tabs aren't empty
    const periods = ['2023-12-31', '2024-03-31', '2024-06-30', '2024-09-30']
    periods.forEach(p => {
      financials.push({
        symbol: normalizedSymbol,
        periodType: 'Q',
        periodEnd: p,
        revenue: 1000 + Math.random() * 500,
        netProfit: 100 + Math.random() * 50,
        eps: 5 + Math.random() * 2,
        roce: 0.15,
        roe: 0.12,
        debtToEquity: 0.4
      })
    })

    company = newCompany
  }

  if (!company) {
    return null
  }

  return {
    ...company,
    currentPrice: liveQuote?.price ?? company.currentPrice,
    changePercent: liveQuote?.changePercent ?? company.changePercent,
    marketCap: liveQuote?.marketCap ?? company.marketCap,
  }
}

function getPricePeriodDays(period) {
  const map = {
    '1d': 1,
    '1w': 7,
    '1m': 30,
    '6m': 180,
    '1y': 365,
    '5y': 1825,
    all: null,
  }
  return map[period?.toLowerCase()] ?? 365
}

function getMarketSnapshot() {
  const rows = LiveMarketService.getLiveMarketRows()
  const gainers = [...rows].sort((a, b) => b.changePercent - a.changePercent).slice(0, 10)
  const losers = [...rows].sort((a, b) => a.changePercent - b.changePercent).slice(0, 10)
  const mostActive = [...rows].sort((a, b) => b.volume - a.volume).slice(0, 10)

  return {
    gainers,
    losers,
    mostActive,
    heatmap: rows,
  }
}

function getHistoricalPrices(symbol, periodDays) {
  return LiveMarketService.getPriceHistoryWithLive(symbol, periodDays)
}

function getRealtimeQuotes() {
  return LiveMarketService.getAllLiveQuotes()
}

module.exports = {
  getCompanyOverview,
  getPricePeriodDays,
  getMarketSnapshot,
  getHistoricalPrices,
  getRealtimeQuotes,
}
