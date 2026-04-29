import { useState } from 'react'
import type { FinancialRow } from '../../types/domain'
import Tabs from '../ui/Tabs'

interface FinancialsProps {
  quarterly: FinancialRow[]
  annual: FinancialRow[]
}

function Financials({ quarterly, annual }: FinancialsProps) {
  const [tab, setTab] = useState('Quarterly')
  const rows = tab === 'Quarterly' ? quarterly : annual

  return (
    <section className="card-shell p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Financial Statements</h3>
        <Tabs tabs={['Quarterly', 'Annual']} value={tab} onChange={setTab} />
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
              <th className="py-2">Period</th>
              <th className="py-2">Revenue</th>
              <th className="py-2">Net Profit</th>
              <th className="py-2">EBITDA</th>
              <th className="py-2">EPS</th>
              <th className="py-2">ROCE</th>
              <th className="py-2">ROE</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${tab}-${row.period}`} className="border-b border-[var(--border)]/50">
                <td className="py-2 font-medium">{row.period}</td>
                <td className="py-2 number-font">{row.revenue.toLocaleString('en-IN')}</td>
                <td className="py-2 number-font">{row.netProfit.toLocaleString('en-IN')}</td>
                <td className="py-2 number-font">{row.ebitda.toLocaleString('en-IN')}</td>
                <td className="py-2 number-font">{row.eps.toFixed(2)}</td>
                <td className="py-2 number-font">{row.roce.toFixed(1)}%</td>
                <td className="py-2 number-font">{row.roe.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default Financials
