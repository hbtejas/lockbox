const dayjs = require('dayjs')
const { companies, stockPrices, newsFeed, resultsCalendar } = require('../data/sampleData')

const quoteState = new Map()
let sequence = 1
let tickCounter = 0

function round(value) {
  return Number(value.toFixed(2))
}

function initializeQuoteState() {
  if (quoteState.size > 0) {
    return
  }

  for (const company of companies) {
    const rows = stockPrices.filter((entry) => entry.symbol === company.symbol)
    const latest = rows[rows.length - 1]
    const previous = rows[rows.length - 2]

    const price = latest?.close ?? company.currentPrice
    const prevClose = previous?.close ?? latest?.open ?? company.currentPrice
    const changePercent = prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : company.changePercent

    quoteState.set(company.symbol, {
      symbol: company.symbol,
      price,
      prevClose,
      open: latest?.open ?? price,
      high: latest?.high ?? price,
      low: latest?.low ?? price,
      volume: latest?.volume ?? 1_000_000,
      changePercent: round(changePercent),
      at: new Date().toISOString(),
    })
  }
}

initializeQuoteState()

function getLiveQuote(symbol) {
  initializeQuoteState()
  return quoteState.get(symbol.toUpperCase()) ?? null
}

function getAllLiveQuotes() {
  initializeQuoteState()
  return Array.from(quoteState.values())
}

function toMarketRow(company, quote) {
  return {
    symbol: company.symbol,
    company: company.name,
    name: company.name,
    exchange: company.exchange,
    sector: company.sector,
    industry: company.industry,
    currentPrice: quote?.price ?? company.currentPrice,
    price: quote?.price ?? company.currentPrice,
    changePercent: quote?.changePercent ?? company.changePercent,
    volume: quote?.volume ?? 0,
    peRatio: company.peRatio,
    marketCap: company.marketCap,
    marketCapCategory: company.marketCapCategory,
  }
}

function getLiveMarketRows() {
  initializeQuoteState()
  return companies.map((company) => toMarketRow(company, quoteState.get(company.symbol)))
}

function getCompanyOverviewWithLiveQuote(symbol) {
  const company = companies.find((entry) => entry.symbol === symbol.toUpperCase())
  if (!company) {
    return null
  }

  const quote = getLiveQuote(symbol)

  return {
    ...company,
    currentPrice: quote?.price ?? company.currentPrice,
    changePercent: quote?.changePercent ?? company.changePercent,
  }
}

function getPriceHistoryWithLive(symbol, periodDays) {
  const normalizedSymbol = symbol.toUpperCase()
  const rows = stockPrices
    .filter((entry) => entry.symbol === normalizedSymbol)
    .map((entry) => ({ ...entry }))

  const quote = getLiveQuote(normalizedSymbol)

  if (quote) {
    const today = dayjs().format('YYYY-MM-DD')
    const latestRow = rows[rows.length - 1]

    if (!latestRow || latestRow.date !== today) {
      rows.push({
        symbol: normalizedSymbol,
        date: today,
        open: quote.open,
        high: quote.high,
        low: quote.low,
        close: quote.price,
        volume: quote.volume,
      })
    } else {
      latestRow.open = quote.open
      latestRow.high = quote.high
      latestRow.low = quote.low
      latestRow.close = quote.price
      latestRow.volume = quote.volume
    }
  }

  if (!periodDays) {
    return rows
  }

  return rows.slice(-periodDays)
}

function createLiveTimelineEvent(symbol, quote) {
  const direction = quote.changePercent >= 0 ? 'up' : 'down'
  const event = {
    id: `live-timeline-${Date.now()}-${sequence++}`,
    symbol,
    title: `${symbol} moved ${direction} ${Math.abs(quote.changePercent).toFixed(2)}% intraday`,
    summary:
      quote.changePercent >= 0
        ? `${symbol} is attracting buying momentum with strong tick activity.`
        : `${symbol} is witnessing selling pressure in the latest tick updates.`,
    source: 'Lockbox Realtime Engine',
    url: 'https://example.com/live',
    type: 'price-alert',
    publishedAt: new Date().toISOString(),
    isRead: false,
  }

  newsFeed.unshift(event)
  if (newsFeed.length > 500) {
    newsFeed.length = 500
  }

  return event
}

