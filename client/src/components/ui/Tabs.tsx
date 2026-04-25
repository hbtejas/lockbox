import clsx from 'clsx'

interface TabsProps {
  tabs: string[]
  value: string
  onChange: (next: string) => void
  className?: string
}

function Tabs({ tabs, value, onChange, className }: TabsProps) {
  return (
    <div className={clsx('flex flex-wrap gap-2', className)}>
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={clsx(
            'rounded-full px-4 py-1.5 text-xs font-semibold transition',
            value === tab
              ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

export default Tabs
