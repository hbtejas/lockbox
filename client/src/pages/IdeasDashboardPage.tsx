import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import IdeaDashboard from '../components/ideas/IdeaDashboard'
import Button from '../components/ui/Button'
import { fetchAllIdeas } from '../api/ideasApi'

function IdeasDashboardPage() {
  const [page, setPage] = useState(1)
  const pageSize = 6

  const ideasQuery = useQuery({
    queryKey: ['ideas-dashboard'],
    queryFn: fetchAllIdeas,
    refetchInterval: 5 * 60 * 1000,
  })

  const allIdeas = useMemo(() => ideasQuery.data ?? [], [ideasQuery.data])

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return allIdeas.slice(start, start + pageSize)
  }, [allIdeas, page])

  const totalPages = Math.max(1, Math.ceil(allIdeas.length / pageSize))

  return (
    <div className="space-y-4">
      <section className="card-shell p-4">
        <h1 className="text-2xl font-bold">Ideas Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Explore promoter activity, whale accumulation, capex announcements, and social momentum.
        </p>
      </section>

      <IdeaDashboard items={allIdeas} />

      <section className="card-shell p-4">
        <h3 className="mb-3 text-sm font-semibold">Paginated Ideas Table</h3>
        <div className="overflow-auto">
          <table className="min-w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                <th className="py-2">Company</th>
                <th className="py-2">Ticker</th>
                <th className="py-2">Metric</th>
                <th className="py-2">Market Cap</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((item) => (
                <tr key={`${item.ticker}-${item.metric}`} className="border-b border-[var(--border)]/50">
                  <td className="py-2">{item.company}</td>
                  <td className="py-2">{item.ticker}</td>
                  <td className="py-2">{item.metric}</td>
                  <td className="py-2">{item.marketCap.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-[var(--text-muted)]">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
              Previous
            </Button>
            <Button size="sm" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>
              Next
            </Button>
          </div>
        </div>
      </section>

      {!ideasQuery.isLoading && allIdeas.length === 0 && (
        <section className="card-shell p-4 text-sm text-[var(--text-muted)]">No ideas available right now.</section>
      )}
    </div>
  )
}

export default IdeasDashboardPage
