import { BarChart3, Bell, BriefcaseBusiness, Building2, ChartCandlestick, LineChart, ScanSearch, Sparkles, TrendingUp } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useUIStore } from '../../store/uiStore'

const links = [
  { to: '/dashboard', label: 'Ideas Dashboard', icon: Sparkles },
  { to: '/results', label: 'Results', icon: TrendingUp },
  { to: '/timeline', label: 'Timeline', icon: LineChart },
  { to: '/watchlist', label: 'Watchlist', icon: Building2 },
  { to: '/portfolio', label: 'Portfolio', icon: BriefcaseBusiness },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/screener', label: 'Stock Screener', icon: ScanSearch },
  { to: '/market-monitor', label: 'Market', icon: ChartCandlestick },
  { to: '/raw-materials', label: 'Raw Material', icon: BarChart3 },
]

function Sidebar() {
  const mobileSidebarOpen = useUIStore((state) => state.mobileSidebarOpen)
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen)

  return (
    <>
      {mobileSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      <aside
        className={`fixed right-0 top-16 z-40 h-[calc(100vh-4rem)] w-[80px] border-l border-[var(--border)] bg-[var(--bg-elev)] py-6 transition-transform md:sticky md:translate-x-0 overflow-y-auto hidden-scrollbar shadow-sm ${
          mobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          {links.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1.5 w-full py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-l-2 ${
                    isActive
                      ? 'border-[var(--text)] text-[var(--text)] font-semibold'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)] font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.5} />
                    <span className="text-[10px] leading-tight text-center px-1 break-words">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