function createLiveResultEvent() {
  const company = companies[Math.floor(Math.random() * companies.length)]
  const result = {
    id: `live-result-${Date.now()}-${sequence++}`,
    symbol: company.symbol,
    name: company.name,
    resultDate: dayjs().add(Math.floor(Math.random() * 10) + 1, 'day').format('YYYY-MM-DD'),
    period: `Q${Math.floor(Math.random() * 4) + 1}FY26`,
    resultType: 'quarterly',
    hasConcall: Math.random() > 0.4,
    concallTime: dayjs().add(Math.floor(Math.random() * 10) + 1, 'day').hour(16).minute(0).toISOString(),
    estimateRevenue: Math.round(20000 + Math.random() * 12000),
    actualRevenue: Math.round(20000 + Math.random() * 12000),
    estimatePat: Math.round(2500 + Math.random() * 1800),
    actualPat: Math.round(2500 + Math.random() * 1800),
    estimateEps: round(7 + Math.random() * 4),
    actualEps: round(7 + Math.random() * 4),
    sector: company.sector,
    marketCapCategory: company.marketCapCategory,
  }

  resultsCalendar.unshift(result)
  if (resultsCalendar.length > 300) {
    resultsCalendar.length = 300
  }

  return result
}

function tickLiveQuotes() {
  initializeQuoteState()
  tickCounter += 1

  const updates = []
  const timelineEvents = []
  const resultEvents = []

  for (const company of companies) {
    const previous = quoteState.get(company.symbol)
    if (!previous) {
      continue
    }

    const noise = (Math.random() - 0.5) * 0.9
    const drift = company.sector === 'Defence' ? 0.05 : 0
    const nextPrice = Math.max(1, previous.price * (1 + (noise + drift) / 100))
    const nextVolume = Math.round(previous.volume * (1 + Math.random() * 0.08))

    const nextQuote = {
      ...previous,
      price: round(nextPrice),
      high: round(Math.max(previous.high, nextPrice)),
      low: round(Math.min(previous.low, nextPrice)),
      volume: nextVolume,
      changePercent: previous.prevClose > 0 ? round(((nextPrice - previous.prevClose) / previous.prevClose) * 100) : 0,
      at: new Date().toISOString(),
    }

    quoteState.set(company.symbol, nextQuote)
    company.currentPrice = nextQuote.price
    company.changePercent = nextQuote.changePercent

    updates.push({
      symbol: nextQuote.symbol,
      price: nextQuote.price,
      changePercent: nextQuote.changePercent,
      volume: nextQuote.volume,
      at: nextQuote.at,
    })

    if (Math.abs(nextQuote.changePercent) >= 2.5 && Math.random() > 0.75) {
      timelineEvents.push(createLiveTimelineEvent(company.symbol, nextQuote))
    }
  }

  if (tickCounter % 12 === 0) {
    resultEvents.push(createLiveResultEvent())
  }

  return {
    updates,
    timelineEvents,
    resultEvents,
  }
}

function getTimelineFeed() {
  return [...newsFeed].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

function getResultsFeed() {
  const companyMap = new Map(companies.map((company) => [company.symbol, company]))

  return [...resultsCalendar]
    .map((row) => {
      const company = companyMap.get(row.symbol)
      return {
        ...row,
        name: row.name ?? company?.name ?? row.symbol,
        sector: row.sector ?? company?.sector ?? '',
        marketCapCategory: row.marketCapCategory ?? company?.marketCapCategory ?? '',
      }
    })
    .sort((a, b) => new Date(a.resultDate).getTime() - new Date(b.resultDate).getTime())
}

function syncNewCompany(company) {
  if (quoteState.has(company.symbol)) return

  quoteState.set(company.symbol, {
    symbol: company.symbol,
    price: company.currentPrice,
    prevClose: company.currentPrice / (1 + (company.changePercent || 0) / 100),
    open: company.currentPrice,
    high: company.currentPrice,
    low: company.currentPrice,
    volume: 1_000_000,
    changePercent: round(company.changePercent || 0),
    at: new Date().toISOString(),
  })
}

module.exports = {
  getAllLiveQuotes,
  getLiveQuote,
  getLiveMarketRows,
  getCompanyOverviewWithLiveQuote,
  getPriceHistoryWithLive,
  tickLiveQuotes,
  getTimelineFeed,
  getResultsFeed,
  syncNewCompany,
}
