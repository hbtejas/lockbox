const express = require('express')
const MarketController = require('../controllers/marketController')
const { cacheMiddleware } = require('../middleware/cache')

const router = express.Router()

router.get('/indices', cacheMiddleware({ ttlSeconds: 60, keyBuilder: () => 'market:indices' }), MarketController.getIndices)
router.get('/gainers', cacheMiddleware({ ttlSeconds: 5, keyBuilder: () => 'market:gainers' }), MarketController.getGainers)
router.get('/losers', cacheMiddleware({ ttlSeconds: 5, keyBuilder: () => 'market:losers' }), MarketController.getLosers)
router.get('/most-active', cacheMiddleware({ ttlSeconds: 5, keyBuilder: () => 'market:most-active' }), MarketController.getMostActive)
router.get('/heatmap', cacheMiddleware({ ttlSeconds: 5, keyBuilder: () => 'market:heatmap' }), MarketController.getHeatmap)
router.get('/live', cacheMiddleware({ ttlSeconds: 3, keyBuilder: () => 'market:live' }), MarketController.getLiveQuotes)

module.exports = router
