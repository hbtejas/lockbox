const { v4: uuidv4 } = require('uuid')
const { isDatabaseEnabled, query } = require('../config/db')
const { inMemoryStore } = require('../data/inMemoryStore')

async function createMessage(payload) {
  if (isDatabaseEnabled()) {
    const result = await query(
      `INSERT INTO ai_chat_messages (user_id, portfolio_id, role, content)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, portfolio_id, role, content, created_at`,
      [payload.userId, payload.portfolioId, payload.role, payload.content],
    )

    return {
      id: result.rows[0].id,
      userId: result.rows[0].user_id,
      portfolioId: result.rows[0].portfolio_id,
      role: result.rows[0].role,
      content: result.rows[0].content,
      createdAt: result.rows[0].created_at,
    }
  }

  const message = {
    id: uuidv4(),
    userId: payload.userId,
    portfolioId: payload.portfolioId,
    role: payload.role,
    content: payload.content,
    createdAt: new Date().toISOString(),
  }

  inMemoryStore.aiChatMessages.push(message)
  return message
}

async function listByPortfolio(userId, portfolioId, limit = 50) {
  if (isDatabaseEnabled()) {
    const result = await query(
      `SELECT id, user_id, portfolio_id, role, content, created_at
       FROM ai_chat_messages
       WHERE user_id = $1 AND portfolio_id = $2
       ORDER BY created_at DESC
       LIMIT $3`,
      [userId, portfolioId, limit],
    )

    return result.rows
      .map((row) => ({
        id: row.id,
        userId: row.user_id,
        portfolioId: row.portfolio_id,
        role: row.role,
        content: row.content,
        createdAt: row.created_at,
      }))
      .reverse()
  }

  return inMemoryStore.aiChatMessages
    .filter((item) => item.userId === userId && item.portfolioId === portfolioId)
    .slice(-limit)
}

module.exports = {
  createMessage,
  listByPortfolio,
}
