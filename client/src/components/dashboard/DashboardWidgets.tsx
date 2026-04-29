import { useState } from 'react'
import type { IdeaRow, IndexPerformance } from '../../types/domain'
import { formatPercent } from '../../utils/formatPercent'
import { formatCurrency } from '../../utils/formatCurrency'
import Button from '../ui/Button'
import Tabs from '../ui/Tabs'
import { Link } from 'react-router-dom'

interface DashboardWidgetsProps {
  ideaRows: IdeaRow[]
  indices: IndexPerformance[]
  isLoggedIn: boolean
  portfolios?: any[]
}

const tabs = ['Promoter Buying', 'Whales Buying', 'Merger', 'Capex', 'Fundamentals', 'Trending']

const queryCards = [
  'Promoter Increasing Stake',
  'Small Cap Consistent Compounders',
  'Low Debt High ROCE',
  'Cash Flow Positive Turnarounds',
  'Profit Growth Above 20%',
  'High FII Accumulation',
]

function DashboardWidgets({ ideaRows, indices, isLoggedIn, portfolios = [] }: DashboardWidgetsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0])
  const gainers = indices.slice(0, 5)
  const losers = [...indices].sort((a, b) => a.oneYear - b.oneYear).slice(0, 5)

  const defaultPortfolio = portfolios[0]
  const summary = defaultPortfolio?.summary

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="card-shell p-4">
        <h3 className="mb-3 text-sm font-semibold">Ideas Dashboard</h3>
        <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} />
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="text-[var(--text-muted)]">
              <tr>
                <th className="pb-2">Company</th>
                <th className="pb-2">Ticker</th>
                <th className="pb-2">Metric</th>
              </tr>
            </thead>
            <tbody>
              {ideaRows.slice(0, 6).map((row) => (
                <tr key={`${activeTab}-${row.ticker}`} className="border-t border-[var(--border)]">
                  <td className="py-2 font-medium">{row.company}</td>
                  <td className="py-2 text-[var(--text-muted)]">{row.ticker}</td>
                  <td className="py-2">{row.metric}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-shell p-4">
        <h3 className="text-sm font-semibold">Timeline</h3>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Personalized updates from companies you follow, including filings, results, and concall highlights.
        </p>
        <Link to="/timeline">
          <Button className="mt-3">View Timeline</Button>
        </Link>
      </section>

      <section className="card-shell p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Portfolio Summary</h3>
          <Link to="/portfolio" className="text-[10px] font-bold text-brand-500 hover:underline">Manage</Link>
        </div>
        {isLoggedIn && summary ? (
          <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-slate-100/70 p-3 dark:bg-slate-800/70">
              <p className="text-[var(--text-muted)]">Current Value</p>
              <p className="number-font mt-1 text-base font-semibold">{formatCurrency(summary.currentValue)}</p>
            </div>
            <div className="rounded-xl bg-slate-100/70 p-3 dark:bg-slate-800/70">
              <p className="text-[var(--text-muted)]">Total P&L</p>
              <p className={`number-font mt-1 text-base font-semibold ${summary.totalPnL >= 0 ? 'metric-positive' : 'metric-negative'}`}>
                {summary.totalPnL >= 0 ? '+' : ''}{formatCurrency(summary.totalPnL)}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-3">
             <p className="text-xs text-[var(--text-muted)] mb-3">Login to track your Indian stock portfolio with real-time P&L.</p>
             <Link to="/portfolio">
               <Button variant="secondary" size="sm">Get Started</Button>
             </Link>
          </div>
        )}
      </section>

      <section className="card-shell p-4">
        <h3 className="mb-3 text-sm font-semibold">Market Monitor</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold text-[var(--text-muted)]">Top Gained Indices</p>
            <div className="space-y-2 text-xs">
              {gainers.map((item) => (
                <div key={item.indexName} className="flex items-center justify-between">
                  <span>{item.indexName}</span>
                  <span className="metric-positive">{formatPercent(item.oneYear)}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold text-[var(--text-muted)]">Top Loser Indices</p>
            <div className="space-y-2 text-xs">
              {losers.map((item) => (
                <div key={item.indexName} className="flex items-center justify-between">
                  <span>{item.indexName}</span>
                  <span className="metric-negative">{formatPercent(item.oneYear)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="card-shell p-4 xl:col-span-2">
        <h3 className="mb-3 text-sm font-semibold">Screener Popular Queries</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {queryCards.map((query) => (
            <button
              key={query}
              type="button"
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] px-3 py-2 text-left text-xs font-medium text-[var(--text)] transition hover:border-brand-400"
            >
              {query}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

export default DashboardWidgets
