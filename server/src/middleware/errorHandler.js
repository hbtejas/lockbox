const { HttpError } = require('../utils/httpError')
const { errorResponse } = require('../utils/response')

function notFoundHandler(req, res) {
  return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND')
}

function errorHandler(error, _req, res, _next) {
  if (error instanceof HttpError) {
    return errorResponse(res, error.message, error.statusCode, error.code)
  }

  console.error(error)
  return errorResponse(res, 'Internal server error', 500, 'INTERNAL_ERROR')
}

module.exports = {
  notFoundHandler,
  errorHandler,
}
