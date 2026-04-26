import { useState, useEffect } from 'react'
import FilterBuilder from '../components/screener/FilterBuilder'
import NaturalLanguageSearch from '../components/screener/NaturalLanguageSearch'
import ResultsTable from '../components/screener/ResultsTable'
import { useScreenerFilter } from '../hooks/useScreener'
import type { ScreenerResultRow } from '../api/screenerApi'
import type { ParsedScreenerQuery } from '../types/ai'

const defaultColumns = ['company', 'ticker', 'sector', 'marketCap', 'peRatio', 'roce', 'revenueGrowth']

const popularScreens = {
  Fundamentals: [
    { title: 'Promoter Increasing Stake', desc: 'Promoters buy for just one reason - stock will go up. List of companies with them continuously increasing stake.', query: 'Promoter Holding > 50 AND Promoter Holding Change > 1' },
    { title: 'Companies Doing Major Expansion', desc: 'Companies in any sector undergoing a massive expansion.', query: 'Capex > 100 AND ROCE > 15' },
    { title: 'Strong Fundamentals With FII/DII Buying And Retail Selling', desc: 'Fundamentally strong companies which are in favour with smart money, and going out of favour with retail.', query: 'ROCE > 20 AND FII Holding Change > 1 AND DII Holding Change > 1' },
    { title: 'Small Cap Consistent Compounders', desc: 'Small companies which consistently grow their sales , while maintaining a healthy return on capital.', query: 'Market Cap > 500 AND Market Cap < 5000 AND Sales Growth 5Yr > 15 AND ROCE > 20' },
    { title: 'Cash Flow Machines', desc: 'Actual Cash profits are more important than accounting profits. List of companies spitting out cash profits.', query: 'Cash Flow Operations > 100 AND Net Profit > 100' },
    { title: 'Superstar Favourites', desc: 'Companies where superstar investors like Rakesh Jhunjhunwala, Ashish Kacholia have invested.', query: 'FII Holding > 10 OR DII Holding > 10' }
  ],
  Marketshare: [
    { title: 'Monopoly Companies', desc: 'Companies which are dominant in a product, usually having a strong moat.', query: 'Sales Growth 5Yr > 10 AND Operating Margin > 20' }
  ],
  Technicals: [
    { title: 'Oversold On RSI Basis', desc: 'Stocks with RSI of less than 30.', query: 'RSI < 30' },
    { title: 'Volume Gainers', desc: 'Gainers with huge volumes.', query: 'Volume > 1000000' },
    { title: 'Golden Crossover', desc: 'Stocks indicating a potential for bullish breakout rally.', query: 'SMA 50 > SMA 200' }
  ],
  Valuation: [
    { title: 'Ben Graham Stock Screener', desc: 'Benjamin Graham, a pioneer in value investing and mentor to Warren Buffett, advocated for buying stocks trading significantly cheaper than their underlying worth.', query: 'PE Ratio < 15 AND PB Ratio < 1.5' },
    { title: 'Warren Buffet Cigar Butt', desc: 'What Warren buffet used to look for in the early days - companies which are trading below working capital and have low debt.', query: 'Debt to Equity < 0.1 AND PB Ratio < 1' },
    { title: 'Dividend Superstars', desc: 'Stocks trading at dividend yield > 5% based on latest price.', query: 'Dividend Yield > 5' },
    { title: 'Reasonably Valued Domestic Healthcare Companies', desc: 'Healthcare companies trading at a decent valuation.', query: 'Sector = Healthcare AND PE Ratio < 25' }
  ]
}

function ScreenerPage() {
  const [columns, setColumns] = useState<string[]>(defaultColumns)
  const [rows, setRows] = useState<ScreenerResultRow[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('Stock Screener')
  const [hasRunQuery, setHasRunQuery] = useState(true)

  const filterMutation = useScreenerFilter()

  const runQuery = async (nextQuery: string) => {
    setQuery(nextQuery)
    setError('')
    setHasRunQuery(true)

    try {
      const response = await filterMutation.mutateAsync({
        query: nextQuery,
        columns,
        page: 1,
        limit: 100,
      })
      setRows(response.data)
    } catch (requestError) {
      setRows([])
      setError(requestError instanceof Error ? requestError.message : 'Unable to run screener query')
    }
  }

  useEffect(() => {
    void runQuery('')
  }, [])

  const exportCsv = () => {
    const header = columns.join(',')
    const lines = rows.map((row) => columns.map((column) => `${row[column as keyof typeof row] ?? ''}`).join(','))
    const csv = [header, ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'screener-results.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex border-b border-[var(--border)] overflow-x-auto hidden-scrollbar">
        {['Popular Screens', 'Stock Screener', 'Advanced Screener', 'Saved Screens', 'Public Screens'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab)
              if (tab === 'Popular Screens') {
                setHasRunQuery(false)
              } else if (!hasRunQuery) {
                void runQuery('')
              }
            }}
            className={`px-4 py-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-yellow-400 text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {!hasRunQuery ? (
        <div className="space-y-8 animate-fade-in bg-white dark:bg-slate-900 p-2 md:p-6 rounded-2xl">
          <h1 className="text-xl font-bold">Popular Stock Screens</h1>

          {Object.entries(popularScreens).map(([category, screens]) => (
            <section key={category}>
              <h2 className="mb-4 text-sm font-semibold text-slate-500 uppercase tracking-widest">{category}</h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {screens.map((screen) => (
                  <article
                    key={screen.title}
                    className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-white dark:bg-slate-800 p-4 transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{screen.title}</h3>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-3">
                        {screen.desc}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('Stock Screener')
                        void runQuery(screen.query)
                      }}
                      className="mt-6 self-end text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      Run Query
                    </button>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {error && <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-500">{error}</p>}
          
          <NaturalLanguageSearch
            onApplyFilters={(parsed: ParsedScreenerQuery) => {
              const operatorMap: Record<string, string> = { gt: '>', gte: '>=', lt: '<', lte: '<=', eq: '=' }
              const nlQuery = parsed.filters
                .map((f) => {
                  if (f.operator === 'between' && f.value2 != null) {
                    return `${f.metric} >= ${f.value} AND ${f.metric} <= ${f.value2}`
                  }
                  return `${f.metric} ${operatorMap[f.operator] ?? '='} ${f.value}`
                })
                .join(` ${parsed.logic || 'AND'} `)
              void runQuery(nlQuery)
            }}
          />
          <FilterBuilder onApply={runQuery} />
          <section className="card-shell p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--text-muted)]">Active Query</p>
                <p className="mt-1 text-sm font-medium">{query}</p>
              </div>
              <button
                onClick={() => setHasRunQuery(false)}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Clear Query
              </button>
            </div>
          </section>
          <ResultsTable rows={rows} columns={columns} onColumnsChange={setColumns} onExport={exportCsv} />
        </div>
      )}
    </div>
  )
}

export default ScreenerPage
