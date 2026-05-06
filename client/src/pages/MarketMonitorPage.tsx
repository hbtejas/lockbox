import { useState } from 'react'
import {
  useMarketIndices,
  useLivePrices,
  useMarketGainers,
  useMarketLosers,
  useMarketMostActive
} from '../hooks/useMarketData'

function formatINR(value: number): string {
  if (value === undefined || value === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatMarketCap(value: number): string {
  if (value === undefined || value === null) return '—';
  const cr = value / 1e7;
  if (cr >= 1_00_000) return `₹${(cr / 1_00_000).toFixed(2)}L Cr`;
  if (cr >= 1_000)    return `₹${(cr / 1_000).toFixed(2)}K Cr`;
  return `₹${cr.toFixed(2)} Cr`;
}

function formatNumber(value: number): string {
  if (value === undefined || value === null) return '—';
  return new Intl.NumberFormat('en-IN').format(value);
}

function MarketMonitorPage() {
  const [activeTab, setActiveTab] = useState('All Stocks')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: indices } = useMarketIndices()
  const { data: allStocks, isLoading: loadingAll } = useLivePrices()
  const { data: gainers } = useMarketGainers()
  const { data: losers } = useMarketLosers()
  const { data: active } = useMarketMostActive()

  const getTableData = () => {
    switch (activeTab) {
      case 'Gainers': return gainers || []
      case 'Losers': return losers || []
      case 'Most Active': return active || []
      default: return allStocks || []
    }
  }

  const tableData = getTableData().filter((s: any) => 
    s.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="bg-[var(--bg-main)] min-h-screen">
      <div className="pt-6 px-6 pb-20 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Market Monitor</h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">
          Live market data from NSE & BSE. Refreshed automatically.
        </p>

        {/* Indices Section */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {(indices || []).map((idx: any) => (
            <div key={idx.symbol} className="glass p-4 rounded-xl flex flex-col justify-between">
              <span className="text-xs text-[var(--text-muted)] uppercase font-bold">{idx.name}</span>
              <div className="mt-2 text-lg font-bold text-white">{formatNumber(idx.value)}</div>
              <div className={`text-xs font-semibold mt-1 ${idx.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {idx.changePercent >= 0 ? '+' : ''}{idx.changePercent?.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>

        {/* Tabs & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex gap-2 p-1 bg-[#1a1a2e]/60 rounded-lg border border-[var(--glass-border)] w-full md:w-auto overflow-x-auto">
            {['All Stocks', 'Gainers', 'Losers', 'Most Active'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white shadow-lg'
                    : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <input 
            type="text" 
            placeholder="Search symbol or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 px-4 py-2 bg-[#1a1a2e]/60 border border-[var(--glass-border)] rounded-lg text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
          />
        </div>

        {/* Table Section */}
        <div className="glass rounded-xl overflow-hidden overflow-x-auto">
          {loadingAll ? (
            <div className="p-8 text-center text-[var(--text-muted)] animate-pulse">Loading market data...</div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-white/5 border-b border-[var(--glass-border)] text-[var(--text-muted)]">
                  <th className="px-6 py-4 font-semibold uppercase text-xs">Symbol</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs">Company Name</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs">Sector</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Price (₹)</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Change (%)</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Volume</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Market Cap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--glass-border)]">
                {tableData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-[var(--text-muted)]">No stocks found matching your criteria.</td>
                  </tr>
                ) : (
                  tableData.map((row: any) => (
                    <tr key={row.symbol} className="hover:bg-white/5 transition-colors cursor-pointer group">
                      <td className="px-6 py-4 font-bold text-white group-hover:text-[var(--brand-primary)] transition-colors">{row.symbol}</td>
                      <td className="px-6 py-4 text-white/90 truncate max-w-[200px]">{row.name}</td>
                      <td className="px-6 py-4 text-[var(--text-muted)] text-xs">{row.sector || '—'}</td>
                      <td className="px-6 py-4 text-right font-semibold text-white">{formatINR(row.price)}</td>
                      <td className={`px-6 py-4 text-right font-bold ${row.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {row.changePercent >= 0 ? '+' : ''}{row.changePercent?.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 text-right text-[var(--text-muted)]">{formatNumber(row.volume)}</td>
                      <td className="px-6 py-4 text-right text-[var(--text-muted)]">{formatMarketCap(row.marketCap)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default MarketMonitorPage
