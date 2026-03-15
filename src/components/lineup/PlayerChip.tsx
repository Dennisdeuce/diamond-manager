import { useDraggable } from '@dnd-kit/core'
import { clsx } from 'clsx'
import { GripVertical, X } from 'lucide-react'
import type { Player, FieldPosition } from '../../types'

interface PlayerChipProps {
  player: Player
  variant?: 'lineup' | 'bench'
  fieldPosition?: FieldPosition | null
  showRemove?: boolean
  onRemove?: () => void
  dragId?: string
}

export function PlayerChip({ player, variant = 'bench', fieldPosition, showRemove, onRemove, dragId }: PlayerChipProps) {
  const id = dragId || `player-${player.id}`
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { type: 'player', playerId: player.id, player },
  })

  const style = transform ? {
    transform: `translate(${transform.x}px, ${transform.y}px)`,
    zIndex: 50,
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full text-sm font-medium transition-all duration-150',
        isDragging && 'opacity-50',
        variant === 'lineup'
          ? 'bg-navy-500 text-white px-3 py-1.5 shadow-sm'
          : 'bg-cream-300 text-navy-600 px-3 py-1.5 hover:bg-cream-400 cursor-grab active:cursor-grabbing'
      )}
    >
      <span {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing touch-none">
        <GripVertical size={14} className="opacity-50" />
      </span>
      {player.jersey_number != null && (
        <span className={clsx(
          'font-condensed font-bold text-xs',
          variant === 'lineup' ? 'text-cream-300' : 'text-navy-400'
        )}>
          #{player.jersey_number}
        </span>
      )}
      <span className="truncate max-w-[100px]">
        {player.first_name} {player.last_name[0]}.
      </span>
      {fieldPosition && (
        <span className={clsx(
          'text-xs font-bold px-1.5 py-0.5 rounded',
          variant === 'lineup' ? 'bg-white/20' : 'bg-navy-500/10'
        )}>
          {fieldPosition}
        </span>
      )}
      {showRemove && onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="p-0.5 rounded-full hover:bg-white/20 transition-colors"
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
}
