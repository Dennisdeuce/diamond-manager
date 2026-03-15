import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { Users, Calendar, ClipboardList, History, Settings, X } from 'lucide-react'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const navItems = [
  { to: '/roster', label: 'Roster', icon: Users },
  { to: '/games', label: 'Games', icon: Calendar },
  { to: '/lineup', label: 'Lineup Builder', icon: ClipboardList },
  { to: '/history', label: 'Season History', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-navy-900/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={clsx(
          'fixed top-0 left-0 z-50 h-full w-64 bg-navy-600 shadow-lg transform transition-transform duration-300 lg:relative lg:transform-none lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center justify-between border-b border-navy-500">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#F5F0E8" strokeWidth="3" />
                <path d="M 30 28 Q 50 18, 70 28" fill="none" stroke="#C8102E" strokeWidth="3" strokeLinecap="round" />
                <path d="M 30 72 Q 50 82, 70 72" fill="none" stroke="#C8102E" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-white font-condensed font-bold text-lg tracking-wide">DIAMOND MGR</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-navy-300 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="mt-4 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-navy-200 hover:bg-white/10 hover:text-white'
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-navy-500">
          <div className="text-xs text-navy-300 text-center">
            Diamond Manager v1.0
          </div>
        </div>
      </aside>
    </>
  )
}
