const { z } = require('zod')
const { applyWebhookEvent, createSubscription, verifyWebhookSignature } = require('../services/billingService')
const { errorResponse, successResponse } = require('../utils/response')

const subscriptionSchema = z.object({
  planId: z.string().min(3),
  customerNotify: z.boolean().optional(),
  totalCount: z.number().positive().optional(),
})

async function createRazorpaySubscription(req, res) {
  const parsed = subscriptionSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 'Invalid subscription payload', 400, 'VALIDATION_ERROR')
  }

  const subscription = await createSubscription(parsed.data)
  return successResponse(res, subscription, 201)
}

async function webhook(req, res) {
  const signature = req.headers['x-razorpay-signature']
  const rawBody = JSON.stringify(req.body)

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return errorResponse(res, 'Invalid webhook signature', 401, 'INVALID_WEBHOOK_SIGNATURE')
  }

  const result = await applyWebhookEvent(req.body)
  return successResponse(res, result)
}

module.exports = {
  createRazorpaySubscription,
  webhook,
}
