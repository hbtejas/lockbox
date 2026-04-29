import { create } from 'zustand'

type ThemeMode = 'light' | 'dark'

interface UIState {
  theme: ThemeMode
  mobileSidebarOpen: boolean
  toggleTheme: () => void
  setTheme: (theme: ThemeMode) => void
  setMobileSidebarOpen: (open: boolean) => void
}

const getInitialTheme = (): ThemeMode => {
  const saved = localStorage.getItem('ui-theme')
  if (saved === 'dark' || saved === 'light') {
    return saved
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useUIStore = create<UIState>((set) => ({
  theme: getInitialTheme(),
  mobileSidebarOpen: false,
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('ui-theme', next)
      return { theme: next }
    }),
  setTheme: (theme) => {
    localStorage.setItem('ui-theme', theme)
    set({ theme })
  },
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
}))
