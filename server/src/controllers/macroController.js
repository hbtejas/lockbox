const StockModel = require('../models/Stock')
const { successResponse } = require('../utils/response')

function getMacro(_req, res) {
  return successResponse(res, StockModel.macroIndicators)
}

function getRawMaterials(_req, res) {
  return successResponse(res, StockModel.rawMaterials)
}

module.exports = {
  getMacro,
  getRawMaterials,
}
