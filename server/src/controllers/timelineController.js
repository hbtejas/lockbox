const LiveMarketService = require('../services/liveMarketService')
const { getPagination, buildPaginatedResponse } = require('../utils/pagination')

function getTimeline(req, res) {
  const symbols = String(req.query.symbols ?? '')
    .split(',')
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean)

  const types = String(req.query.types ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

  const { page, limit } = getPagination(req.query)

  let rows = LiveMarketService.getTimelineFeed()
  if (symbols.length > 0) {
    rows = rows.filter((row) => symbols.includes(row.symbol))
  }

  if (types.length > 0) {
    rows = rows.filter((row) => types.includes(row.type))
  }

  const total = rows.length
  const data = rows.slice((page - 1) * limit, page * limit)

  return res.status(200).json(buildPaginatedResponse(data, total, page, limit))
}

module.exports = {
  getTimeline,
}
