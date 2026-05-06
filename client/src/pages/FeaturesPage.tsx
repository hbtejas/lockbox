const featureBuckets = [
  {
    title: 'Research Tools',
    points: ['Advanced screener with custom filters', 'Company financials and peer comparison', 'Sector and macro research dashboards'],
  },
  {
    title: 'Tracking Tools',
    points: ['Portfolio tracker with benchmark overlay', 'Watchlists with custom views', 'Price and volume alert engine'],
  },
  {
    title: 'Event Intelligence',
    points: ['Results calendar and concall tracker', 'Ideas dashboard with curated signals', 'Personalized timeline feed'],
  },
]

function FeaturesPage() {
  return (
    <div className="space-y-4">
      <section className="glass p-12 text-center rounded-[2rem] relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
        <h1 className="text-4xl font-black text-gradient relative z-10">Platform Features</h1>
        <p className="mt-4 text-sm text-[var(--text-muted)] max-w-lg mx-auto relative z-10 font-medium">
          End-to-end toolkit for Indian stock market research and portfolio tracking.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {featureBuckets.map((bucket) => (
          <article key={bucket.title} className="glass p-8 rounded-3xl hover:-translate-y-1 transition-transform duration-300">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{bucket.title}</h2>
            <ul className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
              {bucket.points.map((point) => (
                <li key={`${bucket.title}-${point}`} className="flex items-start gap-3">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                  {point}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </div>
  )
}

export default FeaturesPage
