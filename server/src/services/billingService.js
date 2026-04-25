const crypto = require('crypto')
const Razorpay = require('razorpay')
const { env } = require('../config/env')
const UserModel = require('../models/User')

const razorpay = env.razorpayKeyId && env.razorpayKeySecret
  ? new Razorpay({
      key_id: env.razorpayKeyId,
      key_secret: env.razorpayKeySecret,
    })
  : null

async function createSubscription({ planId, customerNotify = true, totalCount = 120 }) {
  if (!razorpay) {
    return {
      gateway: 'mock',
      id: `sub_mock_${Date.now()}`,
      status: 'created',
      planId,
      customerNotify,
      totalCount,
    }
  }

  return razorpay.subscriptions.create({
    plan_id: planId,
    customer_notify: customerNotify ? 1 : 0,
    total_count: totalCount,
  })
}

function verifyWebhookSignature(rawBody, signature) {
  if (!env.razorpayWebhookSecret) {
    return false
  }
  const digest = crypto
    .createHmac('sha256', env.razorpayWebhookSecret)
    .update(rawBody)
    .digest('hex')

  return digest === signature
}

async function applyWebhookEvent(event) {
  const eventType = event?.event
  const userId = event?.payload?.subscription?.entity?.notes?.userId

  if (!userId) {
    return { handled: false, reason: 'No userId in webhook notes' }
  }

  if (eventType === 'subscription.activated' || eventType === 'subscription.charged') {
    await UserModel.updatePlan(userId, 'premium')
    return { handled: true, plan: 'premium' }
  }

  if (
    eventType === 'subscription.cancelled' ||
    eventType === 'subscription.completed' ||
    eventType === 'subscription.halted'
  ) {
    await UserModel.updatePlan(userId, 'free')
    return { handled: true, plan: 'free' }
  }

  return { handled: false, reason: 'Unsupported event' }
}

module.exports = {
  createSubscription,
  verifyWebhookSignature,
  applyWebhookEvent,
}
