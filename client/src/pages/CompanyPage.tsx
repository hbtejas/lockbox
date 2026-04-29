import { useState } from 'react'
import { useParams } from 'react-router-dom'
import CompanyHeader from '../components/company/CompanyHeader'
import Financials from '../components/company/Financials'
import Metrics from '../components/company/Metrics'
import Tabs from '../components/ui/Tabs'
import StockAIAnalysis from '../components/ai/StockAIAnalysis'
import {
  useCompanyOverview,
  useCompanyResults,
  useFinancials,
  useNews,
  usePeers,
  useShareholding,
  useStockPrices,
} from '../hooks/useStockData'
import LineChart from '../components/charts/LineChart'

function CompanyPage() {
  const { symbol = 'RELIANCE' } = useParams()
  const [period, setPeriod] = useState('1Y')
  const [tab, setTab] = useState('Overview')

  const { data: overview, isLoading, isError } = useCompanyOverview(symbol)
  const { data: prices } = useStockPrices(symbol, period.toLowerCase())
  const { data: quarterly } = useFinancials(symbol, 'quarterly')
  const { data: annual } = useFinancials(symbol, 'annual')
  const { data: shareholding } = useShareholding(symbol)
  const { data: peers } = usePeers(symbol)
  const { data: news } = useNews(symbol)
  const { data: companyResults } = useCompanyResults(symbol)

  if (isLoading) {
    return (
      <section className="card-shell p-8 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" />
        <span className="ml-3 text-sm text-[var(--text-muted)]">Loading {symbol}...</span>
      </section>
    )
  }

  if (!overview || isError) {
    return (
      <section className="card-shell p-8 text-center">
        <h1 className="text-xl font-bold text-red-500">Company Not Found</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Unable to fetch data for {symbol}.</p>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <CompanyHeader overview={overview} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="card-shell p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Price Chart</h3>
              <div className="flex gap-2">
                {['1M', '6M', '1Y', '5Y', 'ALL'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                      period === p ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[300px]">
              <LineChart data={prices || []} xKey="date" yKey="close" color="#2563eb" />
            </div>
          </section>

          <Tabs
            tabs={['Overview', 'Financials', 'Results', 'Shareholding', 'Peers', 'News']}
            value={tab}
            onChange={setTab}
          />

          <div className="mt-4">
            {tab === 'Overview' && (
              <div className="space-y-6">
                <section className="card-shell p-5">
                  <h3 className="text-sm font-bold mb-3">About {overview.name}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{overview.description}</p>
                </section>
                <Metrics overview={overview} />
              </div>
            )}
            {tab === 'Financials' && (
              <Financials quarterly={quarterly || []} annual={annual || []} />
            )}
            {tab === 'Results' && (
              <section className="card-shell p-5">
                 <h3 className="text-sm font-bold mb-4">Quarterly Results</h3>
                 {/* Results component or table logic here */}
                 <pre className="text-[10px] bg-slate-50 p-2 overflow-auto max-h-60">{JSON.stringify(companyResults, null, 2)}</pre>
              </section>
            )}
            {tab === 'Shareholding' && (
              <section className="card-shell p-5">
                <h3 className="text-sm font-bold mb-4">Shareholding Pattern</h3>
                <pre className="text-[10px] bg-slate-50 p-2 overflow-auto max-h-60">{JSON.stringify(shareholding, null, 2)}</pre>
              </section>
            )}
            {tab === 'Peers' && (
              <section className="card-shell p-5">
                <h3 className="text-sm font-bold mb-4">Industry Peers</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(peers || []).map((peer: any) => (
                    <div key={peer.symbol} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                      <p className="text-xs font-bold">{peer.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{peer.symbol}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {tab === 'News' && (
              <section className="space-y-3">
                {(news || []).map((item: any) => (
                  <div key={item.url} className="card-shell p-4 hover:border-brand-300 transition-colors cursor-pointer">
                    <p className="text-[10px] font-bold text-brand-600 uppercase mb-1">{item.source}</p>
                    <h4 className="text-sm font-bold mb-2">{item.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{item.summary}</p>
                  </div>
                ))}
              </section>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <StockAIAnalysis symbol={symbol} />
          <section className="card-shell p-5 bg-slate-900 text-white border-none shadow-xl">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Market Stats</h3>
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-xs text-slate-400">Market Cap</span>
                   <span className="text-sm font-bold">₹{((overview.marketCap || 0) / 10000000).toFixed(0)} Cr</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-xs text-slate-400">P/E Ratio</span>
                   <span className="text-sm font-bold">{overview.peRatio || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-xs text-slate-400">Dividend Yield</span>
                   <span className="text-sm font-bold">{overview.dividendYield || '0'}%</span>
                </div>
             </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default CompanyPage
