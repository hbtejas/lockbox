// /components/AlertEngine.tsx
'use client';
import { useEffect } from 'react';
import { dataEngine } from '../lib/dataEngine';

export const AlertEngine: React.FC = () => {
  useEffect(() => {
    // Request notification permission on first mount
    if (typeof window !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Start the data engine
    dataEngine.start();

    return () => {
      dataEngine.stop();
    };
  }, []);

  return null;
};
