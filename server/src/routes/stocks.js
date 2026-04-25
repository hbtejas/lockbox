const express = require('express')
const StocksController = require('../controllers/stocksController')
const { cacheMiddleware } = require('../middleware/cache')

const router = express.Router()

router.get('/search', StocksController.searchStocks)
router.get('/:symbol', cacheMiddleware({ ttlSeconds: 5, keyBuilder: (req) => `stocks:overview:${req.params.symbol}` }), StocksController.getOverview)
router.get('/:symbol/price', cacheMiddleware({ ttlSeconds: 5, keyBuilder: (req) => `stocks:price:${req.params.symbol}:${req.query.period ?? '1y'}` }), StocksController.getPrice)
router.get(
  '/:symbol/financials',
  cacheMiddleware({ ttlSeconds: 3600, keyBuilder: (req) => `stocks:financials:${req.params.symbol}:${req.query.type ?? 'quarterly'}` }),
  StocksController.getFinancials,
)
router.get('/:symbol/shareholding', cacheMiddleware({ ttlSeconds: 3600, keyBuilder: (req) => `stocks:shareholding:${req.params.symbol}` }), StocksController.getShareholding)
router.get('/:symbol/peers', cacheMiddleware({ ttlSeconds: 3600, keyBuilder: (req) => `stocks:peers:${req.params.symbol}` }), StocksController.getPeers)
router.get('/:symbol/news', cacheMiddleware({ ttlSeconds: 300, keyBuilder: (req) => `stocks:news:${req.params.symbol}` }), StocksController.getNews)
router.get('/:symbol/results', cacheMiddleware({ ttlSeconds: 300, keyBuilder: (req) => `stocks:results:${req.params.symbol}` }), StocksController.getResults)

module.exports = router
