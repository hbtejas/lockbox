import React, { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FixedSizeList as List } from 'react-window'
import type { ScreenerResultRow } from '../../api/screenerApi'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatPercent } from '../../utils/formatPercent'
import Button from '../ui/Button'

interface ResultsTableProps {
  rows: ScreenerResultRow[]
  columns: string[]
  onExport: () => void
  onColumnsChange: (columns: string[]) => void
}

const allColumns = ['company', 'ticker', 'sector', 'marketCap', 'peRatio', 'roce', 'revenueGrowth', 'promoterHolding']

const TableRow = memo(({ data, index, style, columns, navigate }: any) => {
  const row = data[index]
  return (
    <div
      style={style}
      className="flex items-center border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer text-sm"
      onClick={() => navigate(`/company/${row.ticker}`)}
    >
      {columns.map((column: string) => (
        <div key={`${row.ticker}-${column}`} className="flex-1 px-4 overflow-hidden text-ellipsis whitespace-nowrap">
          {column === 'company' && <span className="font-semibold text-blue-600 hover:underline">{row.company}</span>}
          {column === 'ticker' && <span className="text-[var(--text-muted)] font-mono text-xs">{row.ticker}</span>}
          {column === 'sector' && row.sector}
          {column === 'marketCap' && formatCurrency(row.marketCap)}
          {column === 'peRatio' && row.peRatio.toFixed(2)}
          {column === 'roce' && formatPercent(row.roce, false)}
          {column === 'revenueGrowth' && formatPercent(row.revenueGrowth, true)}
          {column === 'promoterHolding' && formatPercent(row.promoterHolding, false)}
        </div>
      ))}
    </div>
  )
})

function ResultsTable({ rows, columns, onExport, onColumnsChange }: ResultsTableProps) {
  const navigate = useNavigate()

  const toggleColumn = (column: string) => {
    if (columns.includes(column)) {
      onColumnsChange(columns.filter((entry) => entry !== column))
      return
    }
    onColumnsChange([...columns, column])
  }

  return (
    <section className="card-shell p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h3 className="text-sm font-semibold">Screener Results</h3>
        <div className="flex flex-wrap gap-2">
          {allColumns.map((column) => (
            <button
              key={column}
              type="button"
              onClick={() => toggleColumn(column)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                columns.includes(column)
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {column}
            </button>
          ))}
          <Button size="sm" onClick={onExport}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex bg-slate-50/50 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
          {columns.map((column) => (
            <div key={column} className="flex-1 px-4">
              {column}
            </div>
          ))}
        </div>
        <List
          height={500}
          itemCount={rows.length}
          itemSize={48}
          width="100%"
          itemData={rows}
        >
          {(props) => <TableRow {...props} columns={columns} navigate={navigate} />}
        </List>
      </div>
    </section>
  )
}

export default ResultsTable
