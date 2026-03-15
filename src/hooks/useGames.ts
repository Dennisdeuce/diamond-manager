import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useTeam } from '../contexts/TeamContext'
import { reportError } from './useErrorReporter'
import type { Game, GameType } from '../types'

const DEMO_GAMES: Game[] = [
  { id: 'demo-g1', team_id: 'demo-team-1', game_date: '2026-03-15', opponent: 'Eagles', is_home: true, location: 'Home Field', game_type: 'game', notes: null, gamechanger_id: null, score_us: 8, score_them: 3, created_at: '', updated_at: '' },
  { id: 'demo-g2', team_id: 'demo-team-1', game_date: '2026-03-18', opponent: 'Panthers', is_home: false, location: 'Central Park', game_type: 'game', notes: null, gamechanger_id: null, score_us: null, score_them: null, created_at: '', updated_at: '' },
  { id: 'demo-g3', team_id: 'demo-team-1', game_date: '2026-03-20', opponent: null, is_home: true, location: 'Home Field', game_type: 'practice', notes: 'Focus on fielding', gamechanger_id: null, score_us: null, score_them: null, created_at: '', updated_at: '' },
]

export function useGames() {
  const { isDemoMode } = useAuth()
  const { currentTeam } = useTeam()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  // Request deduplication
  const fetchInFlight = useRef(false)
  const lastTeamId = useRef<string | null>(null)

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

    if (fetchInFlight.current && lastTeamId.current === currentTeam.id) return
    fetchInFlight.current = true
    lastTeamId.current = currentTeam.id

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('team_id', currentTeam.id)
        .order('game_date', { ascending: true })

      if (error) {
        reportError('Failed to fetch games', 'useGames.fetch', error)
      } else if (data) {
        setGames(data)
      }
    } catch (err) {
      reportError('Network error fetching games', 'useGames.fetch', err)
    } finally {
      setLoading(false)
      fetchInFlight.current = false
    }
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
        score_us: null,
        score_them: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setGames(prev => [...prev, newGame].sort((a, b) => a.game_date.localeCompare(b.game_date)))
      return newGame
    }

    if (!currentTeam) return null

    try {
      const { data, error } = await supabase
        .from('games')
        .insert({ ...game, team_id: currentTeam.id })
        .select()
        .single()

      if (!error && data) {
        setGames(prev => [...prev, data].sort((a, b) => a.game_date.localeCompare(b.game_date)))
        return data
      }
      reportError('Add game failed', 'useGames.add', error)
      return null
    } catch (err) {
      reportError('Add game exception', 'useGames.add', err)
      return null
    }
  }

  const updateGame = async (id: string, updates: Partial<Game>): Promise<boolean> => {
    if (isDemoMode) {
      setGames(prev => prev.map(g => (g.id === id ? { ...g, ...updates } : g)))
      return true
    }

    // Optimistic update with rollback
    const previousGames = games
    setGames(prev => prev.map(g => (g.id === id ? { ...g, ...updates } : g)))

    try {
      const { data, error } = await supabase
        .from('games')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (!error && data) {
        setGames(prev => prev.map(g => (g.id === id ? data : g)))
        return true
      }
      reportError('Update game failed', 'useGames.update', error)
      setGames(previousGames)
      return false
    } catch (err) {
      reportError('Update game exception', 'useGames.update', err)
      setGames(previousGames)
      return false
    }
  }

  const deleteGame = async (id: string): Promise<boolean> => {
    if (isDemoMode) {
      setGames(prev => prev.filter(g => g.id !== id))
      return true
    }

    // Optimistic delete with rollback
    const previousGames = games
    setGames(prev => prev.filter(g => g.id !== id))

    try {
      const { error } = await supabase.from('games').delete().eq('id', id)
      if (!error) {
        return true
      }
      reportError('Delete game failed', 'useGames.delete', error)
      setGames(previousGames)
      return false
    } catch (err) {
      reportError('Delete game exception', 'useGames.delete', err)
      setGames(previousGames)
      return false
    }
  }

  return { games, loading, addGame, updateGame, deleteGame, refresh: fetchGames }
}
