'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Star, Briefcase, Filter, 
  Newspaper, Settings, ChevronLeft, ChevronRight,
  TrendingUp, Bell
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Star, label: 'Watchlist', href: '/dashboard/watchlist' },
  { icon: Briefcase, label: 'Portfolio', href: '/dashboard/portfolio' },
  { icon: Filter, label: 'Screener', href: '/dashboard/screener' },
  { icon: Bell, label: 'Alerts', href: '/dashboard/alerts' },
  { icon: Newspaper, label: 'News', href: '/dashboard/news' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="fixed left-0 top-0 h-screen bg-[#0a0a0f] border-r border-[#1e1e2e] z-50 hidden md:flex flex-col"
    >
      <div className="p-6 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-xl">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-black tracking-tighter"
          >
            LOCKBOX
          </motion.span>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all group relative",
                isActive ? "bg-indigo-600/10 text-indigo-400" : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
              )}>
                <item.icon className={cn("w-5 h-5", isActive ? "text-indigo-400" : "text-gray-500 group-hover:text-gray-200")} />
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-semibold"
                  >
                    {item.label}
                  </motion.span>
                )}
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="m-4 p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </motion.aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0f]/80 backdrop-blur-xl border-t border-white/10 flex justify-around items-center p-4 z-50">
      {navItems.slice(0, 5).map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <item.icon className={cn("w-6 h-6", isActive ? "text-indigo-500" : "text-gray-500")} />
          </Link>
        );
      })}
    </nav>
  );
}
