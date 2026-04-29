// /components/ui/ErrorCard.tsx
import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface ErrorCardProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorCard({ message, onRetry }: ErrorCardProps) {
  return (
    <div className="glass p-10 rounded-[48px] border-loss/20 bg-loss/5 flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-16 h-16 bg-loss/10 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-loss" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-black tracking-tighter">System Error</h3>
        <p className="text-muted text-sm font-bold max-w-xs">{message}</p>
      </div>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 bg-loss text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-loss/80 transition-all"
        >
          <RefreshCcw className="w-4 h-4" /> Retry Connection
        </button>
      )}
    </div>
  );
}
