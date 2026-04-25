import type { WatchlistItem } from '../../types/domain'
import { formatPercent } from '../../utils/formatPercent'

interface HeatMapProps {
  stocks: WatchlistItem[]
}

function HeatMap({ stocks }: HeatMapProps) {
  return (
    <section className="card-shell p-4">
      <h3 className="mb-3 text-sm font-semibold">Market Heatmap</h3>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
        {stocks.map((stock) => {
          const gain = stock.changePercent >= 0
          return (
            <div
              key={stock.symbol}
              className={`rounded-xl border border-[var(--border)] px-3 py-4 text-center text-xs ${
                gain
                  ? 'bg-emerald-100/60 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200'
                  : 'bg-red-100/60 text-red-900 dark:bg-red-900/40 dark:text-red-200'
              }`}
            >
              <p className="font-semibold">{stock.symbol}</p>
              <p className="mt-1">{formatPercent(stock.changePercent)}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default HeatMap
