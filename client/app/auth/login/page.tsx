// /app/auth/login/page.tsx
'use client'

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight, Chrome } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    if (password.length < 8) return toast.error('Password must be at least 8 characters');

    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === 'AccountDisabled') {
          toast.error('Your account has been disabled. Please contact support.');
        } else {
          toast.error('Invalid email or password');
        }
      } else {
        toast.success('Welcome back!');
        router.push(callbackUrl);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10">
      <div className="text-center mb-10 space-y-3">
        <div className="w-16 h-16 bg-accent rounded-[24px] flex items-center justify-center mx-auto shadow-2xl shadow-accent/40 mb-6">
          <Zap className="w-8 h-8 text-white fill-white" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-white">Welcome Back</h1>
        <p className="text-muted font-bold tracking-tight">Access India's smartest market terminal</p>
      </div>

      <div className="glass p-8 md:p-10 rounded-[40px] border-border shadow-2xl space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-base border border-border rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:border-accent transition-all text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-border bg-base text-accent focus:ring-accent" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted group-hover:text-white transition-colors">Remember me</span>
            </label>
            <Link href="/auth/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent hover:bg-accent/90 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-2 group"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : (
              <>
                Sign In to Terminal
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
            <span className="bg-[#111118] px-4 text-muted">or continue with</span>
          </div>
        </div>

        <button
          onClick={() => {
            setGoogleLoading(true);
            signIn('google', { callbackUrl });
          }}
          disabled={googleLoading}
          className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.1em] transition-all hover:bg-white/90 flex items-center justify-center gap-3 shadow-lg"
        >
          {googleLoading ? <LoadingSpinner size="sm" /> : (
            <>
              <Chrome className="w-5 h-5" />
              Google Account
            </>
          )}
        </button>
      </div>

      <p className="mt-8 text-center text-muted font-bold text-sm">
        Don't have an account?{' '}
        <Link href="/auth/register" className="text-accent hover:underline">
          Create free account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0f] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />

      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
