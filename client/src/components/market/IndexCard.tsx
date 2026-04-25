import type { IndexPerformance } from '../../types/domain'
import { formatPercent } from '../../utils/formatPercent'

interface IndexCardProps {
  index: IndexPerformance
}

function IndexCard({ index }: IndexCardProps) {
  return (
    <article className="card-shell p-4">
      <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">{index.sector}</p>
      <h3 className="mt-1 text-sm font-semibold">{index.indexName}</h3>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <span>1D: {formatPercent(index.oneDay)}</span>
        <span>1W: {formatPercent(index.oneWeek)}</span>
        <span>1M: {formatPercent(index.oneMonth)}</span>
        <span>6M: {formatPercent(index.sixMonths)}</span>
        <span>1Y: {formatPercent(index.oneYear)}</span>
      </div>
    </article>
  )
}

export default IndexCard
