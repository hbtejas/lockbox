// /app/dashboard/compare/page.tsx
'use client';
import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useMarketStore } from '@/store/marketStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '@/lib/utils';
import { Search, X, Repeat, Download, Share2, Scale, TrendingUp } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function ComparisonPage() {
  const { stocks } = useMarketStore();
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS']);
  const [searchQueries, setSearchQueries] = useState<string[]>(['', '', '']);
  const [timeframe, setTimeframe] = useState('1M');

  const selectedStocks = useMemo(() => {
    return selectedSymbols.map(sym => stocks.find(s => s.symbol === sym)).filter(Boolean);
  }, [selectedSymbols, stocks]);

  const chartData = useMemo(() => {
    // Simulated normalized data for demonstration
    // In a real app, this would fetch from /api/chart for all 3 symbols
    return Array.from({ length: 20 }).map((_, i) => ({
      date: `Day ${i + 1}`,
      [selectedSymbols[0]]: 0 + (Math.random() * 5 - 2) + (i * 0.2),
      [selectedSymbols[1]]: 0 + (Math.random() * 4 - 2) + (i * 0.15),
      [selectedSymbols[2]]: 0 + (Math.random() * 6 - 3) + (i * 0.25),
    }));
  }, [selectedSymbols, timeframe]);

  const handleShare = async () => {
    const element = document.getElementById('comparison-content');
    if (element) {
      const canvas = await html2canvas(element, { backgroundColor: '#0a0a0f' });
      const link = document.createElement('a');
      link.download = `lockbox-compare-${selectedSymbols.join('-')}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b'];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-20" id="comparison-content">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">Stock Comparison</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2">Analyze performance metrics across 3 symbols</p>
          </div>
          <div className="flex gap-4">
            <button onClick={handleShare} className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">
              <Download className="w-4 h-4" /> Export
            </button>
            <button className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>

        {/* SEARCH SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="relative group">
              <div className="glass p-6 rounded-[32px] border-white/5 group-hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Stock {idx + 1}</span>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Search symbol..."
                    value={searchQueries[idx]}
                    onChange={(e) => {
                      const newQueries = [...searchQueries];
                      newQueries[idx] = e.target.value;
                      setSearchQueries(newQueries);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                
                {searchQueries[idx] && (
                  <div className="absolute top-full left-0 w-full bg-[#111118] border border-white/10 rounded-2xl mt-2 z-50 shadow-2xl max-h-48 overflow-auto">
                    {stocks.filter(s => s.symbol.toLowerCase().includes(searchQueries[idx].toLowerCase())).map(s => (
                      <div 
                        key={s.symbol}
                        onClick={() => {
                          const newSymbols = [...selectedSymbols];
                          newSymbols[idx] = s.symbol;
                          setSelectedSymbols(newSymbols);
                          const newQueries = [...searchQueries];
                          newQueries[idx] = '';
                          setSearchQueries(newQueries);
                        }}
                        className="px-4 py-3 hover:bg-white/5 cursor-pointer text-xs font-bold"
                      >
                        {s.symbol.split('.')[0]} - {s.shortName}
                      </div>
                    ))}
                  </div>
                )}

                {selectedStocks[idx] && (
                  <div className="mt-4 flex justify-between items-end">
                    <div>
                      <h4 className="text-lg font-black">{selectedStocks[idx].symbol.split('.')[0]}</h4>
                      <p className="text-[10px] font-bold text-gray-500">{selectedStocks[idx].shortName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black number-font">₹{selectedStocks[idx].regularMarketPrice.toLocaleString()}</p>
                      <p className={cn(
                        "text-[10px] font-black",
                        selectedStocks[idx].regularMarketChangePercent >= 0 ? "text-green-500" : "text-red-500"
                      )}>{selectedStocks[idx].regularMarketChangePercent.toFixed(2)}%</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* COMPARISON CHART */}
        <div className="glass p-8 rounded-[40px] border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" /> Relative Returns (%)
            </h3>
            <div className="flex bg-white/5 p-1 rounded-xl">
              {['1W', '1M', '3M', '6M', '1Y'].map(t => (
                <button 
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    timeframe === t ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-300"
                  )}
                >{t}</button>
              ))}
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
                <XAxis dataKey="date" hide />
                <YAxis stroke="#4b5563" fontSize={10} fontWeight="bold" tickFormatter={(v) => `${v}%`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111118', border: '1px solid #1e1e2e', borderRadius: '16px' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                  labelStyle={{ display: 'none' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                {selectedSymbols.map((sym, i) => (
                  <Line 
                    key={sym} 
                    type="monotone" 
                    dataKey={sym} 
                    stroke={COLORS[i]} 
                    strokeWidth={3} 
                    dot={false} 
                    activeDot={{ r: 6, stroke: '#0a0a0f', strokeWidth: 2 }}
                    name={sym.split('.')[0]}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* STATS COMPARISON TABLE */}
        <div className="glass rounded-[40px] border-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                <th className="px-8 py-6 text-left">Metric</th>
                {selectedSymbols.map((sym, i) => (
                  <th key={sym} className="px-8 py-6 text-right" style={{ color: COLORS[i] }}>{sym.split('.')[0]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Current Price', key: 'regularMarketPrice', prefix: '₹' },
                { label: '1D Change %', key: 'regularMarketChangePercent', suffix: '%' },
                { label: '52W High', key: 'fiftyTwoWeekHigh', prefix: '₹' },
                { label: '52W Low', key: 'fiftyTwoWeekLow', prefix: '₹' },
                { label: 'Market Cap', key: 'marketCap', formatter: (v: number) => `₹${(v/10000000).toFixed(0)} Cr` },
                { label: 'P/E Ratio', key: 'trailingPE' },
                { label: 'Volume', key: 'regularMarketVolume', formatter: (v: number) => (v/1000000).toFixed(1) + 'M' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                  <td className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">{row.label}</td>
                  {selectedStocks.map((stock: any, sIdx) => {
                    const val = stock[row.key];
                    const displayVal = row.formatter ? row.formatter(val) : 
                                     `${row.prefix || ''}${val?.toLocaleString() || 'N/A'}${row.suffix || ''}`;
                    return (
                      <td key={sIdx} className="px-8 py-4 text-right text-xs font-black number-font">
                        {displayVal}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
