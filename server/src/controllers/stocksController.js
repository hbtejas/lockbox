const { z } = require('zod')
const StockModel = require('../models/Stock')
const { successResponse, errorResponse } = require('../utils/response')
const { getCompanyOverview, getPricePeriodDays, getHistoricalPrices } = require('../services/stockService')

const querySchema = z.object({
  q: z.string().min(1),
})

async function searchStocks(req, res) {
  const parsed = querySchema.safeParse(req.query)
  if (!parsed.success) {
    return errorResponse(res, 'Search query is required', 400, 'VALIDATION_ERROR')
  }

  const data = StockModel.searchCompanies(parsed.data.q)
  return successResponse(res, data)
}

async function getOverview(req, res) {
  const symbol = req.params.symbol
  const overview = await getCompanyOverview(symbol)

  if (!overview) {
    return errorResponse(res, 'Stock not found', 404, 'STOCK_NOT_FOUND')
  }

  return successResponse(res, overview)
}

function getPrice(req, res) {
  const symbol = req.params.symbol
  const period = req.query.period ?? '1y'
  const periodDays = getPricePeriodDays(period)
  const rows = getHistoricalPrices(symbol, periodDays)
  return successResponse(res, rows)
}

function getFinancials(req, res) {
  const symbol = req.params.symbol
  const type = req.query.type === 'annual' ? 'A' : 'Q'
  const rows = StockModel.getFinancials(symbol, type)
  return successResponse(res, rows)
}

function getShareholding(req, res) {
  const rows = StockModel.getShareholding(req.params.symbol)
  return successResponse(res, rows)
}

function getPeers(req, res) {
  const rows = StockModel.getPeers(req.params.symbol)
  return successResponse(res, rows)
}

function getNews(req, res) {
  const rows = StockModel.getNews(req.params.symbol)
  return successResponse(res, rows)
}

function getResults(req, res) {
  const rows = StockModel.getResults(req.params.symbol)
  return successResponse(res, rows)
}

module.exports = {
  searchStocks,
  getOverview,
  getPrice,
  getFinancials,
  getShareholding,
  getPeers,
  getNews,
  getResults,
}
