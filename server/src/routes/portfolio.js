const express = require('express')
const PortfolioController = require('../controllers/portfolioController')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

router.use(authenticate)

router.get('/', PortfolioController.listPortfolios)
router.post('/', PortfolioController.createPortfolio)
router.put('/:id', PortfolioController.updatePortfolio)
router.delete('/:id', PortfolioController.deletePortfolio)
router.post('/:id/holdings', PortfolioController.addHolding)
router.delete('/:id/holdings/:holdingId', PortfolioController.deleteHolding)
router.get('/:id/performance', PortfolioController.performance)

module.exports = router
