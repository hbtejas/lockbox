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

function searchCompanies(query) {
  const term = query.toLowerCase()
  return companies.filter(
    (company) => company.name.toLowerCase().includes(term) || company.symbol.toLowerCase().includes(term),
  )
}

function getCompanyBySymbol(symbol) {
  return companies.find((company) => company.symbol === symbol.toUpperCase()) ?? null
}

function getStockPrices(symbol, periodDays) {
  const rows = stockPrices.filter((item) => item.symbol === symbol.toUpperCase())
  if (!periodDays) {
    return rows
  }
  return rows.slice(-periodDays)
}

function getFinancials(symbol, periodType) {
  return financials.filter(
    (row) => row.symbol === symbol.toUpperCase() && (!periodType || row.periodType === periodType),
  )
}

function getShareholding(symbol) {
  return shareholding.filter((row) => row.symbol === symbol.toUpperCase())
}

function getPeers(symbol) {
  const company = getCompanyBySymbol(symbol)
  if (!company) {
    return []
  }
  return companies.filter((entry) => entry.sector === company.sector && entry.symbol !== company.symbol)
}

function getNews(symbol) {
  return newsFeed.filter((entry) => entry.symbol === symbol.toUpperCase()).slice(0, 20)
}

function getResults(symbol) {
  return resultsCalendar.filter((row) => row.symbol === symbol.toUpperCase())
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
}
