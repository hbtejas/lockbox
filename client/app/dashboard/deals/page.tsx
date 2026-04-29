// /app/dashboard/deals/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';
import { Search, Filter, Download, ArrowUpRight, ArrowDownRight, Layers, DollarSign } from 'lucide-react';

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Bulk' | 'Block'>('Bulk');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/deals')
      .then(res => res.json())
      .then(data => {
        setDeals(data);
        setLoading(false);
      });
  }, []);

  const filteredDeals = deals.filter(d => 
    d.category === activeTab && 
    (d.symbol.toLowerCase().includes(search.toLowerCase()) || d.client.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    buy: filteredDeals.filter(d => d.type === 'BUY').reduce((acc, d) => acc + parseFloat(d.value), 0),
    sell: filteredDeals.filter(d => d.type === 'SELL').reduce((acc, d) => acc + parseFloat(d.value), 0),
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">Bulk & Block Deals</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2">Track big money movements in the market</p>
          </div>
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass p-6 rounded-[32px] border-white/5">
            <div className="flex items-center gap-2 text-gray-500 mb-4">
              <ArrowUpRight className="w-4 h-4 text-green-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Total Buy Value</span>
            </div>
            <p className="text-2xl font-black number-font text-green-500">₹{stats.buy.toFixed(2)} Cr</p>
          </div>
          <div className="glass p-6 rounded-[32px] border-white/5">
            <div className="flex items-center gap-2 text-gray-500 mb-4">
              <ArrowDownRight className="w-4 h-4 text-red-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Total Sell Value</span>
            </div>
            <p className="text-2xl font-black number-font text-red-500">₹{stats.sell.toFixed(2)} Cr</p>
          </div>
          <div className="glass p-6 rounded-[32px] border-white/5">
            <div className="flex items-center gap-2 text-gray-500 mb-4">
              <DollarSign className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">Net Value</span>
            </div>
            <p className={cn("text-2xl font-black number-font", (stats.buy - stats.sell) >= 0 ? "text-green-500" : "text-red-500")}>
              ₹{Math.abs(stats.buy - stats.sell).toFixed(2)} Cr
            </p>
          </div>
        </div>

        {/* SEARCH & TABS */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white/5 p-4 rounded-[32px]">
          <div className="flex gap-2">
            {['Bulk', 'Block'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === tab ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-white"
                )}
              >
                {tab} Deals
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search by stock or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="glass rounded-[40px] border-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                <th className="px-8 py-6 text-left">Date</th>
                <th className="px-8 py-6 text-left">Symbol</th>
                <th className="px-8 py-6 text-left">Client Name</th>
                <th className="px-8 py-6 text-center">Type</th>
                <th className="px-8 py-6 text-right">Quantity</th>
                <th className="px-8 py-6 text-right">Price</th>
                <th className="px-8 py-6 text-right">Value (Cr)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-8 py-20 text-center text-gray-500 animate-pulse font-black uppercase text-[10px] tracking-widest">Fetching NSE Deals...</td></tr>
              ) : filteredDeals.map((deal, i) => (
                <tr key={i} className={cn(
                  "border-b border-white/5 hover:bg-white/[0.01] transition-colors",
                  deal.type === 'BUY' ? "bg-green-500/[0.02]" : "bg-red-500/[0.02]"
                )}>
                  <td className="px-8 py-4 text-[10px] font-black text-gray-500">{deal.date}</td>
                  <td className="px-8 py-4 text-xs font-black">{deal.symbol}</td>
                  <td className="px-8 py-4 text-[10px] font-bold text-gray-400">{deal.client}</td>
                  <td className="px-8 py-4 text-center">
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                      deal.type === 'BUY' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>{deal.type}</span>
                  </td>
                  <td className="px-8 py-4 text-right text-xs font-black number-font">{deal.qty}</td>
                  <td className="px-8 py-4 text-right text-xs font-black number-font">₹{deal.price}</td>
                  <td className="px-8 py-4 text-right text-xs font-black number-font">₹{deal.value} Cr</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
