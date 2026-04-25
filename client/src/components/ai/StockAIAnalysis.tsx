import { motion } from 'framer-motion'
import { useStockAIAnalysis } from '../../hooks/useAI'
import Badge from '../ui/Badge'

const verdictTone: Record<string, 'success' | 'info' | 'neutral' | 'warning' | 'danger'> = {
  'Strong Buy': 'success',
  Buy: 'success',
  Hold: 'info',
  Sell: 'warning',
  'Strong Sell': 'danger',
}

const sentimentColor: Record<string, string> = {
  Bullish: 'text-emerald-500',
  'Slightly Bullish': 'text-emerald-400',
  Neutral: 'text-slate-400',
  'Slightly Bearish': 'text-amber-500',
  Bearish: 'text-red-500',
}

const sentimentEmoji: Record<string, string> = {
  Bullish: '🟢',
  'Slightly Bullish': '🟡',
  Neutral: '⚪',
  'Slightly Bearish': '🟠',
  Bearish: '🔴',
}

interface StockAIAnalysisProps {
  symbol: string
}

function StockAIAnalysis({ symbol }: StockAIAnalysisProps) {
  const { data, isLoading, isError, refetch } = useStockAIAnalysis(symbol)

  if (isLoading) {
    return (
      <section className="card-shell animate-pulse p-4">
        <div className="flex items-center gap-2">
          <span className="text-base">🤖</span>
          <div className="h-4 w-40 rounded bg-slate-300/40" />
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-3 w-full rounded bg-slate-300/30" />
          <div className="h-3 w-4/5 rounded bg-slate-300/30" />
          <div className="h-3 w-3/5 rounded bg-slate-300/30" />
        </div>
      </section>
    )
  }

  if (isError || !data) {
    return (
      <section className="card-shell p-4">
        <div className="flex items-center gap-2">
          <span className="text-base">🤖</span>
          <h3 className="text-sm font-semibold">AI Analysis</h3>
        </div>
        <p className="mt-2 text-xs text-[var(--text-muted)]">AI analysis unavailable. Please try again.</p>
        <button
          onClick={() => refetch()}
          className="mt-2 text-xs text-[var(--brand)] hover:underline"
        >
          Retry →
        </button>
      </section>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-shell space-y-4 p-4"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">🤖</span>
          <h3 className="text-sm font-semibold">AI Analysis</h3>
        </div>
        <span className={`text-sm font-semibold ${sentimentColor[data.sentimentLabel]}`}>
          {sentimentEmoji[data.sentimentLabel]} {data.sentimentLabel}
        </span>
      </div>

      {/* Summary */}
      <p className="text-sm text-[var(--text-muted)] leading-relaxed">{data.aiSummary}</p>

      {/* Verdict + Target */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">Verdict:</span>
          <Badge tone={verdictTone[data.analystVerdict] ?? 'neutral'}>{data.analystVerdict}</Badge>
        </div>
        {data.priceTarget && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-[var(--text-muted)]">12M Target:</span>
            <span className="text-xs font-semibold">₹{data.priceTarget.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <span className="text-xs text-[var(--text-muted)]">Confidence:</span>
          <span className="text-xs font-medium">{data.confidenceLevel}</span>
        </div>
      </div>

      {/* Fundamental Strength bar */}
      <div>
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-[var(--text-muted)]">Fundamental Strength</span>
          <span className="font-semibold">{data.fundamentalStrength}/100</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200/60 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-brand-500"
            style={{ width: `${Math.min(data.fundamentalStrength, 100)}%` }}
          />
        </div>
      </div>

      {/* Risks and Opportunities Row */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--border)] bg-red-500/5 p-3">
          <p className="mb-1 text-xs font-semibold text-red-400">Key Risks</p>
          <ul className="space-y-1">
            {data.keyRisks.slice(0, 3).map((r) => (
              <li key={r} className="text-xs text-[var(--text-muted)]">• {r}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-emerald-500/5 p-3">
          <p className="mb-1 text-xs font-semibold text-emerald-400">Opportunities</p>
          <ul className="space-y-1">
            {data.keyOpportunities.slice(0, 3).map((o) => (
              <li key={o} className="text-xs text-[var(--text-muted)]">• {o}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* News Impact */}
      {data.newsImpact && (
        <p className="rounded-lg bg-[var(--bg-elev)] px-3 py-2 text-xs text-[var(--text-muted)] italic">
          📰 {data.newsImpact}
        </p>
      )}
    </motion.section>
  )
}

export default StockAIAnalysis
