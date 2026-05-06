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
      <section className="glass p-12 text-center rounded-[2rem] relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
        <h1 className="text-4xl font-black text-gradient relative z-10">Simple Pricing for Serious Investors</h1>
        <p className="mt-4 text-sm text-[var(--text-muted)] max-w-lg mx-auto relative z-10 font-medium">
          Choose a plan that fits your workflow. Upgrade anytime with Razorpay-powered subscription billing.
        </p>
      </section>

      <section className="grid gap-8 lg:grid-cols-2 mt-8">
        {plans.map((plan, index) => (
          <article 
            key={plan.name} 
            className={`glass p-8 rounded-3xl relative ${index === 1 ? 'border-indigo-500/50 shadow-[0_0_30px_rgba(79,70,229,0.15)] animate-glow' : ''}`}
          >
            {index === 1 && (
              <div className="absolute -top-3 right-8 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                Most Popular
              </div>
            )}
            <p className="text-xs font-black uppercase tracking-widest text-indigo-500">{plan.name}</p>
            <h2 className="mt-4 text-4xl font-black text-slate-800 dark:text-slate-100">{plan.price}</h2>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">{plan.subtitle}</p>
            
            <div className="my-6 h-px w-full bg-[var(--border)]"></div>
            
            <ul className="space-y-4 text-sm font-medium text-slate-600 dark:text-slate-300">
              {plan.features.map((feature) => (
                <li key={`${plan.name}-${feature}`} className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                  {feature}
                </li>
              ))}
            </ul>
            <Button className="mt-8" fullWidth variant={index === 1 ? 'primary' : 'secondary'} size="lg">
              {index === 1 ? 'Upgrade to Premium' : 'Start Free'}
            </Button>
          </article>
        ))}
      </section>
    </div>
  )
}

export default PricingPage
