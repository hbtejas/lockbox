import { lazy, Suspense, type ReactNode, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import { useAuthStore } from './store/authStore'
import { useUIStore } from './store/uiStore'

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

function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

function App() {
  const theme = useUIStore((state) => state.theme)
  const initializeAuth = useAuthStore((state) => state.initialize)
  const initialized = useAuthStore((state) => state.initialized)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    void initializeAuth()
  }, [initializeAuth])

  if (!initialized) {
    return <Loader />
  }

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/company/:symbol" element={<CompanyPage />} />
          <Route path="/sector/:name" element={<SectorPage />} />
          <Route path="/screener" element={<ScreenerPage />} />
          <Route
            path="/portfolio"
            element={
              <ProtectedRoute>
                <PortfolioPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <WatchlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <AlertsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/market-monitor" element={<MarketMonitorPage />} />
          <Route path="/macro" element={<MacroIndicatorsPage />} />
          <Route path="/raw-materials" element={<RawMaterialsPage />} />
          <Route path="/ideas" element={<IdeasDashboardPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
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
