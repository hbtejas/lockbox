const YahooFinance = require('yahoo-finance2').default;
const { query, isDatabaseEnabled } = require('../config/db');
const { NSE_STOCKS } = require('../data/nse-stocks');

// Initialize yahoo-finance2 with suppressed notices
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

// Caching layer
const cache = new Map();

function getCache(key) {
  const hit = cache.get(key);
  if (hit && hit.expiry > Date.now()) return hit.data;
  return null;
}

function setCache(key, data, ttlMs = 30000) {
  cache.set(key, { data, expiry: Date.now() + ttlMs });
}

// ─── INDICES ─────────────────────────────────────────────────────────────────
const INDICES = [
  { name: 'NIFTY 50',     symbol: '^NSEI',     shortName: 'NIFTY' },
  { name: 'SENSEX',       symbol: '^BSESN',    shortName: 'SENSEX' },
  { name: 'NIFTY BANK',   symbol: '^NSEBANK',  shortName: 'BANKNIFTY' },
  { name: 'NIFTY IT',     symbol: '^CNXIT',    shortName: 'NIFTYIT' },
  { name: 'NIFTY MIDCAP', symbol: '^NSMIDCP',  shortName: 'MIDCAP' },
];

// ─── FETCH LIVE INDICES ───────────────────────────────────────────────────────
async function getLiveIndices() {
  const cached = getCache('indices');
  if (cached) return cached;

  const results = await Promise.all(
    INDICES.map(async (idx) => {
      try {
        const quote = await yahooFinance.quote(idx.symbol);
        return {
          name: idx.name,
          shortName: idx.shortName,
          symbol: idx.symbol,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          open: quote.regularMarketOpen,
          high: quote.regularMarketDayHigh,
          low: quote.regularMarketDayLow,
          previousClose: quote.regularMarketPreviousClose,
          marketTime: quote.regularMarketTime,
        };
      } catch (err) {
        return null;
      }
    })
  );
  
  const validResults = results.filter(r => r !== null);
  setCache('indices', validResults, 30000);
  return validResults;
}

// ─── FETCH LIVE QUOTE FOR A SINGLE STOCK ─────────────────────────────────────
async function getLiveQuote(nsSymbol) {
  const cached = getCache(`quote_${nsSymbol}`);
  if (cached) return cached;

  const stock = NSE_STOCKS.find(s => s.symbol === nsSymbol.toUpperCase());
  const yahooSymbol = stock ? stock.yahooSymbol : `${nsSymbol.toUpperCase()}.NS`;
  const quote = await yahooFinance.quote(yahooSymbol);
  
  const result = {
    symbol:          nsSymbol.toUpperCase(),
    name:            quote.longName || quote.shortName,
    price:           quote.regularMarketPrice,
    open:            quote.regularMarketOpen,
    high:            quote.regularMarketDayHigh,
    low:             quote.regularMarketDayLow,
    previousClose:   quote.regularMarketPreviousClose,
    change:          quote.regularMarketChange,
    changePercent:   quote.regularMarketChangePercent,
    volume:          quote.regularMarketVolume,
    avgVolume:       quote.averageDailyVolume3Month,
    marketCap:       quote.marketCap,
    pe:              quote.trailingPE,
    eps:             quote.epsTrailingTwelveMonths,
    fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
    fiftyTwoWeekLow:  quote.fiftyTwoWeekLow,
    currency:        quote.currency,
    exchange:        'NSE',
    sector:          stock?.sector || null,
    industry:        stock?.industry || null,
    marketTime:      quote.regularMarketTime,
  };

  setCache(`quote_${nsSymbol}`, result, 30000);
  return result;
}

