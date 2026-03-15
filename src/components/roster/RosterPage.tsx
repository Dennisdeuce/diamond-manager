import { useState } from 'react'
import { UserPlus, Upload, Search } from 'lucide-react'
import { usePlayers } from '../../hooks/usePlayers'
import { useTeam } from '../../contexts/TeamContext'
import { PlayerCard } from './PlayerCard'
import { PlayerForm } from './PlayerForm'
import { ImportPlayersModal } from './ImportPlayersModal'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { EmptyState } from '../ui/EmptyState'
import type { Player } from '../../types'

export function RosterPage() {
  const { currentTeam } = useTeam()
  const { players, loading, addPlayer, updatePlayer, deletePlayer, bulkImport } = usePlayers()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const filteredPlayers = players.filter(p => {
    const q = searchQuery.toLowerCase()
    return (
      p.first_name.toLowerCase().includes(q) ||
      p.last_name.toLowerCase().includes(q) ||
      (p.jersey_number != null && p.jersey_number.toString().includes(q))
    )
  })

  const handleAdd = async (data: Parameters<typeof addPlayer>[0]) => {
    setFormLoading(true)
    await addPlayer(data)
    setFormLoading(false)
    setShowAddForm(false)
  }

  const handleUpdate = async (data: Parameters<typeof updatePlayer>[1]) => {
    if (!editingPlayer) return
    setFormLoading(true)
    await updatePlayer(editingPlayer.id, data)
    setFormLoading(false)
    setEditingPlayer(null)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Remove this player from the roster?')) {
      await deletePlayer(id)
    }
  }

  if (!currentTeam) {
    return (
      <EmptyState
        title="No Team Selected"
        description="Create or select a team from the header to manage your roster."
      />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin h-8 w-8 text-accent-red" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-700">Roster</h1>
          <p className="text-sm text-navy-400">{players.length} player{players.length !== 1 ? 's' : ''} on {currentTeam.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowImport(true)}>
            <Upload size={16} />
            Import
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowAddForm(true)}>
            <UserPlus size={16} />
            Add Player
          </Button>
        </div>
      </div>

      {/* Search */}
      {players.length > 0 && (
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9"
            placeholder="Search players..."
          />
        </div>
      )}

      {/* Player List */}
      {players.length === 0 ? (
        <EmptyState
          title="No Players Yet"
          description="Add players one at a time or import from a spreadsheet to get started."
          actionLabel="Add Player"
          onAction={() => setShowAddForm(true)}
          secondaryActionLabel="Import from File"
          onSecondaryAction={() => setShowImport(true)}
        />
      ) : (
        <div className="space-y-2">
          {filteredPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onEdit={setEditingPlayer}
              onDelete={handleDelete}
            />
          ))}
          {filteredPlayers.length === 0 && searchQuery && (
            <div className="text-center py-8 text-navy-300 text-sm">
              No players match &ldquo;{searchQuery}&rdquo;
            </div>
          )}
        </div>
      )}

      {/* Add Player Modal */}
      <Modal open={showAddForm} onClose={() => setShowAddForm(false)} title="Add Player">
        <PlayerForm onSubmit={handleAdd} onCancel={() => setShowAddForm(false)} loading={formLoading} />
      </Modal>

      {/* Edit Player Modal */}
      <Modal open={!!editingPlayer} onClose={() => setEditingPlayer(null)} title="Edit Player">
        <PlayerForm
          player={editingPlayer}
          onSubmit={handleUpdate}
          onCancel={() => setEditingPlayer(null)}
          loading={formLoading}
        />
      </Modal>

      {/* Import Modal */}
      <Modal open={showImport} onClose={() => setShowImport(false)} title="Import Players" maxWidth="lg">
        <ImportPlayersModal onImport={bulkImport} onClose={() => setShowImport(false)} />
      </Modal>
    </div>
  )
}
