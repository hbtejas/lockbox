const { z } = require('zod')
const { inMemoryStore } = require('../data/inMemoryStore')
const { runScreenerQuery, popularScreenerQueries } = require('../services/screenerService')
const { getPagination, buildPaginatedResponse } = require('../utils/pagination')
const { errorResponse, successResponse } = require('../utils/response')

const filterSchema = z.object({
  query: z.string().min(0).default(''),
  columns: z.array(z.string()).default([]),
  page: z.number().optional(),
  limit: z.number().optional(),
})

function filterScreener(req, res) {
  const parsed = filterSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 'Invalid screener request', 400, 'VALIDATION_ERROR')
  }

  const { page, limit } = getPagination(req.body)
  const allRows = runScreenerQuery(parsed.data.query)
  const paginatedRows = allRows.slice((page - 1) * limit, page * limit)

  return res.status(200).json(buildPaginatedResponse(paginatedRows, allRows.length, page, limit))
}

function getPopularQueries(_req, res) {
  return successResponse(res, popularScreenerQueries)
}

function saveQuery(req, res) {
  const schema = z.object({ query: z.string().min(3) })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 'Invalid query payload', 400, 'VALIDATION_ERROR')
  }

  inMemoryStore.savedScreenerQueries.push({
    userId: req.user.id,
    query: parsed.data.query,
    savedAt: new Date().toISOString(),
  })

  return successResponse(res, { saved: true }, 201)
}

function getSavedQueries(req, res) {
  const saved = inMemoryStore.savedScreenerQueries
    .filter((entry) => entry.userId === req.user.id)
    .map((entry) => entry.query)

  return successResponse(res, saved)
}

module.exports = {
  filterScreener,
  getPopularQueries,
  saveQuery,
  getSavedQueries,
}
