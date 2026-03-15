import { memo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { clsx } from 'clsx'
import { Wand2 } from 'lucide-react'
import { PlayerChip } from './PlayerChip'
import { Button } from '../ui/Button'
import { BATTING_SLOT_LABELS } from '../../lib/constants'
import type { Player, DraftLineup, PlayerPositionHistory } from '../../types'

interface BattingOrderTabProps {
  draft: DraftLineup
  players: Player[]
  onAutoSuggest: () => void
  onRemove: (playerId: string) => void
  hideAutoSuggest?: boolean
  positionHistory?: PlayerPositionHistory[]
}

function BattingSlot({
  slotNumber,
  player,
  fieldPosition,
  onRemove,
  positionHistory,
}: {
  slotNumber: number
  player: Player | null
  fieldPosition: string | null
  onRemove?: () => void
  positionHistory?: PlayerPositionHistory[]
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `batting-slot-${slotNumber}`,
    data: { type: 'batting-slot', battingOrder: slotNumber },
  })

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'flex items-center gap-3 p-3 rounded-lg border-2 min-h-[60px] transition-all duration-200',
        isOver
          ? 'border-accent-red bg-accent-red/5 shadow-sm'
          : player
            ? 'border-navy-200 bg-white shadow-sm'
            : 'border-dashed border-cream-300 bg-cream-50'
      )}
    >
      {/* Slot Number — scoreboard style */}
      <div className={clsx(
        'w-8 h-8 rounded-md flex items-center justify-center font-condensed font-bold text-lg shrink-0 border',
        player
          ? 'bg-navy-600 text-white border-navy-700 shadow-inner'
          : 'bg-cream-200 text-navy-400 border-cream-300'
      )}>
        {slotNumber}
      </div>

      {/* Player or Empty */}
      <div className="flex-1 min-w-0">
        {player ? (
          <PlayerChip
            player={player}
            variant="lineup"
            fieldPosition={fieldPosition as any}
            showRemove
            onRemove={onRemove}
            dragId={`lineup-player-${player.id}`}
            positionHistory={positionHistory}
          />
        ) : (
          <span className="text-sm text-navy-300 italic">
            {BATTING_SLOT_LABELS[slotNumber]} — drag a player here
          </span>
        )}
      </div>

      {/* Slot Label */}
      <div className="text-xs text-navy-300 font-medium shrink-0 hidden sm:block">
        {BATTING_SLOT_LABELS[slotNumber]}
      </div>
    </div>
  )
}

export const BattingOrderTab = memo(function BattingOrderTab({ draft, players, onAutoSuggest, onRemove, hideAutoSuggest, positionHistory }: BattingOrderTabProps) {
  const playerMap = new Map(players.map(p => [p.id, p]))

  return (
    <div>
      {/* Auto-Suggest Button (hidden when parent provides its own) */}
      {!hideAutoSuggest && (
        <div className="flex justify-end mb-4">
          <Button variant="secondary" size="sm" onClick={onAutoSuggest}>
            <Wand2 size={16} />
            Auto Suggest
          </Button>
        </div>
      )}

      {/* Batting Slots */}
      <div className="space-y-2">
        {draft.slots.map((slot) => {
          const player = slot.playerId ? playerMap.get(slot.playerId) || null : null
          return (
            <BattingSlot
              key={slot.battingOrder}
              slotNumber={slot.battingOrder}
              player={player}
              fieldPosition={slot.fieldPosition}
              onRemove={slot.playerId ? () => onRemove(slot.playerId!) : undefined}
              positionHistory={positionHistory}
            />
          )
        })}
      </div>
    </div>
  )
})
