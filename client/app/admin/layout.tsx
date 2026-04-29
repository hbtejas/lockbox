// /app/admin/layout.tsx
'use client'

import React from 'react';
import { 
  LayoutDashboard, Users, Activity, 
  Settings, ShieldAlert, BarChart,
  ChevronLeft, LogOut, Zap
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { UserMenu } from '@/components/UserMenu';
import { useSession } from 'next-auth/react';

const adminNav = [
  { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/users', icon: Users, label: 'User Management' },
  { href: '/admin/ai-usage', icon: Activity, label: 'AI Operations' },
  { href: '/admin/announcements', icon: ShieldAlert, label: 'Announcements' },
  { href: '/admin/analytics', icon: BarChart, label: 'Global Analytics' },
  { href: '/admin/system', icon: Settings, label: 'System Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const sessionData = useSession();
  const session = sessionData?.data;

  return (
    <div className="flex h-screen overflow-hidden bg-[#050507]">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-[#0a0a0f] border-r border-loss/10 flex flex-col">
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-loss rounded-xl flex items-center justify-center shadow-lg shadow-loss/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-black text-xl tracking-tighter text-white">LOCKBOX</span>
            <p className="text-[10px] font-black text-loss uppercase tracking-[0.2em] leading-none">Admin Terminal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8">
          {adminNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group",
                  isActive 
                    ? "bg-loss text-white shadow-xl shadow-loss/10" 
                    : "text-muted hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-muted group-hover:text-white")} />
                <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
          <Link 
            href="/dashboard"
            className="flex items-center gap-4 px-4 py-4 rounded-2xl text-muted hover:bg-white/5 hover:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-black text-xs uppercase tracking-widest">Back to App</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-[#0a0a0f] border-b border-white/5 px-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gain rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Core System Online</span>
          </div>
          
          <div className="flex items-center gap-8">
            {session?.user && <UserMenu user={session.user} />}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