// ─── FETCH QUOTES IN BULK (for all stocks) ───────────────────────────────────
async function getBulkQuotes(symbols) {
  const cacheKey = symbols ? `bulk_${symbols.join(',')}` : 'bulk_all';
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const stockList = symbols
    ? NSE_STOCKS.filter(s => symbols.includes(s.symbol))
    : NSE_STOCKS;

  const batchSize = 20;
  const allQuotes = [];
  for (let i = 0; i < stockList.length; i += batchSize) {
    const batch = stockList.slice(i, i + batchSize);
    const yahooSymbols = batch.map(s => s.yahooSymbol);
    try {
      const results = await yahooFinance.quote(yahooSymbols);
      const quotesArr = Array.isArray(results) ? results : [results];
      quotesArr.forEach((q, j) => {
        const stock = batch[j];
        if (!q) return;
        allQuotes.push({
          symbol:         stock.symbol,
          name:           stock.name,
          sector:         stock.sector,
          industry:       stock.industry,
          exchange:       stock.exchange,
          price:          q.regularMarketPrice,
          open:           q.regularMarketOpen,
          high:           q.regularMarketDayHigh,
          low:            q.regularMarketDayLow,
          previousClose:  q.regularMarketPreviousClose,
          change:         q.regularMarketChange,
          changePercent:  q.regularMarketChangePercent,
          volume:         q.regularMarketVolume,
          marketCap:      q.marketCap,
          pe:             q.trailingPE,
          fiftyTwoWeekHigh: q.fiftyTwoWeekHigh,
          fiftyTwoWeekLow:  q.fiftyTwoWeekLow,
        });
      });
    } catch (e) {
      console.error('Bulk quote batch failed', e.message);
    }
    if (i + batchSize < stockList.length) await new Promise(r => setTimeout(r, 300));
  }
  
  setCache(cacheKey, allQuotes, 30000);
  return allQuotes;
}

// ─── TOP GAINERS ─────────────────────────────────────────────────────────────
async function getTopGainers(limit = 10) {
  const cached = getCache(`gainers_${limit}`);
  if (cached) return cached;

  const quotes = await getBulkQuotes();
  const result = quotes
    .filter(q => q.changePercent != null)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, limit);
    
  setCache(`gainers_${limit}`, result, 30000);
  return result;
}

// ─── TOP LOSERS ──────────────────────────────────────────────────────────────
async function getTopLosers(limit = 10) {
  const cached = getCache(`losers_${limit}`);
  if (cached) return cached;

  const quotes = await getBulkQuotes();
  const result = quotes
    .filter(q => q.changePercent != null)
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, limit);

  setCache(`losers_${limit}`, result, 30000);
  return result;
}

// ─── MOST ACTIVE (by volume) ─────────────────────────────────────────────────
async function getMostActive(limit = 10) {
  const cached = getCache(`active_${limit}`);
  if (cached) return cached;

  const quotes = await getBulkQuotes();
  const result = quotes
    .filter(q => q.volume != null)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, limit);

  setCache(`active_${limit}`, result, 30000);
  return result;
}

// ─── SECTOR HEATMAP ──────────────────────────────────────────────────────────
async function getSectorHeatmap() {
  const cached = getCache('heatmap');
  if (cached) return cached;

  const quotes = await getBulkQuotes();
  const sectorMap = {};
  for (const q of quotes) {
    const sector = q.sector || 'Other';
    if (!sectorMap[sector]) sectorMap[sector] = { totalChange: 0, count: 0, stocks: [] };
    sectorMap[sector].totalChange += q.changePercent || 0;
    sectorMap[sector].count++;
    sectorMap[sector].stocks.push(q);
  }
  
  const result = Object.entries(sectorMap).map(([sector, data]) => ({
    sector,
    avgChange: data.totalChange / data.count,
    stockCount: data.count,
    stocks: data.stocks.slice(0, 5),
  })).sort((a, b) => b.avgChange - a.avgChange);

  setCache('heatmap', result, 30000);
  return result;
}

