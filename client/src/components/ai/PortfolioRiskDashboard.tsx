import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { usePortfolioRiskAnalysis, useRefreshAIAnalysis } from '../../hooks/useAI'
import type { AISuggestion, PortfolioRiskAnalysis } from '../../types/ai'

const chartColors = ['#2563eb', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9']

const riskClassMap: Record<PortfolioRiskAnalysis['riskColor'], string> = {
  green: 'text-emerald-500',
  yellow: 'text-amber-500',
  orange: 'text-orange-500',
  red: 'text-red-500',
  darkred: 'text-red-700',
}

const suggestionToneMap: Record<AISuggestion['priority'], 'danger' | 'warning' | 'info' | 'neutral'> = {
  critical: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'neutral',
}

function formatAgo(value: string | Date) {
  const date = new Date(value)
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.max(0, Math.round(diffMs / 60000))

  if (minutes < 1) {
    return 'just now'
  }
  if (minutes === 1) {
    return '1 minute ago'
  }
  if (minutes < 60) {
    return `${minutes} minutes ago`
  }

  const hours = Math.round(minutes / 60)
  if (hours === 1) {
    return '1 hour ago'
  }

  return `${hours} hours ago`
}

function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500 [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500 [animation-delay:300ms]" />
    </span>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <section className="card-shell animate-pulse space-y-3 p-4">
        <div className="h-5 w-60 rounded bg-slate-300/40" />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="h-32 rounded-xl bg-slate-300/40" />
          <div className="h-32 rounded-xl bg-slate-300/40" />
        </div>
      </section>
      <section className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card-shell h-28 animate-pulse rounded-xl bg-slate-300/30" />
        ))}
      </section>
    </div>
  )
}

interface PortfolioRiskDashboardProps {
  portfolioId: string
}

