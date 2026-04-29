import type { CompanyOverview } from '../../types/domain'
import { formatCurrency } from '../../utils/formatCurrency'

interface MetricsProps {
  overview: CompanyOverview
}

function Metrics({ overview }: MetricsProps) {
  const cards = [
    { label: 'Market Cap', value: formatCurrency(overview.marketCap) },
    { label: 'P/E', value: overview.peRatio.toFixed(2) },
    { label: 'P/B', value: overview.pbRatio.toFixed(2) },
    { label: 'Dividend Yield', value: `${overview.dividendYield.toFixed(2)}%` },
    { label: 'Beta', value: overview.beta.toFixed(2) },
  ]

  return (
    <section className="card-shell p-4">
      <h3 className="mb-3 text-sm font-semibold">Key Metrics</h3>
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] p-3">
            <p className="text-xs text-[var(--text-muted)]">{card.label}</p>
            <p className="number-font mt-1 text-sm font-semibold">{card.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Metrics
