const dayjs = require('dayjs')
const { z } = require('zod')
const PortfolioModel = require('../models/Portfolio')
const LiveMarketService = require('../services/liveMarketService')
const { getPlanLimits } = require('../utils/planLimits')
const { errorResponse, successResponse } = require('../utils/response')

const createPortfolioSchema = z.object({
  name: z.string().min(2).max(100),
})

const addHoldingSchema = z.object({
  symbol: z.string().min(2).max(20),
  quantity: z.number().positive(),
  avgBuyPrice: z.number().positive(),
  buyDate: z.string().min(8),
})

function getCurrentPrice(symbol) {
  const liveQuote = LiveMarketService.getLiveQuote(symbol)
  return liveQuote?.price ?? 0
}

function buildSummary(holdings) {
  const totalInvested = holdings.reduce((total, holding) => total + Number(holding.quantity) * Number(holding.avgBuyPrice), 0)
  const currentValue = holdings.reduce(
    (total, holding) => total + Number(holding.quantity) * getCurrentPrice(holding.symbol),
    0,
  )
  const pnl = currentValue - totalInvested
  const pnlPercent = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0

  return {
    totalInvested,
    currentValue,
    pnl,
    pnlPercent,
    dayGain: pnl * 0.03,
  }
}

async function listPortfolios(req, res) {
  const portfolios = await PortfolioModel.listByUserId(req.user.id)

  const enriched = portfolios.map((portfolio) => {
    const holdings = portfolio.holdings.map((holding) => ({
      id: holding.id,
      symbol: holding.symbol,
      quantity: Number(holding.quantity),
      avgBuyPrice: Number(holding.avgBuyPrice ?? holding.avg_buy_price),
      buyDate: holding.buyDate ?? holding.buy_date,
      currentPrice: getCurrentPrice(holding.symbol),
    }))

    return {
      id: portfolio.id,
      name: portfolio.name,
      isDefault: portfolio.isDefault ?? portfolio.is_default,
      holdings,
      summary: buildSummary(holdings),
    }
  })

  return successResponse(res, enriched)
}

async function createPortfolio(req, res) {
  const parsed = createPortfolioSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 'Invalid portfolio payload', 400, 'VALIDATION_ERROR')
  }

  const existing = await PortfolioModel.listByUserId(req.user.id)
  const limits = getPlanLimits(req.user.plan)
  if (existing.length >= limits.portfolios) {
    return errorResponse(res, 'Portfolio limit reached for your plan', 403, 'PLAN_LIMIT_REACHED')
  }

  const portfolio = await PortfolioModel.createPortfolio(req.user.id, parsed.data.name, existing.length === 0)
  return successResponse(res, portfolio, 201)
}

async function updatePortfolio(req, res) {
  const parsed = createPortfolioSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 'Invalid portfolio update payload', 400, 'VALIDATION_ERROR')
  }

  const portfolio = await PortfolioModel.updatePortfolio(req.params.id, req.user.id, parsed.data.name)
  if (!portfolio) {
    return errorResponse(res, 'Portfolio not found', 404, 'PORTFOLIO_NOT_FOUND')
  }
  return successResponse(res, portfolio)
}

async function deletePortfolio(req, res) {
  const deleted = await PortfolioModel.deletePortfolio(req.params.id, req.user.id)
  if (!deleted) {
    return errorResponse(res, 'Portfolio not found', 404, 'PORTFOLIO_NOT_FOUND')
  }
  return successResponse(res, { deleted: true })
}

async function addHolding(req, res) {
  const parsed = addHoldingSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 'Invalid holding payload', 400, 'VALIDATION_ERROR')
  }

  const holding = await PortfolioModel.addHolding(req.params.id, parsed.data)
  return successResponse(res, holding, 201)
}

async function deleteHolding(req, res) {
  const deleted = await PortfolioModel.deleteHolding(req.params.id, req.params.holdingId)
  if (!deleted) {
    return errorResponse(res, 'Holding not found', 404, 'HOLDING_NOT_FOUND')
  }
  return successResponse(res, { deleted: true })
}

async function performance(req, res) {
  const data = Array.from({ length: 60 }).map((_, index) => {
    const date = dayjs().subtract(59 - index, 'day').format('YYYY-MM-DD')
    return {
      date,
      value: 500000 + index * 1400 + (index % 5) * 300,
      benchmark: 500000 + index * 1100 + (index % 6) * 180,
    }
  })

  return successResponse(res, data)
}

module.exports = {
  listPortfolios,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  addHolding,
  deleteHolding,
  performance,
}
