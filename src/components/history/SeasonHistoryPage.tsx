import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTeam } from '../../contexts/TeamContext'
import { useGames } from '../../hooks/useGames'
import { usePlayers } from '../../hooks/usePlayers'
import { usePageTitle } from '../../hooks/usePageTitle'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { EmptyState } from '../ui/EmptyState'
import { Tabs } from '../ui/Tabs'
import { FIELD_POSITIONS } from '../../lib/constants'
import type { FieldPosition, PlayerPositionHistory } from '../../types'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

function PositionMatrix({ players, positionHistory }: {
  players: { id: string; first_name: string; last_name: string; jersey_number: number | null }[]
  positionHistory: PlayerPositionHistory[]
}) {
  const positions = FIELD_POSITIONS.filter(p => p.code !== 'BN' && p.code !== 'DH')

  // Build matrix: playerId -> position -> count
  const matrix = new Map<string, Map<string, number>>()
  for (const h of positionHistory) {
    if (!matrix.has(h.player_id)) matrix.set(h.player_id, new Map())
    matrix.get(h.player_id)!.set(h.field_position, h.times_played)
  }

  if (players.length === 0) {
    return <EmptyState title="No Players" description="Add players to your roster to see the position matrix." />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-cream-300">
            <th className="text-left px-3 py-2 text-navy-500 font-semibold sticky left-0 bg-white">Player</th>
            {positions.map(p => (
              <th key={p.code} className="text-center px-2 py-2 text-navy-500 font-semibold min-w-[40px]">
                {p.code}
              </th>
            ))}
            <th className="text-center px-2 py-2 text-navy-500 font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {players.map(player => {
            const playerCounts = matrix.get(player.id) || new Map()
            const total = Array.from(playerCounts.values()).reduce((a, b) => a + b, 0)

            return (
              <tr key={player.id} className="border-b border-cream-200 hover:bg-cream-50">
                <td className="px-3 py-2 text-navy-700 font-medium sticky left-0 bg-white whitespace-nowrap">
                  {player.jersey_number != null && (
                    <span className="text-navy-300 font-condensed mr-1">#{player.jersey_number}</span>
                  )}
                  {player.first_name} {player.last_name}
                </td>
                {positions.map(p => {
                  const count = playerCounts.get(p.code) || 0
                  return (
                    <td key={p.code} className="text-center px-2 py-2">
                      {count > 0 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-navy-500/10 text-navy-700 font-semibold text-xs">
                          {count}
                        </span>
                      ) : (
                        <span className="text-navy-200">-</span>
                      )}
                    </td>
                  )
                })}
                <td className="text-center px-2 py-2 font-semibold text-navy-600">{total || '-'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function SeasonHistoryPage() {
  usePageTitle('Season History')
  const { currentTeam } = useTeam()
  const { isDemoMode } = useAuth()
  const { games } = useGames()
  const { players } = usePlayers()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('matrix')
  const [positionHistory, setPositionHistory] = useState<PlayerPositionHistory[]>([])

  useEffect(() => {
    if (!currentTeam || isDemoMode) return
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('player_position_history')
        .select('*')
        .eq('team_id', currentTeam.id)
      if (data) setPositionHistory(data)
    }
    fetchHistory()
  }, [currentTeam, isDemoMode])

  if (!currentTeam) {
    return <EmptyState title="No Team Selected" description="Select a team to view season history." />
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-700">Season History</h1>
        <p className="text-sm text-navy-400">
          {currentTeam.name} {currentTeam.season ? `- ${currentTeam.season}` : ''}
        </p>
      </div>

      <Tabs
        tabs={[
          { id: 'matrix', label: 'Position Matrix' },
          { id: 'games', label: 'Game Log' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-4">
        {activeTab === 'matrix' ? (
          <Card>
            <h3 className="text-sm font-semibold text-navy-600 mb-4">
              Position Play Counts
              <span className="text-navy-300 font-normal ml-2">(from finalized lineups)</span>
            </h3>
            <PositionMatrix players={players} positionHistory={positionHistory} />
            {positionHistory.length === 0 && players.length > 0 && (
              <p className="text-sm text-navy-300 text-center mt-4 italic">
                No finalized lineups yet. Finalize a game lineup to start tracking position history.
              </p>
            )}
          </Card>
        ) : (
          <div className="space-y-2">
            {games.length === 0 ? (
              <EmptyState
                title="No Games Yet"
                description="Schedule games to see your game log."
                actionLabel="Add Game"
                onAction={() => navigate('/games')}
              />
            ) : (
              games.map(game => (
                <Card
                  key={game.id}
                  hover
                  onClick={() => navigate(`/lineup/${game.id}`)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-navy-400">
                      {new Date(game.game_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-navy-700">
                        {game.opponent ? `${game.is_home ? 'vs' : '@'} ${game.opponent}` : 'Practice'}
                      </span>
                    </div>
                    <Badge variant={game.game_type === 'game' ? 'info' : 'success'} size="sm">
                      {game.game_type}
                    </Badge>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
