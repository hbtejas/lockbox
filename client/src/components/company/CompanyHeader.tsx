import type { CompanyOverview } from '../../types/domain'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatPercent } from '../../utils/formatPercent'
import Badge from '../ui/Badge'
import Button from '../ui/Button'

interface CompanyHeaderProps {
  overview: CompanyOverview
}

function CompanyHeader({ overview }: CompanyHeaderProps) {
  return (
    <section className="card-shell p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{overview.name}</h1>
            <Badge tone="info">{overview.symbol}</Badge>
            <Badge tone="neutral">{overview.exchange}</Badge>
          </div>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {overview.sector} / {overview.industry}
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <p className="number-font text-xl font-semibold">{formatCurrency(overview.currentPrice)}</p>
            <p className={overview.changePercent >= 0 ? 'metric-positive' : 'metric-negative'}>
              {formatPercent(overview.changePercent)}
            </p>
            <p className="text-[var(--text-muted)]">
              52W {formatCurrency(overview.week52Low)} - {formatCurrency(overview.week52High)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button>Add to Watchlist</Button>
          <Button variant="secondary">Add to Portfolio</Button>
          <Button variant="ghost">Set Alert</Button>
        </div>
      </div>
    </section>
  )
}

export default CompanyHeader
