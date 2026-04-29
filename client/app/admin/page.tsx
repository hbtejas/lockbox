// /app/admin/page.tsx
'use client'

import React from 'react';
import { 
  Users, Activity, Zap, Bell, 
  TrendingUp, ShieldCheck, ArrowUpRight, 
  MessageSquare, Globe, ChevronRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Platform Users', value: '1,284', change: '+12%', icon: Users, color: 'text-indigo-400' },
    { label: 'AI Operations Today', value: '842', change: '+45%', icon: Activity, color: 'text-purple-400' },
    { label: 'Market Alerts Set', value: '5,921', change: '+8%', icon: Bell, color: 'text-yellow-400' },
    { label: 'Premium Subscribers', value: '142', change: '+22%', icon: Zap, color: 'text-gain' },
  ];

  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h1 className="text-5xl font-black tracking-tighter text-white">System Command</h1>
        <p className="text-muted font-bold tracking-tight">Real-time platform metrics and global security status</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="glass p-8 rounded-[40px] border-white/5 space-y-6 hover:border-white/10 transition-all group cursor-pointer">
            <div className="flex justify-between items-start">
              <div className={cn("w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform", stat.color)}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-1 bg-gain/10 text-gain px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                <TrendingUp className="w-3 h-3" />
                {stat.change}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">{stat.label}</p>
              <h3 className="text-4xl font-black number-font text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* Recent Activity */}
        <div className="xl:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-4">
              <ShieldCheck className="w-6 h-6 text-loss" />
              Live Audit Log
            </h2>
            <button className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline">View All Logs</button>
          </div>

          <div className="glass rounded-[40px] border-white/5 overflow-hidden">
            <div className="p-8 space-y-6">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center justify-between py-4 border-b border-white/[0.02] last:border-0 group">
                  <div className="flex items-center gap-6">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-[10px] text-muted">
                      {item}:32
                    </div>
                    <div>
                      <p className="text-sm font-black text-white group-hover:text-accent transition-colors">USER_REGISTERED</p>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Rahul Sharma (rahul@gmail.com)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">192.168.1.{item}</p>
                      <p className="text-[9px] font-bold text-muted uppercase tracking-widest">Mumbai, IN</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted group-hover:text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black tracking-tight text-white">System Pulse</h2>
          
          <div className="glass p-8 rounded-[40px] border-white/5 space-y-8">
            <HealthItem label="Database" status="Active" color="text-gain" />
            <HealthItem label="AI Gateway (Claude)" status="Synced" color="text-indigo-400" />
            <HealthItem label="Auth Engine" status="Secured" color="text-gain" />
            <HealthItem label="Vercel Edge" status="Operational" color="text-gain" />
            <HealthItem label="Yahoo Finance Proxy" status="Live" color="text-gain" />
            
            <div className="pt-4">
              <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all">
                Run Diagnostics
              </button>
            </div>
          </div>

          {/* Quick Info */}
          <div className="p-8 rounded-[40px] bg-indigo-600 relative overflow-hidden group cursor-pointer shadow-2xl shadow-indigo-500/20">
            <div className="relative z-10 space-y-4">
              <MessageSquare className="w-8 h-8 text-white" />
              <h4 className="text-xl font-black text-white leading-tight">Broadcast Message</h4>
              <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Send to all users</p>
            </div>
            <Globe className="absolute -right-8 -bottom-8 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthItem({ label, status, color }: { label: string, status: string, color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-black uppercase tracking-widest text-muted">{label}</span>
      <div className="flex items-center gap-2">
        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", color.replace('text', 'bg'))} />
        <span className={cn("text-[10px] font-black uppercase tracking-widest", color)}>{status}</span>
      </div>
    </div>
  );
}
