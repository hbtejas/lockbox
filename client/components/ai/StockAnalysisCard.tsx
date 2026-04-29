// /components/ai/StockAnalysisCard.tsx
'use client';
import React, { useState } from 'react';
import { Sparkles, TrendingUp, TrendingDown, RefreshCcw, ShieldCheck, Zap, Globe, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/Badge';
import ReactMarkdown from 'react-markdown';

interface AnalysisCardProps {
  symbol: string;
  stockData: any;
  analysis: string;
  isLoading: boolean;
  onRefresh: () => void;
}

export function StockAnalysisCard({ symbol, stockData, analysis, isLoading, onRefresh }: AnalysisCardProps) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'levels'>('analysis');

  if (isLoading && !analysis) {
    return (
      <div className="glass p-10 rounded-[48px] border-white/5 space-y-8 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-2xl" />
            <div className="space-y-2">
              <div className="w-32 h-6 bg-white/5 rounded-lg" />
              <div className="w-48 h-4 bg-white/5 rounded-md" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-4 bg-white/5 rounded-md w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  // Extract sentiment
  const sentiment = analysis.toLowerCase().includes('bullish') ? 'bullish' : 
                   analysis.toLowerCase().includes('bearish') ? 'bearish' : 'neutral';

  return (
    <div className="glass p-10 rounded-[48px] border-white/5 space-y-10 relative overflow-hidden group">
      {/* Background Glow */}
      <div className={cn(
        "absolute -top-24 -right-24 w-64 h-64 blur-[100px] opacity-20 transition-all duration-1000",
        sentiment === 'bullish' ? "bg-green-500" : sentiment === 'bearish' ? "bg-red-500" : "bg-indigo-500"
      )} />

      <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-indigo-600 rounded-[20px] flex items-center justify-center shadow-xl shadow-indigo-500/20">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-black tracking-tighter">LockAI Analysis</h3>
              <Badge variant={sentiment === 'bullish' ? 'success' : sentiment === 'bearish' ? 'destructive' : 'secondary'}>
                {sentiment.toUpperCase()}
              </Badge>
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
              Powered by Claude 3.5 Sonnet • {symbol}
            </p>
          </div>
        </div>

        <button 
          onClick={onRefresh}
          disabled={isLoading}
          className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group/btn disabled:opacity-50"
        >
          <RefreshCcw className={cn("w-5 h-5 text-gray-400 group-hover/btn:rotate-180 transition-all duration-500", isLoading && "animate-spin")} />
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-white/5 rounded-2xl relative z-10 w-fit">
        <button 
          onClick={() => setActiveTab('analysis')}
          className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'analysis' ? "bg-white/10 text-white shadow-lg" : "text-gray-500 hover:text-gray-300")}
        >Analysis</button>
        <button 
          onClick={() => setActiveTab('levels')}
          className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'levels' ? "bg-white/10 text-white shadow-lg" : "text-gray-500 hover:text-gray-300")}
        >Levels</button>
      </div>

      <div className="relative z-10">
        {activeTab === 'analysis' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-indigo-400 prose-headings:uppercase prose-headings:tracking-widest prose-headings:text-[10px] prose-headings:font-black">
              <ReactMarkdown 
                components={{
                  h1: ({...props}) => <h5 className="text-accent font-black uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2" {...props} />,
                  ul: ({...props}) => <ul className="space-y-3 mb-6" {...props} />,
                  li: ({...props}) => (
                    <li className="flex gap-3 text-gray-300 font-medium leading-relaxed">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 shrink-0" />
                      {props.children}
                    </li>
                  ),
                  p: ({...props}) => <p className="text-gray-300 leading-relaxed mb-4" {...props} />
                }}
              >
                {analysis}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <LevelCard label="Resistance 1" value={`₹${(stockData.regularMarketPrice * 1.05).toFixed(2)}`} icon={ShieldCheck} color="text-red-500" />
            <LevelCard label="Support 1" value={`₹${(stockData.regularMarketPrice * 0.95).toFixed(2)}`} icon={ShieldCheck} color="text-green-500" />
            <LevelCard label="Target" value={`₹${(stockData.regularMarketPrice * 1.15).toFixed(2)}`} icon={Target} color="text-indigo-500" />
            <LevelCard label="Stop Loss" value={`₹${(stockData.regularMarketPrice * 0.92).toFixed(2)}`} icon={Zap} color="text-yellow-500" />
          </div>
        )}
      </div>

      <div className="pt-8 border-t border-white/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4 text-[9px] font-black text-gray-600 uppercase tracking-widest">
          <Globe className="w-3 h-3" />
          NSE India Data
        </div>
        <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">Educational analysis only</p>
      </div>
    </div>
  );
}

function LevelCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-3 hover:border-white/10 transition-all group">
      <div className="flex items-center gap-2">
        <Icon className={cn("w-3 h-3", color)} />
        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-xl font-black number-font text-white group-hover:text-indigo-400 transition-colors">{value}</p>
    </div>
  );
}
