const { getCache, setCache } = require('../config/redis')

function cacheMiddleware({ ttlSeconds = 60, keyBuilder }) {
  return async (req, res, next) => {
    const cacheKey = keyBuilder(req)
    const cached = await getCache(cacheKey)

    if (cached) {
      return res.status(200).json(cached)
    }

    const originalJson = res.json.bind(res)
    res.json = (payload) => {
      void setCache(cacheKey, payload, ttlSeconds)
      return originalJson(payload)
    }

    return next()
  }
}

module.exports = {
  cacheMiddleware,
}
