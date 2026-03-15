import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import type { Team } from '../types'

interface TeamContextType {
  teams: Team[]
  currentTeam: Team | null
  loading: boolean
  selectTeam: (team: Team) => void
  createTeam: (name: string, season?: string, ageGroup?: string) => Promise<Team | null>
  updateTeam: (id: string, updates: Partial<Pick<Team, 'name' | 'season' | 'age_group'>>) => Promise<void>
  deleteTeam: (id: string) => Promise<void>
  refreshTeams: () => Promise<void>
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

// Demo teams for demo mode
const DEMO_TEAM: Team = {
  id: 'demo-team-1',
  user_id: 'demo-user',
  name: 'Demo Thunder',
  season: 'Spring 2026',
  age_group: '12U',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user, isDemoMode } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshTeams = useCallback(async () => {
    if (isDemoMode) {
      setTeams([DEMO_TEAM])
      setCurrentTeam(DEMO_TEAM)
      setLoading(false)
      return
    }
    if (!user) {
      setTeams([])
      setCurrentTeam(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setTeams(data)
      if (data.length > 0 && !currentTeam) {
        // Restore last selected team from localStorage
        const savedTeamId = localStorage.getItem('selectedTeamId')
        const savedTeam = data.find(t => t.id === savedTeamId)
        setCurrentTeam(savedTeam || data[0])
      }
    }
    setLoading(false)
  }, [user, isDemoMode, currentTeam])

  useEffect(() => {
    refreshTeams()
  }, [user, isDemoMode]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectTeam = (team: Team) => {
    setCurrentTeam(team)
    localStorage.setItem('selectedTeamId', team.id)
  }

  const createTeam = async (name: string, season?: string, ageGroup?: string): Promise<Team | null> => {
    if (isDemoMode) return null
    if (!user) return null

    const { data, error } = await supabase
      .from('teams')
      .insert({ name, season, age_group: ageGroup, user_id: user.id })
      .select()
      .single()

    if (!error && data) {
      setTeams(prev => [data, ...prev])
      setCurrentTeam(data)
      localStorage.setItem('selectedTeamId', data.id)
      return data
    }
    return null
  }

  const updateTeam = async (id: string, updates: Partial<Pick<Team, 'name' | 'season' | 'age_group'>>) => {
    if (isDemoMode) return

    const { data, error } = await supabase
      .from('teams')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      setTeams(prev => prev.map(t => (t.id === id ? data : t)))
      if (currentTeam?.id === id) setCurrentTeam(data)
    }
  }

  const deleteTeam = async (id: string) => {
    if (isDemoMode) return

    const { error } = await supabase.from('teams').delete().eq('id', id)
    if (!error) {
      setTeams(prev => prev.filter(t => t.id !== id))
      if (currentTeam?.id === id) {
        setCurrentTeam(teams.find(t => t.id !== id) || null)
      }
    }
  }

  return (
    <TeamContext.Provider value={{ teams, currentTeam, loading, selectTeam, createTeam, updateTeam, deleteTeam, refreshTeams }}>
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider')
  }
  return context
}
