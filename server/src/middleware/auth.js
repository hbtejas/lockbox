const { verifyAccessToken } = require('../config/jwt')
const { errorResponse } = require('../utils/response')

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return errorResponse(res, 'Authentication required', 401)
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = verifyAccessToken(token)
    req.userId = decoded.sub
    req.user = decoded
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Access token expired', 401, 'TOKEN_EXPIRED')
    }
    return errorResponse(res, 'Invalid access token', 401, 'INVALID_TOKEN')
  }
}

module.exports = { authenticate }
