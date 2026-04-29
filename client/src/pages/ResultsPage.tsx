import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchResults, fetchResultsSummary } from '../api/stockApi'

function ResultsPage() {
  const [sectorFilter, setSectorFilter] = useState('All')
  const [marketCapFilter, setMarketCapFilter] = useState('All')

  const resultsQuery = useQuery({
    queryKey: ['results', sectorFilter, marketCapFilter],
    queryFn: () =>
      fetchResults({
        page: 1,
        limit: 200,
        sector: sectorFilter === 'All' ? undefined : sectorFilter,
        marketCapCategory: marketCapFilter === 'All' ? undefined : marketCapFilter,
      }),
  })

  const summaryQuery = useQuery({
    queryKey: ['results-summary'],
    queryFn: fetchResultsSummary,
  })

  const rows = useMemo(() => resultsQuery.data?.data ?? [], [resultsQuery.data])
  const sectors = useMemo(() => ['All', ...new Set(rows.map((row) => row.sector).filter(Boolean))], [rows])

  return (
    <div className="space-y-4">
      <section className="card-shell p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Results Tracker</h1>
            <p className="mt-1 text-sm text-slate-500">
              Track earnings, concall schedules, and surprises.
            </p>
          </div>
          {summaryQuery.data && (
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-slate-400">Today</p>
                <p className="text-lg font-bold text-blue-600">{summaryQuery.data.upcomingResultsToday}</p>
              </div>
              <div className="w-px h-8 bg-slate-200 mt-2"></div>
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-slate-400">Concalls</p>
                <p className="text-lg font-bold text-yellow-600">{summaryQuery.data.concallsToday}</p>
              </div>
              <div className="w-px h-8 bg-slate-200 mt-2"></div>
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-slate-400">Total</p>
                <p className="text-lg font-bold text-emerald-600">{summaryQuery.data.totalUpcoming}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-4 border-t border-dashed border-slate-200 pt-6">
           <div className="flex flex-col gap-1">
             <label className="text-[10px] font-bold uppercase text-slate-400">Sector</label>
             <select
                value={sectorFilter}
                onChange={(event) => setSectorFilter(event.target.value)}
                className="rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold outline-none focus:border-yellow-400"
              >
                {sectors.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
           </div>

           <div className="flex flex-col gap-1">
             <label className="text-[10px] font-bold uppercase text-slate-400">Market Cap</label>
             <select
                value={marketCapFilter}
                onChange={(event) => setMarketCapFilter(event.target.value)}
                className="rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold outline-none focus:border-yellow-400"
              >
                <option value="All">All Market Caps</option>
                <option value="large">Large Cap</option>
                <option value="mid">Mid Cap</option>
                <option value="small">Small Cap</option>
              </select>
           </div>
        </div>
      </section>

      <section className="card-shell overflow-hidden">
        <div className="overflow-x-auto">
          <table className="whitespace-nowrap">
            <thead>
              <tr className="h-10">
                <th className="pl-6">COMPANY</th>
                <th>DATE</th>
                <th>PERIOD</th>
                <th>CONCALL</th>
                <th className="text-center">REVENUE (A/E)</th>
                <th className="text-center">PAT (A/E)</th>
                <th className="text-center pr-6">EPS (A/E)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="h-12">
                  <td className="pl-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#1e1e1e] hover:text-blue-600 cursor-pointer">{row.name}</span>
                      <span className="text-[10px] text-slate-400">{row.symbol}</span>
                    </div>
                  </td>
                  <td className="font-semibold text-slate-600">{row.resultDate}</td>
                  <td className="font-bold text-slate-500 uppercase">{row.period}</td>
                  <td className="text-center">
                    {row.hasConcall ? (
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[10px] font-bold">YES</span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="text-center number-font">
                    <span className="text-emerald-600 font-bold">₹{row.actualRevenue}</span>
                    <span className="text-slate-300 mx-1">/</span>
                    <span className="text-slate-500">₹{row.estimateRevenue}</span>
                  </td>
                  <td className="text-center number-font">
                    <span className="text-emerald-600 font-bold">₹{row.actualPat}</span>
                    <span className="text-slate-300 mx-1">/</span>
                    <span className="text-slate-500">₹{row.estimatePat}</span>
                  </td>
                  <td className="text-center number-font pr-6">
                    <span className="text-emerald-600 font-bold">{row.actualEps.toFixed(2)}</span>
                    <span className="text-slate-300 mx-1">/</span>
                    <span className="text-slate-500">{row.estimateEps.toFixed(2)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!resultsQuery.isLoading && rows.length === 0 && (
          <div className="p-10 text-center text-xs text-slate-400 font-medium">No results found for selected filters.</div>
        )}
      </section>
    </div>
  )
}

export default ResultsPage