// ─── HISTORICAL OHLCV DATA ───────────────────────────────────────────────────
async function getHistoricalData(nsSymbol, period = '1y') {
  const cacheKey = `history_${nsSymbol}_${period}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const stock = NSE_STOCKS.find(s => s.symbol === nsSymbol.toUpperCase());
  const yahooSymbol = stock ? stock.yahooSymbol : `${nsSymbol.toUpperCase()}.NS`;
  const periodDays = { '1mo': 30, '3mo': 90, '6mo': 180, '1y': 365, '5y': 1825 };
  const days = periodDays[period] || 365;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const data = await yahooFinance.historical(yahooSymbol, {
    period1: startDate,
    interval: period === '5y' ? '1wk' : '1d',
  });
  
  const result = data.map(d => ({
    date:   d.date,
    open:   d.open,
    high:   d.high,
    low:    d.low,
    close:  d.close,
    volume: d.volume,
  }));

  setCache(cacheKey, result, 300000); // cache history longer (5 mins)
  return result;
}

// ─── FULL STOCK OVERVIEW (for stock detail page) ─────────────────────────────
async function getStockOverview(nsSymbol) {
  const cacheKey = `overview_${nsSymbol}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const stock = NSE_STOCKS.find(s => s.symbol === nsSymbol.toUpperCase());
  const yahooSymbol = stock ? stock.yahooSymbol : `${nsSymbol.toUpperCase()}.NS`;

  const [quote, summary] = await Promise.all([
    yahooFinance.quote(yahooSymbol),
    yahooFinance.quoteSummary(yahooSymbol, {
      modules: [
        'assetProfile',
        'summaryDetail',
        'financialData',
        'defaultKeyStatistics',
        'incomeStatementHistory',
        'balanceSheetHistory',
        'cashflowStatementHistory',
        'majorHoldersBreakdown',
        'institutionOwnership',
        'earningsTrend',
        'recommendationTrend',
      ]
    }).catch(() => ({}))   // gracefully fail if module unavailable
  ]);

  const result = {
    // Live price
    symbol:             nsSymbol.toUpperCase(),
    name:               quote.longName || quote.shortName || stock?.name,
    price:              quote.regularMarketPrice,
    change:             quote.regularMarketChange,
    changePercent:      quote.regularMarketChangePercent,
    open:               quote.regularMarketOpen,
    high:               quote.regularMarketDayHigh,
    low:                quote.regularMarketDayLow,
    previousClose:      quote.regularMarketPreviousClose,
    volume:             quote.regularMarketVolume,
    avgVolume:          quote.averageDailyVolume3Month,
    marketCap:          quote.marketCap,
    fiftyTwoWeekHigh:   quote.fiftyTwoWeekHigh,
    fiftyTwoWeekLow:    quote.fiftyTwoWeekLow,
    pe:                 quote.trailingPE,
    forwardPE:          quote.forwardPE,
    eps:                quote.epsTrailingTwelveMonths,
    dividendYield:      quote.dividendYield,
    beta:               quote.beta,
    currency:           'INR',
    exchange:           'NSE',
    sector:             stock?.sector,
    industry:           stock?.industry,

    // Fundamentals
    description:        summary?.assetProfile?.longBusinessSummary,
    website:            summary?.assetProfile?.website,
    employees:          summary?.assetProfile?.fullTimeEmployees,
    headquarters:       summary?.assetProfile?.city
                          ? `${summary?.assetProfile?.city}, ${summary?.assetProfile?.country}`
                          : null,

    // Financial ratios
    debtToEquity:       summary?.financialData?.debtToEquity,
    returnOnEquity:     summary?.financialData?.returnOnEquity,
    returnOnAssets:     summary?.financialData?.returnOnAssets,
    revenueGrowth:      summary?.financialData?.revenueGrowth,
    earningsGrowth:     summary?.financialData?.earningsGrowth,
    grossMargins:       summary?.financialData?.grossMargins,
    operatingMargins:   summary?.financialData?.operatingMargins,
    profitMargins:      summary?.financialData?.profitMargins,

    // Key statistics
    bookValue:          summary?.defaultKeyStatistics?.bookValue,
    priceToBook:        summary?.defaultKeyStatistics?.priceToBook,
    enterpriseValue:    summary?.defaultKeyStatistics?.enterpriseValue,
    pegRatio:           summary?.defaultKeyStatistics?.pegRatio,
    shortRatio:         summary?.defaultKeyStatistics?.shortRatio,

    // Shareholding pattern
    shareholding: {
      promoters:      summary?.majorHoldersBreakdown?.insidersPercentHeld,
      institutions:   summary?.majorHoldersBreakdown?.institutionsPercentHeld,
      public:         1 - (summary?.majorHoldersBreakdown?.insidersPercentHeld || 0)
                        - (summary?.majorHoldersBreakdown?.institutionsPercentHeld || 0),
    },

    // Analyst recommendations
    recommendation:     summary?.financialData?.recommendationKey,
    targetMeanPrice:    summary?.financialData?.targetMeanPrice,
    targetHighPrice:    summary?.financialData?.targetHighPrice,
    targetLowPrice:     summary?.financialData?.targetLowPrice,

    // Income statement (last 4 quarters)
    incomeStatements:  summary?.incomeStatementHistory?.incomeStatementHistory?.map((q) => ({
      date:           q.endDate,
      totalRevenue:   q.totalRevenue,
      grossProfit:    q.grossProfit,
      operatingIncome: q.operatingIncome,
      netIncome:      q.netIncome,
      ebitda:         q.ebitda,
    })) || [],

    // Balance sheet
    balanceSheets: summary?.balanceSheetHistory?.balanceSheetStatements?.map((b) => ({
      date:               b.endDate,
      totalAssets:        b.totalAssets,
      totalLiabilities:   b.totalLiab,
      totalEquity:        b.totalStockholderEquity,
      cash:               b.cash,
      totalDebt:          b.longTermDebt,
    })) || [],

    // Cash flow
    cashFlows: summary?.cashflowStatementHistory?.cashflowStatements?.map((c) => ({
      date:               c.endDate,
      operatingCashflow:  c.totalCashFromOperatingActivities,
      capitalExpenditures: c.capitalExpenditures,
      freeCashflow:       c.freeCashflow,
    })) || [],
  };

  setCache(cacheKey, result, 30000);
  return result;
}

