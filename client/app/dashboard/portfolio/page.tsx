// /app/dashboard/portfolio/page.tsx
'use client';
import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useMarketStore } from '@/store/marketStore';
import type { Holding } from '@/types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { 
  Plus, Trash2, Briefcase, TrendingUp, TrendingDown,
  ChevronRight, ArrowRight, Wallet, History, Search, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function PortfolioPage() {
  const { portfolio, stocks, addHolding, removeHolding } = useMarketStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newHolding, setNewHolding] = useState<Omit<Holding, 'id' | 'shortName'>>({
    symbol: '',
    quantity: 0,
    buyPrice: 0,
    buyDate: new Date().toISOString().split('T')[0],
    broker: 'Zerodha'
  });

  const portfolioStats = useMemo(() => {
    let invested = 0;
    let current = 0;

    const holdings = portfolio.map(h => {
      const stock = Array.isArray(stocks) ? stocks.find(s => s.symbol === h.symbol) : null;
      const currentPrice = stock?.regularMarketPrice || h.buyPrice;
      const value = h.quantity * currentPrice;
      const cost = h.quantity * h.buyPrice;
      const pnl = value - cost;
      const pnlPerc = (pnl / cost) * 100;

      invested += cost;
      current += value;

      return { ...h, currentPrice, value, cost, pnl, pnlPerc };
    });

    const totalPnL = current - invested;
    const totalPnLPerc = invested > 0 ? (totalPnL / invested) * 100 : 0;

    return { holdings, invested, current, totalPnL, totalPnLPerc };
  }, [portfolio, stocks]);

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">My Portfolio</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2">Asset allocation and performance tracking</p>
          </div>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" /> Add Assets
          </button>
        </div>

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard label="Total Invested" value={`₹${portfolioStats.invested.toLocaleString()}`} icon={Wallet} color="text-gray-400" />
          <StatCard label="Current Value" value={`₹${portfolioStats.current.toLocaleString()}`} icon={Briefcase} color="text-indigo-400" />
          <StatCard 
            label="Total Returns" 
            value={`₹${portfolioStats.totalPnL.toLocaleString()}`} 
            subValue={`${portfolioStats.totalPnLPerc.toFixed(2)}%`}
            icon={portfolioStats.totalPnL >= 0 ? TrendingUp : TrendingDown} 
            color={portfolioStats.totalPnL >= 0 ? "text-green-500" : "text-red-500"} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* HOLDINGS TABLE */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-black flex items-center gap-4">
              <History className="w-6 h-6 text-indigo-400" />
              Asset Breakdown
            </h3>
            <div className="glass rounded-[40px] border-white/5 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                    <th className="px-8 py-6 text-left">Instrument</th>
                    <th className="px-8 py-6 text-right">Qty</th>
                    <th className="px-8 py-6 text-right">Avg. Price</th>
                    <th className="px-8 py-6 text-right">LTP</th>
                    <th className="px-8 py-6 text-right">Returns</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioStats.holdings.map((h) => (
                    <tr key={h.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                      <td className="px-8 py-4">
                        <p className="font-black text-xs">{h.symbol.split('.')[0]}</p>
                        <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{h.broker}</p>
                      </td>
                      <td className="px-8 py-4 text-right text-xs font-black number-font">{h.quantity}</td>
                      <td className="px-8 py-4 text-right text-xs font-black number-font text-gray-400">₹{h.buyPrice.toLocaleString()}</td>
                      <td className="px-8 py-4 text-right text-xs font-black number-font">₹{h.currentPrice.toLocaleString()}</td>
                      <td className="px-8 py-4 text-right">
                        <p className={cn("text-xs font-black number-font", h.pnl >= 0 ? "text-green-500" : "text-red-500")}>
                          {h.pnl >= 0 ? '+' : ''}₹{h.pnl.toLocaleString()}
                        </p>
                        <p className={cn("text-[9px] font-bold", h.pnl >= 0 ? "text-green-500/50" : "text-red-500/50")}>
                          {h.pnlPerc.toFixed(2)}%
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ALLOCATION CHART */}
          <div className="space-y-6">
            <h3 className="text-xl font-black flex items-center gap-4">
              <PieChart className="w-6 h-6 text-indigo-400" />
              Allocation
            </h3>
            <div className="glass h-[400px] rounded-[48px] border-white/5 p-8 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioStats.holdings}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {portfolioStats.holdings.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                {portfolioStats.holdings.slice(0, 4).map((h, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{h.symbol.split('.')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADD MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-md glass p-10 rounded-[48px] border-white/10 space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black tracking-tighter">Add to Portfolio</h2>
              <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search stock..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-all"
                />
                {searchQuery && (
                  <div className="absolute top-full left-0 w-full bg-[#111118] border border-white/10 rounded-2xl mt-2 z-50 shadow-2xl max-h-48 overflow-auto">
                    {Array.isArray(stocks) && stocks.filter(s => s.symbol.toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
                      <div 
                        key={s.symbol}
                        onClick={() => {
                          setNewHolding({ ...newHolding, symbol: s.symbol, buyPrice: s.regularMarketPrice });
                          setSearchQuery(s.symbol);
                        }}
                        className="px-4 py-3 hover:bg-white/5 cursor-pointer text-xs font-bold"
                      >
                        {s.symbol.split('.')[0]} - {s.shortName}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Quantity</label>
                  <input 
                    type="number" 
                    value={newHolding.quantity}
                    onChange={(e) => setNewHolding({ ...newHolding, quantity: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg font-black number-font focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Buy Price</label>
                  <input 
                    type="number" 
                    value={newHolding.buyPrice}
                    onChange={(e) => setNewHolding({ ...newHolding, buyPrice: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg font-black number-font focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button 
                onClick={() => {
                  if (newHolding.symbol && newHolding.quantity > 0) {
                    const stock = Array.isArray(stocks) ? stocks.find(s => s.symbol === newHolding.symbol) : null;
                    addHolding({
                      ...newHolding,
                      shortName: stock?.shortName || newHolding.symbol,
                    });
                    setIsAddOpen(false);
                    setSearchQuery('');
                  }
                }}
                className="w-full py-5 bg-indigo-600 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20"
              >
                Add Transaction 💼
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function StatCard({ label, value, subValue, icon: Icon, color }: any) {
  return (
    <div className="glass p-10 rounded-[48px] border-white/5 space-y-4">
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-baseline gap-3">
          <h3 className="text-3xl font-black number-font">{value}</h3>
          {subValue && <span className={cn("text-sm font-black", color)}>{subValue}</span>}
        </div>
      </div>
    </div>
  );
}

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#ef4444', '#f59e0b'];
