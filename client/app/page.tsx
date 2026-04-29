import Link from 'next/link';
import { Zap, TrendingUp, ShieldCheck, Globe, ArrowRight, BarChart4 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-accent selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 py-6 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-black text-2xl tracking-tighter">LOCKBOX</span>
          </div>
          <div className="flex items-center gap-8">
            <Link href="/auth/login" className="text-xs font-black uppercase tracking-widest text-muted hover:text-white transition-colors">Sign In</Link>
            <Link href="/auth/register" className="bg-white text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all shadow-xl shadow-white/5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-40 pb-20 px-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center space-y-12 relative z-10">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 px-4 py-2 rounded-full text-accent text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in">
            <TrendingUp className="w-3 h-3" />
            Real-time Market Pulse
          </div>
          
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.9] max-w-5xl mx-auto italic">
            MASTER THE <span className="text-accent">INDIAN</span> MARKETS.
          </h1>
          
          <p className="text-xl text-muted font-bold max-w-2xl mx-auto leading-relaxed">
            A high-performance terminal for modern investors. Real-time data, 
            algorithmic signals, and advanced portfolio intelligence.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/auth/register" className="w-full sm:w-auto bg-accent text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-accent/40 flex items-center justify-center gap-3 group">
              Start Trading Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto glass border-white/10 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-3">
              Explore Demo
              <BarChart4 className="w-5 h-5" />
            </Link>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-24 glass rounded-[48px] border-white/5 overflow-hidden shadow-3xl p-4 animate-float">
            <div className="bg-base rounded-[36px] overflow-hidden aspect-video border border-white/5 bg-[url('https://images.unsplash.com/photo-1611974717535-73f13961f88a?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="py-40 px-8 bg-black/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <FeatureCard 
            icon={Zap} 
            title="Instant Ticker" 
            desc="Zero-latency updates directly from the exchange. Every tick matters."
            color="text-yellow-400"
          />
          <FeatureCard 
            icon={Globe} 
            title="Global Signals" 
            desc="Track international indices and commodities that influence Nifty."
            color="text-indigo-400"
          />
          <FeatureCard 
            icon={ShieldCheck} 
            title="Risk Intel" 
            desc="AI-powered portfolio diagnostics and stop-loss management."
            color="text-gain"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-accent fill-accent" />
            <span className="font-black text-xl tracking-tighter">LOCKBOX</span>
          </div>
          <div className="flex gap-12 text-[10px] font-black uppercase tracking-widest text-muted">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Security</Link>
          </div>
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest">© 2024 Lockbox Terminal. Built for the future.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }: any) {
  return (
    <div className="glass p-10 rounded-[48px] border-white/5 space-y-6 hover:border-white/10 transition-all group">
      <div className={cn("w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform", color)}>
        <Icon className="w-7 h-7" />
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-black">{title}</h3>
        <p className="text-sm text-muted font-bold leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
