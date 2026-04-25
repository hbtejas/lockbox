import { motion } from 'framer-motion'
import { useMarketInsight } from '../../hooks/useAI'
import type { SectorOutlook } from '../../types/ai'

const moodConfig: Record<string, { emoji: string; color: string; bg: string }> = {
  Fearful:   { emoji: '😱', color: 'text-red-500',     bg: 'bg-red-500/10' },
  Cautious:  { emoji: '😐', color: 'text-amber-500',   bg: 'bg-amber-500/10' },
  Neutral:   { emoji: '🙂', color: 'text-slate-400',   bg: 'bg-slate-500/10' },
  Optimistic:{ emoji: '😊', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  Euphoric:  { emoji: '🚀', color: 'text-brand-500',   bg: 'bg-brand-500/10' },
}

const outlookColor: Record<string, string> = {
  Bullish: 'text-emerald-400',
  Neutral: 'text-slate-400',
  Bearish: 'text-red-400',
}

const outlookEmoji: Record<string, string> = {
  Bullish: '🟢',
  Neutral: '⚪',
  Bearish: '🔴',
}

function MoodMeter({ score }: { score: number }) {
  const pct = Math.min(Math.max(score, 0), 100)
  const color = pct < 30 ? '#ef4444' : pct < 50 ? '#f59e0b' : pct < 70 ? '#94a3b8' : '#10b981'

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-[var(--text-muted)]">Fear</span>
        <span className="font-semibold">{score}/100</span>
        <span className="text-[var(--text-muted)]">Greed</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200/60 dark:bg-slate-800">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

function SectorPill({ item }: { item: SectorOutlook }) {
  return (
    <span className={`text-xs font-medium ${outlookColor[item.outlook]}`}>
      {outlookEmoji[item.outlook]} {item.sector}
    </span>
  )
}

function MarketInsightWidget() {
  const { data, isLoading, isError, refetch } = useMarketInsight()

  if (isLoading) {
    return (
      <section className="card-shell animate-pulse p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">🤖</span>
          <div className="h-4 w-48 rounded bg-slate-300/40" />
        </div>
        <div className="space-y-2">
          <div className="h-6 w-32 rounded-full bg-slate-300/30" />
          <div className="h-3 w-full rounded bg-slate-300/20" />
          <div className="h-3 w-4/5 rounded bg-slate-300/20" />
        </div>
      </section>
    )
  }

  if (isError || !data) {
    return (
      <section className="card-shell p-4">
        <div className="flex items-center gap-2">
          <span>🤖</span>
          <h3 className="text-sm font-semibold">Today's Market Insight</h3>
        </div>
        <p className="mt-2 text-xs text-[var(--text-muted)]">Market insight unavailable.</p>
        <button onClick={() => refetch()} className="mt-2 text-xs text-[var(--brand)] hover:underline">
          Retry →
        </button>
      </section>
    )
  }

  const mood = moodConfig[data.marketMood] ?? moodConfig.Neutral

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-shell space-y-4 p-4"
    >
      {/* Title */}
      <div className="flex items-center gap-2">
        <span className="text-base">🤖</span>
        <h3 className="text-sm font-semibold">Today's Market Insight</h3>
        <span className="ml-auto text-xs text-[var(--text-muted)]">AI Powered</span>
      </div>

      {/* Mood Badge */}
      <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${mood.bg}`}>
        <span className="text-lg">{mood.emoji}</span>
        <span className={`text-sm font-semibold ${mood.color}`}>Market is {data.marketMood}</span>
      </div>

      <MoodMeter score={data.moodScore} />

      {/* Top Themes */}
      {data.topThemes.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[var(--text-muted)] mb-1">📌 Top Themes</p>
          <div className="flex flex-wrap gap-2">
            {data.topThemes.slice(0, 4).map((t) => (
              <span key={t} className="rounded-full bg-[var(--bg-elev)] border border-[var(--border)] px-2 py-0.5 text-xs">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Risks */}
      {data.topRisks.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-red-400 mb-1">⚠️ Key Risks</p>
          <ul className="space-y-1">
            {data.topRisks.slice(0, 2).map((r) => (
              <li key={r} className="text-xs text-[var(--text-muted)]">• {r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Sector Outlook */}
      {data.sectorOutlook.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[var(--text-muted)] mb-2">Sector Outlook</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {data.sectorOutlook.slice(0, 6).map((item) => (
              <SectorPill key={item.sector} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Weekly Outlook */}
      {data.weeklyOutlook && (
        <p className="rounded-xl bg-[var(--bg-elev)] border border-[var(--border)] p-3 text-xs text-[var(--text-muted)] leading-relaxed italic">
          {data.weeklyOutlook}
        </p>
      )}
    </motion.section>
  )
}

export default MarketInsightWidget
