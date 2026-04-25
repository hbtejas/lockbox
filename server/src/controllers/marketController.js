const StockModel = require('../models/Stock')
const { successResponse } = require('../utils/response')
const { getMarketSnapshot, getRealtimeQuotes } = require('../services/stockService')

function getIndices(_req, res) {
  return successResponse(res, StockModel.sectorIndices)
}

function getGainers(_req, res) {
  const snapshot = getMarketSnapshot()
  return successResponse(res, snapshot.gainers)
}

function getLosers(_req, res) {
  const snapshot = getMarketSnapshot()
  return successResponse(res, snapshot.losers)
}

function getMostActive(_req, res) {
  const snapshot = getMarketSnapshot()
  return successResponse(res, snapshot.mostActive)
}

function getHeatmap(_req, res) {
  const snapshot = getMarketSnapshot()
  return successResponse(res, snapshot.heatmap)
}

function getLiveQuotes(_req, res) {
  return successResponse(res, getRealtimeQuotes())
}

module.exports = {
  getIndices,
  getGainers,
  getLosers,
  getMostActive,
  getHeatmap,
  getLiveQuotes,
}
