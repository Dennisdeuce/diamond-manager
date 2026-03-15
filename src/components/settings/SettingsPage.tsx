import { useState, useEffect } from 'react'
import { useTeam } from '../../contexts/TeamContext'
import { useAuth } from '../../contexts/AuthContext'
import { usePageTitle } from '../../hooks/usePageTitle'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'

export function SettingsPage() {
  usePageTitle('Settings')
  const { currentTeam, updateTeam } = useTeam()
  const { isDemoMode } = useAuth()
  const [teamName, setTeamName] = useState(currentTeam?.name || '')
  const [teamSeason, setTeamSeason] = useState(currentTeam?.season || '')
  const [teamAge, setTeamAge] = useState(currentTeam?.age_group || '')
  const [saved, setSaved] = useState(false)

  // Sync form state when switching teams
  useEffect(() => {
    if (currentTeam) {
      setTeamName(currentTeam.name)
      setTeamSeason(currentTeam.season || '')
      setTeamAge(currentTeam.age_group || '')
    }
  }, [currentTeam?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!currentTeam) {
    return <EmptyState title="No Team Selected" description="Select a team to manage settings." />
  }

  const handleSaveTeam = async () => {
    await updateTeam(currentTeam.id, {
      name: teamName.trim() || currentTeam.name,
      season: teamSeason.trim() || null,
      age_group: teamAge.trim() || null,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
              maxLength={100}
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
                maxLength={50}
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
                maxLength={30}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="primary" size="sm" onClick={handleSaveTeam} disabled={isDemoMode}>
              {saved ? 'Saved!' : 'Save Changes'}
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

        <div className="flex items-center gap-3 p-3 rounded-lg bg-cream-50 border border-cream-300">
          <div className="w-3 h-3 rounded-full bg-navy-300" />
          <span className="text-sm text-navy-600 font-medium">Coming Soon</span>
        </div>
        <p className="text-xs text-navy-300 mt-3">
          GameChanger API integration is under development. For now, import players from the Roster page using CSV.
        </p>
      </Card>

      {/* About */}
      <Card>
        <h2 className="text-lg font-bold text-navy-700 mb-2">About Diamond Manager</h2>
        <p className="text-sm text-navy-400">
          Version 1.1.0 — Your season's source of truth for lineups, batting orders, and field positions.
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
