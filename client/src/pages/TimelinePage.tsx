import { useEffect, useMemo, useRef, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchTimeline } from '../api/stockApi'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { formatDateTime } from '../utils/dateUtils'

const filterOptions = ['all', 'filing', 'news', 'concall', 'results', 'tweet', 'price-alert'] as const
const pageSize = 20

function TimelinePage() {
  const [activeFilter, setActiveFilter] = useState<(typeof filterOptions)[number]>('all')
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const timelineQuery = useInfiniteQuery({
    queryKey: ['timeline', activeFilter],
    queryFn: ({ pageParam }) =>
      fetchTimeline([], activeFilter === 'all' ? [] : [activeFilter], Number(pageParam), pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.page
      const totalPages = Math.ceil(lastPage.total / lastPage.limit)
      if (currentPage >= totalPages) {
        return undefined
      }
      return currentPage + 1
    },
  })

  const rows = useMemo(() => timelineQuery.data?.pages.flatMap((page) => page.data) ?? [], [timelineQuery.data])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && timelineQuery.hasNextPage && !timelineQuery.isFetchingNextPage) {
          void timelineQuery.fetchNextPage()
        }
      },
      { threshold: 0.5 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [timelineQuery])

  return (
    <div className="space-y-4">
      <section className="card-shell p-4">
        <h1 className="text-2xl font-bold">Timeline</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Personalized stream of filings, news, concalls, results, tweets, and triggered price alerts.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setActiveFilter(option)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                activeFilter === option
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        {rows.map((event) => (
          <article key={event.id} className="card-shell p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold">{event.symbol}</p>
              <Badge tone="info">{event.type}</Badge>
              {!event.isRead && <Badge tone="warning">New</Badge>}
            </div>
            <h3 className="mt-2 text-base font-semibold">{event.title}</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{event.summary}</p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
              <span>{formatDateTime(event.publishedAt)}</span>
              <span>{event.source}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="secondary" disabled>
                Mark as Read
              </Button>
              <Button size="sm" variant="ghost" disabled>
                Save for Later
              </Button>
            </div>
          </article>
        ))}

        <div ref={sentinelRef} className="h-3" />

        {timelineQuery.hasNextPage && (
          <div className="flex justify-center">
            <Button variant="secondary" onClick={() => void timelineQuery.fetchNextPage()} disabled={timelineQuery.isFetchingNextPage}>
              {timelineQuery.isFetchingNextPage ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}

        {!timelineQuery.isLoading && rows.length === 0 && (
          <p className="text-center text-xs text-[var(--text-muted)]">No timeline events found.</p>
        )}
      </section>
    </div>
  )
}

export default TimelinePage
