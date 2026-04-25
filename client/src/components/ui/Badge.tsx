import clsx from 'clsx'
import type { PropsWithChildren } from 'react'

type BadgeTone = 'neutral' | 'success' | 'danger' | 'warning' | 'info' | 'nano' | 'micro' | 'small' | 'mid' | 'large'

interface BadgeProps {
  tone?: BadgeTone
  className?: string
}

const toneStyles: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  nano: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  micro: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  small: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  mid: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  large: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
}

function Badge({ children, tone = 'neutral', className }: PropsWithChildren<BadgeProps>) {
  return (
    <span className={clsx('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', toneStyles[tone], className)}>
      {children}
    </span>
  )
}

export default Badge
