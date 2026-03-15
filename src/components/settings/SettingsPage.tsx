import { useState, useRef } from 'react'
import { Upload, ExternalLink, RefreshCw } from 'lucide-react'
import { useTeam } from '../../contexts/TeamContext'
import { useAuth } from '../../contexts/AuthContext'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { parseSpreadsheet } from '../../services/playerImport'

export function SettingsPage() {
  const { currentTeam, updateTeam } = useTeam()
  const { isDemoMode } = useAuth()
  const [teamName, setTeamName] = useState(currentTeam?.name || '')
  const [teamSeason, setTeamSeason] = useState(currentTeam?.season || '')
  const [teamAge, setTeamAge] = useState(currentTeam?.age_group || '')
  const [gcStatus, setGcStatus] = useState<'disconnected' | 'connected'>('disconnected')
  const fileRef = useRef<HTMLInputElement>(null)

  if (!currentTeam) {
    return <EmptyState title="No Team Selected" description="Select a team to manage settings." />
  }

  const handleSaveTeam = async () => {
    await updateTeam(currentTeam.id, {
      name: teamName.trim() || currentTeam.name,
      season: teamSeason.trim() || null,
      age_group: teamAge.trim() || null,
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-navy-700">Settings</h1>

      {/* Team Settings */}
      <Card>
        <h2 className="text-lg font-bold text-navy-700 mb-4">Team Info</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-navy-600 mb-1">Team Name</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-navy-600 mb-1">Season</label>
              <input
                type="text"
                value={teamSeason}
                onChange={(e) => setTeamSeason(e.target.value)}
                className="input-field"
                placeholder="e.g. Spring 2026"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-600 mb-1">Age Group</label>
              <input
                type="text"
                value={teamAge}
                onChange={(e) => setTeamAge(e.target.value)}
                className="input-field"
                placeholder="e.g. 12U"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="primary" size="sm" onClick={handleSaveTeam} disabled={isDemoMode}>
              Save Changes
            </Button>
          </div>
        </div>
      </Card>

      {/* GameChanger Integration */}
      <Card>
        <h2 className="text-lg font-bold text-navy-700 mb-2">GameChanger Integration</h2>
        <p className="text-sm text-navy-400 mb-4">
          Import player stats and game data from GameChanger to power auto-suggestions.
        </p>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-cream-50 border border-cream-300 mb-4">
          <div className={`w-3 h-3 rounded-full ${gcStatus === 'connected' ? 'bg-green-500' : 'bg-navy-300'}`} />
          <span className="text-sm text-navy-600 font-medium">
            {gcStatus === 'connected' ? 'Connected to GameChanger' : 'Not Connected'}
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-navy-600 mb-2">Import Stats from CSV</h3>
            <p className="text-xs text-navy-300 mb-2">
              Export your team stats from GameChanger as CSV, then upload here.
            </p>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-cream-300 rounded-lg p-6 text-center cursor-pointer hover:border-navy-300 hover:bg-cream-50 transition-all"
            >
              <Upload size={24} className="mx-auto text-navy-300 mb-2" />
              <p className="text-sm text-navy-500">Upload GameChanger CSV export</p>
            </div>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" />
          </div>

          <div className="border-t border-cream-200 pt-3">
            <h3 className="text-sm font-semibold text-navy-600 mb-1">API Connection</h3>
            <p className="text-xs text-navy-300">
              GameChanger API integration coming soon. For now, use CSV import to sync your stats.
            </p>
          </div>
        </div>
      </Card>

      {/* About */}
      <Card>
        <h2 className="text-lg font-bold text-navy-700 mb-2">About Diamond Manager</h2>
        <p className="text-sm text-navy-400">
          Version 1.0.0 — Your season's source of truth for lineups, batting orders, and field positions.
        </p>
        {isDemoMode && (
          <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-700 font-medium">
              Demo Mode — Data is stored locally and will be lost when you clear your browser data.
              Sign in for persistent storage.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
