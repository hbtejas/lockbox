const dayjs = require('dayjs')

const companies = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    exchange: 'NSE',
    sector: 'Energy',
    industry: 'Oil & Gas',
    marketCapCategory: 'large',
    isin: 'INE002A01018',
    logoUrl: 'https://logo.clearbit.com/ril.com',
    currentPrice: 2968.4,
    changePercent: 1.92,
    marketCap: 2005000000000,
    peRatio: 24.1,
    pbRatio: 2.2,
    dividendYield: 0.34,
    beta: 1.06,
    week52High: 3120,
    week52Low: 2221,
    description:
      'Reliance Industries is one of Indias largest conglomerates with businesses in energy, digital services, and retail.',
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    exchange: 'NSE',
    sector: 'Information Technology',
    industry: 'IT Services',
    marketCapCategory: 'large',
    isin: 'INE467B01029',
    logoUrl: 'https://logo.clearbit.com/tcs.com',
    currentPrice: 4255,
    changePercent: -0.72,
    marketCap: 1542000000000,
    peRatio: 29.3,
    pbRatio: 12.6,
    dividendYield: 1.18,
    beta: 0.84,
    week52High: 4595,
    week52Low: 3311,
    description: 'TCS provides IT services, consulting, and enterprise solutions globally.',
  },
  {
    symbol: 'HAL',
    name: 'Hindustan Aeronautics Ltd',
    exchange: 'NSE',
    sector: 'Aviation',
    industry: 'Aerospace & Defence',
    marketCapCategory: 'mid',
    isin: 'INE066F01020',
    logoUrl: 'https://logo.clearbit.com/hal-india.co.in',
    currentPrice: 4572,
    changePercent: 2.67,
    marketCap: 305000000000,
    peRatio: 34.8,
    pbRatio: 10.1,
    dividendYield: 0.6,
    beta: 1.1,
    week52High: 4898,
    week52Low: 1688,
    description: 'HAL is a leading aerospace and defence manufacturing company in India.',
  },
  {
    symbol: 'SUNPHARMA',
    name: 'Sun Pharmaceutical Industries',
    exchange: 'NSE',
    sector: 'Pharmaceuticals',
    industry: 'Drug Manufacturers',
    marketCapCategory: 'large',
    isin: 'INE044A01036',
    logoUrl: 'https://logo.clearbit.com/sunpharma.com',
    currentPrice: 1628,
    changePercent: 0.41,
    marketCap: 391000000000,
    peRatio: 35.2,
    pbRatio: 6.1,
    dividendYield: 0.8,
    beta: 0.75,
    week52High: 1708,
    week52Low: 1092,
    description: 'Sun Pharma is among the largest specialty generic pharmaceutical companies.',
  },
]

const stockPrices = Array.from({ length: 365 }).flatMap((_, index) => {
  const date = dayjs().subtract(364 - index, 'day').format('YYYY-MM-DD')
  return companies.map((company) => {
    const move = Math.sin(index / 14) * 0.04 + index / 2000
    const close = Number((company.currentPrice * (0.82 + move)).toFixed(2))
    return {
      symbol: company.symbol,
      date,
      open: Number((close * 0.995).toFixed(2)),
      high: Number((close * 1.012).toFixed(2)),
      low: Number((close * 0.985).toFixed(2)),
      close,
      volume: 700000 + index * 3000,
    }
  })
})

const financials = companies.flatMap((company) => [
  { symbol: company.symbol, periodType: 'Q', periodEnd: '2025-03-31', revenue: 267000, netProfit: 18800, ebitda: 41200, eps: 13.8, grossMargin: 0.41, netMargin: 0.13, roce: 0.182, roe: 0.111, debtToEquity: 0.45, operatingCashFlow: 38000, capex: 22000, freeCashFlow: 16000 },
  { symbol: company.symbol, periodType: 'Q', periodEnd: '2024-12-31', revenue: 261120, netProfit: 17560, ebitda: 39950, eps: 13.1, grossMargin: 0.4, netMargin: 0.125, roce: 0.176, roe: 0.109, debtToEquity: 0.46, operatingCashFlow: 36210, capex: 21480, freeCashFlow: 14730 },
  { symbol: company.symbol, periodType: 'A', periodEnd: '2025-03-31', revenue: 1034200, netProfit: 69200, ebitda: 154100, eps: 51.7, grossMargin: 0.412, netMargin: 0.128, roce: 0.174, roe: 0.108, debtToEquity: 0.44, operatingCashFlow: 142200, capex: 85800, freeCashFlow: 56400 },
  { symbol: company.symbol, periodType: 'A', periodEnd: '2024-03-31', revenue: 982300, netProfit: 65020, ebitda: 146850, eps: 48.3, grossMargin: 0.406, netMargin: 0.122, roce: 0.167, roe: 0.102, debtToEquity: 0.46, operatingCashFlow: 134900, capex: 80220, freeCashFlow: 54680 },
])

