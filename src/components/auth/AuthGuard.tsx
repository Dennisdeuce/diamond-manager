import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isDemoMode, isConfigured } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-accent-red" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-navy-400 text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user && !isDemoMode) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
