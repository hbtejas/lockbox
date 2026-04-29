import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNaturalLanguageScreener } from '../../hooks/useAI'
import type { ParsedScreenerQuery } from '../../types/ai'

const OPERATOR_LABEL: Record<string, string> = {
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  eq: '=',
  between: 'between',
}

const EXAMPLE_QUERIES = [
  'Small caps with ROCE above 20% and low debt',
  'IT companies with high ROE and PE below 30',
  'High dividend yield above 4% with strong fundamentals',
  'Promoters buying heavily, PE below 20',
  'Debt free companies with revenue growth above 15%',
]

interface NaturalLanguageSearchProps {
  onApplyFilters?: (parsed: ParsedScreenerQuery) => void
}

function NaturalLanguageSearch({ onApplyFilters }: NaturalLanguageSearchProps) {
  const [query, setQuery] = useState('')
  const [parsedResult, setParsedResult] = useState<ParsedScreenerQuery | null>(null)

  const mutation = useNaturalLanguageScreener()

  const handleParse = async () => {
    const trimmed = query.trim()
    if (!trimmed) return
    try {
      const result = await mutation.mutateAsync(trimmed)
      setParsedResult(result)
    } catch {
      // handled by mutation
    }
  }

  const handleApply = () => {
    if (parsedResult && onApplyFilters) {
      onApplyFilters(parsedResult)
    }
  }

  return (
    <section className="card-shell space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-base">🤖</span>
        <h3 className="text-sm font-semibold">AI Screener — Natural Language Filter</h3>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void handleParse() }}
          placeholder='Try: "Small caps with ROCE above 20% and low debt"'
          disabled={mutation.isPending}
          className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] px-3 py-2 text-sm outline-none placeholder:text-[var(--text-muted)] focus:border-brand-500 disabled:opacity-50"
        />
        <button
          onClick={handleParse}
          disabled={mutation.isPending || !query.trim()}
          className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-40 transition-colors whitespace-nowrap"
        >
          {mutation.isPending ? 'Parsing...' : '✨ Parse'}
        </button>
      </div>

      {/* Example queries */}
      <div className="flex flex-wrap gap-2">
        {EXAMPLE_QUERIES.map((ex) => (
          <button
            key={ex}
            onClick={() => setQuery(ex)}
            className="rounded-full border border-[var(--border)] bg-[var(--bg-elev)] px-2 py-0.5 text-xs text-[var(--text-muted)] hover:border-brand-500 hover:text-brand-400 transition-colors"
          >
            {ex}
          </button>
        ))}
      </div>

      {/* Parsed Result */}
      <AnimatePresence>
        {parsedResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-brand-500/30 bg-brand-500/5 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-brand-400">✅</span>
                <div>
                  <p className="text-sm font-semibold text-brand-400">AI understood your query:</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{parsedResult.explanation}</p>
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-1">
                {parsedResult.filters.map((f, i) => (
                  <div
                    key={`${f.metric}-${i}`}
                    className="flex items-center gap-2 rounded-lg bg-[var(--bg-elev)] border border-[var(--border)] px-3 py-1.5 text-xs"
                  >
                    <span className="font-mono text-[var(--text-muted)]">{f.metric}</span>
                    <span className="font-bold text-brand-500">{OPERATOR_LABEL[f.operator] ?? f.operator}</span>
                    <span className="font-semibold">{f.value}</span>
                    {f.value2 != null && (
                      <>
                        <span className="text-[var(--text-muted)]">and</span>
                        <span className="font-semibold">{f.value2}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Logic badge */}
              <p className="text-xs text-[var(--text-muted)]">
                Combine with: <span className="font-mono font-bold text-brand-400">{parsedResult.logic}</span>
              </p>

              {/* Apply button */}
              {onApplyFilters && (
                <button
                  onClick={handleApply}
                  className="w-full rounded-xl bg-brand-500 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
                >
                  Apply These Filters →
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {mutation.isError && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-500">
          Could not parse your query. Please try rephrasing.
        </p>
      )}
    </section>
  )
}

export default NaturalLanguageSearch
