import type { AlertRule } from '../types/domain'
import { http } from './http'

function normalizeAlert(row: {
  id: number
  symbol: string
  alertType?: AlertRule['alertType']
  alert_type?: AlertRule['alertType']
  triggerValue?: number
  trigger_value?: number
  isActive?: boolean
  is_active?: boolean
  triggeredAt?: string | null
  triggered_at?: string | null
}): AlertRule {
  return {
    id: Number(row.id),
    symbol: row.symbol,
    alertType: (row.alertType ?? row.alert_type ?? 'price_above') as AlertRule['alertType'],
    triggerValue: Number(row.triggerValue ?? row.trigger_value ?? 0),
    isActive: Boolean(row.isActive ?? row.is_active),
    triggeredAt: row.triggeredAt ?? row.triggered_at ?? null,
  }
}

export async function fetchAlerts(): Promise<AlertRule[]> {
  const { data } = await http.get('/alerts')
  return data.data.map(normalizeAlert)
}

export async function createAlert(payload: {
  symbol: string
  alertType: AlertRule['alertType']
  triggerValue: number
}): Promise<void> {
  await http.post('/alerts', payload)
}

export async function toggleAlert(alertId: number): Promise<void> {
  await http.patch(`/alerts/${alertId}/toggle`)
}

export async function deleteAlert(alertId: number): Promise<void> {
  await http.delete(`/alerts/${alertId}`)
}
