// /app/dashboard/screener/page.tsx
'use client';
import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useMarketStore } from '@/store/marketStore';
import type { StockQuote } from '@/types';
import { cn } from '@/lib/utils';
import { Filter, Search, RotateCcw, ChevronDown, Check, LayoutGrid, List } from 'lucide-react';

export default function StockScreenerPage() {
  const { stocks } = useMarketStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    sector: 'All',
    minPrice: 0,
    maxPrice: 100000,
    minChange: -20,
    maxChange: 20,
  });

  const sectors = useMemo(() => {
    const s = new Set<string>();
    s.add('All');
    if (Array.isArray(stocks)) {
      stocks.forEach(stock => { if (stock.sector) s.add(stock.sector); });
    }
    return Array.from(s);
  }, [stocks]);

  const filteredStocks = useMemo(() => {
    if (!Array.isArray(stocks)) return [];
    return stocks.filter(stock => {
      const matchesSearch = stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           stock.shortName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector = filters.sector === 'All' || stock.sector === filters.sector;
      const matchesPrice = stock.regularMarketPrice >= filters.minPrice && stock.regularMarketPrice <= filters.maxPrice;
      const matchesChange = stock.regularMarketChangePercent >= filters.minChange && stock.regularMarketChangePercent <= filters.maxChange;
      
      return matchesSearch && matchesSector && matchesPrice && matchesChange;
    });
  }, [stocks, searchQuery, filters]);

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-20">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Market Screener</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2">Filter and discover high-potential Indian stocks</p>
        </div>

        {/* CONTROLS */}
        <div className="glass p-8 rounded-[40px] border-white/5 space-y-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search symbol or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setViewMode('list')}
                className={cn("p-4 rounded-2xl transition-all", viewMode === 'list' ? "bg-indigo-600 text-white" : "bg-white/5 text-gray-500")}
              ><List className="w-4 h-4" /></button>
              <button 
                onClick={() => setViewMode('grid')}
                className={cn("p-4 rounded-2xl transition-all", viewMode === 'grid' ? "bg-indigo-600 text-white" : "bg-white/5 text-gray-500")}
              ><LayoutGrid className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-4 border-t border-white/5">
            <FilterSelect 
              label="Sector" 
              options={sectors} 
              value={filters.sector} 
              onChange={(val: string) => setFilters({ ...filters, sector: val })} 
            />
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Price Range</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={filters.minPrice} 
                  onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold"
                />
                <span className="text-gray-700">-</span>
                <input 
                  type="number" 
                  value={filters.maxPrice} 
                  onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Daily Change %</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={filters.minChange} 
                  onChange={(e) => setFilters({ ...filters, minChange: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold"
                />
                <span className="text-gray-700">-</span>
                <input 
                  type="number" 
                  value={filters.maxChange} 
                  onChange={(e) => setFilters({ ...filters, maxChange: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button 
                onClick={() => setFilters({ sector: 'All', minPrice: 0, maxPrice: 100000, minChange: -20, maxChange: 20 })}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all"
              >
                <RotateCcw className="w-3 h-3" /> Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* RESULTS */}
        {viewMode === 'list' ? (
          <div className="glass rounded-[40px] border-white/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                  <th className="px-8 py-6 text-left">Company</th>
                  <th className="px-8 py-6 text-left">Sector</th>
                  <th className="px-8 py-6 text-right">Price</th>
                  <th className="px-8 py-6 text-right">Change</th>
                  <th className="px-8 py-6 text-right">Market Cap</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.map((stock) => (
                  <tr key={stock.symbol} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors cursor-pointer group">
                    <td className="px-8 py-4">
                      <p className="font-black text-xs group-hover:text-indigo-400 transition-colors">{stock.symbol.split('.')[0]}</p>
                      <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest truncate max-w-[200px]">{stock.shortName}</p>
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full text-gray-400">{stock.sector}</span>
                    </td>
                    <td className="px-8 py-4 text-right text-xs font-black number-font">₹{stock.regularMarketPrice.toLocaleString()}</td>
                    <td className={cn("px-8 py-4 text-right text-xs font-black number-font", stock.regularMarketChangePercent >= 0 ? "text-green-500" : "text-red-500")}>
                      {stock.regularMarketChangePercent >= 0 ? '+' : ''}{stock.regularMarketChangePercent.toFixed(2)}%
                    </td>
                    <td className="px-8 py-4 text-right text-xs font-black text-gray-500 number-font">
                      ₹{stock.marketCap ? (stock.marketCap / 10000000).toFixed(0) : '0'}Cr
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredStocks.map((stock) => (
              <div key={stock.symbol} className="glass p-8 rounded-[40px] border-white/5 space-y-6 hover:border-indigo-500/30 transition-all cursor-pointer group">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-black group-hover:text-indigo-400 transition-colors">{stock.symbol.split('.')[0]}</h4>
                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{stock.sector}</p>
                  </div>
                  <div className={cn("px-2 py-1 rounded-lg text-[9px] font-black", stock.regularMarketChangePercent >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                    {stock.regularMarketChangePercent.toFixed(2)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-black number-font">₹{stock.regularMarketPrice.toLocaleString()}</p>
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                    Market Cap: ₹{stock.marketCap ? (stock.marketCap / 10000000).toFixed(0) : '0'}Cr
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function FilterSelect({ label, options, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <select 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold appearance-none focus:outline-none focus:border-indigo-500 transition-all"
        >
          {options.map((opt: string) => <option key={opt} value={opt} className="bg-[#111118]">{opt}</option>)}
        </select>
        <ChevronDown className="w-3 h-3 absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
      </div>
    </div>
  );
}
