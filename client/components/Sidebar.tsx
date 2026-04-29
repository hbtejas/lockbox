// /components/Sidebar.tsx
'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, TrendingUp, Globe, Rocket, 
  GitCompare, Filter, Briefcase, Bell, 
  Handshake, Calculator, Sun, Settings,
  ChevronLeft, ChevronRight, Moon, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMarketStore } from '@/store/marketStore';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/options', icon: TrendingUp, label: 'Options Chain' },
  { href: '/dashboard/fii-dii', icon: Globe, label: 'FII / DII' },
  { href: '/dashboard/ipo', icon: Rocket, label: 'IPO Center' },
  { href: '/dashboard/compare', icon: GitCompare, label: 'Compare' },
  { href: '/dashboard/screener', icon: Filter, label: 'Screener' },
  { href: '/dashboard/portfolio', icon: Briefcase, label: 'Portfolio' },
  { href: '/dashboard/alerts', icon: Bell, label: 'Alerts' },
  { href: '/dashboard/deals', icon: Handshake, label: 'Bulk Deals' },
  { href: '/dashboard/sip', icon: Calculator, label: 'SIP Calc' },
  { href: '/dashboard/briefing', icon: Sun, label: 'Briefing' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, setTheme } = useMarketStore();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsCollapsed(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <aside 
      className={cn(
        "hidden md:flex bg-card border-r border-border transition-all duration-300 flex-col",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter">LOCKBOX</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center mx-auto">
            <Zap className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
                isActive ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-muted hover:bg-white/5 hover:text-white",
                isCollapsed && "justify-center px-0"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-white" : "group-hover:text-white")} />
              {!isCollapsed && <span className="font-bold text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={cn(
            "w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-muted hover:text-white",
            isCollapsed && "justify-center px-0"
          )}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!isCollapsed && <span className="font-bold text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-muted hover:text-white",
            isCollapsed && "justify-center px-0"
          )}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!isCollapsed && <span className="font-bold text-sm">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
