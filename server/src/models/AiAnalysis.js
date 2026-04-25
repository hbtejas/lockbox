const { v4: uuidv4 } = require('uuid')
const { isDatabaseEnabled, query } = require('../config/db')
const { inMemoryStore } = require('../data/inMemoryStore')

async function createAnalysis(payload) {
  if (isDatabaseEnabled()) {
    const result = await query(
      `INSERT INTO ai_analyses (user_id, portfolio_id, symbol, type, result, tokens_used, model)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, portfolio_id, symbol, type, result, tokens_used, model, created_at`,
      [
        payload.userId,
        payload.portfolioId ?? null,
        payload.symbol ?? null,
        payload.type,
        payload.result,
        payload.tokensUsed ?? 0,
        payload.model ?? 'claude-sonnet-4-20250514',
      ],
    )

    return result.rows[0]
  }

  const analysis = {
    id: uuidv4(),
    userId: payload.userId,
    portfolioId: payload.portfolioId ?? null,
    symbol: payload.symbol ?? null,
    type: payload.type,
    result: payload.result,
    tokensUsed: payload.tokensUsed ?? 0,
    model: payload.model ?? 'claude-sonnet-4-20250514',
    createdAt: new Date().toISOString(),
  }

  inMemoryStore.aiAnalyses.unshift(analysis)
  return analysis
}

async function listByUserId(userId, limit = 20) {
  if (isDatabaseEnabled()) {
    const result = await query(
      `SELECT id, type, portfolio_id, symbol, tokens_used, model, created_at
       FROM ai_analyses
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit],
    )

    return result.rows.map((row) => ({
      id: row.id,
      type: row.type,
      portfolioId: row.portfolio_id,
      symbol: row.symbol,
      tokensUsed: Number(row.tokens_used ?? 0),
      model: row.model,
      createdAt: row.created_at,
    }))
  }

  return inMemoryStore.aiAnalyses
    .filter((item) => item.userId === userId)
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      type: item.type,
      portfolioId: item.portfolioId,
      symbol: item.symbol,
      tokensUsed: item.tokensUsed,
      model: item.model,
      createdAt: item.createdAt,
    }))
}

module.exports = {
  createAnalysis,
  listByUserId,
}
