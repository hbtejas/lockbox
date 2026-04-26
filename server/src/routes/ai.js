const express = require('express')
const rateLimit = require('express-rate-limit')
const { authenticate } = require('../middleware/auth')
const { successResponse, errorResponse } = require('../utils/response')
const { env } = require('../config/env')
const AiAnalysisModel = require('../models/AiAnalysis')
const AiChatMessageModel = require('../models/AiChatMessage')
const {
  analyzePortfolioRisk,
  analyzeStock,
  getMarketInsight,
  portfolioChat,
  parseNaturalLanguageFilter,
} = require('../services/aiService')

const router = express.Router()

const aiRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: env.aiRateLimitPerHour,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, ip: false },
  keyGenerator: (req) => req.user?.id || 'anonymous',
  message: {
    success: false,
    code: 'AI_RATE_LIMIT',
    message: `Too many AI requests. Limit: ${env.aiRateLimitPerHour}/hour.`,
  },
})

const freeAiLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: env.aiFreeDailyLimit,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, ip: false },
  keyGenerator: (req) => `free:${req.user?.id ?? 'anonymous'}`,
  skip: (req) => req.user?.plan === 'premium',
  message: {
    success: false,
    code: 'FREE_AI_LIMIT',
    message: `Free plan allows ${env.aiFreeDailyLimit} AI analyses/day. Upgrade for unlimited access.`,
  },
})

router.get('/portfolio/:portfolioId/risk', authenticate, freeAiLimit, aiRateLimit, async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === '1' || req.query.refresh === 'true'
    const analysis = await analyzePortfolioRisk(req.user.id, req.params.portfolioId, { forceRefresh })
    const generatedAt = new Date(analysis.generatedAt).getTime()
    const cached = Date.now() - generatedAt > 60 * 1000

    return successResponse(res, analysis, 200, { cached })
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to analyze portfolio risk', 500, 'AI_PORTFOLIO_RISK_FAILED')
  }
})

router.get('/stock/:symbol', authenticate, aiRateLimit, async (req, res) => {
  try {
    const analysis = await analyzeStock(req.params.symbol, req.user.id)
    return successResponse(res, analysis)
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to analyze stock', 500, 'AI_STOCK_ANALYSIS_FAILED')
  }
})

router.get('/market/insight', authenticate, aiRateLimit, async (req, res) => {
  try {
    const insight = await getMarketInsight(req.user.id)
    return successResponse(res, insight)
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to fetch market insight', 500, 'AI_MARKET_INSIGHT_FAILED')
  }
})

router.post('/portfolio/:portfolioId/chat', authenticate, freeAiLimit, aiRateLimit, async (req, res) => {
  try {
    const { message, history = [] } = req.body
    if (!message || typeof message !== 'string') {
      return errorResponse(res, 'Message is required', 400, 'VALIDATION_ERROR')
    }

    if (message.length > 500) {
      return errorResponse(res, 'Message too long (max 500 chars)', 400, 'VALIDATION_ERROR')
    }

    await AiChatMessageModel.createMessage({
      userId: req.user.id,
      portfolioId: req.params.portfolioId,
      role: 'user',
      content: message,
    })

    const response = await portfolioChat(req.user.id, req.params.portfolioId, message, history)

    await AiChatMessageModel.createMessage({
      userId: req.user.id,
      portfolioId: req.params.portfolioId,
      role: 'assistant',
      content: response.reply,
    })

    return successResponse(res, response)
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to chat with AI', 500, 'AI_CHAT_FAILED')
  }
})

router.get('/portfolio/:portfolioId/chat/history', authenticate, async (req, res) => {
  try {
    const messages = await AiChatMessageModel.listByPortfolio(req.user.id, req.params.portfolioId, 50)
    return successResponse(res, messages)
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to fetch chat history', 500, 'AI_CHAT_HISTORY_FAILED')
  }
})

router.post('/screener/parse', authenticate, aiRateLimit, async (req, res) => {
  try {
    const { query } = req.body
    if (!query || typeof query !== 'string') {
      return errorResponse(res, 'Query is required', 400, 'VALIDATION_ERROR')
    }

    const parsed = await parseNaturalLanguageFilter(query, req.user.id)
    return successResponse(res, parsed)
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to parse screener query', 500, 'AI_SCREENER_PARSE_FAILED')
  }
})

router.get('/history', authenticate, async (req, res) => {
  try {
    const history = await AiAnalysisModel.listByUserId(req.user.id, 20)
    return successResponse(res, history)
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to fetch AI history', 500, 'AI_HISTORY_FAILED')
  }
})

module.exports = router
