import { useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useParams } from 'react-router-dom'
import CandlestickChart from '../components/charts/CandlestickChart'
import LineChart from '../components/charts/LineChart'
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
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        <span className="ml-3 text-sm text-[var(--text-muted)]">Loading {symbol}...</span>
      </section>
    )
  }

  if (!overview || isError) {
    return (
      <section className="card-shell p-6">
        <h1 className="text-xl font-bold text-red-500">Company not found</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">No data available for symbol <strong>{symbol}</strong>. Please check the spelling.</p>
        <p className="mt-3 text-xs text-[var(--text-muted)]">Try: RELIANCE, TCS, HDFCBANK, INFY, ICICIBANK, ITC, SBIN, BHARTIARTL, LT, TATAMOTORS, HAL, TITAN, BAJFINANCE, WIPRO, MARUTI, SUNPHARMA, HCLTECH, TATASTEEL, ADANIENT, AXISBANK, NESTLEIND, ASIANPAINT, KOTAKBANK, HINDUNILVR, POWERGRID</p>
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <CompanyHeader overview={overview} />

      <section className="card-shell p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Stock Chart</h3>
          <Tabs tabs={['1D', '1W', '1M', '6M', '1Y', '5Y', 'ALL']} value={period} onChange={setPeriod} />
        </div>
        {period === '1D' ? (
          <CandlestickChart data={(prices ?? []).slice(-24)} />
        ) : (
          <LineChart data={prices ?? []} xKey="date" yKey="close" />
        )}
      </section>

      <Tabs
        tabs={['Overview', 'Financials', 'Shareholding', 'Peers', 'News & Filings', 'Results Calendar', 'AI Analysis']}
        value={tab}
        onChange={setTab}
      />

      {tab === 'Overview' && (
        <div className="space-y-4">
          <Metrics overview={overview} />
          <section className="card-shell p-4">
            <h3 className="text-sm font-semibold">About</h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{overview.description}</p>
          </section>
        </div>
      )}

      {tab === 'Financials' && <Financials quarterly={quarterly ?? []} annual={annual ?? []} />}

      {tab === 'Shareholding' && (
        <section className="card-shell p-4">
          <h3 className="mb-3 text-sm font-semibold">Shareholding Pattern</h3>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={shareholding ?? []}>
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="promoter" stackId="1" stroke="#1d4ed8" fill="#1d4ed8" />
                <Area type="monotone" dataKey="fii" stackId="1" stroke="#0ea5e9" fill="#0ea5e9" />
                <Area type="monotone" dataKey="dii" stackId="1" stroke="#0284c7" fill="#0284c7" />
                <Area type="monotone" dataKey="retail" stackId="1" stroke="#64748b" fill="#64748b" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {tab === 'Peers' && (
        <section className="card-shell p-4">
          <h3 className="mb-3 text-sm font-semibold">Peer Comparison</h3>
          <div className="overflow-auto">
            <table className="min-w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                  <th className="py-2">Company</th>
                  <th className="py-2">Ticker</th>
                  <th className="py-2">P/E</th>
                  <th className="py-2">P/B</th>
                  <th className="py-2">Dividend Yield</th>
                </tr>
              </thead>
              <tbody>
                {(peers ?? []).map((peer) => (
                  <tr key={peer.symbol} className="border-b border-[var(--border)]/50">
                    <td className="py-2">{peer.name}</td>
                    <td className="py-2">{peer.symbol}</td>
                    <td className="py-2">{peer.peRatio.toFixed(1)}</td>
                    <td className="py-2">{peer.pbRatio.toFixed(1)}</td>
                    <td className="py-2">{peer.dividendYield.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'News & Filings' && (
        <section className="card-shell p-4">
          <h3 className="mb-3 text-sm font-semibold">News & Filings</h3>
          <ul className="space-y-2 text-sm text-[var(--text-muted)]">
            {(news ?? []).map((item) => (
              <li key={item.id}>
                <a href={item.url} target="_blank" rel="noreferrer" className="font-medium text-brand-500 hover:text-brand-400">
                  {item.title}
                </a>
                <p className="text-xs text-[var(--text-muted)]">{item.source}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'Results Calendar' && (
        <section className="card-shell p-4">
          <h3 className="mb-3 text-sm font-semibold">Results Calendar</h3>
          <ul className="space-y-2 text-sm text-[var(--text-muted)]">
            {(companyResults ?? []).map((result) => (
              <li key={result.id}>
                {result.period} Results - {result.resultDate}
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'AI Analysis' && <StockAIAnalysis symbol={symbol} />}
    </div>
  )
}

export default CompanyPage
