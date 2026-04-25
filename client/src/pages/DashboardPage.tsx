import { useQuery } from '@tanstack/react-query'
import DashboardWidgets from '../components/dashboard/DashboardWidgets'
import MarketEvents from '../components/dashboard/MarketEvents'
import MarketInsightWidget from '../components/ai/MarketInsightWidget'
import { LiveTickerBar } from '../components/dashboard/LiveTickerBar'
import { fetchAllIdeas } from '../api/ideasApi'
import { fetchMarketIndices, fetchResultsSummary } from '../api/stockApi'
import { useAuthStore } from '../store/authStore'

function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  const indicesQuery = useQuery({
    queryKey: ['dashboard-indices'],
    queryFn: fetchMarketIndices,
  })

  const marketEventsQuery = useQuery({
    queryKey: ['results-summary'],
    queryFn: fetchResultsSummary,
  })

  const ideasQuery = useQuery({
    queryKey: ['dashboard-ideas'],
    queryFn: fetchAllIdeas,
  })

  return (
    <div className="space-y-4">
      <LiveTickerBar />
      <section className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="card-shell p-5">
          <p className="text-xs uppercase tracking-wide text-brand-500">Indian Stock Market Research Platform</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Discover Ideas. Track Portfolios. Make Better Decisions.</h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--text-muted)]">
            Analyze fundamentals, monitor market events, and follow sector-level trends through a research-focused dashboard built for Indian retail investors.
          </p>
        </div>
        <MarketEvents
          upcomingResults={marketEventsQuery.data?.upcomingResultsToday ?? 0}
          concallsToday={marketEventsQuery.data?.concallsToday ?? 0}
        />
      </section>

      <DashboardWidgets
        ideaRows={ideasQuery.data ?? []}
        indices={indicesQuery.data ?? []}
        isLoggedIn={Boolean(user)}
      />

      <MarketInsightWidget />
    </div>
  )
}

export default DashboardPage
