// /app/auth/error/page.tsx
'use client'

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, RefreshCcw, HelpCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, { title: string, description: string }> = {
    'Configuration': {
      title: 'Terminal Config Error',
      description: 'The authentication system is not configured correctly. This usually means the AUTH_SECRET environment variable is missing.'
    },
    'AccessDenied': {
      title: 'Security Clearance Denied',
      description: 'You do not have the required permissions to access this terminal.'
    },
    'Verification': {
      title: 'Link Expired',
      description: 'The security verification link has expired or has already been used.'
    },
    'Default': {
      title: 'System Malfunction',
      description: 'An unexpected error occurred within the authentication engine.'
    }
  };

  const { title, description } = errorMessages[error as string] || errorMessages.Default;

  return (
    <div className="w-full max-w-md relative z-10 text-center space-y-10">
      <div className="w-24 h-24 bg-loss/10 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-loss/20 border border-loss/20 animate-pulse">
        <ShieldAlert className="w-12 h-12 text-loss" />
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-black tracking-tighter text-white uppercase">{title}</h1>
        <p className="text-muted font-bold tracking-tight px-4">{description}</p>
      </div>

      <div className="glass p-8 rounded-[40px] border-border space-y-6">
        <div className="flex flex-col gap-4">
          <Link 
            href="/auth/login"
            className="w-full bg-accent hover:bg-accent/90 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </Link>
          
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Retry System
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest pt-4">
        <HelpCircle className="w-4 h-4" />
        Error Code: {error || 'AUTH_UNKNOWN'}
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0f] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-loss/10 rounded-full blur-[120px]" />
      
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <ErrorContent />
      </Suspense>
    </div>
  );
}
