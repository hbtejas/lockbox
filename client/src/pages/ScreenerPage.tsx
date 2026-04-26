import { useState, useEffect } from 'react'
import FilterBuilder from '../components/screener/FilterBuilder'
import NaturalLanguageSearch from '../components/screener/NaturalLanguageSearch'
import ResultsTable from '../components/screener/ResultsTable'
import { useScreenerFilter } from '../hooks/useScreener'
import ScreenerSkeleton from '../components/screener/ScreenerSkeleton'
import type { ScreenerResultRow } from '../api/screenerApi'
import type { ParsedScreenerQuery } from '../types/ai'

const defaultColumns = ['score', 'company', 'sector', 'marketCap', 'peRatio', 'roce', 'revenueGrowth', 'insights']

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
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('Stock Screener')
  const [hasRunQuery, setHasRunQuery] = useState(true)
  const [loading, setLoading] = useState(false)

  const filterMutation = useScreenerFilter()

  const runQuery = async (nextQuery: string, nextPage: number = 1, append: boolean = false) => {
    setQuery(nextQuery)
    setError('')
    setHasRunQuery(true)
    setLoading(true)
    setPage(nextPage)

    try {
      const response = await filterMutation.mutateAsync({
        query: nextQuery,
        columns,
        page: nextPage,
        limit: 100,
      })
      
      setRows(prev => append ? [...prev, ...response.data] : response.data)
      setTotal(response.total)
    } catch (requestError) {
      if (!append) setRows([])
      setError(requestError instanceof Error ? requestError.message : 'Unable to run screener query')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllPages = async (nextQuery: string) => {
    setQuery(nextQuery)
    setError('')
    setHasRunQuery(true)
    setLoading(true)
    
    let allRows: ScreenerResultRow[] = []
    let currentPage = 1
    let totalRecords = 0
    
    try {
      do {
        const response = await filterMutation.mutateAsync({
          query: nextQuery,
          columns,
          page: currentPage,
          limit: 100,
        })
        allRows = [...allRows, ...response.data]
        totalRecords = response.total
        currentPage++
      } while (allRows.length < totalRecords && currentPage < 10)
      
      setRows(allRows)
      setTotal(totalRecords)
      setPage(currentPage - 1)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Error fetching all pages')
    } finally {
      setLoading(false)
    }
  }

  const exportCsv = () => {
    const headers = columns.join(',')
    const csvContent = rows
      .map((row) => columns.map((col) => (row as any)[col]).join(','))
      .join('\n')
    const blob = new Blob([`${headers}\n${csvContent}`], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `screener_results_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Professional Sidebar: Saved Strategies */}
      <aside className="space-y-6">
        <section className="card-shell p-4 border-slate-200/60 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Saved Strategies</h3>
          <div className="space-y-2">
            {Object.values(popularScreens).flat().slice(0, 8).map((screen) => (
              <button
                key={screen.title}
                onClick={() => void runQuery(screen.query)}
                className={`w-full text-left p-2.5 rounded-lg text-[11px] font-bold transition-all border ${
                  query === screen.query 
                    ? 'bg-brand-50 text-brand-600 border-brand-100 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 border-transparent'
                }`}
              >
                {screen.title}
              </button>
            ))}
          </div>
        </section>

        <section className="card-shell p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-xl">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Power User Tip</h3>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Use the <span className="text-amber-400 font-bold">Natural Language Search</span> to find complex ideas like "Companies with zero debt and ROCE > 25%".
          </p>
        </section>
      </aside>

      <main className="space-y-4">
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-500 font-bold">{error}</p>}
        
        <div className="card-shell p-4 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-sm border-slate-200/60">
          <div className="flex-1 w-full">
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
          </div>
          <div className="flex gap-2 shrink-0">
            <FilterBuilder onApply={runQuery} />
            <button
              onClick={() => { setQuery(''); void runQuery('') }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        <section className="flex items-center justify-between px-2">
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">Research Results</h1>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              Active Strategy: <span className="font-bold text-slate-900 italic opacity-75">{query || 'Unfiltered List'}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
              {rows.length} / {total} Matches
            </p>
            {rows.length < total && !loading && (
              <button
                onClick={() => void fetchAllPages(query)}
                className="text-[11px] font-black text-brand-600 hover:underline tracking-tight"
              >
                FETCH ALL DATA
              </button>
            )}
          </div>
        </section>

        {loading && rows.length === 0 ? (
          <ScreenerSkeleton />
        ) : (
          <ResultsTable rows={rows} columns={columns} onColumnsChange={setColumns} onExport={exportCsv} />
        )}

        {rows.length < total && (
          <div className="flex justify-center py-6">
            <button
              disabled={loading}
              onClick={() => void runQuery(query, page + 1, true)}
              className="rounded-full bg-slate-900 px-8 py-2.5 text-[11px] font-bold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              {loading ? 'Optimizing Feed...' : `Load Next ${Math.min(100, total - rows.length)} Positions`}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default ScreenerPage
