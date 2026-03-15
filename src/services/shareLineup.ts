import type { Player, DraftLineup, Game } from '../types'

export function formatLineupText(
  draft: DraftLineup,
  players: Player[],
  game?: Game | null,
  teamName?: string
): string {
  const playerMap = new Map(players.map(p => [p.id, p]))
  const lines: string[] = []

  // Header
  if (game) {
    const dateStr = new Date(game.game_date + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    if (game.opponent) {
      lines.push(`${teamName || 'Team'} ${game.is_home ? 'vs' : '@'} ${game.opponent}`)
    } else {
      lines.push(`${teamName || 'Team'} - ${game.game_type.charAt(0).toUpperCase() + game.game_type.slice(1)}`)
    }
    lines.push(dateStr)
    if (game.location) lines.push(game.location)
  } else {
    lines.push(teamName || 'Lineup')
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━━━')
  lines.push('')
  lines.push('BATTING ORDER')

  for (const slot of draft.slots) {
    const player = slot.playerId ? playerMap.get(slot.playerId) : null
    if (player) {
      const num = player.jersey_number != null ? `#${player.jersey_number.toString().padStart(2)}` : '   '
      const pos = slot.fieldPosition ? ` (${slot.fieldPosition})` : ''
      lines.push(`${slot.battingOrder}. ${num} ${player.first_name} ${player.last_name}${pos}`)
    } else {
      lines.push(`${slot.battingOrder}. --- Empty ---`)
    }
  }

  // Field positions summary
  lines.push('')
  lines.push('FIELD POSITIONS')
  const positionOrder = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH']
  for (const pos of positionOrder) {
    const slot = draft.slots.find(s => s.fieldPosition === pos)
    const player = slot?.playerId ? playerMap.get(slot.playerId) : null
    if (player) {
      const num = player.jersey_number != null ? `#${player.jersey_number.toString().padStart(2)}` : '   '
      lines.push(`${pos.padEnd(3)} ${num} ${player.first_name} ${player.last_name}`)
    }
  }

  lines.push('')
  lines.push('— Diamond Manager')

  return lines.join('\n')
}

export async function shareLineup(text: string): Promise<boolean> {
  // Try Web Share API (mobile)
  if (navigator.share) {
    try {
      await navigator.share({ text })
      return true
    } catch {
      // User cancelled or not supported
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Last resort: textarea copy
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    return true
  }
}
