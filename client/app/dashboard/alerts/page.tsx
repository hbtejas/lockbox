// /app/dashboard/alerts/page.tsx
'use client';
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useMarketStore } from '@/store/marketStore';
import type { Alert } from '@/types';
import { cn } from '@/lib/utils';
import { 
  Bell, Plus, Trash2, CheckCircle2, 
  ArrowUp, ArrowDown, Search, X, 
  AlertTriangle, Clock, History
} from 'lucide-react';
import { format } from 'date-fns';

export default function AlertsPage() {
  const { alerts, stocks, addAlert, removeAlert } = useMarketStore();
  const [activeTab, setActiveTab] = useState<'active' | 'triggered'>('active');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newAlert, setNewAlert] = useState<Omit<Alert, 'id' | 'isTriggered' | 'createdAt' | 'shortName'>>({
    symbol: '',
    condition: 'above',
    targetValue: 0,
    currentPrice: 0,
    isActive: true
  });

  const activeAlerts = alerts.filter(a => !a.isTriggered);
  const triggeredAlerts = alerts.filter(a => a.isTriggered);

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">Price Alerts</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2">Real-time notifications for market targets</p>
          </div>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" /> Create Alert
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-4 border-b border-white/5 pb-4">
          <button
            onClick={() => setActiveTab('active')}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'active' ? "bg-indigo-600 text-white" : "bg-white/5 text-gray-500 hover:bg-white/10"
            )}
          >
            <Clock className="w-4 h-4" /> Active ({activeAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('triggered')}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'triggered' ? "bg-indigo-600 text-white" : "bg-white/5 text-gray-500 hover:bg-white/10"
            )}
          >
            <History className="w-4 h-4" /> Triggered ({triggeredAlerts.length})
          </button>
        </div>

        {activeTab === 'active' ? (
          activeAlerts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeAlerts.map((alert) => {
                const stock = Array.isArray(stocks) ? stocks.find(s => s.symbol === alert.symbol) : null;
                const currentPrice = stock?.regularMarketPrice || alert.currentPrice || 0;
                const distance = Math.abs(currentPrice - alert.targetValue);
                const distancePerc = currentPrice > 0 ? (distance / currentPrice) * 100 : 0;

                return (
                  <div key={alert.id} className="glass p-8 rounded-[40px] border-white/5 space-y-6 relative group overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-black">{alert.symbol.split('.')[0]}</h3>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target: ₹{alert.targetValue.toLocaleString()}</p>
                      </div>
                      <div className={cn(
                        "p-3 rounded-2xl",
                        alert.condition === 'above' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {alert.condition === 'above' ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                        <span>Current Price</span>
                        <span>Distance</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <p className="text-lg font-black number-font">₹{currentPrice.toLocaleString()}</p>
                        <p className="text-xs font-black text-indigo-400">{distancePerc.toFixed(1)}% away</p>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500" 
                          style={{ width: `${Math.max(10, 100 - distancePerc)}%` }} 
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => removeAlert(alert.id)}
                      className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass h-[300px] rounded-[40px] flex flex-col items-center justify-center border-dashed border-white/10 space-y-4">
              <Bell className="w-10 h-10 text-gray-700" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">No active alerts found</p>
            </div>
          )
        ) : (
          <div className="glass rounded-[40px] border-white/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                  <th className="px-8 py-6 text-left">Stock</th>
                  <th className="px-8 py-6 text-left">Condition</th>
                  <th className="px-8 py-6 text-right">Target Price</th>
                  <th className="px-8 py-6 text-right">Triggered At</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {triggeredAlerts.map((alert) => (
                  <tr key={alert.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-4 font-black text-xs">{alert.symbol.split('.')[0]}</td>
                    <td className="px-8 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                        alert.condition === 'above' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {alert.condition === 'above' ? 'Crossed Above' : 'Dropped Below'}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right text-xs font-black number-font">₹{alert.targetValue.toLocaleString()}</td>
                    <td className="px-8 py-4 text-right text-[10px] font-bold text-gray-500">{format(new Date(alert.createdAt), 'dd MMM, HH:mm')}</td>
                    <td className="px-8 py-4 text-right">
                      <button onClick={() => removeAlert(alert.id)} className="text-gray-600 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD ALERT MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-md glass p-10 rounded-[48px] border-white/10 space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black tracking-tighter">New Alert</h2>
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
                          setNewAlert({ ...newAlert, symbol: s.symbol, targetValue: s.regularMarketPrice, currentPrice: s.regularMarketPrice });
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

              <div className="flex bg-white/5 p-1 rounded-2xl">
                <button 
                  onClick={() => setNewAlert({ ...newAlert, condition: 'above' })}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    newAlert.condition === 'above' ? "bg-green-500 text-white" : "text-gray-500"
                  )}
                ><ArrowUp className="w-4 h-4" /> Price Above</button>
                <button 
                  onClick={() => setNewAlert({ ...newAlert, condition: 'below' })}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    newAlert.condition === 'below' ? "bg-red-500 text-white" : "text-gray-500"
                  )}
                ><ArrowDown className="w-4 h-4" /> Price Below</button>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Target Price (₹)</label>
                <input 
                  type="number" 
                  value={newAlert.targetValue}
                  onChange={(e) => setNewAlert({ ...newAlert, targetValue: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-xl font-black number-font focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button 
                onClick={() => {
                  if (newAlert.symbol && newAlert.targetValue > 0) {
                    const stock = stocks.find(s => s.symbol === newAlert.symbol);
                    addAlert({
                      ...newAlert,
                      shortName: stock?.shortName || newAlert.symbol,
                    });
                    setIsAddOpen(false);
                    setSearchQuery('');
                  }
                }}
                className="w-full py-5 bg-indigo-600 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20"
              >
                Set Alert 🔔
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