// ─── STOCK SEARCH ────────────────────────────────────────────────────────────
async function searchStocks(queryStr) {
  const localMatches = NSE_STOCKS.filter(s =>
    s.symbol.includes(queryStr.toUpperCase()) ||
    s.name.toLowerCase().includes(queryStr.toLowerCase())
  ).slice(0, 5);

  let yahooResults = [];
  try {
    const search = await yahooFinance.search(queryStr + ' NSE');
    yahooResults = (search.quotes || [])
      .filter(q => q.exchange === 'NSI' || q.symbol?.endsWith('.NS') || q.symbol?.endsWith('.BO'))
      .slice(0, 5)
      .map(q => ({
        symbol: q.symbol?.replace('.NS', '').replace('.BO', ''),
        name:   q.longname || q.shortname,
        sector: null,
        exchange: q.exchange === 'NSI' ? 'NSE' : 'BSE',
      }));
  } catch (_) {}

  const merged = [...localMatches, ...yahooResults];
  const seen = new Set();
  return merged.filter(s => {
    if (seen.has(s.symbol)) return false;
    seen.add(s.symbol);
    return true;
  }).slice(0, 10);
}

// ─── SYNC ALL STOCK PRICES TO SUPABASE DB ────────────────────────────────────
async function syncPricesToDB() {
  if (!isDatabaseEnabled()) {
    console.log('[MarketData] DB disabled, skipping sync.');
    return;
  }
  
  console.log('[MarketData] Starting price sync to Supabase...');
  const quotes = await getBulkQuotes();
  const today = new Date().toISOString().split('T')[0];

  try {
    // Upsert companies first
    for (const stock of NSE_STOCKS) {
      await query(`
        INSERT INTO public.companies (symbol, name, exchange, sector, industry)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (symbol) DO UPDATE SET
          name = EXCLUDED.name,
          sector = EXCLUDED.sector,
          industry = EXCLUDED.industry
      `, [stock.symbol, stock.name, stock.exchange, stock.sector, stock.industry]);
    }

    // Upsert today's prices
    for (const q of quotes) {
      if (!q.price) continue;
      await query(`
        INSERT INTO public.stock_prices (symbol, date, open, high, low, close, volume)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (symbol, date) DO UPDATE SET
          open   = EXCLUDED.open,
          high   = EXCLUDED.high,
          low    = EXCLUDED.low,
          close  = EXCLUDED.close,
          volume = EXCLUDED.volume
      `, [q.symbol, today, q.open, q.high, q.low, q.price, q.volume]);
    }
    console.log(`[MarketData] Synced ${quotes.length} stocks to DB.`);
  } catch (error) {
    console.error('[MarketData] Sync failed:', error.message);
  }
}

module.exports = {
  INDICES,
  getLiveIndices,
  getLiveQuote,
  getBulkQuotes,
  getTopGainers,
  getTopLosers,
  getMostActive,
  getSectorHeatmap,
  getHistoricalData,
  getStockOverview,
  searchStocks,
  syncPricesToDB,
};
