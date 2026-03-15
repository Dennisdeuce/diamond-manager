import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useTeam } from '../contexts/TeamContext'
import type { Game, GameType } from '../types'

const DEMO_GAMES: Game[] = [
  { id: 'demo-g1', team_id: 'demo-team-1', game_date: '2026-03-15', opponent: 'Eagles', is_home: true, location: 'Home Field', game_type: 'game', notes: null, gamechanger_id: null, created_at: '', updated_at: '' },
  { id: 'demo-g2', team_id: 'demo-team-1', game_date: '2026-03-18', opponent: 'Panthers', is_home: false, location: 'Central Park', game_type: 'game', notes: null, gamechanger_id: null, created_at: '', updated_at: '' },
  { id: 'demo-g3', team_id: 'demo-team-1', game_date: '2026-03-20', opponent: null, is_home: true, location: 'Home Field', game_type: 'practice', notes: 'Focus on fielding', gamechanger_id: null, created_at: '', updated_at: '' },
]

export function useGames() {
  const { isDemoMode } = useAuth()
  const { currentTeam } = useTeam()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGames = useCallback(async () => {
    if (isDemoMode) {
      setGames(DEMO_GAMES)
      setLoading(false)
      return
    }
    if (!currentTeam) {
      setGames([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('team_id', currentTeam.id)
      .order('game_date', { ascending: true })

    if (!error && data) setGames(data)
    setLoading(false)
  }, [currentTeam, isDemoMode])

  useEffect(() => { fetchGames() }, [fetchGames])

  const addGame = async (game: {
    game_date: string
    opponent?: string
    is_home?: boolean
    location?: string
    game_type?: GameType
    notes?: string
  }): Promise<Game | null> => {
    if (isDemoMode) {
      const newGame: Game = {
        id: `demo-g${Date.now()}`,
        team_id: 'demo-team-1',
        game_date: game.game_date,
        opponent: game.opponent || null,
        is_home: game.is_home ?? true,
        location: game.location || null,
        game_type: game.game_type || 'game',
        notes: game.notes || null,
        gamechanger_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setGames(prev => [...prev, newGame].sort((a, b) => a.game_date.localeCompare(b.game_date)))
      return newGame
    }

    if (!currentTeam) return null

    const { data, error } = await supabase
      .from('games')
      .insert({ ...game, team_id: currentTeam.id })
      .select()
      .single()

    if (!error && data) {
      setGames(prev => [...prev, data].sort((a, b) => a.game_date.localeCompare(b.game_date)))
      return data
    }
    return null
  }

  const updateGame = async (id: string, updates: Partial<Game>) => {
    if (isDemoMode) {
      setGames(prev => prev.map(g => (g.id === id ? { ...g, ...updates } : g)))
      return
    }

    const { data, error } = await supabase
      .from('games')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      setGames(prev => prev.map(g => (g.id === id ? data : g)))
    }
  }

  const deleteGame = async (id: string) => {
    if (isDemoMode) {
      setGames(prev => prev.filter(g => g.id !== id))
      return
    }

    const { error } = await supabase.from('games').delete().eq('id', id)
    if (!error) setGames(prev => prev.filter(g => g.id !== id))
  }

  return { games, loading, addGame, updateGame, deleteGame, refresh: fetchGames }
}
