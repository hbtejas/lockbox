// /app/dashboard/options/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { TrendingUp, TrendingDown, Target, Zap, Clock } from 'lucide-react';

export default function OptionsChainPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(60);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/options');
      const json = await res.json();
      setData(json);
      setLoading(false);
      setCountdown(60);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchData();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading || !data || !data.strikes) return (
    <DashboardLayout>
      <div className="space-y-8 animate-pulse">
        <div className="h-32 bg-white/5 rounded-[40px]" />
        <div className="h-[600px] bg-white/5 rounded-[40px]" />
      </div>
    </DashboardLayout>
  );

  const { spotPrice: underlyingPrice = 0, pcr = 0, strikes = [] } = data;
  const maxPain = data.maxPain || underlyingPrice;
  
  // Find ATM strike
  const atmStrike = strikes.length > 0 
    ? strikes.reduce((prev: any, curr: any) => 
        Math.abs(curr.strike - underlyingPrice) < Math.abs(prev.strike - underlyingPrice) ? curr : prev
      ).strike
    : 0;

  // Data is already filtered/sorted by API usually, but let's ensure it's ready for chart
  const chartData = strikes.map((s: any) => ({
    strike: s.strike,
    callOI: s.callOI || 0,
    putOI: s.putOI || 0,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-20">
        {/* SECTION A — Key Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass p-6 rounded-[32px] border-white/5">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Nifty Spot</span>
            </div>
            <p className="text-2xl font-black number-font">₹{underlyingPrice.toLocaleString()}</p>
          </div>
          
          <div className="glass p-6 rounded-[32px] border-white/5">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">PCR Ratio</span>
            </div>
            <p className={cn(
              "text-2xl font-black number-font",
              pcr > 1.2 ? "text-green-500" : pcr < 0.8 ? "text-red-500" : "text-white"
            )}>{pcr.toFixed(2)}</p>
          </div>

          <div className="glass p-6 rounded-[32px] border-white/5">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Target className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Max Pain</span>
            </div>
            <p className="text-2xl font-black number-font text-indigo-400">₹{maxPain.toLocaleString()}</p>
          </div>

          <div className="glass p-6 rounded-[32px] border-white/5 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Clock className="w-3 h-3" />
              <span className="text-[9px] font-black uppercase tracking-widest">Next Refresh</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-1000" 
                style={{ width: `${(countdown / 60) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* SECTION B — Options Chain Table */}
        <div className="glass rounded-[40px] border-white/5 overflow-hidden">
          <div className="grid grid-cols-11 bg-black/20 border-b border-white/5 text-[9px] font-black uppercase tracking-widest py-4 px-6">
            <div className="col-span-5 text-center text-green-500 border-r border-white/5">CALLS</div>
            <div className="text-center text-indigo-400">STRIKE</div>
            <div className="col-span-5 text-center text-red-500 border-l border-white/5">PUTS</div>
          </div>
          
          <div className="grid grid-cols-11 border-b border-white/10 text-[8px] font-black text-gray-500 uppercase py-2 px-6">
            <div>OI</div><div>CHG</div><div>VOL</div><div>IV</div><div>LTP</div>
            <div className="text-center text-white">-</div>
            <div className="text-right">LTP</div><div className="text-right">IV</div><div className="text-right">VOL</div><div className="text-right">CHG</div><div className="text-right">OI</div>
          </div>

          <div className="max-h-[600px] overflow-auto">
            {strikes.map((s: any) => {
              const strike = s.strike;
              const isATM = strike === atmStrike;
              const isCallITM = strike < underlyingPrice;
              const isPutITM = strike > underlyingPrice;

              return (
                <div 
                  key={strike} 
                  className={cn(
                    "grid grid-cols-11 items-center px-6 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors",
                    isATM && "bg-indigo-500/10 border-y border-indigo-500/30"
                  )}
                >
                  {/* CALLS */}
                  <div className={cn("text-[10px] font-bold", isCallITM && "text-green-400")}>{s.callOI?.toLocaleString()}</div>
                  <div className="text-[10px] font-medium text-gray-500">{s.callOIChange?.toFixed(1)}</div>
                  <div className="text-[10px] font-medium text-gray-500">{s.callVolume?.toLocaleString()}</div>
                  <div className="text-[10px] font-medium text-gray-500">{s.callIV?.toFixed(1)}</div>
                  <div className="text-[10px] font-black number-font">₹{s.callLTP?.toFixed(1)}</div>

                  {/* STRIKE */}
                  <div className="text-center">
                    <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-[10px] font-black number-font text-indigo-400">
                      {strike}
                    </span>
                  </div>

                  {/* PUTS */}
                  <div className="text-[10px] font-black number-font text-right">₹{s.putLTP?.toFixed(1)}</div>
                  <div className="text-[10px] font-medium text-gray-500 text-right">{s.putIV?.toFixed(1)}</div>
                  <div className="text-[10px] font-medium text-gray-500 text-right">{s.putVolume?.toLocaleString()}</div>
                  <div className="text-[10px] font-medium text-gray-500 text-right">{s.putOIChange?.toFixed(1)}</div>
                  <div className={cn("text-[10px] font-bold text-right", isPutITM && "text-red-400")}>{s.putOI?.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION C — OI Chart */}
        <div className="glass p-8 rounded-[40px] border-white/5">
          <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" /> Open Interest Distribution
          </h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
                <XAxis dataKey="strike" stroke="#4b5563" fontSize={10} fontWeight="bold" />
                <YAxis stroke="#4b5563" fontSize={10} fontWeight="bold" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111118', border: '1px solid #1e1e2e', borderRadius: '16px' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                />
                <Bar dataKey="callOI" fill="#22c55e" radius={[4, 4, 0, 0]} name="Call OI" />
                <Bar dataKey="putOI" fill="#ef4444" radius={[4, 4, 0, 0]} name="Put OI" />
                <ReferenceLine x={atmStrike} stroke="#6366f1" strokeDasharray="5 5" label={{ value: 'ATM', position: 'top', fill: '#6366f1', fontSize: 10, fontWeight: 'black' }} />
                <ReferenceLine x={maxPain} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Max Pain', position: 'top', fill: '#f59e0b', fontSize: 10, fontWeight: 'black' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { BarChart2 } from 'lucide-react';
