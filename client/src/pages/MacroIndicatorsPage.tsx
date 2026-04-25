import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import LineChart from '../components/charts/LineChart'
import { fetchMacroIndicators } from '../api/stockApi'

function MacroIndicatorsPage() {
  const macroQuery = useQuery({
    queryKey: ['macro-indicators'],
    queryFn: fetchMacroIndicators,
    refetchInterval: 15 * 60 * 1000,
  })

  const indicators = useMemo(() => macroQuery.data ?? [], [macroQuery.data])
  const [selected, setSelected] = useState('')

  const selectedIndicator = indicators.find((indicator) => indicator.name === selected) ?? indicators[0]

  const chartData = useMemo(
    () =>
      indicators.map((indicator, index) => ({
        month: `M${index + 1}`,
        value: indicator.value,
      })),
    [indicators],
  )

  return (
    <div className="space-y-4">
      <section className="card-shell p-4">
        <h1 className="text-2xl font-bold">Macro Indicators</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Monitor macro trends like GDP, inflation, repo rate, reserves, PMI, and institutional flows.
        </p>
      </section>

      <section className="card-shell p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {indicators.map((indicator) => (
            <button
              key={indicator.name}
              type="button"
              onClick={() => setSelected(indicator.name)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                selectedIndicator?.name === indicator.name
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {indicator.name}
            </button>
          ))}
        </div>
        <LineChart data={chartData} xKey="month" yKey="value" color="#0ea5e9" />
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {indicators.map((indicator) => (
          <article key={indicator.name} className="card-shell p-4">
            <p className="text-xs text-[var(--text-muted)]">{indicator.category}</p>
            <h3 className="mt-1 text-sm font-semibold">{indicator.name}</h3>
            <p className="number-font mt-2 text-lg font-semibold">
              {indicator.value} {indicator.unit}
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Updated {indicator.date}</p>
          </article>
        ))}
      </section>

      {!macroQuery.isLoading && indicators.length === 0 && (
        <section className="card-shell p-4 text-sm text-[var(--text-muted)]">No macro indicator data available.</section>
      )}
    </div>
  )
}

export default MacroIndicatorsPage
