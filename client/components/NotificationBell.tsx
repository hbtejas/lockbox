// /components/NotificationBell.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertCircle, Info, Zap, X } from 'lucide-react';
import { useMarketStore } from '@/store/marketStore';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markNotificationRead, markAllNotificationsRead } = useMarketStore();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-card border border-border rounded-2xl hover:bg-white/5 transition-all group"
      >
        <Bell className={cn("w-5 h-5 text-muted group-hover:text-white transition-colors", unreadCount > 0 && "animate-wiggle")} />
        {unreadCount > 0 && (
          <span className="absolute top-[-4px] right-[-4px] w-5 h-5 bg-loss text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-[#0a0a0f] shadow-lg shadow-loss/20">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-4 w-96 bg-[#111118] border border-border rounded-[40px] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="p-8 border-b border-border flex items-center justify-between bg-white/[0.01]">
              <div>
                <h3 className="text-lg font-black tracking-tighter">Notifications</h3>
                <p className="text-[10px] font-black text-muted uppercase tracking-widest">{unreadCount} unread items</p>
              </div>
              <button 
                onClick={() => markAllNotificationsRead()}
                className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline"
              >
                Clear All
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                    <Bell className="w-8 h-8 text-muted/30" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted">All caught up!</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id}
                    className={cn(
                      "p-6 border-b border-white/[0.02] flex gap-4 transition-all hover:bg-white/[0.02] cursor-pointer group relative",
                      !n.isRead && "bg-white/[0.01]"
                    )}
                    onClick={() => markNotificationRead(n.id)}
                  >
                    {!n.isRead && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_10px_#6366f1]" />}
                    
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                      n.type === 'alert' ? "bg-yellow-500/10 text-yellow-500" :
                      n.type === 'success' ? "bg-gain/10 text-gain" :
                      n.type === 'warning' ? "bg-loss/10 text-loss" : "bg-indigo-500/10 text-indigo-400"
                    )}>
                      {n.type === 'alert' ? <Zap className="w-5 h-5 fill-current" /> :
                       n.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                       n.type === 'warning' ? <AlertCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-black text-white truncate">{n.title}</p>
                        <span className="text-[9px] font-bold text-muted whitespace-nowrap">
                          {formatDistanceToNow(new Date(n.createdAt))} ago
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-muted leading-relaxed line-clamp-2">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-white/[0.01] text-center border-t border-border">
              <button className="text-[10px] font-black uppercase tracking-widest text-muted hover:text-white transition-colors">
                View History
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
