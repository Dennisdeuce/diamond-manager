import { useState, useRef, useEffect } from 'react'
import { Menu, ChevronDown, LogOut, Plus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTeam } from '../../contexts/TeamContext'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut, isDemoMode } = useAuth()
  const { teams, currentTeam, selectTeam, createTeam } = useTeam()
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamSeason, setNewTeamSeason] = useState('')
  const [newTeamAge, setNewTeamAge] = useState('')
  const teamRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (teamRef.current && !teamRef.current.contains(e.target as Node)) setTeamDropdownOpen(false)
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return
    await createTeam(newTeamName.trim(), newTeamSeason || undefined, newTeamAge || undefined)
    setShowCreateTeam(false)
    setNewTeamName('')
    setNewTeamSeason('')
    setNewTeamAge('')
  }

  return (
    <>
      <header className="h-14 bg-white border-b border-cream-300 px-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden p-1.5 rounded-lg hover:bg-cream-200 text-navy-400">
            <Menu size={20} />
          </button>

          {/* Team Selector */}
          <div className="relative" ref={teamRef}>
            <button
              onClick={() => setTeamDropdownOpen(!teamDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-cream-100 transition-colors"
            >
              <span className="font-semibold text-navy-700 text-sm">
                {currentTeam?.name || 'Select Team'}
              </span>
              <ChevronDown size={16} className="text-navy-400" />
            </button>
            {teamDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-cream-300 py-1 z-50">
                {teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => {
                      selectTeam(team)
                      setTeamDropdownOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-cream-50 transition-colors ${
                      currentTeam?.id === team.id ? 'bg-cream-100 font-semibold text-accent-red' : 'text-navy-600'
                    }`}
                  >
                    <div>{team.name}</div>
                    {team.season && <div className="text-xs text-navy-300">{team.season}</div>}
                  </button>
                ))}
                <div className="border-t border-cream-200 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setTeamDropdownOpen(false)
                      setShowCreateTeam(true)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-navy-400 hover:bg-cream-50 flex items-center gap-2"
                  >
                    <Plus size={14} />
                    Create New Team
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-cream-100 transition-colors"
          >
            <div className="w-7 h-7 bg-navy-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {isDemoMode ? 'D' : (user?.email?.[0]?.toUpperCase() || '?')}
            </div>
            <ChevronDown size={14} className="text-navy-400" />
          </button>
          {userDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-cream-300 py-1 z-50">
              <div className="px-4 py-2 border-b border-cream-200">
                <div className="text-xs text-navy-300">Signed in as</div>
                <div className="text-sm text-navy-600 font-medium truncate">
                  {isDemoMode ? 'Demo User' : user?.email}
                </div>
              </div>
              <button
                onClick={() => {
                  signOut()
                  setUserDropdownOpen(false)
                }}
                className="w-full text-left px-4 py-2 text-sm text-navy-500 hover:bg-cream-50 flex items-center gap-2"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Create Team Modal */}
      <Modal open={showCreateTeam} onClose={() => setShowCreateTeam(false)} title="Create Team">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-600 mb-1">Team Name *</label>
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="input-field"
              placeholder="e.g. Court Crushers"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-600 mb-1">Season</label>
            <input
              type="text"
              value={newTeamSeason}
              onChange={(e) => setNewTeamSeason(e.target.value)}
              className="input-field"
              placeholder="e.g. Spring 2026"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-600 mb-1">Age Group</label>
            <input
              type="text"
              value={newTeamAge}
              onChange={(e) => setNewTeamAge(e.target.value)}
              className="input-field"
              placeholder="e.g. 12U, High School, Adult"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowCreateTeam(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateTeam} disabled={!newTeamName.trim()}>
              Create Team
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
