import { HashRouter as BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { TeamProvider } from './contexts/TeamContext'
import { AuthGuard } from './components/auth/AuthGuard'
import { LoginPage } from './components/auth/LoginPage'
import { AppShell } from './components/layout/AppShell'
import { RosterPage } from './components/roster/RosterPage'
import { GamesPage } from './components/games/GamesPage'
import { LineupBuilderPage } from './components/lineup/LineupBuilderPage'
import { SeasonHistoryPage } from './components/history/SeasonHistoryPage'
import { SettingsPage } from './components/settings/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TeamProvider>
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
        </TeamProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
