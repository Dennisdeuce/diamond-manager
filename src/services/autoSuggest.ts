import type { Player, PlayerBattingHistory, AutoSuggestResult } from '../types'
import { BATTING_SLOTS } from '../lib/constants'

/**
 * Auto-suggest batting order based on historical success and player attributes.
 *
 * Scoring factors:
 * 1. Historical batting average at each slot (if GameChanger stats available)
 * 2. Frequency (familiarity) at each slot
 * 3. Player attributes matching slot strategy:
 *    - Slots 1-2: Speed/contact (preferred positions CF, SS suggest speed)
 *    - Slots 3-4: Power (1B, 3B, DH suggest power)
 *    - Slots 5-9: Balanced
 *
 * When no data exists, uses a heuristic based on player attributes.
 */
export function autoSuggestBattingOrder(
  players: Player[],
  battingHistory: PlayerBattingHistory[]
): AutoSuggestResult[] {
  if (players.length === 0) return []

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

  const hasAnyHistory = battingHistory.length > 0

  // Score each player for each slot
  const scores = new Map<string, Map<number, number>>()

  for (const player of players) {
    if (!player.active) continue
    const playerScores = new Map<number, number>()
    const playerHistory = historyMap.get(player.id)

    for (const slot of BATTING_SLOTS) {
      let score = 0.5 // neutral baseline

      // 1. Historical performance at this slot
      const slotHistory = playerHistory?.get(slot)
      if (slotHistory) {
        if (slotHistory.atBats > 0) {
          // Use batting average at this slot
          const avg = slotHistory.hits / slotHistory.atBats
          score = avg * 0.6 + 0.4 // Weight: 60% avg, 40% baseline
        }
        // Familiarity bonus
        score += Math.min(slotHistory.times * 0.02, 0.1)
      }

      // 2. Attribute-based heuristics (when limited data)
      if (!hasAnyHistory || !slotHistory) {
        const positions = new Set(player.preferred_positions)

        if (slot <= 2) {
          // Leadoff/two-hole: favor speed positions
          if (positions.has('CF') || positions.has('SS') || positions.has('2B')) score += 0.15
          if (player.bats === 'S') score += 0.05 // switch hitters get a small boost
        } else if (slot === 3 || slot === 4) {
          // 3/4 hole: favor power positions
          if (positions.has('1B') || positions.has('3B') || positions.has('DH')) score += 0.15
          if (positions.has('LF') || positions.has('RF')) score += 0.08
        } else if (slot === 5 || slot === 6) {
          // Middle: moderate power
          if (positions.has('LF') || positions.has('RF') || positions.has('3B')) score += 0.1
        } else {
          // Bottom: catchers, pitchers, fill
          if (positions.has('C')) score += 0.1
          if (positions.has('P')) score += 0.05
        }
      }

      playerScores.set(slot, score)
    }

    scores.set(player.id, playerScores)
  }

  // Greedy assignment: iterate slots, assign highest-scoring available player
  const activePlayers = players.filter(p => p.active)
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

      if (slotHistory && slotHistory.atBats > 0) {
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
