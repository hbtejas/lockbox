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
      <section className="card-shell p-6 text-center">
        <h1 className="text-3xl font-bold">Platform Features</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          End-to-end toolkit for Indian stock market research and portfolio tracking.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {featureBuckets.map((bucket) => (
          <article key={bucket.title} className="card-shell p-4">
            <h2 className="text-lg font-semibold">{bucket.title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
              {bucket.points.map((point) => (
                <li key={`${bucket.title}-${point}`}>• {point}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </div>
  )
}

export default FeaturesPage
