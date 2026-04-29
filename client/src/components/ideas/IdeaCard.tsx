import type { IdeaRow } from '../../types/domain'
import { formatCurrency } from '../../utils/formatCurrency'

interface IdeaCardProps {
  row: IdeaRow
}

function IdeaCard({ row }: IdeaCardProps) {
  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
      <p className="text-xs text-[var(--text-muted)]">{row.ticker}</p>
      <h4 className="mt-1 text-sm font-semibold">{row.company}</h4>
      <p className="mt-1 text-xs text-[var(--text-muted)]">{row.metric}</p>
      <p className="number-font mt-2 text-xs">MCap: {formatCurrency(row.marketCap)}</p>
    </article>
  )
}

export default IdeaCard
