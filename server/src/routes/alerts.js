const express = require('express')
const AlertsController = require('../controllers/alertsController')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

router.use(authenticate)

router.get('/', AlertsController.getAlerts)
router.post('/', AlertsController.createAlert)
router.delete('/:id', AlertsController.deleteAlert)
router.patch('/:id/toggle', AlertsController.toggleAlert)

module.exports = router
