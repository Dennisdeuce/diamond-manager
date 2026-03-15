import { memo } from 'react'
import { PlayerChip } from './PlayerChip'
import type { Player } from '../../types'

interface PlayerBenchProps {
  players: Player[]
  assignedPlayerIds: Set<string>
}

export const PlayerBench = memo(function PlayerBench({ players, assignedPlayerIds }: PlayerBenchProps) {
  const benchPlayers = players.filter(p => p.active && !assignedPlayerIds.has(p.id))

  if (benchPlayers.length === 0 && players.length > 0) {
    return (
      <div className="text-center py-4 text-sm text-navy-300">
        All players assigned
      </div>
    )
  }

  if (players.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-navy-300">No players on roster yet.</p>
        <p className="text-xs text-navy-200 mt-1">Add players in the Roster page first.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {benchPlayers.map((player) => (
        <PlayerChip
          key={player.id}
          player={player}
          variant="bench"
          dragId={`bench-player-${player.id}`}
        />
      ))}
    </div>
  )
})
