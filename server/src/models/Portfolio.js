const { v4: uuidv4 } = require('uuid')
const { isDatabaseEnabled, query } = require('../config/db')
const { inMemoryStore } = require('../data/inMemoryStore')

async function listByUserId(userId) {
  if (isDatabaseEnabled()) {
    const result = await query('SELECT id, user_id, name, is_default FROM portfolios WHERE user_id = $1 ORDER BY name ASC', [
      userId,
    ])
    const portfolios = result.rows

    const withHoldings = await Promise.all(
      portfolios.map(async (portfolio) => {
        const holdingResult = await query(
          'SELECT id, portfolio_id, symbol, quantity, avg_buy_price, buy_date FROM portfolio_holdings WHERE portfolio_id = $1',
          [portfolio.id],
        )
        return {
          id: portfolio.id,
          userId: portfolio.user_id,
          name: portfolio.name,
          isDefault: portfolio.is_default,
          holdings: holdingResult.rows.map((holding) => ({
            id: holding.id,
            portfolioId: holding.portfolio_id,
            symbol: holding.symbol,
            quantity: Number(holding.quantity),
            avgBuyPrice: Number(holding.avg_buy_price),
            buyDate: holding.buy_date,
          })),
        }
      }),
    )

    return withHoldings
  }

  return inMemoryStore.portfolios
    .filter((portfolio) => portfolio.userId === userId)
    .map((portfolio) => ({
      ...portfolio,
      holdings: inMemoryStore.portfolioHoldings.filter((holding) => holding.portfolioId === portfolio.id),
    }))
}

async function createPortfolio(userId, name, isDefault = false) {
  if (isDatabaseEnabled()) {
    const result = await query(
      'INSERT INTO portfolios (user_id, name, is_default) VALUES ($1, $2, $3) RETURNING id, user_id, name, is_default',
      [userId, name, isDefault],
    )
    return result.rows[0]
  }

  const portfolio = {
    id: uuidv4(),
    userId,
    name,
    isDefault,
  }
  inMemoryStore.portfolios.push(portfolio)
  return portfolio
}

async function updatePortfolio(id, userId, name) {
  if (isDatabaseEnabled()) {
    const result = await query('UPDATE portfolios SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING id, user_id, name, is_default', [
      name,
      id,
      userId,
    ])
    return result.rows[0] ?? null
  }

  const portfolio = inMemoryStore.portfolios.find((entry) => entry.id === id && entry.userId === userId)
  if (!portfolio) {
    return null
  }
  portfolio.name = name
  return portfolio
}

async function deletePortfolio(id, userId) {
  if (isDatabaseEnabled()) {
    await query('DELETE FROM portfolio_holdings WHERE portfolio_id = $1', [id])
    const result = await query('DELETE FROM portfolios WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId])
    return result.rows.length > 0
  }

  const beforeCount = inMemoryStore.portfolios.length
  inMemoryStore.portfolios = inMemoryStore.portfolios.filter((entry) => !(entry.id === id && entry.userId === userId))
  inMemoryStore.portfolioHoldings = inMemoryStore.portfolioHoldings.filter((entry) => entry.portfolioId !== id)
  return inMemoryStore.portfolios.length < beforeCount
}

async function addHolding(portfolioId, payload) {
  if (isDatabaseEnabled()) {
    const result = await query(
      'INSERT INTO portfolio_holdings (portfolio_id, symbol, quantity, avg_buy_price, buy_date) VALUES ($1, $2, $3, $4, $5) RETURNING id, portfolio_id, symbol, quantity, avg_buy_price, buy_date',
      [portfolioId, payload.symbol, payload.quantity, payload.avgBuyPrice, payload.buyDate],
    )
    return result.rows[0]
  }

  const maxId = inMemoryStore.portfolioHoldings.reduce((max, item) => Math.max(max, item.id), 0)
  const holding = {
    id: maxId + 1,
    portfolioId,
    symbol: payload.symbol,
    quantity: Number(payload.quantity),
    avgBuyPrice: Number(payload.avgBuyPrice),
    buyDate: payload.buyDate,
  }
  inMemoryStore.portfolioHoldings.push(holding)
  return holding
}

async function deleteHolding(portfolioId, holdingId) {
  if (isDatabaseEnabled()) {
    const result = await query('DELETE FROM portfolio_holdings WHERE id = $1 AND portfolio_id = $2 RETURNING id', [holdingId, portfolioId])
    return result.rows.length > 0
  }

  const beforeCount = inMemoryStore.portfolioHoldings.length
  inMemoryStore.portfolioHoldings = inMemoryStore.portfolioHoldings.filter(
    (entry) => !(entry.id === Number(holdingId) && entry.portfolioId === portfolioId),
  )
  return inMemoryStore.portfolioHoldings.length < beforeCount
}

module.exports = {
  listByUserId,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  addHolding,
  deleteHolding,
}
