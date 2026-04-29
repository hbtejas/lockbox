'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus Search: /
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }

      // Close Modal: Escape
      if (e.key === 'Escape') {
        // This is usually handled by the modal logic itself
      }

      // Refresh: R
      if (e.key.toLowerCase() === 'r') {
        window.location.reload();
      }

      // Navigation: 1-5
      if (e.key === '1') router.push('/dashboard');
      if (e.key === '2') router.push('/dashboard/watchlist');
      if (e.key === '3') router.push('/dashboard/portfolio');
      if (e.key === '4') router.push('/dashboard/screener');
      if (e.key === '5') router.push('/dashboard/alerts');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);
}
