import type { WatchlistItem } from '../../types/domain'
import { formatCurrency } from '../../utils/formatCurrency'

interface SectorTableProps {
  companies: WatchlistItem[]
}

function SectorTable({ companies }: SectorTableProps) {
  return (
    <section className="card-shell p-4">
      <h3 className="mb-3 text-sm font-semibold">Sector Constituents</h3>
      <div className="overflow-auto">
        <table className="min-w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
              <th className="py-2">Company</th>
              <th className="py-2">Ticker</th>
              <th className="py-2">Market Cap</th>
              <th className="py-2">P/E</th>
              <th className="py-2">Change %</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.symbol} className="border-b border-[var(--border)]/50">
                <td className="py-2 font-medium">{company.company}</td>
                <td className="py-2">{company.symbol}</td>
                <td className="py-2">{formatCurrency(company.marketCap)}</td>
                <td className="py-2">{company.peRatio.toFixed(2)}</td>
                <td className={`py-2 ${company.changePercent >= 0 ? 'metric-positive' : 'metric-negative'}`}>
                  {company.changePercent.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default SectorTable
