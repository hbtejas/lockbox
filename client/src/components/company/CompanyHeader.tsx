import type { CompanyOverview } from '../../types/domain'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatPercent } from '../../utils/formatPercent'
import Badge from '../ui/Badge'
import { useLivePrice } from '../../hooks/useLivePrice'
import { useEffect, useState, useMemo } from 'react'
import Button from '../ui/Button'
import { useWatchlists, useAddWatchlistStock, useRemoveWatchlistStock } from '../../hooks/useWatchlist'
import { useAuthStore } from '../../store/authStore'

interface CompanyHeaderProps {
  overview: CompanyOverview
}

function CompanyHeader({ overview }: CompanyHeaderProps) {
  const user = useAuthStore(s => s.user)
  const liveQuote = useLivePrice(overview.symbol)
  const [isUpdating, setIsUpdating] = useState(false)

  const price = liveQuote?.price ?? overview.currentPrice
  const change = liveQuote?.changePercent ?? overview.changePercent

  useEffect(() => {
    if (liveQuote) {
      setIsUpdating(true)
      const timer = setTimeout(() => setIsUpdating(false), 800)
      return () => clearTimeout(timer)
    }
  }, [liveQuote])

  const watchlists = useWatchlists(!!user)
  const addStock = useAddWatchlistStock()
  const removeStock = useRemoveWatchlistStock()

  const watchlistSymbols = useMemo(() => {
    const symbols = new Set<string>()
    watchlists.data?.forEach(w => w.symbols?.forEach(s => symbols.add(s)))
    return symbols
  }, [watchlists.data])

  const isWatched = watchlistSymbols.has(overview.symbol)

  const onToggleWatchlist = () => {
    if (!user) return
    const watchlistId = watchlists.data?.[0]?.id
    if (!watchlistId) return

    if (isWatched) {
      removeStock.mutate({ watchlistId, symbol: overview.symbol })
    } else {
      addStock.mutate({ watchlistId, symbol: overview.symbol })
    }
  }

  return (
    <section className="card-shell p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">{overview.name}</h1>
            <Badge tone="info">{overview.symbol}</Badge>
            <Badge tone="neutral">{overview.exchange}</Badge>
            <div className="ml-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600 border border-emerald-100 uppercase tracking-wider">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              Live
            </div>
          </div>
          <p className="mt-1 text-sm text-[var(--text-muted)] font-medium">
            {overview.sector} · {overview.industry}
          </p>
          <div className="mt-4 flex flex-wrap items-baseline gap-4">
            <p className={`number-font text-3xl font-bold transition-colors duration-300 ${isUpdating ? 'text-blue-500' : 'text-slate-900'}`}>
              {formatCurrency(price)}
            </p>
            <p className={`number-font text-lg font-bold ${change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {change > 0 ? '+' : ''}{formatPercent(change)}
            </p>
            <p className="text-xs font-medium text-[var(--text-muted)] border-l border-slate-200 pl-4">
              52W Range: <span className="text-slate-600">{formatCurrency(overview.week52Low)}</span> - <span className="text-slate-600">{formatCurrency(overview.week52High)}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 lg:pt-0">
          <Button 
            variant={isWatched ? 'secondary' : 'default'}
            onClick={onToggleWatchlist} 
            className="shadow-sm min-w-[140px]"
          >
            {isWatched ? 'In Watchlist' : 'Add to Watchlist'}
          </Button>
          <Button variant="outline" className="shadow-sm border-slate-200">Analyze Portfolio</Button>
          <Button variant="ghost" className="text-slate-500 hover:text-slate-700">Set Alert</Button>
        </div>
      </div>
    </section>
  )
}

export default CompanyHeader
