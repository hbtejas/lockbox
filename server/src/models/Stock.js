const {
  companies,
  stockPrices,
  financials,
  shareholding,
  sectorIndices,
  macroIndicators,
  rawMaterials,
  resultsCalendar,
  newsFeed,
} = require('../data/sampleData')

// Internal Indexes for O(1) Lookups
const companiesBySymbol = new Map(companies.map(c => [c.symbol, c]))
const pricesBySymbol = new Map()
const financialsBySymbol = new Map()
const shareholdingBySymbol = new Map()
const newsBySymbol = new Map()
const resultsBySymbol = new Map()

// Initialize indexes
function rebuildIndexes() {
  pricesBySymbol.clear()
  financialsBySymbol.clear()
  shareholdingBySymbol.clear()
  newsBySymbol.clear()
  resultsBySymbol.clear()

  stockPrices.forEach(p => {
    if (!pricesBySymbol.has(p.symbol)) pricesBySymbol.set(p.symbol, [])
    pricesBySymbol.get(p.symbol).push(p)
  })

  financials.forEach(f => {
    if (!financialsBySymbol.has(f.symbol)) financialsBySymbol.set(f.symbol, [])
    financialsBySymbol.get(f.symbol).push(f)
  })

  shareholding.forEach(s => {
    if (!shareholdingBySymbol.has(s.symbol)) shareholdingBySymbol.set(s.symbol, [])
    shareholdingBySymbol.get(s.symbol).push(s)
  })

  newsFeed.forEach(n => {
    if (!newsBySymbol.has(n.symbol)) newsBySymbol.set(n.symbol, [])
    newsBySymbol.get(n.symbol).push(n)
  })

  resultsCalendar.forEach(r => {
    if (!resultsBySymbol.has(r.symbol)) resultsBySymbol.set(r.symbol, [])
    resultsBySymbol.get(r.symbol).push(r)
  })
}

rebuildIndexes()

function searchCompanies(query) {
  const term = query.toLowerCase()
  // Search still requires filter, but we can optimize it by searching names/symbols
  return companies.filter(
    (company) => company.name.toLowerCase().includes(term) || company.symbol.toLowerCase().includes(term),
  )
}

function getCompanyBySymbol(symbol) {
  const s = symbol.toUpperCase()
  // Check index first, then companies array (for newly added stocks)
  return companiesBySymbol.get(s) || companies.find(c => c.symbol === s) || null
}

function getStockPrices(symbol, periodDays) {
  const s = symbol.toUpperCase()
  const rows = pricesBySymbol.get(s) || []
  if (!periodDays) {
    return rows
  }
  return rows.slice(-periodDays)
}

function getFinancials(symbol, periodType) {
  const s = symbol.toUpperCase()
  const rows = financialsBySymbol.get(s) || []
  return rows.filter(
    (row) => !periodType || row.periodType === periodType,
  )
}

function getShareholding(symbol) {
  return shareholdingBySymbol.get(symbol.toUpperCase()) || []
}

function getPeers(symbol) {
  const company = getCompanyBySymbol(symbol)
  if (!company) {
    return []
  }
  return companies.filter((entry) => entry.sector === company.sector && entry.symbol !== company.symbol)
}

function getNews(symbol) {
  return (newsBySymbol.get(symbol.toUpperCase()) || []).slice(0, 20)
}

function getResults(symbol) {
  return resultsBySymbol.get(symbol.toUpperCase()) || []
}

module.exports = {
  searchCompanies,
  getCompanyBySymbol,
  getStockPrices,
  getFinancials,
  getShareholding,
  getPeers,
  getNews,
  getResults,
  sectorIndices,
  macroIndicators,
  rawMaterials,
  resultsCalendar,
  newsFeed,
  rebuildIndexes, // Export to allow services to refresh index when new stocks are added
}
