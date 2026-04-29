'use client';

import { Sidebar, MobileNav } from './Sidebar';
import { motion } from 'framer-motion';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts();
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Sidebar />
      <div className="md:pl-[80px] lg:pl-[260px] transition-all duration-300">
        <main className="p-4 md:p-8 pb-24 md:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
