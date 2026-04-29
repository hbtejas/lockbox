// /app/dashboard/sip-calculator/page.tsx
'use client';
import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { Calculator, TrendingUp, Wallet, Coins, RefreshCcw } from 'lucide-react';

export default function SIPCalculator() {
  const [monthlySip, setMonthlySip] = useState(5000);
  const [years, setYears] = useState(10);
  const [returnRate, setReturnRate] = useState(12);
  const [stepUp, setStepUp] = useState(10);

  const results = useMemo(() => {
    let totalInvested = 0;
    let totalValue = 0;
    const chartData = [];

    let currentSip = monthlySip;

    for (let year = 1; year <= years; year++) {
      let yearlyInvested = 0;
      for (let month = 1; month <= 12; month++) {
        yearlyInvested += currentSip;
        totalValue = (totalValue + currentSip) * (1 + (returnRate / 100) / 12);
      }
      totalInvested += yearlyInvested;
      chartData.push({
        year: `Year ${year}`,
        invested: Math.round(totalInvested),
        value: Math.round(totalValue),
        returns: Math.round(totalValue - totalInvested)
      });
      currentSip = currentSip * (1 + stepUp / 100);
    }

    return { totalInvested, totalValue, totalReturns: totalValue - totalInvested, chartData };
  }, [monthlySip, years, returnRate, stepUp]);

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-20">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">SIP Calculator</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2">Plan your wealth creation with step-up SIPs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* INPUTS */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass p-8 rounded-[40px] border-white/5 space-y-8">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Calculator className="w-4 h-4 text-indigo-400" /> Investment Parameters
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Monthly SIP</label>
                  <span className="text-sm font-black number-font text-white">₹{monthlySip.toLocaleString()}</span>
                </div>
                <input 
                  type="range" min="500" max="100000" step="500"
                  value={monthlySip} onChange={(e) => setMonthlySip(Number(e.target.value))}
                  className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Duration (Years)</label>
                  <span className="text-sm font-black number-font text-white">{years} Years</span>
                </div>
                <input 
                  type="range" min="1" max="30" step="1"
                  value={years} onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Expected Return (%)</label>
                  <span className="text-sm font-black number-font text-white">{returnRate}%</span>
                </div>
                <input 
                  type="range" min="1" max="30" step="0.5"
                  value={returnRate} onChange={(e) => setReturnRate(Number(e.target.value))}
                  className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Annual Step-up (%)</label>
                  <span className="text-sm font-black number-font text-white">{stepUp}%</span>
                </div>
                <input 
                  type="range" min="0" max="25" step="1"
                  value={stepUp} onChange={(e) => setStepUp(Number(e.target.value))}
                  className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* RESULTS */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass p-6 rounded-[32px] border-white/5 bg-gradient-to-br from-indigo-600/10 to-transparent">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Invested</p>
                <p className="text-xl font-black number-font text-white">₹{Math.round(results.totalInvested).toLocaleString()}</p>
              </div>
              <div className="glass p-6 rounded-[32px] border-white/5">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Estimated Returns</p>
                <p className="text-xl font-black number-font text-green-500">₹{Math.round(results.totalReturns).toLocaleString()}</p>
              </div>
              <div className="glass p-6 rounded-[32px] border-white/5 bg-indigo-600/20 border-indigo-500/30">
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Corpus</p>
                <p className="text-2xl font-black number-font text-indigo-400">₹{Math.round(results.totalValue).toLocaleString()}</p>
              </div>
            </div>

            <div className="glass p-8 rounded-[40px] border-white/5">
              <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" /> Wealth Projection
              </h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={results.chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
                    <XAxis dataKey="year" stroke="#4b5563" fontSize={10} fontWeight="bold" />
                    <YAxis stroke="#4b5563" fontSize={10} fontWeight="bold" tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111118', border: '1px solid #1e1e2e', borderRadius: '16px' }}
                      itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} name="Total Value" />
                    <Area type="monotone" dataKey="invested" stroke="#94a3b8" fillOpacity={0.1} fill="#94a3b8" strokeWidth={2} name="Invested" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
