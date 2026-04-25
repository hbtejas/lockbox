const rateLimit = require('express-rate-limit')

const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please retry after some time.',
  },
})

module.exports = {
  apiRateLimiter,
}
