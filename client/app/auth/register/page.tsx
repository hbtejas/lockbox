// /app/auth/register/page.tsx
'use client'
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Eye, EyeOff, Zap, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Weak', color: 'bg-loss' });

  useEffect(() => {
    const pass = formData.password;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    const levels = [
      { score: 0, label: 'Weak', color: 'bg-loss' },
      { score: 1, label: 'Fair', color: 'bg-yellow-500' },
      { score: 2, label: 'Good', color: 'bg-indigo-500' },
      { score: 3, label: 'Strong', color: 'bg-gain' },
      { score: 4, label: 'Elite', color: 'bg-accent' },
    ];
    setPasswordStrength(levels[score]);
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { name, email, password, confirmPassword, terms } = formData;
    
    // Validation
    if (!name.trim()) return toast.error('Name is required');
    if (!email.trim()) return toast.error('Email is required');
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    if (!terms) return toast.error('Please accept the Terms & Conditions');
    if (passwordStrength.score < 2) return toast.error('Please choose a stronger password');

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Registration failed');
      } else {
        toast.success('Account created! Please sign in.');
        router.push('/auth/login');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0f] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />

      <div className="w-full max-w-md relative z-10 py-12">
        <div className="text-center mb-10 space-y-3">
          <div className="w-16 h-16 bg-accent rounded-[24px] flex items-center justify-center mx-auto shadow-2xl shadow-accent/40 mb-6">
            <Zap className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white">Create Account</h1>
          <p className="text-muted font-bold tracking-tight">Join 50,000+ smart Indian investors</p>
        </div>

        <div className="glass p-8 md:p-10 rounded-[40px] border-border shadow-2xl space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full bg-base border border-border rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:border-accent transition-all text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full bg-base border border-border rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:border-accent transition-all text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Security Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-base border border-border rounded-2xl pl-12 pr-12 py-4 text-sm font-bold focus:outline-none focus:border-accent transition-all text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              <div className="pt-2 space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted">Strength: {passwordStrength.label}</span>
                  <ShieldCheck className={cn("w-3 h-3", passwordStrength.score >= 3 ? "text-gain" : "text-muted")} />
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={cn("h-full flex-1 transition-all duration-500", i <= passwordStrength.score ? passwordStrength.color : "bg-transparent")} />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Confirm Password</label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-base border border-border rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:border-accent transition-all text-white"
                  required
                />
              </div>
            </div>

            <div className="px-1">
              <div className="flex items-start gap-3 group">
                <div className="relative flex items-center h-5">
                  <input 
                    id="terms"
                    name="terms"
                    type="checkbox" 
                    checked={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                    className="w-4 h-4 rounded border-border bg-base text-accent focus:ring-accent cursor-pointer" 
                    required
                  />
                </div>
                <label htmlFor="terms" className="text-[10px] font-black uppercase tracking-widest text-muted group-hover:text-white transition-colors leading-relaxed cursor-pointer select-none">
                  I agree to the <span className="text-accent hover:underline">Terms of Service</span> and <span className="text-accent hover:underline">Privacy Policy</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent hover:bg-accent/90 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-2 group mt-4"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-muted font-bold text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-accent hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
