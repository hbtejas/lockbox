const express = require('express')
const ResultsController = require('../controllers/resultsController')

const router = express.Router()

router.get('/', ResultsController.getResults)
router.get('/summary', ResultsController.getResultsSummary)

module.exports = router
