'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, TrendingUp, Briefcase, 
  Bell, Settings 
} from 'lucide-react'
import { cn } from '@/lib/utils'

const mobileItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Market' },
  { href: '/dashboard/options', icon: TrendingUp, label: 'Options' },
  { href: '/dashboard/portfolio', icon: Briefcase, label: 'Holdings' },
  { href: '/dashboard/alerts', icon: Bell, label: 'Alerts' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-card/80 backdrop-blur-xl border-t border-white/5 px-6 py-4 safe-area-bottom">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all",
                isActive ? "text-accent" : "text-muted hover:text-white"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive && "animate-pulse")} />
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
