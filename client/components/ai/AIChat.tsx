// /components/ai/AIChat.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { 
  X, Send, Bot, User, Sparkles, 
  RefreshCcw, Trash2, ChevronRight,
  MessageSquare, BarChart2, Lightbulb, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMarketStore } from '@/store/marketStore';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import ReactMarkdown from 'react-markdown';

export function AIChat({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { selectedStock, stocks } = useMarketStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [chatId, setChatId] = useState<string | null>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages } = useChat({
    api: '/api/ai/chat',
    body: {
      chatId,
      stockContext: selectedStock || null
    },
    onFinish: (message) => {
      // Auto-save logic is handled on server side in route.ts
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const suggestions = [
    { text: "Analyze this stock", icon: BarChart2 },
    { text: "Compare with sector", icon: MessageSquare },
    { text: "Explain P/E ratio", icon: Lightbulb },
    { text: "Is market overbought?", icon: AlertCircle },
  ];

  const handleSuggestion = (text: string) => {
    const fakeEvent = {
      preventDefault: () => {},
    } as React.FormEvent;
    
    // Manual trigger
    handleInputChange({ target: { value: text } } as any);
  };

  return (
    <div 
      className={cn(
        "fixed inset-y-0 right-0 w-full md:w-[500px] bg-[#0a0a0f] border-l border-border shadow-2xl z-[100] transition-transform duration-500 ease-out flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Header */}
      <div className="p-8 border-b border-border bg-white/[0.01] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tighter text-white flex items-center gap-2">
              LockAI
              <Sparkles className="w-4 h-4 text-accent fill-accent" />
            </h3>
            <p className="text-[10px] font-black text-muted uppercase tracking-widest">Quantum Intelligence v2.0</p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl text-muted hover:text-white transition-all">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
        {messages.length === 0 && (
          <div className="space-y-12 py-12">
            <div className="space-y-4 text-center">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot className="w-10 h-10 text-accent" />
              </div>
              <h4 className="text-2xl font-black tracking-tight">How can I help you today?</h4>
              <p className="text-muted font-medium text-sm px-12">Ask me anything about the Indian stock market, technical indicators, or macro trends.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestion(s.text)}
                  className="p-6 bg-white/[0.02] border border-border rounded-[32px] text-left hover:border-accent/50 hover:bg-accent/5 transition-all group"
                >
                  <s.icon className="w-6 h-6 text-accent mb-4 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-black uppercase tracking-widest text-muted group-hover:text-white">{s.text}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={cn(
            "flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300",
            m.role === 'user' ? "flex-row-reverse" : "flex-row"
          )}>
            <div className={cn(
              "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-lg",
              m.role === 'user' ? "bg-accent text-white" : "bg-white/5 text-muted"
            )}>
              {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={cn(
              "max-w-[80%] p-6 rounded-[28px] text-sm leading-relaxed",
              m.role === 'user' ? "bg-accent text-white rounded-tr-none" : "bg-white/[0.03] border border-border text-gray-200 rounded-tl-none shadow-xl"
            )}>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>
                  {m.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <Bot className="w-5 h-5 text-muted" />
            </div>
            <div className="bg-white/[0.03] border border-border p-6 rounded-[28px] rounded-tl-none space-y-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-6 bg-loss/10 border border-loss/20 rounded-3xl flex items-center gap-4 text-loss">
            <AlertCircle className="w-5 h-5" />
            <p className="text-xs font-black uppercase tracking-widest">{error.message}</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-8 border-t border-border bg-white/[0.01]">
        <div className="mb-4 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-gain rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Neural Link Active</span>
          </div>
          <span className="text-[9px] font-black text-muted uppercase tracking-widest">20 Messages Remaining</span>
        </div>

        <form onSubmit={handleSubmit} className="relative group">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask anything about the markets..."
            className="w-full bg-base border border-border rounded-[28px] pl-6 pr-20 py-5 text-sm font-bold focus:outline-none focus:border-accent transition-all text-white shadow-2xl"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
            <button
              type="submit"
              disabled={isLoading || !input}
              className="p-3 bg-accent hover:bg-accent/80 text-white rounded-2xl transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
        
        <div className="mt-6 flex items-center justify-center gap-6">
          <button onClick={() => setMessages([])} className="text-[9px] font-black uppercase tracking-widest text-muted hover:text-white transition-colors flex items-center gap-2">
            <Trash2 className="w-3 h-3" /> Clear Chat
          </button>
          <div className="w-px h-3 bg-white/10" />
          <button className="text-[9px] font-black uppercase tracking-widest text-muted hover:text-white transition-colors flex items-center gap-2">
            <RefreshCcw className="w-3 h-3" /> Regenerate
          </button>
        </div>
      </div>
    </div>
  );
}
