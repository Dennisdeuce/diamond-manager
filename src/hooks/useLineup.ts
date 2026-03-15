import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useTeam } from '../contexts/TeamContext'
import type { FieldPosition, DraftLineup, LineupSlot } from '../types'
import { BATTING_SLOTS, EMPTY_DRAFT_LINEUP } from '../lib/constants'

export function useLineup(gameId: string | undefined) {
  const { isDemoMode } = useAuth()
  const { currentTeam } = useTeam()
  const [draft, setDraft] = useState<DraftLineup>(EMPTY_DRAFT_LINEUP(gameId || ''))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isFinal, setIsFinal] = useState(false)

  // Load existing lineup from DB
  const loadLineup = useCallback(async () => {
    if (!gameId) { setLoading(false); return }

    if (isDemoMode) {
      // Load from localStorage in demo mode
      const saved = localStorage.getItem(`demo-lineup-${gameId}`)
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as DraftLineup
          setDraft(parsed)
        } catch { /* ignore */ }
      } else {
        setDraft(EMPTY_DRAFT_LINEUP(gameId))
      }
      setLoading(false)
      return
    }

    if (!currentTeam) { setLoading(false); return }

    setLoading(true)
    // Find lineup for this game
    const { data: lineupData } = await supabase
      .from('lineups')
      .select('*')
      .eq('game_id', gameId)
      .eq('label', 'Starting')
      .single()

    if (lineupData) {
      setIsFinal(lineupData.is_final)
      // Load entries
      const { data: entries } = await supabase
        .from('lineup_entries')
        .select('*')
        .eq('lineup_id', lineupData.id)
        .order('batting_order')

      const slots: LineupSlot[] = BATTING_SLOTS.map((order) => {
        const entry = entries?.find(e => e.batting_order === order)
        return {
          battingOrder: order,
          playerId: entry?.player_id || null,
          fieldPosition: (entry?.field_position as FieldPosition) || null,
        }
      })

      setDraft({ gameId, lineupId: lineupData.id, slots, benchPlayerIds: [] })
    } else {
      setDraft(EMPTY_DRAFT_LINEUP(gameId))
    }
    setLoading(false)
  }, [gameId, currentTeam, isDemoMode])

  useEffect(() => { loadLineup() }, [loadLineup])

  // Assign a player to a batting order slot
  const assignToBattingOrder = (playerId: string, battingOrder: number) => {
    setDraft(prev => {
      const newSlots = [...prev.slots]

      // Remove player from any existing slot
      const existingIdx = newSlots.findIndex(s => s.playerId === playerId)
      const targetIdx = newSlots.findIndex(s => s.battingOrder === battingOrder)

      if (targetIdx === -1) return prev

      // If target slot has a player, swap them
      const targetPlayerId = newSlots[targetIdx].playerId
      const targetFieldPos = newSlots[targetIdx].fieldPosition

      if (existingIdx !== -1) {
        // Swap
        newSlots[existingIdx] = {
          ...newSlots[existingIdx],
          playerId: targetPlayerId,
          fieldPosition: targetFieldPos,
        }
      }

      newSlots[targetIdx] = {
        ...newSlots[targetIdx],
        playerId,
        fieldPosition: newSlots[targetIdx].fieldPosition,
      }

      return { ...prev, slots: newSlots }
    })
  }

  // Assign a field position to a player already in a batting slot
  const assignFieldPosition = (playerId: string, position: FieldPosition) => {
    setDraft(prev => {
      const newSlots = [...prev.slots]

      // Remove this position from any other player
      for (let i = 0; i < newSlots.length; i++) {
        if (newSlots[i].fieldPosition === position && newSlots[i].playerId !== playerId) {
          newSlots[i] = { ...newSlots[i], fieldPosition: null }
        }
      }

      // Assign position to the player
      const playerIdx = newSlots.findIndex(s => s.playerId === playerId)
      if (playerIdx !== -1) {
        newSlots[playerIdx] = { ...newSlots[playerIdx], fieldPosition: position }
      }

      return { ...prev, slots: newSlots }
    })
  }

  // Assign player directly to a field position (puts them in first open batting slot if not in lineup)
  const assignToFieldPosition = (playerId: string, position: FieldPosition) => {
    setDraft(prev => {
      const newSlots = [...prev.slots]

      // Clear this position from any other player
      for (let i = 0; i < newSlots.length; i++) {
        if (newSlots[i].fieldPosition === position) {
          newSlots[i] = { ...newSlots[i], fieldPosition: null }
        }
      }

      // Check if player is already in lineup
      const playerIdx = newSlots.findIndex(s => s.playerId === playerId)
      if (playerIdx !== -1) {
        newSlots[playerIdx] = { ...newSlots[playerIdx], fieldPosition: position }
      } else {
        // Find first empty batting slot and put them there
        const emptyIdx = newSlots.findIndex(s => s.playerId === null)
        if (emptyIdx !== -1) {
          newSlots[emptyIdx] = { ...newSlots[emptyIdx], playerId, fieldPosition: position }
        }
      }

      return { ...prev, slots: newSlots }
    })
  }

  // Remove a player from the lineup
  const removeFromLineup = (playerId: string) => {
    setDraft(prev => ({
      ...prev,
      slots: prev.slots.map(s =>
        s.playerId === playerId ? { ...s, playerId: null, fieldPosition: null } : s
      ),
    }))
  }

  // Set entire batting order (for auto-suggest)
  const setFullBattingOrder = (order: { battingOrder: number; playerId: string }[]) => {
    setDraft(prev => {
      const newSlots = prev.slots.map(s => {
        const match = order.find(o => o.battingOrder === s.battingOrder)
        return match ? { ...s, playerId: match.playerId } : { ...s, playerId: null }
      })
      return { ...prev, slots: newSlots }
    })
  }

  // Clear all assignments
  const clearLineup = () => {
    setDraft(prev => ({
      ...prev,
      slots: prev.slots.map(s => ({ ...s, playerId: null, fieldPosition: null })),
    }))
  }

  const [saveError, setSaveError] = useState<string | null>(null)

  // Save lineup to DB (atomic via RPC)
  const saveLineup = async (finalize = false): Promise<boolean> => {
    if (!gameId || !currentTeam) return false

    if (isDemoMode) {
      localStorage.setItem(`demo-lineup-${gameId}`, JSON.stringify(draft))
      return true
    }

    setSaving(true)
    setSaveError(null)

    const entries = draft.slots
      .filter(s => s.playerId)
      .map(s => ({
        player_id: s.playerId!,
        batting_order: s.battingOrder,
        field_position: s.fieldPosition || 'BN',
      }))

    try {
      const { data: lineupId, error } = await supabase.rpc('save_lineup_entries', {
        p_lineup_id: draft.lineupId || null,
        p_game_id: gameId,
        p_team_id: currentTeam.id,
        p_is_final: finalize,
        p_entries: entries,
      })

      if (error) {
        console.error('Save lineup error:', error)
        setSaveError(error.message || 'Failed to save lineup')
        setSaving(false)
        return false
      }

      setDraft(prev => ({ ...prev, lineupId: lineupId as string }))
      setIsFinal(finalize)
      setSaving(false)
      return true
    } catch (err) {
      console.error('Save lineup exception:', err)
      setSaveError('Network error — check your connection and try again.')
      setSaving(false)
      return false
    }
  }

  const assignedPlayerIds = new Set(draft.slots.filter(s => s.playerId).map(s => s.playerId!))
  const assignedPositions = new Set(draft.slots.filter(s => s.fieldPosition).map(s => s.fieldPosition!))

  return {
    draft,
    loading,
    saving,
    saveError,
    isFinal,
    assignToBattingOrder,
    assignFieldPosition,
    assignToFieldPosition,
    removeFromLineup,
    setFullBattingOrder,
    clearLineup,
    saveLineup,
    assignedPlayerIds,
    assignedPositions,
  }
}
