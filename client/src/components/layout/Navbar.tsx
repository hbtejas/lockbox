import { Menu, Moon, Search, Sun } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../../api/authApi'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import Button from '../ui/Button'
import { useState } from 'react'

const navGroups = [
  { label: 'Tracking Tools', path: '/portfolio' },
  { label: 'Research Tools', path: '/screener' },
]

function Navbar() {
  const toggleTheme = useUIStore((state) => state.toggleTheme)
  const theme = useUIStore((state) => state.theme)
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen)
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const onLogout = async () => {
    try {
      await logout()
    } catch {
      // ignore network logout failures and clear local session
    }
    clearSession()
  }

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/company/${search.toUpperCase()}`)
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-elev)]">
      <div className="mx-auto flex h-14 max-w-full items-center gap-4 px-4 md:px-8">
        <button
          type="button"
          className="rounded-lg border border-[var(--border)] p-1.5 md:hidden text-[var(--text-muted)] hover:text-[var(--text)]"
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/dashboard" className="relative flex h-full items-center pl-2 pr-6">
          <span className="text-xl font-bold tracking-[0.2em] text-[var(--text)] uppercase">
            Lockbox
          </span>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-yellow-400" />
        </Link>

        <nav className="ml-8 hidden items-center gap-6 md:flex">
          {navGroups.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-[var(--text)] flex items-center gap-1.5 ${
                  isActive ? 'text-[var(--text)] font-semibold' : 'text-[var(--text-muted)]'
                }`
              }
            >
              {item.label}
              <span className="text-[10px] opacity-50">▼</span>
            </NavLink>
          ))}
        </nav>

        <div className="relative ml-auto hidden w-[320px] md:block mx-8 text-slate-800">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search for a company, sector or brand"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full rounded-full border border-slate-300 bg-slate-100 py-2 pl-9 pr-4 text-xs font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
          />
          <div className="absolute right-4 top-3.5 flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-tight text-slate-400">Live</span>
            <div className="live-pulse">
              <span className="live-pulse-dot"></span>
              <span className="live-pulse-center"></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="text-[var(--text-muted)] hover:text-[var(--text)] transition">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {user ? (
            <div className="hidden items-center gap-4 md:flex ml-2">
              <div className="h-8 w-8 rounded-full bg-yellow-400 text-yellow-900 flex items-center justify-center font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <Button size="sm" onClick={onLogout} variant="ghost" className="text-xs">
                Logout
              </Button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex ml-2">
              <Link to="/login" className="text-sm font-medium hover:text-[var(--text)] text-[var(--text-muted)]">
                Sign In
              </Link>
            </div>
          )}

          <Link to="/pricing" className="ml-2 hidden md:flex items-center gap-1.5 rounded-sm bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition">
            Upgrade now
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Navbar
