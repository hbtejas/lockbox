const { isDatabaseEnabled, query } = require('../config/db')
const { inMemoryStore } = require('../data/inMemoryStore')

async function listByUserId(userId) {
  if (isDatabaseEnabled()) {
    const result = await query(
      'SELECT id, user_id, symbol, alert_type, trigger_value, is_active, triggered_at FROM alerts WHERE user_id = $1 ORDER BY id DESC',
      [userId],
    )
    return result.rows
  }

  return inMemoryStore.alerts.filter((alert) => alert.userId === userId)
}

async function createAlert(userId, payload) {
  if (isDatabaseEnabled()) {
    const result = await query(
      'INSERT INTO alerts (user_id, symbol, alert_type, trigger_value, is_active) VALUES ($1, $2, $3, $4, true) RETURNING id, user_id, symbol, alert_type, trigger_value, is_active, triggered_at',
      [userId, payload.symbol, payload.alertType, payload.triggerValue],
    )
    return result.rows[0]
  }

  const maxId = inMemoryStore.alerts.reduce((max, item) => Math.max(max, item.id), 0)
  const alert = {
    id: maxId + 1,
    userId,
    symbol: payload.symbol,
    alertType: payload.alertType,
    triggerValue: payload.triggerValue,
    isActive: true,
    triggeredAt: null,
  }
  inMemoryStore.alerts.push(alert)
  return alert
}

async function deleteAlert(userId, alertId) {
  if (isDatabaseEnabled()) {
    const result = await query('DELETE FROM alerts WHERE id = $1 AND user_id = $2 RETURNING id', [alertId, userId])
    return result.rows.length > 0
  }

  const beforeCount = inMemoryStore.alerts.length
  inMemoryStore.alerts = inMemoryStore.alerts.filter((alert) => !(alert.id === Number(alertId) && alert.userId === userId))
  return inMemoryStore.alerts.length < beforeCount
}

async function toggleAlert(userId, alertId) {
  if (isDatabaseEnabled()) {
    const result = await query(
      'UPDATE alerts SET is_active = NOT is_active WHERE id = $1 AND user_id = $2 RETURNING id, user_id, symbol, alert_type, trigger_value, is_active, triggered_at',
      [alertId, userId],
    )
    return result.rows[0] ?? null
  }

  const alert = inMemoryStore.alerts.find((item) => item.id === Number(alertId) && item.userId === userId)
  if (!alert) {
    return null
  }
  alert.isActive = !alert.isActive
  return alert
}

module.exports = {
  listByUserId,
  createAlert,
  deleteAlert,
  toggleAlert,
}
