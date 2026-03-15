import { lazy, Suspense } from 'react'
import { HashRouter as BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastProvider } from './components/ui/Toast'
import { AuthProvider } from './contexts/AuthContext'
import { TeamProvider } from './contexts/TeamContext'
import { AuthGuard } from './components/auth/AuthGuard'
import { LoginPage } from './components/auth/LoginPage'
import { AppShell } from './components/layout/AppShell'

// Lazy-loaded route components for code splitting
const RosterPage = lazy(() => import('./components/roster/RosterPage').then(m => ({ default: m.RosterPage })))
const GamesPage = lazy(() => import('./components/games/GamesPage').then(m => ({ default: m.GamesPage })))
const LineupBuilderPage = lazy(() => import('./components/lineup/LineupBuilderPage').then(m => ({ default: m.LineupBuilderPage })))
const SeasonHistoryPage = lazy(() => import('./components/history/SeasonHistoryPage').then(m => ({ default: m.SeasonHistoryPage })))
const SettingsPage = lazy(() => import('./components/settings/SettingsPage').then(m => ({ default: m.SettingsPage })))

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <svg className="animate-spin h-8 w-8 text-accent-red" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
    <ToastProvider>
    <BrowserRouter>
      <AuthProvider>
        <TeamProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                element={
                  <AuthGuard>
                    <AppShell />
                  </AuthGuard>
                }
              >
                <Route index element={<Navigate to="/roster" replace />} />
                <Route path="roster" element={<RosterPage />} />
                <Route path="games" element={<GamesPage />} />
                <Route path="lineup/:gameId" element={<LineupBuilderPage />} />
                <Route path="lineup" element={<GamesPage />} />
                <Route path="history" element={<SeasonHistoryPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/roster" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </TeamProvider>
      </AuthProvider>
    </BrowserRouter>
    </ToastProvider>
    </ErrorBoundary>
  )
}
