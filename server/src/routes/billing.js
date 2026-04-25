const express = require('express')
const BillingController = require('../controllers/billingController')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

router.post('/subscriptions', authenticate, BillingController.createRazorpaySubscription)
router.post('/webhook', BillingController.webhook)

module.exports = router