const shareholding = companies.flatMap((company) => [
  { symbol: company.symbol, quarter: '2024-06-30', promoterHolding: 50.3, fiiHolding: 24.8, diiHolding: 13.1, mutualFundHolding: 8.2, retailHolding: 11.8 },
  { symbol: company.symbol, quarter: '2024-09-30', promoterHolding: 50.2, fiiHolding: 25.1, diiHolding: 13.3, mutualFundHolding: 8.3, retailHolding: 11.4 },
  { symbol: company.symbol, quarter: '2024-12-31', promoterHolding: 50.1, fiiHolding: 25.6, diiHolding: 13.4, mutualFundHolding: 8.4, retailHolding: 10.9 },
  { symbol: company.symbol, quarter: '2025-03-31', promoterHolding: 50.1, fiiHolding: 26.2, diiHolding: 13.9, mutualFundHolding: 8.6, retailHolding: 10.2 },
])

const sectorIndices = [
  { indexName: 'TJI Aviation', sector: 'Aviation', oneDay: 0.9, oneWeek: 2.2, oneMonth: 6.1, sixMonths: 18.4, oneYear: 27.8 },
  { indexName: 'TJI EMS', sector: 'Electronics', oneDay: 0.6, oneWeek: 1.5, oneMonth: 4.2, sixMonths: 12.6, oneYear: 22.2 },
  { indexName: 'TJI Chemicals', sector: 'Chemicals', oneDay: -0.4, oneWeek: 0.8, oneMonth: 2.6, sixMonths: 8.2, oneYear: 11.1 },
  { indexName: 'TJI Defence', sector: 'Defence', oneDay: 1.4, oneWeek: 3.8, oneMonth: 9.2, sixMonths: 28.1, oneYear: 45.4 },
  { indexName: 'TJI Renewables', sector: 'Renewables', oneDay: -1.1, oneWeek: -2.9, oneMonth: -5.4, sixMonths: 4.7, oneYear: 9.8 },
]

const ideas = {
  'promoter-buying': [
    { company: 'HAL', ticker: 'HAL', metric: 'Promoter buy Rs 145 Cr', marketCap: 305000000000 },
    { company: 'Bharat Electronics', ticker: 'BEL', metric: 'Promoter stake +0.8%', marketCap: 194000000000 },
  ],
  'whale-buying': [
    { company: 'ABB India', ticker: 'ABB', metric: 'Institutional accumulation +2.6%', marketCap: 156000000000 },
    { company: 'Persistent Systems', ticker: 'PERSISTENT', metric: 'HNI block deal', marketCap: 102000000000 },
  ],
  capex: [
    { company: 'Reliance Industries', ticker: 'RELIANCE', metric: 'Capex announced Rs 5,600 Cr', marketCap: 2005000000000 },
  ],
  mergers: [
    { company: 'JSW Energy', ticker: 'JSWENERGY', metric: 'Acquisition in renewable segment', marketCap: 112000000000 },
  ],
  fundamentals: [
    { company: 'TCS', ticker: 'TCS', metric: 'ROCE > 50 and debt free', marketCap: 1542000000000 },
  ],
}

