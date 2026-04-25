const LiveMarketService = require('../services/liveMarketService')
const { getPagination, buildPaginatedResponse } = require('../utils/pagination')
const { successResponse } = require('../utils/response')

function getResults(req, res) {
  const sector = String(req.query.sector ?? '').trim().toLowerCase()
  const marketCapCategory = String(req.query.marketCapCategory ?? '').trim().toLowerCase()
  const fromDate = String(req.query.fromDate ?? '').trim()
  const toDate = String(req.query.toDate ?? '').trim()

  const rows = LiveMarketService.getResultsFeed().filter((row) => {
    const sectorMatch = !sector || String(row.sector ?? '').toLowerCase() === sector
    const capMatch = !marketCapCategory || String(row.marketCapCategory ?? '').toLowerCase() === marketCapCategory

    const rowDate = new Date(row.resultDate).getTime()
    const fromMatch = !fromDate || rowDate >= new Date(fromDate).getTime()
    const toMatch = !toDate || rowDate <= new Date(toDate).getTime()

    return sectorMatch && capMatch && fromMatch && toMatch
  })

  const { page, limit } = getPagination(req.query)
  const data = rows.slice((page - 1) * limit, page * limit)

  return res.status(200).json(buildPaginatedResponse(data, rows.length, page, limit))
}

function getResultsSummary(_req, res) {
  const now = new Date()
  const today = now.toISOString().slice(0, 10)

  const all = LiveMarketService.getResultsFeed()
  const upcomingToday = all.filter((item) => item.resultDate === today)
  const concallsToday = upcomingToday.filter((item) => item.hasConcall)

  return successResponse(res, {
    upcomingResultsToday: upcomingToday.length,
    concallsToday: concallsToday.length,
    totalUpcoming: all.filter((item) => new Date(item.resultDate).getTime() >= now.getTime()).length,
  })
}

module.exports = {
  getResults,
  getResultsSummary,
}
