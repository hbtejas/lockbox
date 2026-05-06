// /components/CommandPalette.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Terminal, Layout, Briefcase, Filter, Bell, Calculator, Info, Moon, Sun, ChevronRight } from 'lucide-react';
import { useMarketStore } from '../store/marketStore';
import { cn } from '@/lib/utils';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { theme, setTheme } = useMarketStore();

  const commands = [
    { id: 'dashboard', label: 'Go to Dashboard', icon: Layout, action: () => navigate('/dashboard') },
    { id: 'portfolio', label: 'My Portfolio', icon: Briefcase, action: () => navigate('/portfolio') },
    { id: 'screener', label: 'Stock Screener', icon: Filter, action: () => navigate('/screener') },
    { id: 'alerts', label: 'Price Alerts', icon: Bell, action: () => navigate('/alerts') },
    { id: 'theme', label: `Toggle ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, icon: theme === 'dark' ? Sun : Moon, action: () => setTheme(theme === 'dark' ? 'light' : 'dark') },
  ];

  const filteredCommands = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsOpen(false)} />
      <div className="relative w-full max-w-xl glass rounded-[40px] border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center px-6 border-b border-white/5 py-6">
          <Search className="w-5 h-5 text-gray-500 mr-4" />
          <input 
            autoFocus
            type="text" 
            placeholder="Type a command or search stocks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none text-lg font-bold placeholder:text-gray-600 focus:outline-none"
          />
          <div className="bg-white/5 px-2 py-1 rounded text-[10px] font-black text-gray-500 border border-white/10">ESC</div>
        </div>

        <div className="p-4 max-h-[60vh] overflow-auto">
          <div className="px-4 py-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">Available Commands</div>
          <div className="space-y-1 mt-2">
            {filteredCommands.map((cmd) => (
              <div 
                key={cmd.id}
                onClick={() => { cmd.action(); setIsOpen(false); }}
                className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 cursor-pointer group transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white/5 rounded-xl group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-all">
                    <cmd.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{cmd.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-700 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-black/20 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="bg-white/10 px-1.5 py-0.5 rounded text-[8px] font-black text-gray-400 border border-white/10">↑↓</span>
              <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Navigate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white/10 px-1.5 py-0.5 rounded text-[8px] font-black text-gray-400 border border-white/10">ENTER</span>
              <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Execute</span>
            </div>
          </div>
          <div className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">Lockbox v1.0.0</div>
        </div>
      </div>
    </div>
  );
};
