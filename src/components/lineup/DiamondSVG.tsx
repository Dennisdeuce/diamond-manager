import { useDroppable } from '@dnd-kit/core'
import { clsx } from 'clsx'
import type { Player, FieldPosition, DraftLineup } from '../../types'

// Position coordinates on the diamond (relative to viewBox 0 0 400 400)
const POSITION_COORDS: Record<Exclude<FieldPosition, 'DH' | 'BN'>, { x: number; y: number }> = {
  P:  { x: 200, y: 240 },
  C:  { x: 200, y: 340 },
  '1B': { x: 310, y: 230 },
  '2B': { x: 260, y: 170 },
  '3B': { x: 90, y: 230 },
  SS: { x: 140, y: 170 },
  LF: { x: 60, y: 100 },
  CF: { x: 200, y: 50 },
  RF: { x: 340, y: 100 },
}

function FieldSlot({
  position,
  x,
  y,
  player,
}: {
  position: FieldPosition
  x: number
  y: number
  player: Player | null
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `field-pos-${position}`,
    data: { type: 'field-position', position },
  })

  return (
    <g ref={setNodeRef as any} role="button" aria-label={`${position} position${player ? `: ${player.first_name} ${player.last_name}` : ' — empty, drag a player here'}`}>
      {/* Drop zone circle */}
      <circle
        cx={x}
        cy={y}
        r={28}
        className={clsx(
          'transition-all duration-200',
          isOver
            ? 'fill-white/40 stroke-white stroke-[3]'
            : player
              ? 'fill-white/25 stroke-white/80 stroke-[2]'
              : 'fill-transparent stroke-white/40 stroke-[2] stroke-dasharray-[4,4]'
        )}
        style={{ strokeDasharray: !player && !isOver ? '4 4' : undefined }}
      />
      {/* Position label */}
      <text
        x={x}
        y={player ? y - 8 : y - 2}
        textAnchor="middle"
        className="fill-white/70 text-[11px] font-bold"
        style={{ fontFamily: '"Barlow Condensed", sans-serif' }}
      >
        {position}
      </text>
      {/* Player name */}
      {player && (
        <>
          <text
            x={x}
            y={y + 6}
            textAnchor="middle"
            className="fill-white text-[10px] font-semibold"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {player.jersey_number != null ? `#${player.jersey_number}` : ''}
          </text>
          <text
            x={x}
            y={y + 18}
            textAnchor="middle"
            className="fill-white/90 text-[9px]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {player.first_name[0]}. {player.last_name}
          </text>
        </>
      )}
    </g>
  )
}

interface DiamondSVGProps {
  draft: DraftLineup
  players: Player[]
}

export function DiamondSVG({ draft, players }: DiamondSVGProps) {
  const playerMap = new Map(players.map(p => [p.id, p]))

  // Build position -> player mapping from draft
  const positionPlayerMap = new Map<FieldPosition, Player>()
  for (const slot of draft.slots) {
    if (slot.playerId && slot.fieldPosition && slot.fieldPosition !== 'BN' && slot.fieldPosition !== 'DH') {
      const player = playerMap.get(slot.playerId)
      if (player) positionPlayerMap.set(slot.fieldPosition, player)
    }
  }

  return (
    <svg viewBox="0 0 400 400" className="w-full max-w-md mx-auto">
      {/* Outfield grass */}
      <ellipse cx="200" cy="180" rx="185" ry="170" fill="#2D5A27" opacity="0.9" />

      {/* Infield dirt */}
      <polygon points="200,190 290,250 200,310 110,250" fill="#C4A265" opacity="0.7" />

      {/* Base paths */}
      <polygon points="200,190 290,250 200,310 110,250" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5" />

      {/* Bases */}
      <rect x="194" y="184" width="12" height="12" transform="rotate(45,200,190)" fill="white" /> {/* 2nd base */}
      <rect x="284" y="244" width="12" height="12" transform="rotate(45,290,250)" fill="white" /> {/* 1st base */}
      <rect x="104" y="244" width="12" height="12" transform="rotate(45,110,250)" fill="white" /> {/* 3rd base */}

      {/* Home plate */}
      <polygon points="200,305 194,312 197,318 203,318 206,312" fill="white" />

      {/* Pitcher's mound */}
      <circle cx="200" cy="248" r="6" fill="#D4BA85" />

      {/* Foul lines */}
      <line x1="200" y1="310" x2="20" y2="40" stroke="white" strokeWidth="1" opacity="0.3" />
      <line x1="200" y1="310" x2="380" y2="40" stroke="white" strokeWidth="1" opacity="0.3" />

      {/* Position slots */}
      {(Object.entries(POSITION_COORDS) as [Exclude<FieldPosition, 'DH' | 'BN'>, { x: number; y: number }][]).map(
        ([pos, coords]) => (
          <FieldSlot
            key={pos}
            position={pos as FieldPosition}
            x={coords.x}
            y={coords.y}
            player={positionPlayerMap.get(pos as FieldPosition) || null}
          />
        )
      )}
    </svg>
  )
}
