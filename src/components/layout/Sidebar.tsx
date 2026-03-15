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

// Baseball stitching SVG pattern
function BaseballStitching() {
  return (
    <svg width="100%" height="8" viewBox="0 0 256 8" preserveAspectRatio="none" className="opacity-30">
      <path d="M0,4 Q16,0 32,4 Q48,8 64,4 Q80,0 96,4 Q112,8 128,4 Q144,0 160,4 Q176,8 192,4 Q208,0 224,4 Q240,8 256,4"
        fill="none" stroke="#C8102E" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-navy-900/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={clsx(
          'fixed top-0 left-0 z-50 h-full w-64 bg-navy-600 shadow-lg transform transition-transform duration-300 lg:relative lg:transform-none lg:z-auto flex flex-col',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#F5F0E8" strokeWidth="2.5" />
                {/* Baseball stitching - top arc */}
                <path d="M 28 30 Q 38 20, 50 18 Q 62 20, 72 30" fill="none" stroke="#C8102E" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="32" y1="25" x2="34" y2="29" stroke="#C8102E" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="42" y1="20" x2="43" y2="24" stroke="#C8102E" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="57" y1="20" x2="57" y2="24" stroke="#C8102E" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="67" y1="25" x2="66" y2="29" stroke="#C8102E" strokeWidth="1.5" strokeLinecap="round" />
                {/* Baseball stitching - bottom arc */}
                <path d="M 28 70 Q 38 80, 50 82 Q 62 80, 72 70" fill="none" stroke="#C8102E" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="32" y1="75" x2="34" y2="71" stroke="#C8102E" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="42" y1="80" x2="43" y2="76" stroke="#C8102E" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="57" y1="80" x2="57" y2="76" stroke="#C8102E" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="67" y1="75" x2="66" y2="71" stroke="#C8102E" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <span className="text-white font-condensed font-bold text-lg tracking-wide block leading-tight">DIAMOND MGR</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-navy-300 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* Stitching divider */}
        <div className="px-4 mb-2 shrink-0">
          <BaseballStitching />
        </div>

        {/* Nav */}
        <nav className="px-3 space-y-1 flex-1 overflow-y-auto" aria-label="Main navigation">
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
        <div className="p-4 shrink-0">
          <div className="px-1 mb-3">
            <BaseballStitching />
          </div>
          <div className="text-xs text-navy-300 text-center">
            Diamond Manager v1.1
          </div>
        </div>
      </aside>
    </>
  )
}
