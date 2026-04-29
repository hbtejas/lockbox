// /app/dashboard/ipo/page.tsx
'use client';
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';
import { Rocket, Calendar, Tag, Layers, TrendingUp, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';

const UPCOMING_IPOS = [
  { company: 'Ola Electric', sector: 'Automotive', size: 6145, price: '72-76', open: '2026-05-01', close: '2026-05-04', listing: '2026-05-12', gmp: 12, status: 'upcoming' },
  { company: 'Swiggy', sector: 'Technology', size: 10500, price: '380-400', open: '2026-05-15', close: '2026-05-18', listing: '2026-05-25', gmp: 45, status: 'upcoming' },
  { company: 'FirstCry', sector: 'Retail', size: 4193, price: '440-465', open: '2026-05-20', close: '2026-05-23', listing: '2026-06-01', gmp: 25, status: 'upcoming' },
];

const OPEN_IPOS = [
  { company: 'Brainbees Solutions', sector: 'E-commerce', size: 4193, price: '440-465', open: '2026-04-25', close: '2026-04-28', listing: '2026-05-05', gmp: 85, subscription: 4.5, qib: 1.2, nii: 8.5, retail: 12.4 },
];

const LISTED_IPOS = [
  { company: 'Indegene', price: 452, listing: 659, cmp: 580, date: '2026-04-10', gain: 45.8 },
  { company: 'Go Digit', price: 272, listing: 286, cmp: 310, date: '2026-04-05', gain: 5.1 },
  { company: 'TBO Tek', price: 920, listing: 1380, cmp: 1450, date: '2026-03-25', gain: 50.0 },
];

export default function IPODashboard() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'open' | 'listed'>('open');

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-20">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">IPO Center</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2">Track upcoming and live public offerings</p>
        </div>

        {/* TABS */}
        <div className="flex gap-4 border-b border-white/5 pb-4">
          {[
            { id: 'upcoming', label: 'Upcoming', icon: Calendar },
            { id: 'open', label: 'Open Now', icon: Rocket },
            { id: 'listed', label: 'Recently Listed', icon: CheckCircle2 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === tab.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-white/5 text-gray-500 hover:bg-white/10"
              )}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'upcoming' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {UPCOMING_IPOS.map((ipo, i) => (
              <div key={i} className="glass p-8 rounded-[40px] border-white/5 space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors">
                  <Calendar className="w-24 h-24" />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black">{ipo.company}</h3>
                    <span className="bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-indigo-500/20">{ipo.sector}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">GMP (Expected)</p>
                    <p className="text-lg font-black text-green-500 number-font">+₹{ipo.gmp}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-4">
                  <div>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Issue Size</p>
                    <p className="text-sm font-black text-white">₹{ipo.size.toLocaleString()} Cr</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Price Band</p>
                    <p className="text-sm font-black text-white">₹{ipo.price}</p>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-white/5">
                  <div className="flex-1">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Opens</p>
                    <p className="text-[10px] font-bold text-gray-300">{ipo.open}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Closes</p>
                    <p className="text-[10px] font-bold text-gray-300">{ipo.close}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Listing</p>
                    <p className="text-[10px] font-bold text-gray-300">{ipo.listing}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'open' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {OPEN_IPOS.map((ipo, i) => (
              <div key={i} className="glass p-8 rounded-[40px] border-white/5 space-y-8 border-l-4 border-indigo-500">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-green-500 w-2 h-2 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Subscription Open</span>
                    </div>
                    <h3 className="text-2xl font-black">{ipo.company}</h3>
                  </div>
                  <div className="text-right flex items-center gap-2 text-indigo-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Closes in 2d 4h</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Overall Subscription</p>
                    <p className="text-lg font-black number-font text-white">{ipo.subscription}x</p>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[65%]" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    {[
                      { label: 'QIB', val: ipo.qib },
                      { label: 'NII', val: ipo.nii },
                      { label: 'Retail', val: ipo.retail },
                    ].map((cat) => (
                      <div key={cat.label} className="text-center p-3 bg-white/5 rounded-2xl">
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">{cat.label}</p>
                        <p className="text-xs font-black number-font">{cat.val}x</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="w-full py-4 rounded-2xl bg-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
                  Apply via UPI 🚀
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'listed' && (
          <div className="glass rounded-[40px] border-white/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                  <th className="px-8 py-6 text-left">Company</th>
                  <th className="px-8 py-6 text-right">Issue Price</th>
                  <th className="px-8 py-6 text-right">Listing Price</th>
                  <th className="px-8 py-6 text-right">CMP</th>
                  <th className="px-8 py-6 text-right">Gain %</th>
                </tr>
              </thead>
              <tbody>
                {LISTED_IPOS.map((ipo, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center font-black text-[10px] text-indigo-400">
                          {ipo.company.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-black text-white">{ipo.company}</p>
                          <p className="text-[9px] font-bold text-gray-500">{ipo.date}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right text-[10px] font-black number-font">₹{ipo.price}</td>
                    <td className="px-8 py-4 text-right text-[10px] font-black number-font text-indigo-400">₹{ipo.listing}</td>
                    <td className="px-8 py-4 text-right text-[10px] font-black number-font">₹{ipo.cmp}</td>
                    <td className="px-8 py-4 text-right">
                      <div className={cn(
                        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black",
                        ipo.gain >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {ipo.gain >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                        {Math.abs(ipo.gain)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
