const { errorResponse } = require('../utils/response')

function requirePremium(req, res, next) {
  if (!req.user) {
    return errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED')
  }

  if (req.user.plan !== 'premium') {
    return errorResponse(res, 'This feature is available for premium plan only.', 403, 'PREMIUM_REQUIRED')
  }

  return next()
}

module.exports = {
  requirePremium,
}
