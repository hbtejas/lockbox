import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'

interface MarketEventsProps {
  upcomingResults: number
  concallsToday: number
}

function MarketEvents({ upcomingResults, concallsToday }: MarketEventsProps) {
  return (
    <section className="card-shell p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text)]">Market Events</h3>
        <Link to="/results" className="text-xs font-semibold text-brand-500 hover:text-brand-400">
          Results Tracker
        </Link>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-muted)]">Today's Upcoming Results</span>
          <Badge tone="info">{upcomingResults}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-muted)]">Concalls Today</span>
          <Badge tone="warning">{concallsToday}</Badge>
        </div>
      </div>
    </section>
  )
}

export default MarketEvents
