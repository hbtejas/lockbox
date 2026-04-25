import { useState } from 'react'
import Button from '../ui/Button'

interface FilterBuilderProps {
  onApply: (query: string) => void
}

interface FilterRow {
  metric: string
  operator: string
  value: string
  connector: 'AND' | 'OR'
}

const metrics = [
  'Market Cap',
  'Revenue',
  'Net Profit',
  'ROCE',
  'ROE',
  'P/E Ratio',
  'P/B Ratio',
  'Debt/Equity',
  'EPS',
  'Dividend Yield',
  'Promoter Holding',
  'FII Holding',
  'DII Holding',
  'QoQ Revenue Growth',
  'YoY Revenue Growth',
  'Cash from Operations',
  'Capex/Net Block',
  'Free Cash Flow',
]

const operators = ['>', '<', '=', 'between']

function FilterBuilder({ onApply }: FilterBuilderProps) {
  const [naturalQuery, setNaturalQuery] = useState('ROCE > 20 AND Market Cap > 500 AND Promoter Holding > 50')
  const [rows, setRows] = useState<FilterRow[]>([
    { metric: 'ROCE', operator: '>', value: '20', connector: 'AND' },
  ])

  const addRow = () => {
    setRows((prev) => [...prev, { metric: 'Market Cap', operator: '>', value: '500', connector: 'AND' }])
  }

  const updateRow = (index: number, key: keyof FilterRow, value: string) => {
    setRows((prev) =>
      prev.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)),
    )
  }

  const buildFromRows = () => {
    const query = rows
      .map((row, index) => {
        const segment = `${row.metric} ${row.operator} ${row.value}`
        if (index === rows.length - 1) {
          return segment
        }
        return `${segment} ${row.connector}`
      })
      .join(' ')
    setNaturalQuery(query)
    onApply(query)
  }

  return (
    <section className="card-shell p-4">
      <h3 className="mb-2 text-sm font-semibold">Natural Language Filter</h3>
      <textarea
        value={naturalQuery}
        onChange={(event) => setNaturalQuery(event.target.value)}
        rows={3}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] p-3 text-sm outline-none ring-brand-500 focus:ring-2"
      />
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={() => onApply(naturalQuery)}>
          Run Query
        </Button>
        <Button size="sm" variant="secondary" onClick={buildFromRows}>
          Build From Filters
        </Button>
      </div>

      <h4 className="mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Filter Builder</h4>
      <div className="mt-2 space-y-2">
        {rows.map((row, index) => (
          <div key={`${row.metric}-${index}`} className="grid gap-2 md:grid-cols-4">
            <select
              value={row.metric}
              onChange={(event) => updateRow(index, 'metric', event.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 text-xs"
            >
              {metrics.map((metric) => (
                <option key={metric} value={metric}>
                  {metric}
                </option>
              ))}
            </select>
            <select
              value={row.operator}
              onChange={(event) => updateRow(index, 'operator', event.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 text-xs"
            >
              {operators.map((operator) => (
                <option key={operator} value={operator}>
                  {operator}
                </option>
              ))}
            </select>
            <input
              value={row.value}
              onChange={(event) => updateRow(index, 'value', event.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 text-xs"
            />
            <select
              value={row.connector}
              onChange={(event) => updateRow(index, 'connector', event.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 text-xs"
            >
              <option value="AND">AND</option>
              <option value="OR">OR</option>
            </select>
          </div>
        ))}
      </div>
      <Button className="mt-3" size="sm" variant="ghost" onClick={addRow}>
        + Add Condition
      </Button>
    </section>
  )
}

export default FilterBuilder
