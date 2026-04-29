import type { PortfolioHolding } from '../../types/domain'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatPercent } from '../../utils/formatPercent'

interface HoldingsListProps {
  holdings: PortfolioHolding[]
}

function HoldingsList({ holdings }: HoldingsListProps) {
  return (
    <section className="card-shell p-4">
      <h3 className="mb-3 text-sm font-semibold">Holdings</h3>
      <div className="overflow-auto">
        <table className="min-w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
              <th className="py-2">Stock</th>
              <th className="py-2">Qty</th>
              <th className="py-2">Avg Price</th>
              <th className="py-2">Current Price</th>
              <th className="py-2">P&L</th>
              <th className="py-2">P&L %</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding) => {
              const pnl = (holding.currentPrice - holding.avgBuyPrice) * holding.quantity
              const pnlPercent = (holding.currentPrice / holding.avgBuyPrice - 1) * 100
              return (
                <tr key={holding.id} className="border-b border-[var(--border)]/50">
                  <td className="py-2 font-medium">{holding.symbol}</td>
                  <td className="py-2">{holding.quantity}</td>
                  <td className="py-2">{formatCurrency(holding.avgBuyPrice)}</td>
                  <td className="py-2">{formatCurrency(holding.currentPrice)}</td>
                  <td className={`py-2 ${pnl >= 0 ? 'metric-positive' : 'metric-negative'}`}>{formatCurrency(pnl)}</td>
                  <td className={`py-2 ${pnlPercent >= 0 ? 'metric-positive' : 'metric-negative'}`}>
                    {formatPercent(pnlPercent)}
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

export default HoldingsList
