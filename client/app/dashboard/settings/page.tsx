'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  Moon, Sun, Palette, Bell, RefreshCw, 
  Coins, Smartphone, Layout, Save,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Layout },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Privacy', icon: RefreshCw },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Settings</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2">Customize your Lockbox experience</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Tabs Navigation */}
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all",
                  activeTab === tab.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="glass p-10 rounded-[40px] border-white/5 space-y-12">
              {activeTab === 'general' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-indigo-400" /> Refresh Interval
                      </h3>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">How often should market prices be updated automatically?</p>
                      <div className="flex gap-2">
                        {['30s', '60s', '2m', '5m'].map((time) => (
                          <button key={time} className={cn(
                            "px-4 py-2 rounded-xl text-xs font-black",
                            time === '60s' ? "bg-indigo-600" : "bg-white/5 text-gray-500"
                          )}>{time}</button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <Coins className="w-4 h-4 text-indigo-400" /> Base Currency
                      </h3>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">Choose your primary currency for portfolio and price display.</p>
                      <div className="flex gap-2">
                        {['INR (₹)', 'USD ($)', 'EUR (€)'].map((curr) => (
                          <button key={curr} className={cn(
                            "px-4 py-2 rounded-xl text-xs font-black",
                            curr.includes('INR') ? "bg-indigo-600" : "bg-white/5 text-gray-500"
                          )}>{curr}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <Layout className="w-4 h-4 text-indigo-400" /> Display Layout
                    </h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                        <input type="checkbox" checked className="w-5 h-5 rounded-lg accent-indigo-500" />
                        <div>
                          <p className="text-sm font-bold">Show 52-week High/Low in tables</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Extra details for professional analysis</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                        <input type="checkbox" checked className="w-5 h-5 rounded-lg accent-indigo-500" />
                        <div>
                          <p className="text-sm font-bold">Infinite Scroll (Virtualized)</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Smoother experience on large lists</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <Sun className="w-4 h-4 text-indigo-400" /> Theme Mode
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: 'dark', icon: Moon, label: 'Deep Dark' },
                        { id: 'light', icon: Sun, label: 'Clean Light' },
                        { id: 'system', icon: Smartphone, label: 'Auto System' },
                      ].map((theme) => (
                        <button key={theme.id} className={cn(
                          "flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all",
                          theme.id === 'dark' ? "bg-indigo-600/10 border-indigo-500 shadow-xl" : "bg-white/5 border-transparent text-gray-500"
                        )}>
                          <theme.icon className="w-6 h-6" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{theme.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <Palette className="w-4 h-4 text-indigo-400" /> Accent Color
                    </h3>
                    <div className="flex gap-4">
                      {['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'].map((color) => (
                        <button 
                          key={color}
                          style={{ backgroundColor: color }}
                          className={cn(
                            "w-12 h-12 rounded-full border-4 transition-all",
                            color === '#6366f1' ? "border-white scale-110 shadow-lg" : "border-transparent"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-8">
                  <div className="p-8 rounded-3xl bg-red-500/5 border border-red-500/20 space-y-4">
                    <div className="flex items-center gap-3 text-red-500">
                      <AlertTriangle className="w-5 h-5" />
                      <h3 className="text-sm font-black uppercase tracking-widest">Danger Zone</h3>
                    </div>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">Resetting your data will permanently delete your watchlist, portfolio holdings, and alerts. This action cannot be undone.</p>
                    <button className="px-6 py-3 rounded-2xl bg-red-500 text-white font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all">Clear All Local Data</button>
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-white/5 flex justify-end">
                <button className="flex items-center gap-3 bg-indigo-600 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
