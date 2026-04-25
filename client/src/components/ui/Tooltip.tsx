import type { PropsWithChildren } from 'react'

interface TooltipProps {
  label: string
}

function Tooltip({ label, children }: PropsWithChildren<TooltipProps>) {
  return (
    <span className="group relative inline-flex cursor-help items-center">
      {children}
      <span className="pointer-events-none absolute -top-9 left-1/2 z-40 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">
        {label}
      </span>
    </span>
  )
}

export default Tooltip