const macroIndicators = [
  { name: 'GDP Growth Rate', category: 'Growth', date: '2026-03-31', value: 7.1, unit: '%' },
  { name: 'CPI Inflation', category: 'Inflation', date: '2026-03-01', value: 4.8, unit: '%' },
  { name: 'WPI Inflation', category: 'Inflation', date: '2026-03-01', value: 2.1, unit: '%' },
  { name: 'RBI Repo Rate', category: 'Monetary', date: '2026-03-15', value: 6.5, unit: '%' },
  { name: 'Forex Reserves', category: 'External', date: '2026-03-20', value: 648.3, unit: 'USD Bn' },
  { name: 'India PMI Manufacturing', category: 'Production', date: '2026-03-01', value: 58.3, unit: 'Index' },
  { name: 'India PMI Services', category: 'Production', date: '2026-03-01', value: 57.2, unit: 'Index' },
  { name: 'IIP Growth', category: 'Production', date: '2026-02-01', value: 5.4, unit: '%' },
  { name: 'FII Net Flow', category: 'Flows', date: '2026-03-31', value: 2.1, unit: 'USD Bn' },
  { name: 'Current Account Deficit', category: 'External', date: '2025-12-31', value: 1.2, unit: '% of GDP' },
]

const rawMaterials = [
  { name: 'Brent Crude', category: 'Energy', date: '2026-04-22', price: 86.4, oneDayChange: 1.2, oneWeekChange: -0.8, oneMonthChange: 2.4 },
  { name: 'Natural Gas', category: 'Energy', date: '2026-04-22', price: 2.9, oneDayChange: -0.6, oneWeekChange: 3.2, oneMonthChange: 8.1 },
  { name: 'Steel HRC', category: 'Metals', date: '2026-04-22', price: 568, oneDayChange: 0.7, oneWeekChange: 1.1, oneMonthChange: 5.4 },
  { name: 'Copper', category: 'Metals', date: '2026-04-22', price: 9150, oneDayChange: 1.1, oneWeekChange: 4.2, oneMonthChange: 9.8 },
  { name: 'Gold', category: 'Metals', date: '2026-04-22', price: 2354, oneDayChange: -0.4, oneWeekChange: 1.7, oneMonthChange: 6.8 },
  { name: 'Cotton', category: 'Agri', date: '2026-04-22', price: 82.3, oneDayChange: 0.2, oneWeekChange: -0.9, oneMonthChange: -2.1 },
  { name: 'Wheat', category: 'Agri', date: '2026-04-22', price: 6.4, oneDayChange: -0.1, oneWeekChange: 0.5, oneMonthChange: 2.2 },
  { name: 'Urea', category: 'Chemicals', date: '2026-04-22', price: 452, oneDayChange: 0.8, oneWeekChange: 1.5, oneMonthChange: 4.4 },
]

const resultsCalendar = companies.map((company, index) => ({
  symbol: company.symbol,
  resultDate: dayjs().add(index + 1, 'day').format('YYYY-MM-DD'),
  period: `Q${(index % 4) + 1}FY26`,
  resultType: 'quarterly',
  hasConcall: index % 2 === 0,
  concallTime: dayjs().add(index + 1, 'day').hour(16).minute(0).toISOString(),
  estimateRevenue: 21000 + index * 1400,
  actualRevenue: 21400 + index * 1450,
  estimatePat: 3500 + index * 280,
  actualPat: 3560 + index * 300,
  estimateEps: 8.4 + index * 0.7,
  actualEps: 8.6 + index * 0.8,
}))

const newsFeed = Array.from({ length: 30 }).map((_, index) => ({
  id: index + 1,
  symbol: index % 2 === 0 ? 'RELIANCE' : 'TCS',
  title: index % 3 === 0 ? 'Board approves capex expansion' : 'Quarterly update released',
  summary:
    index % 3 === 0
      ? 'The company approved additional capex over the next 3 years.'
      : 'Management commentary indicates stable demand and margin resilience.',
  source: index % 2 === 0 ? 'NSE Filing' : 'Business Standard',
  url: 'https://example.com/news',
  type: ['filing', 'news', 'concall', 'results', 'tweet', 'price-alert'][index % 6],
  publishedAt: dayjs().subtract(index * 2, 'hour').toISOString(),
}))

const popularScreenerQueries = [
  'ROCE > 20 AND Market Cap > 500 AND Promoter Holding > 50',
  'Net Profit Growth > 15 AND Debt/Equity < 0.5',
  'Small Cap Consistent Compounders',
  'FII Holding Increasing for 3 Quarters',
  'Cash from Operations > Net Profit',
  'Free Cash Flow Positive and PE < 25',
]

module.exports = {
  companies,
  stockPrices,
  financials,
  shareholding,
  sectorIndices,
  ideas,
  macroIndicators,
  rawMaterials,
  resultsCalendar,
  newsFeed,
  popularScreenerQueries,
}
