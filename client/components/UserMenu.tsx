// /components/UserMenu.tsx
'use client'

import React, { useState } from 'react';
import { signOut } from 'next-auth/react';
import { 
  User, Briefcase, Bell, Settings, 
  LogOut, Shield, ChevronDown, Star 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPERADMIN';

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-white/5 transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center font-black text-white text-sm shadow-lg shadow-accent/20 overflow-hidden">
          {user.image ? <img src={user.image} alt="" className="w-full h-full object-cover" /> : initials}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-[10px] font-black text-white leading-none mb-1">{user.name}</p>
          <p className="text-[9px] font-bold text-muted uppercase tracking-widest">{user.role}</p>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-muted transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-4 w-64 bg-[#111118] border border-border rounded-[32px] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="p-6 bg-white/[0.02] border-b border-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center font-black text-white text-lg">
                  {user.image ? <img src={user.image} alt="" className="w-full h-full object-cover" /> : initials}
                </div>
                <div className="min-w-0">
                  <p className="font-black text-white text-sm truncate">{user.name}</p>
                  <p className="text-[10px] font-bold text-muted truncate">{user.email}</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full border border-accent/20">
                <Star className="w-3 h-3 text-accent fill-accent" />
                <span className="text-[9px] font-black text-accent uppercase tracking-[0.2em]">{user.role} Status</span>
              </div>
            </div>

            <div className="p-2">
              <Link 
                href="/dashboard/profile"
                className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all group"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4 text-muted group-hover:text-white" />
                <span className="text-[11px] font-black uppercase tracking-widest text-muted group-hover:text-white">My Profile</span>
              </Link>
              <Link 
                href="/dashboard/portfolio"
                className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all group"
                onClick={() => setIsOpen(false)}
              >
                <Briefcase className="w-4 h-4 text-muted group-hover:text-white" />
                <span className="text-[11px] font-black uppercase tracking-widest text-muted group-hover:text-white">Investment Hub</span>
              </Link>
              {isAdmin && (
                <Link 
                  href="/admin"
                  className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all group"
                  onClick={() => setIsOpen(false)}
                >
                  <Shield className="w-4 h-4 text-loss group-hover:text-loss" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-loss">Admin Terminal</span>
                </Link>
              )}
              <Link 
                href="/dashboard/settings"
                className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all group"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4 text-muted group-hover:text-white" />
                <span className="text-[11px] font-black uppercase tracking-widest text-muted group-hover:text-white">Settings</span>
              </Link>
            </div>

            <div className="p-2 border-t border-border bg-white/[0.01]">
              <button 
                onClick={() => signOut()}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-loss/10 transition-all group text-loss"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase tracking-widest">Sign Out Securely</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
