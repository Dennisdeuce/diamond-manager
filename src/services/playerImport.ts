import * as XLSX from 'xlsx'
import type { PlayerImportRow, BatSide, ThrowHand, FieldPosition } from '../types'

// Common column name mappings
const FIRST_NAME_KEYS = ['first_name', 'firstname', 'first', 'fname', 'player first name', 'name']
const LAST_NAME_KEYS = ['last_name', 'lastname', 'last', 'lname', 'player last name', 'surname']
const JERSEY_KEYS = ['jersey_number', 'jersey', 'number', '#', 'num', 'uniform', 'jersey_num']
const BATS_KEYS = ['bats', 'bat', 'bat_side', 'batting']
const THROWS_KEYS = ['throws', 'throw', 'throw_hand', 'throwing']
const POSITION_KEYS = ['position', 'positions', 'pos', 'field_position', 'preferred_position']

function normalizeKey(key: string): string {
  return key.toLowerCase().trim().replace(/[^a-z0-9]/g, '')
}

function findColumn(headers: string[], candidates: string[]): string | null {
  const normalizedCandidates = candidates.map(normalizeKey)
  for (const header of headers) {
    if (normalizedCandidates.includes(normalizeKey(header))) {
      return header
    }
  }
  return null
}

function parseBatSide(value: string | undefined): BatSide | undefined {
  if (!value) return undefined
  const v = value.toUpperCase().trim()
  if (v === 'L' || v === 'LEFT') return 'L'
  if (v === 'R' || v === 'RIGHT') return 'R'
  if (v === 'S' || v === 'SWITCH' || v === 'B' || v === 'BOTH') return 'S'
  return undefined
}

function parseThrowHand(value: string | undefined): ThrowHand | undefined {
  if (!value) return undefined
  const v = value.toUpperCase().trim()
  if (v === 'L' || v === 'LEFT') return 'L'
  if (v === 'R' || v === 'RIGHT') return 'R'
  return undefined
}

const VALID_POSITIONS = new Set(['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'])

function parsePositions(value: string | undefined): FieldPosition[] {
  if (!value) return []
  return value
    .split(/[,/;]/)
    .map(p => p.trim().toUpperCase())
    .filter(p => VALID_POSITIONS.has(p)) as FieldPosition[]
}

export function parseSpreadsheet(file: File): Promise<PlayerImportRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)

        if (jsonData.length === 0) {
          resolve([])
          return
        }

        const headers = Object.keys(jsonData[0])
        const firstNameCol = findColumn(headers, FIRST_NAME_KEYS)
        const lastNameCol = findColumn(headers, LAST_NAME_KEYS)
        const jerseyCol = findColumn(headers, JERSEY_KEYS)
        const batsCol = findColumn(headers, BATS_KEYS)
        const throwsCol = findColumn(headers, THROWS_KEYS)
        const positionCol = findColumn(headers, POSITION_KEYS)

        // If we can't find first/last name columns, try a single "name" column
        const rows: PlayerImportRow[] = []
        for (const row of jsonData) {
          let firstName = ''
          let lastName = ''

          if (firstNameCol && lastNameCol) {
            firstName = String(row[firstNameCol] || '').trim()
            lastName = String(row[lastNameCol] || '').trim()
          } else if (firstNameCol) {
            // Single name column — split on space
            const fullName = String(row[firstNameCol] || '').trim()
            const parts = fullName.split(/\s+/)
            firstName = parts[0] || ''
            lastName = parts.slice(1).join(' ') || ''
          } else {
            // Try the first column as the name
            const firstCol = headers[0]
            const fullName = String(row[firstCol] || '').trim()
            const parts = fullName.split(/\s+/)
            firstName = parts[0] || ''
            lastName = parts.slice(1).join(' ') || ''
          }

          if (!firstName && !lastName) continue

          const importRow: PlayerImportRow = {
            firstName,
            lastName,
          }

          if (jerseyCol && row[jerseyCol] != null) {
            const num = parseInt(String(row[jerseyCol]), 10)
            if (!isNaN(num)) importRow.jerseyNumber = num
          }

          if (batsCol) importRow.bats = parseBatSide(String(row[batsCol]))
          if (throwsCol) importRow.throws = parseThrowHand(String(row[throwsCol]))
          if (positionCol) importRow.preferredPositions = parsePositions(String(row[positionCol]))

          rows.push(importRow)
        }

        resolve(rows)
      } catch {
        reject(new Error('Failed to parse spreadsheet. Please check the file format.'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file.'))
    reader.readAsArrayBuffer(file)
  })
}

export function parseCSVText(text: string): PlayerImportRow[] {
  const lines = text.trim().split('\n').filter(l => l.trim())
  if (lines.length === 0) return []

  const rows: PlayerImportRow[] = []
  for (const line of lines) {
    const parts = line.split(/[,\t]/).map(s => s.trim())
    if (parts.length >= 2) {
      rows.push({ firstName: parts[0], lastName: parts[1], jerseyNumber: parts[2] ? parseInt(parts[2], 10) || undefined : undefined })
    } else if (parts.length === 1) {
      const name = parts[0].split(/\s+/)
      rows.push({ firstName: name[0], lastName: name.slice(1).join(' ') || '' })
    }
  }
  return rows
}
