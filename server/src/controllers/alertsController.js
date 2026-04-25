const { z } = require('zod')
const AlertModel = require('../models/Alert')
const { getPlanLimits } = require('../utils/planLimits')
const { errorResponse, successResponse } = require('../utils/response')

const createSchema = z.object({
  symbol: z.string().min(2).max(20),
  alertType: z.enum(['price_above', 'price_below', 'volume_spike', 'week_52_high', 'week_52_low', 'rsi']),
  triggerValue: z.number().positive(),
})

async function getAlerts(req, res) {
  const alerts = await AlertModel.listByUserId(req.user.id)
  return successResponse(res, alerts)
}

async function createAlert(req, res) {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 'Invalid alert payload', 400, 'VALIDATION_ERROR')
  }

  const existing = await AlertModel.listByUserId(req.user.id)
  const limits = getPlanLimits(req.user.plan)
  if (existing.length >= limits.alerts) {
    return errorResponse(res, 'Alert limit reached for your plan', 403, 'PLAN_LIMIT_REACHED')
  }

  const alert = await AlertModel.createAlert(req.user.id, parsed.data)
  return successResponse(res, alert, 201)
}

async function deleteAlert(req, res) {
  const deleted = await AlertModel.deleteAlert(req.user.id, req.params.id)
  if (!deleted) {
    return errorResponse(res, 'Alert not found', 404, 'ALERT_NOT_FOUND')
  }
  return successResponse(res, { deleted: true })
}

async function toggleAlert(req, res) {
  const alert = await AlertModel.toggleAlert(req.user.id, req.params.id)
  if (!alert) {
    return errorResponse(res, 'Alert not found', 404, 'ALERT_NOT_FOUND')
  }
  return successResponse(res, alert)
}

module.exports = {
  getAlerts,
  createAlert,
  deleteAlert,
  toggleAlert,
}
