const { ideas } = require('../data/sampleData')
const { successResponse } = require('../utils/response')

function promoterBuying(_req, res) {
  return successResponse(res, ideas['promoter-buying'])
}

function whaleBuying(_req, res) {
  return successResponse(res, ideas['whale-buying'])
}

function capex(_req, res) {
  return successResponse(res, ideas.capex)
}

function mergers(_req, res) {
  return successResponse(res, ideas.mergers)
}

function fundamentals(_req, res) {
  return successResponse(res, ideas.fundamentals)
}

module.exports = {
  promoterBuying,
  whaleBuying,
  capex,
  mergers,
  fundamentals,
}
