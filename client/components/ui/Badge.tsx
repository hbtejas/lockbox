// /components/ui/Badge.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'success' | 'destructive' | 'secondary' | 'outline' | 'default';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: "bg-white/10 text-white",
    success: "bg-gain/10 text-gain",
    destructive: "bg-loss/10 text-loss",
    secondary: "bg-indigo-500/10 text-indigo-400",
    outline: "border border-white/10 text-gray-500",
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}

// Special percentage badge
export function PercentageBadge({ value, showIcon = true, className }: { value: number, showIcon?: boolean, className?: string }) {
  const isPositive = value >= 0;
  if (isNaN(value)) return <span className="text-muted">—</span>;

  return (
    <Badge variant={isPositive ? 'success' : 'destructive'} className={className}>
      {showIcon && (isPositive ? '▲' : '▼')}
      {Math.abs(value).toFixed(2)}%
    </Badge>
  );
}
