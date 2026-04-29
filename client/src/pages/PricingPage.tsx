import Button from '../components/ui/Button'

const plans = [
  {
    name: 'FREE',
    price: 'Rs 0',
    subtitle: 'For getting started',
    features: ['1 Portfolio', '2 Watchlists', '5 Alerts', 'Basic financial data', '10 Screener queries/month'],
  },
  {
    name: 'PREMIUM',
    price: 'Rs 999/month',
    subtitle: 'Rs 7999/year billed annually',
    features: [
      '5 Portfolios',
      '10 Watchlists',
      'Unlimited Alerts (WhatsApp + Email)',
      'Full historical financial data',
      'Unlimited screener queries',
      'Operational metrics (6000+ data points)',
      'Source links for all data',
      'Reverse DCF calculator',
      'Advanced comparison tools',
    ],
  },
]

function PricingPage() {
  return (
    <div className="space-y-4">
      <section className="card-shell p-6 text-center">
        <h1 className="text-3xl font-bold">Simple Pricing for Serious Investors</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Choose a plan that fits your workflow. Upgrade anytime with Razorpay-powered subscription billing.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {plans.map((plan, index) => (
          <article key={plan.name} className={`card-shell p-6 ${index === 1 ? 'border-brand-500 shadow-lg shadow-brand-500/20' : ''}`}>
            <p className="text-xs uppercase tracking-wide text-brand-500">{plan.name}</p>
            <h2 className="mt-2 text-3xl font-bold">{plan.price}</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{plan.subtitle}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {plan.features.map((feature) => (
                <li key={`${plan.name}-${feature}`}>• {feature}</li>
              ))}
            </ul>
            <Button className="mt-5" fullWidth variant={index === 1 ? 'primary' : 'secondary'}>
              {index === 1 ? 'Upgrade to Premium' : 'Start Free'}
            </Button>
          </article>
        ))}
      </section>
    </div>
  )
}

export default PricingPage
