import { memo } from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import { Badge } from '../ui/Badge'
import type { Player } from '../../types'

interface PlayerCardProps {
  player: Player
  onEdit: (player: Player) => void
  onDelete: (id: string) => void
}

export const PlayerCard = memo(function PlayerCard({ player, onEdit, onDelete }: PlayerCardProps) {
  return (
    <div className="card-hover flex items-center gap-4 group">
      {/* Jersey Number */}
      <div className="w-12 h-12 bg-navy-500 rounded-lg flex items-center justify-center text-white font-condensed font-bold text-lg shrink-0">
        {player.jersey_number != null ? `#${player.jersey_number}` : '--'}
      </div>

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-navy-700">
            {player.first_name} {player.last_name}
          </span>
          {!player.active && <Badge variant="warning">Inactive</Badge>}
        </div>
        <div className="flex items-center gap-3 mt-1">
          {player.preferred_positions.length > 0 && (
            <div className="flex gap-1">
              {player.preferred_positions.map((pos) => (
                <Badge key={pos} variant="info" size="sm">{pos}</Badge>
              ))}
            </div>
          )}
          {player.bats && (
            <span className="text-xs text-navy-300">Bats: {player.bats}</span>
          )}
          {player.throws && (
            <span className="text-xs text-navy-300">Throws: {player.throws}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(player)}
          className="p-2 rounded-lg hover:bg-cream-200 text-navy-400 hover:text-navy-600 transition-colors"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => onDelete(player.id)}
          className="p-2 rounded-lg hover:bg-red-50 text-navy-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
})
