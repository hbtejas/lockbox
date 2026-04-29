// /components/ai/FloatingAIButton.tsx
'use client'

import React, { useState } from 'react';
import { Bot, Sparkles, X } from 'lucide-react';
import { AIChat } from './AIChat';
import { cn } from '@/lib/utils';

export function FloatingAIButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNotified, setHasNotified] = useState(false);

  return (
    <>
      <div className="fixed bottom-10 right-10 z-[90]">
        {!isOpen && !hasNotified && (
          <div className="absolute -top-16 right-0 bg-accent text-white px-4 py-2 rounded-2xl whitespace-nowrap text-[10px] font-black uppercase tracking-widest shadow-2xl animate-bounce">
            Ask LockAI Anything!
            <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-accent rotate-45" />
          </div>
        )}
        
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setHasNotified(true);
          }}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 group",
            isOpen 
              ? "bg-white/5 border border-border text-white rotate-90" 
              : "bg-accent text-white hover:scale-110 shadow-accent/40"
          )}
        >
          {isOpen ? (
            <X className="w-8 h-8" />
          ) : (
            <div className="relative">
              <Bot className="w-8 h-8 group-hover:animate-pulse" />
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-white fill-white animate-pulse" />
            </div>
          )}
        </button>
      </div>

      <AIChat isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
