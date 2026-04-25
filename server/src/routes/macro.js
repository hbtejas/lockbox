const express = require('express')
const MacroController = require('../controllers/macroController')

const router = express.Router()

router.get('/', MacroController.getMacro)

module.exports = router
