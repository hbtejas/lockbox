import type { WatchlistItem } from '../../types/domain'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatPercent } from '../../utils/formatPercent'
import StockRow from './StockRow'

interface WatchlistCardProps {
  title: string
  items: WatchlistItem[]
  onRemove?: (symbol: string) => void
}

function WatchlistCard({ title, items, onRemove }: WatchlistCardProps) {
  return (
    <section className="card-shell p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="overflow-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)]">
              <th className="py-2">Stock</th>
              <th className="py-2">Ticker</th>
              <th className="py-2">Price</th>
              <th className="py-2">Change%</th>
              <th className="py-2">Volume</th>
              <th className="py-2">P/E</th>
              <th className="py-2">Market Cap</th>
              {onRemove && <th className="py-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              if (!onRemove) {
                return <StockRow key={item.symbol} item={item} />
              }

              return (
                <tr key={item.symbol} className="border-b border-[var(--border)]/60 text-xs">
                  <td className="py-2 font-medium">{item.company}</td>
                  <td className="py-2">{item.symbol}</td>
                  <td className="py-2 number-font">{formatCurrency(item.price)}</td>
                  <td className={`py-2 ${item.changePercent >= 0 ? 'metric-positive' : 'metric-negative'}`}>
                    {formatPercent(item.changePercent)}
                  </td>
                  <td className="py-2 number-font">{item.volume.toLocaleString('en-IN')}</td>
                  <td className="py-2">{item.peRatio.toFixed(2)}</td>
                  <td className="py-2">{formatCurrency(item.marketCap)}</td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => onRemove(item.symbol)}
                      className="rounded-lg border border-red-400/50 px-2 py-1 text-[10px] font-semibold text-red-500"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default WatchlistCard
