import React from 'react'

const ScreenerSkeleton = () => {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />
      <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />
      <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-50 dark:bg-slate-800/50 rounded-lg w-full" />
        ))}
      </div>
    </div>
  )
}

export default ScreenerSkeleton
