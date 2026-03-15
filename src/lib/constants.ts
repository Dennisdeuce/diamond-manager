import type { FieldPosition } from '../types'

export const FIELD_POSITIONS: { code: FieldPosition; label: string; number: number }[] = [
  { code: 'P', label: 'Pitcher', number: 1 },
  { code: 'C', label: 'Catcher', number: 2 },
  { code: '1B', label: 'First Base', number: 3 },
  { code: '2B', label: 'Second Base', number: 4 },
  { code: '3B', label: 'Third Base', number: 5 },
  { code: 'SS', label: 'Shortstop', number: 6 },
  { code: 'LF', label: 'Left Field', number: 7 },
  { code: 'CF', label: 'Center Field', number: 8 },
  { code: 'RF', label: 'Right Field', number: 9 },
  { code: 'DH', label: 'Designated Hitter', number: 0 },
  { code: 'BN', label: 'Bench', number: -1 },
]

export const BATTING_SLOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

export const BATTING_SLOT_LABELS: Record<number, string> = {
  1: 'Leadoff',
  2: 'Two-Hole',
  3: 'Three-Hole',
  4: 'Cleanup',
  5: 'Five-Hole',
  6: 'Six-Hole',
  7: 'Seven-Hole',
  8: 'Eight-Hole',
  9: 'Nine-Hole',
}

export const POSITION_ABBREVIATIONS: Record<FieldPosition, string> = {
  P: 'P',
  C: 'C',
  '1B': '1B',
  '2B': '2B',
  '3B': '3B',
  SS: 'SS',
  LF: 'LF',
  CF: 'CF',
  RF: 'RF',
  DH: 'DH',
  BN: 'BN',
}

export const EMPTY_DRAFT_LINEUP = (gameId: string) => ({
  gameId,
  lineupId: null,
  slots: BATTING_SLOTS.map((order) => ({
    battingOrder: order,
    playerId: null,
    fieldPosition: null as FieldPosition | null,
  })),
  benchPlayerIds: [],
})
