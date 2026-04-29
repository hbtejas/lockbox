import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import BarChart from '../components/charts/BarChart'
import { fetchRawMaterials } from '../api/stockApi'

function RawMaterialsPage() {
  const rawMaterialsQuery = useQuery({
    queryKey: ['raw-materials'],
    queryFn: fetchRawMaterials,
    refetchInterval: 15 * 60 * 1000,
  })

  const rows = useMemo(() => rawMaterialsQuery.data ?? [], [rawMaterialsQuery.data])
  const [group, setGroup] = useState('All')

  const groups = useMemo(() => ['All', ...new Set(rows.map((item) => item.category))], [rows])
  const filteredRows = group === 'All' ? rows : rows.filter((item) => item.category === group)

  const chartData = filteredRows.map((item) => ({
    commodity: item.name,
    price: item.price,
  }))

  return (
    <div className="space-y-4">
      <section className="card-shell p-4">
        <h1 className="text-2xl font-bold">Raw Materials</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Track key commodities across energy, metals, agri, and chemicals with trend snapshots.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {groups.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setGroup(item)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                group === item
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="card-shell p-4">
        <h3 className="mb-3 text-sm font-semibold">Commodity Price Snapshot</h3>
        <BarChart data={chartData} xKey="commodity" yKey="price" height={280} color="#0ea5e9" />
      </section>

      <section className="card-shell p-4">
        <div className="overflow-auto">
          <table className="min-w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                <th className="py-2">Commodity</th>
                <th className="py-2">Category</th>
                <th className="py-2">Price</th>
                <th className="py-2">1D Change</th>
                <th className="py-2">1W Change</th>
                <th className="py-2">1M Change</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((item) => (
                <tr key={item.name} className="border-b border-[var(--border)]/50">
                  <td className="py-2 font-medium">{item.name}</td>
                  <td className="py-2">{item.category}</td>
                  <td className="py-2">{item.price}</td>
                  <td className={`py-2 ${item.oneDayChange >= 0 ? 'metric-positive' : 'metric-negative'}`}>
                    {item.oneDayChange.toFixed(2)}%
                  </td>
                  <td className={`py-2 ${item.oneWeekChange >= 0 ? 'metric-positive' : 'metric-negative'}`}>
                    {item.oneWeekChange.toFixed(2)}%
                  </td>
                  <td className={`py-2 ${item.oneMonthChange >= 0 ? 'metric-positive' : 'metric-negative'}`}>
                    {item.oneMonthChange.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {!rawMaterialsQuery.isLoading && filteredRows.length === 0 && (
        <section className="card-shell p-4 text-sm text-[var(--text-muted)]">No raw material data available.</section>
      )}
    </div>
  )
}

export default RawMaterialsPage
