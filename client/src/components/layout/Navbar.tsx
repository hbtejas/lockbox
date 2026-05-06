import { Menu, Moon, Search, Sun, X } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import Button from '../ui/Button'
import { useState, useEffect, useRef } from 'react'
import { searchStocks } from '../../api/stockApi'
import type { WatchlistItem } from '../../types/domain'

const navGroups = [
  { label: 'Tracking Tools', path: '/portfolio' },
  { label: 'Research Tools', path: '/screener' },
]

function Navbar() {
  const toggleTheme = useUIStore((state) => state.toggleTheme)
  const theme = useUIStore((state) => state.theme)
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState<WatchlistItem[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const navigate = useNavigate()
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (search.trim().length > 1) {
        try {
          const results = await searchStocks(search)
          setSuggestions(results.slice(0, 8))
          setShowSuggestions(true)
        } catch {
          setSuggestions([])
        }
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }

    const timer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timer)
  }, [search])

  const onLogout = async () => {
    try {
      await logout()
    } catch {
      // ignore
    }
  }

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim()) {
      const match = suggestions.find(s => s.symbol.toUpperCase() === search.toUpperCase())
      const target = match ? match.symbol : search.toUpperCase()
      navigate(`/company/${target}`)
      setShowSuggestions(false)
    }
  }

  const selectSuggestion = (symbol: string) => {
    navigate(`/company/${symbol}`)
    setSearch('')
    setShowSuggestions(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] glass">
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
          <span className="text-xl font-black tracking-[0.2em] text-gradient uppercase">
            Lockbox
          </span>
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

        <div ref={searchRef} className="relative ml-auto hidden w-[320px] md:block mx-8 text-slate-800">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search for a company, sector or brand"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            onFocus={() => search.trim().length > 1 && setShowSuggestions(true)}
            className="w-full rounded-full border border-[var(--border)] bg-black/5 dark:bg-white/5 py-2 pl-9 pr-10 text-xs font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-800 dark:text-slate-200 backdrop-blur-sm"
          />
          {search && (
            <button 
              onClick={() => { setSearch(''); setSuggestions([]); setShowSuggestions(false); }}
              className="absolute right-10 top-2.5 p-0.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <div className="absolute right-4 top-3.5 flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-tight text-slate-400">Live</span>
            <div className="live-pulse">
              <span className="live-pulse-dot"></span>
              <span className="live-pulse-center"></span>
            </div>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-xl glass shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="py-2">
                {suggestions.map((s) => (
                  <button
                    key={s.symbol}
                    onClick={() => selectSuggestion(s.symbol)}
                    className="w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{s.symbol}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">{s.name}</span>
                    </div>
                    <span className={`text-[10px] font-bold ${s.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
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
