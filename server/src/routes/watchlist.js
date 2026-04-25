const express = require('express')
const WatchlistController = require('../controllers/watchlistController')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

router.use(authenticate)

router.get('/', WatchlistController.getWatchlists)
router.post('/', WatchlistController.createWatchlist)
router.post('/:id/stocks', WatchlistController.addStock)
router.delete('/:id/stocks/:symbol', WatchlistController.removeStock)

module.exports = router
