import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { WifiOff } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { useScrollToTop } from '../../hooks/useScrollToTop'

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isOnline = useOnlineStatus()
  useScrollToTop()

  return (
    <div className="min-h-screen bg-cream-100 flex">
      {/* Skip to content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:bg-navy-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        {/* Offline banner */}
        {!isOnline && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-amber-800 text-sm" role="alert">
            <WifiOff size={16} />
            <span>You're offline. Changes will sync when your connection returns.</span>
          </div>
        )}
        <main id="main-content" className="flex-1 p-4 lg:p-6 overflow-auto" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
