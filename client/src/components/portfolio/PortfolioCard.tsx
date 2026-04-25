import type { PortfolioSummary } from '../../types/domain'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatPercent } from '../../utils/formatPercent'

interface PortfolioCardProps {
  summary: PortfolioSummary
}

function PortfolioCard({ summary }: PortfolioCardProps) {
  return (
    <section className="card-shell p-4">
      <h3 className="mb-3 text-sm font-semibold">Portfolio Summary</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Metric label="Total Invested" value={formatCurrency(summary.totalInvested)} />
        <Metric label="Current Value" value={formatCurrency(summary.currentValue)} />
        <Metric label="P&L" value={formatCurrency(summary.pnl)} tone={summary.pnl >= 0 ? 'positive' : 'negative'} />
        <Metric
          label="P&L %"
          value={formatPercent(summary.pnlPercent)}
          tone={summary.pnlPercent >= 0 ? 'positive' : 'negative'}
        />
        <Metric label="Day Gain/Loss" value={formatCurrency(summary.dayGain)} tone={summary.dayGain >= 0 ? 'positive' : 'negative'} />
      </div>
    </section>
  )
}

function Metric({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: string
  tone?: 'neutral' | 'positive' | 'negative'
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] p-3">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p
        className={`number-font mt-1 text-sm font-semibold ${
          tone === 'positive' ? 'metric-positive' : tone === 'negative' ? 'metric-negative' : ''
        }`}
      >
        {value}
      </p>
    </div>
  )
}

export default PortfolioCard
