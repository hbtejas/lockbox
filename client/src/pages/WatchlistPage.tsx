import { useMemo, useState } from 'react'
import WatchlistCard from '../components/watchlist/WatchlistCard'
import Button from '../components/ui/Button'
import {
  useAddWatchlistStock,
  useCreateWatchlist,
  useRemoveWatchlistStock,
  useWatchlists,
} from '../hooks/useWatchlist'
import { useAuthStore } from '../store/authStore'

function WatchlistPage() {
  const user = useAuthStore((state) => state.user)
  const watchlistsQuery = useWatchlists(Boolean(user))
  const createWatchlistMutation = useCreateWatchlist()
  const addStockMutation = useAddWatchlistStock()
  const removeStockMutation = useRemoveWatchlistStock()

  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('detailed')
  const [activeListId, setActiveListId] = useState('')
  const [newListName, setNewListName] = useState('My Watchlist')
  const [newSymbol, setNewSymbol] = useState('')
  const [error, setError] = useState('')

  const lists = useMemo(() => watchlistsQuery.data ?? [], [watchlistsQuery.data])
  const effectiveActiveListId = activeListId || lists[0]?.id || ''
  const activeList = lists.find((list) => list.id === effectiveActiveListId) ?? lists[0]

  const sortedItems = useMemo(
    () => [...(activeList?.items ?? [])].sort((a, b) => b.changePercent - a.changePercent),
    [activeList?.items],
  )

  const onCreateList = async () => {
    setError('')

    try {
      await createWatchlistMutation.mutateAsync(newListName)
      setNewListName('My Watchlist')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create watchlist')
    }
  }

  const onAddSymbol = async () => {
    if (!activeList) {
      setError('Create a watchlist first')
      return
    }

    if (!newSymbol.trim()) {
      setError('Enter a stock symbol')
      return
    }

    setError('')
    try {
      await addStockMutation.mutateAsync({
        watchlistId: activeList.id,
        symbol: newSymbol.trim().toUpperCase(),
      })
      setNewSymbol('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to add stock to watchlist')
    }
  }

  const onRemoveSymbol = async (symbol: string) => {
    if (!activeList) {
      return
    }

    setError('')
    try {
      await removeStockMutation.mutateAsync({
        watchlistId: activeList.id,
        symbol,
      })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to remove stock from watchlist')
    }
  }

  return (
    <div className="space-y-4">
      <section className="card-shell p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Watchlist</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Create multiple watchlists and monitor live prices, valuation metrics, and activity.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant={viewMode === 'compact' ? 'primary' : 'secondary'} size="sm" onClick={() => setViewMode('compact')}>
              Compact
            </Button>
            <Button variant={viewMode === 'detailed' ? 'primary' : 'secondary'} size="sm" onClick={() => setViewMode('detailed')}>
              Detailed
            </Button>
          </div>
        </div>

        {error && <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-500">{error}</p>}

        <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
          <input
            value={newListName}
            onChange={(event) => setNewListName(event.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
            placeholder="Watchlist name"
          />
          <Button size="sm" onClick={onCreateList}>
            Create Watchlist
          </Button>
        </div>

        <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
          <input
            value={newSymbol}
            onChange={(event) => setNewSymbol(event.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
            placeholder="Add symbol (e.g. RELIANCE)"
          />
          <Button size="sm" onClick={onAddSymbol}>
            Add Stock
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {lists.map((list) => (
            <button
              key={list.id}
              type="button"
              onClick={() => setActiveListId(list.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                activeList?.id === list.id
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {list.name}
            </button>
          ))}
        </div>
      </section>

      <WatchlistCard title={`${activeList?.name ?? 'Watchlist'} (${viewMode})`} items={sortedItems} onRemove={onRemoveSymbol} />
    </div>
  )
}

export default WatchlistPage
