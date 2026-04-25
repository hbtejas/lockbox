const express = require('express')
const ScreenerController = require('../controllers/screenerController')
const { authenticate } = require('../middleware/auth')
const { requirePremium } = require('../middleware/requirePlan')

const router = express.Router()

router.post('/filter', ScreenerController.filterScreener)
router.get('/popular-queries', ScreenerController.getPopularQueries)
router.post('/save-query', authenticate, requirePremium, ScreenerController.saveQuery)
router.get('/saved-queries', authenticate, requirePremium, ScreenerController.getSavedQueries)

module.exports = router
