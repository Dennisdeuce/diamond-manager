import type { Player, PlayerBattingHistory, PlayerPositionHistory, AutoSuggestResult, FieldPosition } from '../types'
import { BATTING_SLOTS } from '../lib/constants'

export type SuggestMode = 'performance' | 'fairRotation'

/**
 * Auto-suggest batting order based on historical success and player attributes.
 *
 * Two modes:
 * - "performance": Optimizes for best batting results per slot (default)
 * - "fairRotation": Balances playing time, prioritizes players who have played less
 */
export function autoSuggestBattingOrder(
  players: Player[],
  battingHistory: PlayerBattingHistory[],
  mode: SuggestMode = 'performance'
): AutoSuggestResult[] {
  if (players.length === 0) return []

  const activePlayers = players.filter(p => p.active)
  if (activePlayers.length === 0) return []

  // Build history map: playerId -> { slot -> { times, hits, at_bats } }
  const historyMap = new Map<string, Map<number, { times: number; hits: number; atBats: number }>>()
  for (const h of battingHistory) {
    if (!historyMap.has(h.player_id)) historyMap.set(h.player_id, new Map())
    historyMap.get(h.player_id)!.set(h.batting_order, {
      times: h.times_batted,
      hits: h.hits,
      atBats: h.at_bats,
    })
  }

  // Total times each player has batted (across all slots)
  const totalTimesBatted = new Map<string, number>()
  for (const player of activePlayers) {
    const playerHistory = historyMap.get(player.id)
    let total = 0
    if (playerHistory) {
      for (const [, data] of playerHistory) total += data.times
    }
    totalTimesBatted.set(player.id, total)
  }

  const hasAnyHistory = battingHistory.length > 0
  const maxTimesBatted = Math.max(...Array.from(totalTimesBatted.values()), 1)

  // Score each player for each slot
  const scores = new Map<string, Map<number, number>>()

  for (const player of activePlayers) {
    const playerScores = new Map<number, number>()
    const playerHistory = historyMap.get(player.id)

    for (const slot of BATTING_SLOTS) {
      let score = 0.5

      if (mode === 'fairRotation') {
        // Fair rotation: prioritize players who have played LESS
        const timesPlayed = totalTimesBatted.get(player.id) || 0
        // Inverse score: less play time = higher score
        score = 1 - (timesPlayed / (maxTimesBatted + 1))
        // Small randomization to avoid same order every time
        score += Math.random() * 0.1
      } else {
        // Performance mode: optimize for batting results
        const slotHistory = playerHistory?.get(slot)
        if (slotHistory) {
          if (slotHistory.atBats > 0) {
            const avg = slotHistory.hits / slotHistory.atBats
            score = avg * 0.6 + 0.4
          }
          score += Math.min(slotHistory.times * 0.02, 0.1)
        }

        if (!hasAnyHistory || !playerHistory?.get(slot)) {
          const positions = new Set(player.preferred_positions)
          if (slot <= 2) {
            if (positions.has('CF') || positions.has('SS') || positions.has('2B')) score += 0.15
            if (player.bats === 'S') score += 0.05
          } else if (slot === 3 || slot === 4) {
            if (positions.has('1B') || positions.has('3B') || positions.has('DH')) score += 0.15
            if (positions.has('LF') || positions.has('RF')) score += 0.08
          } else if (slot === 5 || slot === 6) {
            if (positions.has('LF') || positions.has('RF') || positions.has('3B')) score += 0.1
          } else {
            if (positions.has('C')) score += 0.1
            if (positions.has('P')) score += 0.05
          }
        }
      }

      playerScores.set(slot, score)
    }

    scores.set(player.id, playerScores)
  }

  // Greedy assignment
  const assigned = new Set<string>()
  const results: AutoSuggestResult[] = []

  for (const slot of BATTING_SLOTS) {
    if (assigned.size >= activePlayers.length) break

    let bestPlayerId = ''
    let bestScore = -1

    for (const player of activePlayers) {
      if (assigned.has(player.id)) continue
      const playerScore = scores.get(player.id)?.get(slot) || 0.5
      if (playerScore > bestScore) {
        bestScore = playerScore
        bestPlayerId = player.id
      }
    }

    if (bestPlayerId) {
      assigned.add(bestPlayerId)

      const player = activePlayers.find(p => p.id === bestPlayerId)!
      const slotHistory = historyMap.get(bestPlayerId)?.get(slot)
      let rationale = ''

      if (mode === 'fairRotation') {
        const times = totalTimesBatted.get(bestPlayerId) || 0
        rationale = times === 0 ? 'hasn\'t played yet' : `${times} games played (balancing time)`
      } else if (slotHistory && slotHistory.atBats > 0) {
        const avg = (slotHistory.hits / slotHistory.atBats).toFixed(3)
        rationale = `Batting .${avg.slice(2)} in ${slotHistory.atBats} AB at #${slot}`
      } else if (slotHistory) {
        rationale = `${slotHistory.times}x experience at #${slot}`
      } else {
        const reasons: string[] = []
        if (slot <= 2 && player.preferred_positions.some(p => ['CF', 'SS', '2B'].includes(p))) {
          reasons.push('speed profile')
        }
        if ((slot === 3 || slot === 4) && player.preferred_positions.some(p => ['1B', '3B', 'DH'].includes(p))) {
          reasons.push('power profile')
        }
        rationale = reasons.length > 0 ? reasons.join(', ') : 'roster order'
      }

      results.push({
        battingOrder: slot,
        playerId: bestPlayerId,
        score: bestScore,
        rationale,
      })
    }
  }

  return results
}

/**
 * Auto-suggest field positions based on fair rotation.
 * Assigns each active player to the position they've played the LEAST.
 */
export function autoSuggestFieldPositions(
  players: Player[],
  positionHistory: PlayerPositionHistory[],
  mode: SuggestMode = 'fairRotation'
): { playerId: string; position: FieldPosition }[] {
  const activePlayers = players.filter(p => p.active)
  if (activePlayers.length === 0) return []

  const fieldPositions: FieldPosition[] = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF']

  // Build history: playerId -> { position -> count }
  const histMap = new Map<string, Map<string, number>>()
  for (const h of positionHistory) {
    if (!histMap.has(h.player_id)) histMap.set(h.player_id, new Map())
    histMap.get(h.player_id)!.set(h.field_position, h.times_played)
  }

  // Greedy: for each position, assign the player who has played it the least
  const assigned = new Set<string>()
  const results: { playerId: string; position: FieldPosition }[] = []

  for (const pos of fieldPositions) {
    if (assigned.size >= activePlayers.length) break

    let bestPlayerId = ''
    let leastPlayed = Infinity

    for (const player of activePlayers) {
      if (assigned.has(player.id)) continue

      const timesAtPos = histMap.get(player.id)?.get(pos) || 0

      // Prefer players whose preferred_positions include this position
      const prefBonus = player.preferred_positions.includes(pos) ? -0.5 : 0

      const effectiveCount = timesAtPos + prefBonus

      if (effectiveCount < leastPlayed) {
        leastPlayed = effectiveCount
        bestPlayerId = player.id
      }
    }

    if (bestPlayerId) {
      assigned.add(bestPlayerId)
      results.push({ playerId: bestPlayerId, position: pos })
    }
  }

  return results
}
