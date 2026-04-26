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
        className={`fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-[70px] border-r border-[var(--border)] bg-white/50 backdrop-blur-md py-6 transition-transform md:sticky md:translate-x-0 overflow-y-auto hidden-scrollbar ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col items-center gap-6">
          {links.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `group relative flex flex-col items-center justify-center gap-1 w-full py-1 transition-all ${
                    isActive
                      ? 'text-brand-600'
                      : 'text-slate-400 hover:text-slate-700'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.5 : 2} />
                    <span className={`text-[9px] font-black uppercase tracking-tighter text-center px-1 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-brand-600 rounded-r-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                    )}
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
