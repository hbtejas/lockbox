import { lazy, Suspense, type ReactNode, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import { useAuthStore } from './store/authStore'
import { useUIStore } from './store/uiStore'
import { ProtectedRoute } from './components/ProtectedRoute'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const CompanyPage = lazy(() => import('./pages/CompanyPage'))
const SectorPage = lazy(() => import('./pages/SectorPage'))
const ScreenerPage = lazy(() => import('./pages/ScreenerPage'))
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'))
const WatchlistPage = lazy(() => import('./pages/WatchlistPage'))
const AlertsPage = lazy(() => import('./pages/AlertsPage'))
const ResultsPage = lazy(() => import('./pages/ResultsPage'))
const MarketMonitorPage = lazy(() => import('./pages/MarketMonitorPage'))
const MacroIndicatorsPage = lazy(() => import('./pages/MacroIndicatorsPage'))
const RawMaterialsPage = lazy(() => import('./pages/RawMaterialsPage'))
const IdeasDashboardPage = lazy(() => import('./pages/IdeasDashboardPage'))
const TimelinePage = lazy(() => import('./pages/TimelinePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const PricingPage = lazy(() => import('./pages/PricingPage'))
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const Loader = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-400 border-t-brand-500" />
  </div>
)

function App() {
  const theme = useUIStore((state) => state.theme)
  const initializeAuth = useAuthStore((state) => state.initialize)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    const unsubscribe = initializeAuth()
    return () => unsubscribe()
  }, [initializeAuth])

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<AppLayout />}>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/screener" element={<ScreenerPage />} />
            <Route path="/market-monitor" element={<MarketMonitorPage />} />
            <Route path="/macro" element={<MacroIndicatorsPage />} />
            <Route path="/raw-materials" element={<RawMaterialsPage />} />
            <Route path="/ideas" element={<IdeasDashboardPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
          </Route>
          
          <Route path="/company/:symbol" element={<CompanyPage />} />
          <Route path="/sector/:name" element={<SectorPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default App
