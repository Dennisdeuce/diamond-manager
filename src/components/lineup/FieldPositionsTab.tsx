import { memo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { clsx } from 'clsx'
import { DiamondSVG } from './DiamondSVG'
import { Badge } from '../ui/Badge'
import type { Player, DraftLineup, FieldPosition, PlayerPositionHistory } from '../../types'
import { FIELD_POSITIONS } from '../../lib/constants'

interface FieldPositionsTabProps {
  draft: DraftLineup
  players: Player[]
  positionHistory?: PlayerPositionHistory[]
}

export const FieldPositionsTab = memo(function FieldPositionsTab({ draft, players, positionHistory = [] }: FieldPositionsTabProps) {
  const playerMap = new Map(players.map(p => [p.id, p]))

  // Build position history map: playerId -> { position -> count }
  const historyMap = new Map<string, Map<string, number>>()
  for (const h of positionHistory) {
    if (!historyMap.has(h.player_id)) historyMap.set(h.player_id, new Map())
    historyMap.get(h.player_id)!.set(h.field_position, h.times_played)
  }

  // DH slot (not on diamond)
  const dhSlot = draft.slots.find(s => s.fieldPosition === 'DH')
  const dhPlayer = dhSlot?.playerId ? playerMap.get(dhSlot.playerId) : null

  const { setNodeRef: dhRef, isOver: dhOver } = useDroppable({
    id: 'field-pos-DH',
    data: { type: 'field-position', position: 'DH' },
  })

  return (
    <div>
      {/* Diamond Visualization */}
      <div className="bg-gradient-to-b from-field-green to-field-greenLight rounded-2xl p-4 mb-4 shadow-inner">
        <DiamondSVG draft={draft} players={players} />
      </div>

      {/* DH Slot */}
      <div
        ref={dhRef}
        className={clsx(
          'flex items-center gap-3 p-3 rounded-lg border-2 mb-4 transition-all duration-200',
          dhOver
            ? 'border-accent-red bg-accent-red/5'
            : dhPlayer
              ? 'border-navy-200 bg-white shadow-sm'
              : 'border-dashed border-cream-300 bg-cream-50'
        )}
      >
        <div className={clsx(
          'w-8 h-8 rounded-full flex items-center justify-center font-condensed font-bold text-sm shrink-0',
          dhPlayer ? 'bg-navy-500 text-white' : 'bg-cream-300 text-navy-400'
        )}>
          DH
        </div>
        <div className="flex-1 text-sm">
          {dhPlayer ? (
            <span className="font-medium text-navy-700">
              #{dhPlayer.jersey_number} {dhPlayer.first_name} {dhPlayer.last_name}
            </span>
          ) : (
            <span className="text-navy-300 italic">Designated Hitter — drag a player here</span>
          )}
        </div>
      </div>

      {/* Position Assignment Summary */}
      <div className="card">
        <h3 className="text-sm font-semibold text-navy-600 mb-3">Position Assignments</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FIELD_POSITIONS.filter(p => p.code !== 'BN').map(({ code, label }) => {
            const slot = draft.slots.find(s => s.fieldPosition === code)
            const player = slot?.playerId ? playerMap.get(slot.playerId) : null
            const count = player ? historyMap.get(player.id)?.get(code) || 0 : 0

            return (
              <div key={code} className="flex items-center gap-2 p-2 rounded-lg bg-cream-50">
                <span className="text-xs font-bold text-navy-400 w-6">{code}</span>
                {player ? (
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-navy-700 truncate">
                      {player.first_name} {player.last_name[0]}.
                    </div>
                    {count > 0 && (
                      <div className="text-[10px] text-navy-300">{count}x at {code}</div>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-navy-300">Empty</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
})
