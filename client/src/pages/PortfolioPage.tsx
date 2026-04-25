import { useEffect, useMemo, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import LineChart from '../components/charts/LineChart'
import HoldingsList from '../components/portfolio/HoldingsList'
import PnL from '../components/portfolio/PnL'
import PortfolioCard from '../components/portfolio/PortfolioCard'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Tabs from '../components/ui/Tabs'
import PortfolioRiskDashboard from '../components/ai/PortfolioRiskDashboard'
import PortfolioAIChat from '../components/ai/PortfolioAIChat'
import { useCreatePortfolio, usePortfolioPerformance, usePortfolios } from '../hooks/usePortfolio'
import { useAuthStore } from '../store/authStore'
import { usePortfolioStore } from '../store/portfolioStore'

const pieColors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

function PortfolioPage() {
  const user = useAuthStore((state) => state.user)

  const [showModal, setShowModal] = useState(false)
  const [portfolioName, setPortfolioName] = useState('My Portfolio')
  const [error, setError] = useState('')
  const [portfolioTab, setPortfolioTab] = useState('Holdings')

  const portfoliosQuery = usePortfolios(Boolean(user))
  const createPortfolioMutation = useCreatePortfolio()

  const portfolios = usePortfolioStore((state) => state.portfolios)
  const selectedPortfolioId = usePortfolioStore((state) => state.selectedPortfolioId)
  const setPortfolios = usePortfolioStore((state) => state.setPortfolios)
  const selectPortfolio = usePortfolioStore((state) => state.selectPortfolio)

  useEffect(() => {
    if (portfoliosQuery.data) {
      setPortfolios(portfoliosQuery.data)
    }
  }, [portfoliosQuery.data, setPortfolios])

  const activePortfolio = portfolios.find((portfolio) => portfolio.id === selectedPortfolioId) ?? portfolios[0] ?? null

  const { data: performanceData } = usePortfolioPerformance(activePortfolio?.id ?? null, Boolean(user && activePortfolio))

  const chartData = performanceData ?? []

  const sectorAllocation = useMemo(
    () =>
      (activePortfolio?.holdings ?? []).map((holding) => ({
        name: holding.symbol,
        value: Number((holding.currentPrice * holding.quantity).toFixed(2)),
      })),
    [activePortfolio?.holdings],
  )

  const marketCapAllocation = useMemo(
    () => {
      if (!activePortfolio) {
        return []
      }

      const values = activePortfolio.holdings.map((holding) => holding.currentPrice * holding.quantity)
      const total = values.reduce((sum, value) => sum + value, 0)

      const large = values.filter((value) => (total > 0 ? value / total >= 0.25 : false)).reduce((sum, value) => sum + value, 0)
      const mid = values
        .filter((value) => (total > 0 ? value / total >= 0.1 && value / total < 0.25 : false))
        .reduce((sum, value) => sum + value, 0)
      const small = Math.max(total - large - mid, 0)

      return [
        { name: 'Large Position', value: Number(large.toFixed(2)) },
        { name: 'Mid Position', value: Number(mid.toFixed(2)) },
        { name: 'Small Position', value: Number(small.toFixed(2)) },
      ].filter((bucket) => bucket.value > 0)
    },
    [activePortfolio],
  )

  const onCreate = async () => {
    setError('')

    try {
      await createPortfolioMutation.mutateAsync(portfolioName)
      setShowModal(false)
      setPortfolioName('My Portfolio')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create portfolio')
    }
  }

  if (!activePortfolio) {
    return (
      <div className="space-y-4">
        <section className="card-shell p-5">
          <h1 className="text-2xl font-bold">Portfolio Tracker</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Create your first portfolio to track holdings and live P&L.
          </p>

          {error && <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-500">{error}</p>}

          <div className="mt-4 max-w-sm space-y-3">
            <input
              value={portfolioName}
              onChange={(event) => setPortfolioName(event.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
              placeholder="Portfolio name"
            />
            <Button onClick={onCreate}>
              Create Portfolio
            </Button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <section className="card-shell p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Portfolio Tracker</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Track invested capital, P&L, allocations, and benchmark-relative performance.
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={activePortfolio.id}
              onChange={(event) => selectPortfolio(event.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
            >
              {portfolios.map((portfolio) => (
                <option key={portfolio.id} value={portfolio.id}>
                  {portfolio.name}
                </option>
              ))}
            </select>
            <Button onClick={() => setShowModal(true)}>Create Portfolio</Button>
          </div>
        </div>

        {error && <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-500">{error}</p>}
      </section>

      <PortfolioCard summary={activePortfolio.summary} />
      <PnL invested={activePortfolio.summary.totalInvested} currentValue={activePortfolio.summary.currentValue} />

      {chartData.length > 0 && (
        <section className="card-shell p-4">
          <h3 className="mb-3 text-sm font-semibold">Performance vs Nifty 50</h3>
          <LineChart data={chartData} xKey="date" yKey="value" color="#2563eb" />
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        <PieCard title="Holdings Allocation" data={sectorAllocation} />
        <PieCard title="Position Concentration" data={marketCapAllocation} />
      </section>

      <Tabs
        tabs={['Holdings', 'AI Risk Analysis', 'AI Chat']}
        value={portfolioTab}
        onChange={setPortfolioTab}
      />

      {portfolioTab === 'Holdings' && <HoldingsList holdings={activePortfolio.holdings} />}

      {portfolioTab === 'AI Risk Analysis' && (
        <PortfolioRiskDashboard portfolioId={activePortfolio.id} />
      )}

      {portfolioTab === 'AI Chat' && (
        <PortfolioAIChat portfolioId={activePortfolio.id} />
      )}

      <Modal open={showModal} title="Create Portfolio" onClose={() => setShowModal(false)}>
        <div className="space-y-3">
          <input
            value={portfolioName}
            onChange={(event) => setPortfolioName(event.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
            placeholder="Portfolio name"
          />
          <Button onClick={onCreate} fullWidth>
            Save Portfolio
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function PieCard({ title, data }: { title: string; data: Array<{ name: string; value: number }> }) {
  return (
    <section className="card-shell p-4">
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      <div style={{ height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={88}>
              {data.map((entry, index) => (
                <Cell key={`${title}-${entry.name}`} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {data.map((item) => (
          <div key={`${title}-${item.name}`} className="rounded-lg bg-[var(--bg-elev)] p-2">
            <p className="text-[var(--text-muted)]">{item.name}</p>
            <p className="number-font font-semibold">{item.value}%</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default PortfolioPage
