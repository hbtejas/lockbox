// /components/Providers.tsx
'use client'

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './ThemeProvider';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#111118',
              color: '#fff',
              border: '1px solid #1e1e2e',
            },
          }}
        />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