function PortfolioRiskDashboard({ portfolioId }: PortfolioRiskDashboardProps) {
  const riskQuery = usePortfolioRiskAnalysis(portfolioId)
  const refreshMutation = useRefreshAIAnalysis(portfolioId)

  const analysis = riskQuery.data?.analysis
  const isGenerating = riskQuery.isLoading || refreshMutation.isPending

  const suggestions = useMemo(() => {
    if (!analysis) {
      return []
    }

    return [...analysis.aiSuggestions].sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 }
      return order[a.priority] - order[b.priority]
    })
  }, [analysis])

  if (isGenerating && !analysis) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--text-muted)]">
          Generating AI Analysis... <LoadingDots />
        </p>
        <LoadingSkeleton />
      </div>
    )
  }

  if (riskQuery.isError || !analysis) {
    return (
      <section className="card-shell p-5">
        <h3 className="text-lg font-semibold">AI Portfolio Risk Analysis</h3>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          We could not generate your AI portfolio analysis right now.
        </p>
        <Button className="mt-4" onClick={() => riskQuery.refetch()}>
          Retry Analysis
        </Button>
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-shell space-y-4 p-5"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold">AI Portfolio Risk Analysis</h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Last analyzed: {formatAgo(analysis.generatedAt)} · Powered by AI
            </p>
          </div>
          <Button size="sm" onClick={() => refreshMutation.mutate()} disabled={refreshMutation.isPending}>
            {refreshMutation.isPending ? 'Analyzing...' : 'Analyze Now'}
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <article className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Risk Score</p>
            <p className={`number-font mt-2 text-4xl font-bold ${riskClassMap[analysis.riskColor]}`}>
              {analysis.overallRiskScore.toFixed(1)}
            </p>
            <p className="mt-1 text-sm font-semibold">{analysis.riskLevel}</p>
          </article>

          <article className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Diversification Score</p>
            <p className="number-font mt-2 text-3xl font-bold">{analysis.diversificationScore}/100</p>
            <div className="mt-3 h-2 rounded-full bg-slate-200/70 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-brand-500"
                style={{ width: `${Math.max(4, Math.min(analysis.diversificationScore, 100))}%` }}
              />
            </div>
          </article>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid gap-3 md:grid-cols-2"
      >
        <SwotCard title="Strengths" icon="💪" points={analysis.strengths} />
        <SwotCard title="Weaknesses" icon="⚠️" points={analysis.weaknesses} />
        <SwotCard title="Opportunities" icon="🚀" points={analysis.opportunities} />
        <SwotCard title="Threats" icon="🚨" points={analysis.threats} />
      </motion.section>

      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="card-shell p-4">
        <h3 className="mb-3 text-sm font-semibold">Concentration Risk</h3>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {analysis.concentrationRisk.length === 0 && (
            <p className="text-sm text-[var(--text-muted)]">No major concentration risks identified.</p>
          )}
          {analysis.concentrationRisk.map((risk) => (
            <article key={`${risk.type}-${risk.name}`} className="min-w-[260px] rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] p-3">
              <Badge tone={risk.riskLevel === 'high' ? 'danger' : risk.riskLevel === 'medium' ? 'warning' : 'success'}>
                {risk.riskLevel.toUpperCase()} RISK
              </Badge>
              <p className="mt-2 text-sm font-semibold">
                {risk.name} - {risk.currentWeight.toFixed(1)}%
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Recommended max: {risk.recommendedMax}%</p>
              <p className="mt-2 text-xs text-[var(--text-muted)]">{risk.message}</p>
            </article>
          ))}
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="space-y-3">
        <h3 className="text-sm font-semibold">AI Suggestions</h3>
        {suggestions.map((suggestion) => (
          <article key={suggestion.id} className="card-shell p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Badge tone={suggestionToneMap[suggestion.priority]}>{suggestion.priority.toUpperCase()}</Badge>
                <h4 className="mt-2 text-base font-semibold">{suggestion.title}</h4>
              </div>
              <p className="text-xs text-[var(--text-muted)]">Confidence: {(suggestion.confidenceScore * 100).toFixed(0)}%</p>
            </div>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{suggestion.description}</p>
            {suggestion.affectedStocks && suggestion.affectedStocks.length > 0 && (
              <p className="mt-2 text-xs text-[var(--text-muted)]">Affected: {suggestion.affectedStocks.join(', ')}</p>
            )}
            {suggestion.expectedImpact && (
              <p className="mt-1 text-xs text-[var(--text-muted)]">Expected Impact: {suggestion.expectedImpact}</p>
            )}
          </article>
        ))}
      </motion.section>

      <section className="card-shell p-4">
        <h3 className="mb-3 text-sm font-semibold">Risk Metrics</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <MetricTile label="Beta" value={analysis.riskMetrics.beta.toFixed(2)} />
          <MetricTile label="Volatility" value={`${analysis.riskMetrics.volatility.toFixed(2)}%`} />
          <MetricTile label="Sharpe" value={analysis.riskMetrics.sharpeRatio.toFixed(2)} />
          <MetricTile label="Max Drawdown" value={`${analysis.riskMetrics.maxDrawdown.toFixed(2)}%`} />
          <MetricTile label="VaR (1-day)" value={`${analysis.riskMetrics.valueAtRisk.toFixed(2)}%`} />
          <MetricTile label="Nifty Correlation" value={analysis.riskMetrics.correlationToNifty.toFixed(2)} />
          <MetricTile label="High D/E" value={`${analysis.riskMetrics.debtExposure.toFixed(1)}%`} />
          <MetricTile label="Small/Micro Cap" value={`${analysis.riskMetrics.smallMicroCapExposure.toFixed(1)}%`} />
        </div>
      </section>

      {analysis.rebalancePlan && (
        <section className="card-shell p-4">
          <h3 className="text-sm font-semibold">Suggested Rebalance</h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">{analysis.rebalancePlan.trigger}</p>
          <div className="mt-3 space-y-2">
            {analysis.rebalancePlan.steps.map((step, index) => (
              <div key={`${step.symbol}-${index}`} className="rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] p-3 text-sm">
                <p className="font-semibold">
                  {step.action.toUpperCase()} {step.symbol} {step.estimatedShares} shares
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {step.currentWeight.toFixed(1)}% → {step.targetWeight.toFixed(1)}% · ₹{step.estimatedValue.toLocaleString('en-IN')}
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{step.reason}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Estimated Brokerage: ₹{analysis.rebalancePlan.estimatedBrokerage.toLocaleString('en-IN')} | Estimated Tax: ₹
            {analysis.rebalancePlan.estimatedTax.toLocaleString('en-IN')}
          </p>
        </section>
      )}

      <section className="card-shell p-4">
        <h3 className="mb-3 text-sm font-semibold">Sector Exposure</h3>
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analysis.sectorExposure}
                  dataKey="weight"
                  nameKey="sector"
                  innerRadius={54}
                  outerRadius={92}
                  paddingAngle={2}
                >
                  {analysis.sectorExposure.map((entry, index) => (
                    <Cell key={entry.sector} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number | string) => `${Number(value).toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                  <th className="py-2">Sector</th>
                  <th className="py-2">Weight</th>
                  <th className="py-2">Stocks</th>
                  <th className="py-2">Comment</th>
                </tr>
              </thead>
              <tbody>
                {analysis.sectorExposure.map((entry) => (
                  <tr key={entry.sector} className="border-b border-[var(--border)]/50">
                    <td className="py-2 font-medium">{entry.sector}</td>
                    <td className="py-2">{entry.weight.toFixed(1)}%</td>
                    <td className="py-2">{entry.stockCount}</td>
                    <td className="py-2 text-[var(--text-muted)]">{entry.riskComment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}

function SwotCard({ title, icon, points }: { title: string; icon: string; points: string[] }) {
  return (
    <article className="card-shell p-4">
      <h4 className="text-sm font-semibold">
        {icon} {title}
      </h4>
      <ul className="mt-2 space-y-1 text-xs text-[var(--text-muted)]">
        {points.slice(0, 4).map((point) => (
          <li key={point}>• {point}</li>
        ))}
      </ul>
    </article>
  )
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] p-3">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="number-font mt-1 text-sm font-semibold">{value}</p>
    </div>
  )
}

export default PortfolioRiskDashboard
