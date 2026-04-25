const { z } = require('zod')
const WatchlistModel = require('../models/Watchlist')
const StockModel = require('../models/Stock')
const LiveMarketService = require('../services/liveMarketService')
const { getPlanLimits } = require('../utils/planLimits')
const { errorResponse, successResponse } = require('../utils/response')

const createSchema = z.object({
  name: z.string().min(2).max(100),
})

const addStockSchema = z.object({
  symbol: z.string().min(2).max(20),
})

function toWatchlistTableRow(symbol) {
  const company = StockModel.getCompanyBySymbol(symbol)
  const liveQuote = LiveMarketService.getLiveQuote(symbol)
  if (!company || !liveQuote) {
    return null
  }

  return {
    symbol: company.symbol,
    company: company.name,
    sector: company.sector,
    price: liveQuote.price,
    changePercent: liveQuote.changePercent,
    volume: liveQuote.volume,
    peRatio: company.peRatio,
    marketCap: company.marketCap,
  }
}

async function getWatchlists(req, res) {
  const watchlists = await WatchlistModel.listByUserId(req.user.id)
  const enriched = watchlists.map((watchlist) => ({
    id: watchlist.id,
    name: watchlist.name,
    items: watchlist.items
      .map((item) => toWatchlistTableRow(item.symbol))
      .filter(Boolean),
  }))

  return successResponse(res, enriched)
}

async function createWatchlist(req, res) {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 'Invalid watchlist payload', 400, 'VALIDATION_ERROR')
  }

  const existing = await WatchlistModel.listByUserId(req.user.id)
  const limits = getPlanLimits(req.user.plan)
  if (existing.length >= limits.watchlists) {
    return errorResponse(res, 'Watchlist limit reached for your plan', 403, 'PLAN_LIMIT_REACHED')
  }

  const watchlist = await WatchlistModel.createWatchlist(req.user.id, parsed.data.name)
  return successResponse(res, watchlist, 201)
}

async function addStock(req, res) {
  const parsed = addStockSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 'Invalid stock payload', 400, 'VALIDATION_ERROR')
  }

  const item = await WatchlistModel.addStock(req.params.id, parsed.data.symbol.toUpperCase())
  return successResponse(res, item, 201)
}

async function removeStock(req, res) {
  const deleted = await WatchlistModel.removeStock(req.params.id, req.params.symbol.toUpperCase())
  if (!deleted) {
    return errorResponse(res, 'Stock not found in watchlist', 404, 'WATCHLIST_ITEM_NOT_FOUND')
  }

  return successResponse(res, { deleted: true })
}

module.exports = {
  getWatchlists,
  createWatchlist,
  addStock,
  removeStock,
}
