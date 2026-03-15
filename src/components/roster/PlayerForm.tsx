import { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { FIELD_POSITIONS } from '../../lib/constants'
import type { Player, FieldPosition, BatSide, ThrowHand } from '../../types'

interface PlayerFormProps {
  player?: Player | null
  onSubmit: (data: {
    first_name: string
    last_name: string
    jersey_number: number | null
    bats: BatSide | null
    throws: ThrowHand | null
    preferred_positions: FieldPosition[]
    active: boolean
    notes: string | null
  }) => void
  onCancel: () => void
  loading?: boolean
}

export function PlayerForm({ player, onSubmit, onCancel, loading }: PlayerFormProps) {
  const [firstName, setFirstName] = useState(player?.first_name || '')
  const [lastName, setLastName] = useState(player?.last_name || '')
  const [jerseyNumber, setJerseyNumber] = useState(player?.jersey_number?.toString() || '')
  const [bats, setBats] = useState<BatSide | ''>(player?.bats || '')
  const [throws_, setThrows] = useState<ThrowHand | ''>(player?.throws || '')
  const [positions, setPositions] = useState<FieldPosition[]>(player?.preferred_positions || [])
  const [notes, setNotes] = useState(player?.notes || '')

  useEffect(() => {
    if (player) {
      setFirstName(player.first_name)
      setLastName(player.last_name)
      setJerseyNumber(player.jersey_number?.toString() || '')
      setBats(player.bats || '')
      setThrows(player.throws || '')
      setPositions(player.preferred_positions || [])
      setNotes(player.notes || '')
    }
  }, [player])

  const togglePosition = (pos: FieldPosition) => {
    setPositions(prev => prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      jersey_number: jerseyNumber ? parseInt(jerseyNumber, 10) : null,
      bats: (bats as BatSide) || null,
      throws: (throws_ as ThrowHand) || null,
      preferred_positions: positions,
      active: true,
      notes: notes.trim() || null,
    })
  }

  const fieldPositions = FIELD_POSITIONS.filter(p => p.code !== 'BN')

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-navy-600 mb-1">First Name *</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="input-field"
            placeholder="Jake"
            required
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-600 mb-1">Last Name *</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="input-field"
            placeholder="Smith"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-navy-600 mb-1">Jersey #</label>
          <input
            type="number"
            value={jerseyNumber}
            onChange={(e) => setJerseyNumber(e.target.value)}
            className="input-field"
            placeholder="12"
            min={0}
            max={99}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-600 mb-1">Bats</label>
          <select value={bats} onChange={(e) => setBats(e.target.value as BatSide | '')} className="input-field">
            <option value="">--</option>
            <option value="R">Right</option>
            <option value="L">Left</option>
            <option value="S">Switch</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-600 mb-1">Throws</label>
          <select value={throws_} onChange={(e) => setThrows(e.target.value as ThrowHand | '')} className="input-field">
            <option value="">--</option>
            <option value="R">Right</option>
            <option value="L">Left</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-600 mb-2">Preferred Positions</label>
        <div className="flex flex-wrap gap-2">
          {fieldPositions.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              onClick={() => togglePosition(code)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                positions.includes(code)
                  ? 'bg-navy-500 text-white shadow-sm'
                  : 'bg-cream-200 text-navy-400 hover:bg-cream-300'
              }`}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-600 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input-field resize-none"
          rows={2}
          placeholder="Any additional notes..."
        />
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" loading={loading} disabled={!firstName.trim() || !lastName.trim()}>
          {player ? 'Update Player' : 'Add Player'}
        </Button>
      </div>
    </form>
  )
}
