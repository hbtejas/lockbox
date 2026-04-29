// /app/dashboard/fii-dii/page.tsx
'use client';
import React, { useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { Globe, Users, TrendingUp, Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Mock data generator for 30 days of activity
const generateData = () => {
  return Array.from({ length: 30 }).map((_, i) => {
    const date = format(subDays(new Date(), 29 - i), 'dd MMM');
    const fiiNet = Math.floor(Math.random() * 6000) - 2500;
    const diiNet = Math.floor(Math.random() * 4000) - 1000;
    const nifty = 22000 + (fiiNet / 5) + (i * 20);
    return { date, fiiNet, diiNet, nifty };
  });
};

export default function FIIDIIPage() {
  const data = useMemo(() => generateData(), []);
  
  const stats = useMemo(() => {
    const today = data[data.length - 1];
    const mtdFii = data.reduce((acc, curr) => acc + curr.fiiNet, 0);
    const mtdDii = data.reduce((acc, curr) => acc + curr.diiNet, 0);
    return { today, mtdFii, mtdDii };
  }, [data]);

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">FII / DII Activity</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2">Foreign & Domestic Institutional Investor Trends</p>
          </div>
          <div className="bg-indigo-600/10 border border-indigo-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Live for {format(new Date(), 'dd MMM yyyy')}</span>
          </div>
        </div>

        {/* CARD ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'FII Net Today', val: stats.today.fiiNet, icon: Globe },
            { label: 'DII Net Today', val: stats.today.diiNet, icon: Users },
            { label: 'FII MTD', val: stats.mtdFii, icon: TrendingUp },
            { label: 'DII MTD', val: stats.mtdDii, icon: TrendingUp },
          ].map((card, i) => (
            <div key={i} className="glass p-6 rounded-[32px] border-white/5">
              <div className="flex items-center gap-2 text-gray-500 mb-4">
                <card.icon className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">{card.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className={cn(
                  "text-2xl font-black number-font",
                  card.val >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  ₹{Math.abs(card.val).toLocaleString()} Cr
                </p>
                {card.val >= 0 ? <ArrowUpRight className="w-4 h-4 text-green-500" /> : <ArrowDownRight className="w-4 h-4 text-red-500" />}
              </div>
            </div>
          ))}
        </div>

        {/* CHART SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass p-8 rounded-[40px] border-white/5">
            <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" /> Institutional Flow vs Nifty
            </h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
                  <XAxis dataKey="date" stroke="#4b5563" fontSize={10} fontWeight="bold" />
                  <YAxis yAxisId="left" stroke="#4b5563" fontSize={10} fontWeight="bold" label={{ value: 'Net Flow (Cr)', angle: -90, position: 'insideLeft', style: { fill: '#4b5563', fontSize: 10, fontWeight: 'bold' } }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#4b5563" fontSize={10} fontWeight="bold" domain={['auto', 'auto']} label={{ value: 'Nifty 50', angle: 90, position: 'insideRight', style: { fill: '#4b5563', fontSize: 10, fontWeight: 'bold' } }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111118', border: '1px solid #1e1e2e', borderRadius: '16px' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                  <Bar yAxisId="left" dataKey="fiiNet" fill="#6366f1" radius={[4, 4, 0, 0]} name="FII Net" />
                  <Line yAxisId="right" type="monotone" dataKey="nifty" stroke="#22c55e" strokeWidth={3} dot={false} name="Nifty Price" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass p-8 rounded-[40px] border-white/5 h-full flex flex-col">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-400" /> AI Flow Insights
              </h3>
              <div className="flex-1 space-y-6">
                <div className="p-6 rounded-3xl bg-green-500/10 border border-green-500/20">
                  <p className="text-xs font-bold leading-relaxed text-green-200">
                    "FIIs have been net buyers for {data.filter(d => d.fiiNet > 0).length} of the last 30 days. Current trend shows accumulation in large-cap sectors, correlating with the {((data[29].nifty - data[0].nifty)/data[0].nifty * 100).toFixed(1)}% gain in Nifty."
                  </p>
                </div>
                <div className="p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20">
                  <p className="text-xs font-bold leading-relaxed text-indigo-200">
                    "DII participation remains robust with ₹{stats.mtdDii.toLocaleString()} Cr injected this month, providing a strong floor to market corrections."
                  </p>
                </div>
              </div>
              <button className="w-full mt-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                Download Detailed PDF Report
              </button>
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="glass rounded-[40px] border-white/5 overflow-hidden">
          <div className="p-8 border-b border-white/5 bg-white/[0.02]">
            <h3 className="text-sm font-black uppercase tracking-widest">Historical Daily Flow (Last 30 Days)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                  <th className="px-8 py-4 text-left">Date</th>
                  <th className="px-8 py-4 text-right">FII Net (Cr)</th>
                  <th className="px-8 py-4 text-right">DII Net (Cr)</th>
                  <th className="px-8 py-4 text-right">Combined Net</th>
                </tr>
              </thead>
              <tbody>
                {[...data].reverse().map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-4 text-[10px] font-black text-gray-400">{row.date}</td>
                    <td className={cn(
                      "px-8 py-4 text-right text-[10px] font-black number-font",
                      row.fiiNet >= 0 ? "text-green-500" : "text-red-500"
                    )}>₹{row.fiiNet.toLocaleString()}</td>
                    <td className={cn(
                      "px-8 py-4 text-right text-[10px] font-black number-font",
                      row.diiNet >= 0 ? "text-green-500" : "text-red-500"
                    )}>₹{row.diiNet.toLocaleString()}</td>
                    <td className={cn(
                      "px-8 py-4 text-right text-[10px] font-black number-font",
                      (row.fiiNet + row.diiNet) >= 0 ? "text-green-500" : "text-red-500"
                    )}>₹{(row.fiiNet + row.diiNet).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
