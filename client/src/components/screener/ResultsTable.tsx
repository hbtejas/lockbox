import React, { memo, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { List } from 'react-window'
import { ArrowUp, ArrowDown, Star } from 'lucide-react'
import { useWatchlists, useAddWatchlistStock, useRemoveWatchlistStock } from '../../hooks/useWatchlist'
import { useAuthStore } from '../../store/authStore'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatPercent } from '../../utils/formatPercent'
import Button from '../ui/Button'

interface ResultsTableProps {
  rows: any[]
  columns: string[]
  onExport: () => void
  onColumnsChange: (columns: string[]) => void
}

const allColumns = ['score', 'company', 'sector', 'marketCap', 'peRatio', 'roce', 'revenueGrowth', 'insights']

const getScoreColor = (score: number) => {
  if (score >= 8) return 'bg-emerald-500 text-white'
  if (score >= 6) return 'bg-amber-500 text-white'
  return 'bg-slate-500 text-white'
}

const TableRow = memo(({ index, style, rows, columns, navigate, onToggleWatchlist, watchlistSymbols }: any) => {
  const row = rows[index]
  if (!row) return null
  
  const isWatched = watchlistSymbols.has(row.ticker)

  return (
    <div
      style={style}
      className="flex items-center border-b border-slate-50 hover:bg-slate-50/80 transition-colors cursor-pointer text-[13px]"
    >
      <div className="px-2" onClick={(e) => { e.stopPropagation(); onToggleWatchlist(row.ticker) }}>
        <Star 
          size={14} 
          className={isWatched ? 'fill-amber-400 text-amber-400' : 'text-slate-300 hover:text-slate-400'} 
        />
      </div>
      <div className="flex flex-1 items-center" onClick={() => navigate(`/company/${row.ticker}`)}>
        {columns.map((column: string) => (
          <div key={`${row.ticker}-${column}`} className="flex-1 px-4 py-2 overflow-hidden text-ellipsis whitespace-nowrap">
            {column === 'score' && (
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-bold text-[11px] ${getScoreColor(row.score)}`}>
                {row.score}
              </span>
            )}
            {column === 'company' && (
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 truncate">{row.company}</span>
                <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{row.ticker}</span>
              </div>
            )}
            {column === 'sector' && <span className="text-slate-500">{row.sector}</span>}
            {column === 'marketCap' && <span className="font-medium text-slate-700">{formatCurrency(row.marketCap)}</span>}
            {column === 'peRatio' && <span className="number-font">{(row.peRatio || 0).toFixed(1)}</span>}
            {column === 'roce' && (
              <span className={`font-bold flex items-center gap-1 ${(row.roce || 0) > 20 ? 'text-emerald-600' : (row.roce || 0) < 10 ? 'text-rose-500' : 'text-slate-700'}`}>
                {(row.roce || 0) > 20 && <ArrowUp size={10} />}
                {formatPercent(row.roce, false)}
              </span>
            )}
            {column === 'revenueGrowth' && (
              <span className={`font-bold flex items-center gap-1 ${(row.revenueGrowth || 0) > 15 ? 'text-emerald-600' : (row.revenueGrowth || 0) < 0 ? 'text-rose-500' : 'text-slate-700'}`}>
                {(row.revenueGrowth || 0) > 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                {formatPercent(row.revenueGrowth, true)}
              </span>
            )}
            {column === 'insights' && (
              <div className="flex gap-1 overflow-x-hidden">
                {(row.insights || []).slice(0, 1).map((insight: string) => (
                  <span key={insight} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold whitespace-nowrap">
                    {insight}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
})

function ResultsTable({ rows, columns: activeColumns, onExport, onColumnsChange }: ResultsTableProps) {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const [sortKey, setSortKey] = useState<string | null>('score')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const watchlists = useWatchlists(!!user)
  const addStock = useAddWatchlistStock()
  const removeStock = useRemoveWatchlistStock()

  const watchlistSymbols = useMemo(() => {
    const symbols = new Set<string>()
    watchlists.data?.forEach(w => w.symbols?.forEach(s => symbols.add(s)))
    return symbols
  }, [watchlists.data])

  const onToggleWatchlist = (symbol: string) => {
    if (!user) return
    const watchlistId = watchlists.data?.[0]?.id
    if (!watchlistId) return

    if (watchlistSymbols.has(symbol)) {
      removeStock.mutate({ watchlistId, symbol })
    } else {
      addStock.mutate({ watchlistId, symbol })
    }
  }

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows
    return [...rows].sort((a, b) => {
      const valA = (a as any)[sortKey]
      const valB = (b as any)[sortKey]
      if (typeof valA === 'string') {
        return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
      }
      return sortDir === 'asc' ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0)
    })
  }, [rows, sortKey, sortDir])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const toggleColumn = (column: string) => {
    if (activeColumns.includes(column)) {
      onColumnsChange(activeColumns.filter((entry) => entry !== column))
      return
    }
    onColumnsChange([...activeColumns, column])
  }

  return (
    <section className="card-shell overflow-hidden shadow-sm border-slate-200/60">
      <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-800">Screener Insights</h3>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
            {rows.length} Matches
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {allColumns.slice(0, 5).map((column) => (
              <button
                key={column}
                type="button"
                onClick={() => toggleColumn(column)}
                className={`rounded-md px-2 py-1 text-[10px] font-bold transition-all ${
                  activeColumns.includes(column)
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {column}
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={onExport} className="h-8 text-[11px] font-bold">
            Export CSV
          </Button>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <div className="flex bg-slate-50/80 backdrop-blur-md py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 sticky top-0 z-20 min-w-[800px]">
          <div className="w-10 px-2" />
          {activeColumns.map((column) => (
            <div 
              key={column} 
              className="flex-1 px-4 cursor-pointer hover:text-slate-600 transition-colors flex items-center gap-1"
              onClick={() => handleSort(column)}
            >
              {column}
              {sortKey === column && (sortDir === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />)}
            </div>
          ))}
        </div>
        <List
          height={600}
          rowCount={sortedRows.length}
          rowHeight={52}
          rowComponent={TableRow}
          rowProps={{
            rows: sortedRows,
            columns: activeColumns,
            navigate,
            onToggleWatchlist,
            watchlistSymbols
          }}
          className="min-w-[800px]"
        />
      </div>
    </section>
  )
}

export default ResultsTable
