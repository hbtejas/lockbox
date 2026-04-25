const { v4: uuidv4 } = require('uuid')
const { isDatabaseEnabled, query } = require('../config/db')
const { inMemoryStore } = require('../data/inMemoryStore')

async function listByUserId(userId) {
  if (isDatabaseEnabled()) {
    const watchlistsResult = await query('SELECT id, user_id, name FROM watchlists WHERE user_id = $1 ORDER BY name ASC', [userId])

    return Promise.all(
      watchlistsResult.rows.map(async (watchlist) => {
        const itemsResult = await query('SELECT id, watchlist_id, symbol, added_at FROM watchlist_items WHERE watchlist_id = $1', [
          watchlist.id,
        ])

        return {
          id: watchlist.id,
          userId: watchlist.user_id,
          name: watchlist.name,
          items: itemsResult.rows,
        }
      }),
    )
  }

  return inMemoryStore.watchlists
    .filter((watchlist) => watchlist.userId === userId)
    .map((watchlist) => ({
      ...watchlist,
      items: inMemoryStore.watchlistItems.filter((item) => item.watchlistId === watchlist.id),
    }))
}

async function createWatchlist(userId, name) {
  if (isDatabaseEnabled()) {
    const result = await query('INSERT INTO watchlists (user_id, name) VALUES ($1, $2) RETURNING id, user_id, name', [userId, name])
    return result.rows[0]
  }

  const watchlist = {
    id: uuidv4(),
    userId,
    name,
  }
  inMemoryStore.watchlists.push(watchlist)
  return watchlist
}

async function addStock(watchlistId, symbol) {
  if (isDatabaseEnabled()) {
    const result = await query('INSERT INTO watchlist_items (watchlist_id, symbol) VALUES ($1, $2) RETURNING id, watchlist_id, symbol, added_at', [
      watchlistId,
      symbol,
    ])
    return result.rows[0]
  }

  const maxId = inMemoryStore.watchlistItems.reduce((max, item) => Math.max(max, item.id), 0)
  const item = {
    id: maxId + 1,
    watchlistId,
    symbol,
    addedAt: new Date().toISOString(),
  }
  inMemoryStore.watchlistItems.push(item)
  return item
}

async function removeStock(watchlistId, symbol) {
  if (isDatabaseEnabled()) {
    const result = await query('DELETE FROM watchlist_items WHERE watchlist_id = $1 AND symbol = $2 RETURNING id', [
      watchlistId,
      symbol,
    ])
    return result.rows.length > 0
  }

  const beforeCount = inMemoryStore.watchlistItems.length
  inMemoryStore.watchlistItems = inMemoryStore.watchlistItems.filter(
    (item) => !(item.watchlistId === watchlistId && item.symbol === symbol),
  )
  return inMemoryStore.watchlistItems.length < beforeCount
}

module.exports = {
  listByUserId,
  createWatchlist,
  addStock,
  removeStock,
}
