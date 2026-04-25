const axios = require('axios')
const { env } = require('../config/env')
const StockModel = require('../models/Stock')
const LiveMarketService = require('./liveMarketService')

async function fetchAlphaVantageQuote(symbol) {
  if (!env.alphaVantageApiKey) {
    return null
  }

  try {
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: `${symbol}.BSE`,
        apikey: env.alphaVantageApiKey,
      },
      timeout: 6000,
    })

    const quote = response.data['Global Quote']
    if (!quote) {
      return null
    }

    return {
      price: Number(quote['05. price']),
      changePercent: Number(String(quote['10. change percent']).replace('%', '')),
    }
  } catch {
    return null
  }
}

async function getCompanyOverview(symbol) {
  const company = LiveMarketService.getCompanyOverviewWithLiveQuote(symbol)
  if (!company) {
    return null
  }

  const liveQuote = await fetchAlphaVantageQuote(symbol)

  return {
    ...company,
    currentPrice: liveQuote?.price ?? company.currentPrice,
    changePercent: liveQuote?.changePercent ?? company.changePercent,
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
