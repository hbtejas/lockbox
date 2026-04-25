import type { AlertRule } from '../../types/domain'
import { formatDateTime } from '../../utils/dateUtils'
import Badge from '../ui/Badge'
import Button from '../ui/Button'

interface AlertListProps {
  alerts: AlertRule[]
  onToggle?: (alertId: number) => void
  onDelete?: (alertId: number) => void
}

function AlertList({ alerts, onToggle, onDelete }: AlertListProps) {
  return (
    <section className="card-shell p-4">
      <h3 className="mb-3 text-sm font-semibold">Alert History</h3>
      <div className="overflow-auto">
        <table className="min-w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
              <th className="py-2">Stock</th>
              <th className="py-2">Condition</th>
              <th className="py-2">Trigger</th>
              <th className="py-2">Status</th>
              <th className="py-2">Triggered At</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr key={alert.id} className="border-b border-[var(--border)]/50">
                <td className="py-2 font-medium">{alert.symbol}</td>
                <td className="py-2">{alert.alertType}</td>
                <td className="py-2">{alert.triggerValue}</td>
                <td className="py-2">{alert.isActive ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Paused</Badge>}</td>
                <td className="py-2">{alert.triggeredAt ? formatDateTime(alert.triggeredAt) : 'Not triggered'}</td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => onToggle?.(alert.id)}>
                      {alert.isActive ? 'Pause' : 'Resume'}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => onDelete?.(alert.id)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default AlertList
