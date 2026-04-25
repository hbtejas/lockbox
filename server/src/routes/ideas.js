const express = require('express')
const IdeasController = require('../controllers/ideasController')

const router = express.Router()

router.get('/promoter-buying', IdeasController.promoterBuying)
router.get('/whale-buying', IdeasController.whaleBuying)
router.get('/capex', IdeasController.capex)
router.get('/mergers', IdeasController.mergers)
router.get('/fundamentals', IdeasController.fundamentals)

module.exports = router
