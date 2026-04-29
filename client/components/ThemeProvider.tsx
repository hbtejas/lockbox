// /components/ThemeProvider.tsx
'use client'

import { useEffect, useState } from 'react';
import { useMarketStore } from '@/store/marketStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useMarketStore((state) => state.theme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Prevent hydration mismatch
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return <>{children}</>;
}
