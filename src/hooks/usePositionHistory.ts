import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useTeam } from '../contexts/TeamContext'
import type { PlayerPositionHistory } from '../types'

const DEMO_HISTORY: PlayerPositionHistory[] = [
  { id: 'dh1', player_id: 'demo-p1', team_id: 'demo-team-1', field_position: 'P', times_played: 3 },
  { id: 'dh2', player_id: 'demo-p1', team_id: 'demo-team-1', field_position: 'SS', times_played: 2 },
  { id: 'dh3', player_id: 'demo-p2', team_id: 'demo-team-1', field_position: 'C', times_played: 4 },
  { id: 'dh4', player_id: 'demo-p2', team_id: 'demo-team-1', field_position: '1B', times_played: 1 },
  { id: 'dh5', player_id: 'demo-p3', team_id: 'demo-team-1', field_position: '1B', times_played: 3 },
  { id: 'dh6', player_id: 'demo-p4', team_id: 'demo-team-1', field_position: '2B', times_played: 5 },
  { id: 'dh7', player_id: 'demo-p5', team_id: 'demo-team-1', field_position: 'SS', times_played: 3 },
  { id: 'dh8', player_id: 'demo-p5', team_id: 'demo-team-1', field_position: '3B', times_played: 2 },
  { id: 'dh9', player_id: 'demo-p6', team_id: 'demo-team-1', field_position: '3B', times_played: 4 },
  { id: 'dh10', player_id: 'demo-p7', team_id: 'demo-team-1', field_position: 'LF', times_played: 3 },
  { id: 'dh11', player_id: 'demo-p8', team_id: 'demo-team-1', field_position: 'CF', times_played: 5 },
  { id: 'dh12', player_id: 'demo-p9', team_id: 'demo-team-1', field_position: 'RF', times_played: 2 },
  { id: 'dh13', player_id: 'demo-p9', team_id: 'demo-team-1', field_position: 'LF', times_played: 3 },
]

export function usePositionHistory() {
  const { isDemoMode } = useAuth()
  const { currentTeam } = useTeam()
  const [history, setHistory] = useState<PlayerPositionHistory[]>([])

  const fetch = useCallback(async () => {
    if (isDemoMode) {
      setHistory(DEMO_HISTORY)
      return
    }
    if (!currentTeam) {
      setHistory([])
      return
    }

    const { data, error } = await supabase
      .from('player_position_history')
      .select('*')
      .eq('team_id', currentTeam.id)

    if (!error && data) setHistory(data)
  }, [currentTeam, isDemoMode])

  useEffect(() => { fetch() }, [fetch])

  return { positionHistory: history, refreshHistory: fetch }
}
