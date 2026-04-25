function successResponse(res, data, statusCode = 200, meta = {}) {
  return res.status(statusCode).json({
    success: true,
    ...meta,
    data,
  })
}

function errorResponse(res, message, statusCode = 400, code = 'BAD_REQUEST') {
  return res.status(statusCode).json({
    success: false,
    code,
    message,
  })
}

module.exports = {
  successResponse,
  errorResponse,
}
