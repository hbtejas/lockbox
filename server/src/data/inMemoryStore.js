const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcryptjs')

const inMemoryStore = {
  users: [],
  sessions: [],
  portfolios: [],
  portfolioHoldings: [],
  watchlists: [],
  watchlistItems: [],
  alerts: [],
  savedScreenerQueries: [],
  aiAnalyses: [],
  aiChatMessages: [],
}

function seedStore() {
  if (inMemoryStore.users.length > 0) {
    return
  }

  const userId = uuidv4()
  const portfolioId = uuidv4()
  const watchlistId = uuidv4()

  inMemoryStore.users.push({
    id: userId,
    name: 'Demo Investor',
    email: 'demo@lockbox.in',
    passwordHash: bcrypt.hashSync('password123', 12),
    plan: 'premium',
    createdAt: new Date().toISOString(),
  })

  inMemoryStore.portfolios.push({
    id: portfolioId,
    userId,
    name: 'Core Equity',
    isDefault: true,
  })

  inMemoryStore.portfolioHoldings.push(
    { id: 1, portfolioId, symbol: 'RELIANCE', quantity: 40, avgBuyPrice: 2450, buyDate: '2024-06-14' },
    { id: 2, portfolioId, symbol: 'TCS', quantity: 22, avgBuyPrice: 3890, buyDate: '2024-02-21' },
    { id: 3, portfolioId, symbol: 'HDFCBANK', quantity: 60, avgBuyPrice: 1580, buyDate: '2024-04-10' },
    { id: 4, portfolioId, symbol: 'INFY', quantity: 50, avgBuyPrice: 1620, buyDate: '2024-07-05' },
    { id: 5, portfolioId, symbol: 'ITC', quantity: 200, avgBuyPrice: 410, buyDate: '2024-01-15' },
    { id: 6, portfolioId, symbol: 'HAL', quantity: 15, avgBuyPrice: 3200, buyDate: '2024-09-20' },
  )

  inMemoryStore.watchlists.push({
    id: watchlistId,
    userId,
    name: 'Core Watchlist',
  })

  inMemoryStore.watchlistItems.push(
    { id: 1, watchlistId, symbol: 'RELIANCE', addedAt: new Date().toISOString() },
    { id: 2, watchlistId, symbol: 'TCS', addedAt: new Date().toISOString() },
    { id: 3, watchlistId, symbol: 'HDFCBANK', addedAt: new Date().toISOString() },
    { id: 4, watchlistId, symbol: 'BAJFINANCE', addedAt: new Date().toISOString() },
    { id: 5, watchlistId, symbol: 'TITAN', addedAt: new Date().toISOString() },
  )

  inMemoryStore.alerts.push(
    { id: 1, userId, symbol: 'RELIANCE', alertType: 'price_above', triggerValue: 3000, isActive: true, triggeredAt: null },
    { id: 2, userId, symbol: 'TCS', alertType: 'price_below', triggerValue: 4100, isActive: false, triggeredAt: new Date().toISOString() },
    { id: 3, userId, symbol: 'HDFCBANK', alertType: 'price_above', triggerValue: 1900, isActive: true, triggeredAt: null },
    { id: 4, userId, symbol: 'HAL', alertType: 'price_above', triggerValue: 5000, isActive: true, triggeredAt: null },
  )
}

seedStore()

module.exports = {
  inMemoryStore,
}
