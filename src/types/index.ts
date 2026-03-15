export type FieldPosition = 'P' | 'C' | '1B' | '2B' | '3B' | 'SS' | 'LF' | 'CF' | 'RF' | 'DH' | 'BN'

export type BatSide = 'L' | 'R' | 'S'
export type ThrowHand = 'L' | 'R'
export type GameType = 'game' | 'practice' | 'scrimmage' | 'tournament'

export interface Team {
  id: string
  user_id: string
  name: string
  season: string | null
  age_group: string | null
  created_at: string
  updated_at: string
}

export interface Player {
  id: string
  team_id: string
  first_name: string
  last_name: string
  jersey_number: number | null
  bats: BatSide | null
  throws: ThrowHand | null
  preferred_positions: FieldPosition[]
  active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Game {
  id: string
  team_id: string
  game_date: string
  opponent: string | null
  is_home: boolean
  location: string | null
  game_type: GameType
  notes: string | null
  gamechanger_id: string | null
  score_us: number | null
  score_them: number | null
  created_at: string
  updated_at: string
}

export interface Lineup {
  id: string
  game_id: string
  team_id: string
  label: string
  is_final: boolean
  created_at: string
  updated_at: string
}

export interface LineupEntry {
  id: string
  lineup_id: string
  player_id: string
  batting_order: number
  field_position: FieldPosition
  inning_start: number
  inning_end: number | null
  created_at: string
}

export interface PlayerPositionHistory {
  id: string
  player_id: string
  team_id: string
  field_position: FieldPosition
  times_played: number
}

export interface PlayerBattingHistory {
  id: string
  player_id: string
  team_id: string
  batting_order: number
  times_batted: number
  hits: number
  at_bats: number
}

// Local state types (not persisted directly)
export interface LineupSlot {
  battingOrder: number
  playerId: string | null
  fieldPosition: FieldPosition | null
}

export interface DraftLineup {
  gameId: string
  lineupId: string | null
  slots: LineupSlot[]
  benchPlayerIds: string[]
}

export interface AutoSuggestResult {
  battingOrder: number
  playerId: string
  score: number
  rationale: string
}

export interface PlayerImportRow {
  firstName: string
  lastName: string
  jerseyNumber?: number
  bats?: BatSide
  throws?: ThrowHand
  preferredPositions?: FieldPosition[]
}
