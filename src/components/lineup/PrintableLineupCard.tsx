import type { Player, DraftLineup, Game } from '../../types'
import { FIELD_POSITIONS } from '../../lib/constants'

interface PrintableLineupCardProps {
  draft: DraftLineup
  players: Player[]
  game?: Game | null
  teamName?: string
}

export function PrintableLineupCard({ draft, players, game, teamName }: PrintableLineupCardProps) {
  const playerMap = new Map(players.map(p => [p.id, p]))

  const dateStr = game
    ? new Date(game.game_date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : ''

  const positionOrder = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'] as const

  return (
    <div className="print-lineup-card bg-white p-6 max-w-lg mx-auto border-2 border-navy-700 rounded-lg">
      {/* Header */}
      <div className="text-center border-b-2 border-navy-700 pb-3 mb-4">
        <h1 className="text-2xl font-condensed font-bold text-navy-700 uppercase tracking-wider">
          {teamName || 'Team Lineup'}
        </h1>
        {game && (
          <div className="mt-1">
            <div className="text-base font-semibold text-navy-600">
              {game.opponent
                ? `${game.is_home ? 'vs' : '@'} ${game.opponent}`
                : game.game_type.charAt(0).toUpperCase() + game.game_type.slice(1)}
            </div>
            <div className="text-sm text-navy-400">{dateStr}</div>
            {game.location && <div className="text-xs text-navy-300">{game.location}</div>}
          </div>
        )}
      </div>

      {/* Two-column layout: Batting Order + Field Positions */}
      <div className="grid grid-cols-2 gap-4">
        {/* Batting Order */}
        <div>
          <h2 className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-2 border-b border-navy-200 pb-1">
            Batting Order
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-navy-400">
                <th className="text-left w-6">#</th>
                <th className="text-left w-8">No.</th>
                <th className="text-left">Player</th>
                <th className="text-center w-8">Pos</th>
              </tr>
            </thead>
            <tbody>
              {draft.slots.map((slot) => {
                const player = slot.playerId ? playerMap.get(slot.playerId) : null
                return (
                  <tr key={slot.battingOrder} className="border-b border-cream-200">
                    <td className="py-1.5 font-bold text-navy-700 font-condensed text-base">
                      {slot.battingOrder}
                    </td>
                    <td className="py-1.5 text-navy-400 font-condensed">
                      {player?.jersey_number != null ? `#${player.jersey_number}` : ''}
                    </td>
                    <td className="py-1.5 font-medium text-navy-700">
                      {player ? `${player.first_name} ${player.last_name}` : '_______________'}
                    </td>
                    <td className="py-1.5 text-center font-bold text-navy-500 text-xs">
                      {slot.fieldPosition || ''}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Field Positions */}
        <div>
          <h2 className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-2 border-b border-navy-200 pb-1">
            Field Positions
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-navy-400">
                <th className="text-left w-10">Pos</th>
                <th className="text-left w-8">No.</th>
                <th className="text-left">Player</th>
              </tr>
            </thead>
            <tbody>
              {positionOrder.map((pos) => {
                const slot = draft.slots.find(s => s.fieldPosition === pos)
                const player = slot?.playerId ? playerMap.get(slot.playerId) : null
                return (
                  <tr key={pos} className="border-b border-cream-200">
                    <td className="py-1.5 font-bold text-navy-600 text-xs">{pos}</td>
                    <td className="py-1.5 text-navy-400 font-condensed">
                      {player?.jersey_number != null ? `#${player.jersey_number}` : ''}
                    </td>
                    <td className="py-1.5 font-medium text-navy-700">
                      {player ? `${player.first_name} ${player.last_name}` : '_______________'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Mini Diamond Diagram */}
          <div className="mt-3 flex justify-center">
            <svg viewBox="0 0 120 120" width="100" height="100">
              <polygon points="60,20 100,55 60,90 20,55" fill="none" stroke="#1B2A4A" strokeWidth="1" opacity="0.3" />
              {/* Position labels */}
              <text x="60" y="42" textAnchor="middle" fontSize="7" fill="#1B2A4A" fontWeight="bold">P</text>
              <text x="60" y="100" textAnchor="middle" fontSize="7" fill="#1B2A4A" fontWeight="bold">C</text>
              <text x="95" y="58" textAnchor="middle" fontSize="7" fill="#1B2A4A" fontWeight="bold">1B</text>
              <text x="75" y="32" textAnchor="middle" fontSize="7" fill="#1B2A4A" fontWeight="bold">2B</text>
              <text x="25" y="58" textAnchor="middle" fontSize="7" fill="#1B2A4A" fontWeight="bold">3B</text>
              <text x="42" y="32" textAnchor="middle" fontSize="7" fill="#1B2A4A" fontWeight="bold">SS</text>
              <text x="12" y="18" textAnchor="middle" fontSize="7" fill="#1B2A4A" fontWeight="bold">LF</text>
              <text x="60" y="10" textAnchor="middle" fontSize="7" fill="#1B2A4A" fontWeight="bold">CF</text>
              <text x="108" y="18" textAnchor="middle" fontSize="7" fill="#1B2A4A" fontWeight="bold">RF</text>
            </svg>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t-2 border-navy-700 flex justify-between items-end">
        <div>
          <div className="text-xs text-navy-300">Coach Signature</div>
          <div className="mt-1 w-40 border-b border-navy-400" />
        </div>
        <div className="text-[10px] text-navy-300 text-right">
          Diamond Manager
        </div>
      </div>
    </div>
  )
}

export function handlePrintLineup() {
  window.print()
}
