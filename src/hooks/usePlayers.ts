import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useTeam } from '../contexts/TeamContext'
import type { Player, PlayerImportRow } from '../types'

// Demo players for demo mode
const DEMO_PLAYERS: Player[] = [
  { id: 'demo-p1', team_id: 'demo-team-1', first_name: 'Jake', last_name: 'Smith', jersey_number: 12, bats: 'R', throws: 'R', preferred_positions: ['SS', 'CF'], active: true, notes: null, created_at: '', updated_at: '' },
  { id: 'demo-p2', team_id: 'demo-team-1', first_name: 'Mike', last_name: 'Jones', jersey_number: 7, bats: 'L', throws: 'L', preferred_positions: ['CF', 'LF'], active: true, notes: null, created_at: '', updated_at: '' },
  { id: 'demo-p3', team_id: 'demo-team-1', first_name: 'Tom', last_name: 'Brown', jersey_number: 24, bats: 'R', throws: 'R', preferred_positions: ['1B', '3B'], active: true, notes: null, created_at: '', updated_at: '' },
  { id: 'demo-p4', team_id: 'demo-team-1', first_name: 'Alex', last_name: 'Lee', jersey_number: 3, bats: 'R', throws: 'R', preferred_positions: ['P'], active: true, notes: null, created_at: '', updated_at: '' },
  { id: 'demo-p5', team_id: 'demo-team-1', first_name: 'Sam', last_name: 'Davis', jersey_number: 18, bats: 'R', throws: 'R', preferred_positions: ['C'], active: true, notes: null, created_at: '', updated_at: '' },
  { id: 'demo-p6', team_id: 'demo-team-1', first_name: 'Chris', last_name: 'Wilson', jersey_number: 5, bats: 'S', throws: 'R', preferred_positions: ['2B', 'SS'], active: true, notes: null, created_at: '', updated_at: '' },
  { id: 'demo-p7', team_id: 'demo-team-1', first_name: 'Ryan', last_name: 'Taylor', jersey_number: 9, bats: 'R', throws: 'R', preferred_positions: ['3B', '1B'], active: true, notes: null, created_at: '', updated_at: '' },
  { id: 'demo-p8', team_id: 'demo-team-1', first_name: 'Matt', last_name: 'Anderson', jersey_number: 22, bats: 'L', throws: 'L', preferred_positions: ['LF', 'RF'], active: true, notes: null, created_at: '', updated_at: '' },
  { id: 'demo-p9', team_id: 'demo-team-1', first_name: 'Josh', last_name: 'Martinez', jersey_number: 15, bats: 'R', throws: 'R', preferred_positions: ['RF', 'CF'], active: true, notes: null, created_at: '', updated_at: '' },
]

export function usePlayers() {
  const { isDemoMode } = useAuth()
  const { currentTeam } = useTeam()
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPlayers = useCallback(async () => {
    if (isDemoMode) {
      setPlayers(DEMO_PLAYERS)
      setLoading(false)
      return
    }
    if (!currentTeam) {
      setPlayers([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', currentTeam.id)
      .order('last_name')

    if (!error && data) {
      setPlayers(data)
    }
    setLoading(false)
  }, [currentTeam, isDemoMode])

  useEffect(() => {
    fetchPlayers()
  }, [fetchPlayers])

  const addPlayer = async (player: Omit<Player, 'id' | 'team_id' | 'created_at' | 'updated_at'>): Promise<Player | null> => {
    if (isDemoMode) {
      const newPlayer: Player = {
        ...player,
        id: `demo-p${Date.now()}`,
        team_id: 'demo-team-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setPlayers(prev => [...prev, newPlayer])
      return newPlayer
    }

    if (!currentTeam) return null

    const { data, error } = await supabase
      .from('players')
      .insert({ ...player, team_id: currentTeam.id })
      .select()
      .single()

    if (!error && data) {
      setPlayers(prev => [...prev, data])
      return data
    }
    return null
  }

  const updatePlayer = async (id: string, updates: Partial<Player>) => {
    if (isDemoMode) {
      setPlayers(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)))
      return
    }

    const { data, error } = await supabase
      .from('players')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      setPlayers(prev => prev.map(p => (p.id === id ? data : p)))
    }
  }

  const deletePlayer = async (id: string) => {
    if (isDemoMode) {
      setPlayers(prev => prev.filter(p => p.id !== id))
      return
    }

    const { error } = await supabase.from('players').delete().eq('id', id)
    if (!error) {
      setPlayers(prev => prev.filter(p => p.id !== id))
    }
  }

  const bulkImport = async (rows: PlayerImportRow[]): Promise<number> => {
    if (!currentTeam && !isDemoMode) return 0

    let count = 0
    for (const row of rows) {
      const result = await addPlayer({
        first_name: row.firstName,
        last_name: row.lastName,
        jersey_number: row.jerseyNumber ?? null,
        bats: row.bats ?? null,
        throws: row.throws ?? null,
        preferred_positions: row.preferredPositions ?? [],
        active: true,
        notes: null,
      })
      if (result) count++
    }
    return count
  }

  const activePlayers = players.filter(p => p.active)

  return { players, activePlayers, loading, addPlayer, updatePlayer, deletePlayer, bulkImport, refresh: fetchPlayers }
}
