import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Calendar, MapPin, Trash2, ClipboardList, Trophy, Home, Plane } from 'lucide-react'
import { useGames } from '../../hooks/useGames'
import { useTeam } from '../../contexts/TeamContext'
import { usePageTitle } from '../../hooks/usePageTitle'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { EmptyState } from '../ui/EmptyState'
import { useToast } from '../ui/Toast'
import type { Game, GameType } from '../../types'

function GameResultBadge({ game }: { game: Game }) {
  if (game.score_us == null || game.score_them == null) return null

  const won = game.score_us > game.score_them
  const lost = game.score_us < game.score_them
  const tied = game.score_us === game.score_them
  const label = won ? 'W' : lost ? 'L' : 'T'

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
      won ? 'bg-green-100 text-green-700' :
      lost ? 'bg-red-100 text-red-600' :
      'bg-yellow-100 text-yellow-700'
    }`}>
      {label} {game.score_us}-{game.score_them}
    </span>
  )
}

export function GamesPage() {
  usePageTitle('Games')
  const { currentTeam } = useTeam()
  const { games, loading, addGame, updateGame, deleteGame } = useGames()
  const navigate = useNavigate()
  const { showError } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [scoreEditId, setScoreEditId] = useState<string | null>(null)
  const [scoreForm, setScoreForm] = useState({ score_us: '', score_them: '' })
  const [formData, setFormData] = useState({
    game_date: '',
    opponent: '',
    is_home: true,
    location: '',
    game_type: 'game' as GameType,
    notes: '',
  })

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const game = await addGame({
      ...formData,
      opponent: formData.opponent || undefined,
      location: formData.location || undefined,
      notes: formData.notes || undefined,
    })
    if (game) {
      setShowAddForm(false)
      setFormData({ game_date: '', opponent: '', is_home: true, location: '', game_type: 'game', notes: '' })
    } else {
      showError('Failed to add game. Check your connection and try again.')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this game and its lineup? This cannot be undone.')) {
      await deleteGame(id)
    }
  }

  const openScoreEdit = (game: Game) => {
    setScoreEditId(game.id)
    setScoreForm({
      score_us: game.score_us != null ? String(game.score_us) : '',
      score_them: game.score_them != null ? String(game.score_them) : '',
    })
  }

  const handleScoreSave = async () => {
    if (!scoreEditId) return
    const us = scoreForm.score_us.trim() === '' ? null : parseInt(scoreForm.score_us, 10)
    const them = scoreForm.score_them.trim() === '' ? null : parseInt(scoreForm.score_them, 10)
    await updateGame(scoreEditId, { score_us: us, score_them: them } as Partial<Game>)
    setScoreEditId(null)
  }

  const gameTypeVariant = (type: GameType) => {
    switch (type) {
      case 'game': return 'info'
      case 'practice': return 'success'
      case 'scrimmage': return 'warning'
      case 'tournament': return 'danger'
    }
  }

  // Season record
  const record = games.reduce(
    (acc, g) => {
      if (g.score_us != null && g.score_them != null) {
        if (g.score_us > g.score_them) acc.w++
        else if (g.score_us < g.score_them) acc.l++
        else acc.t++
      }
      return acc
    },
    { w: 0, l: 0, t: 0 }
  )
  const hasRecord = record.w + record.l + record.t > 0

  if (!currentTeam) {
    return <EmptyState title="No Team Selected" description="Create or select a team to manage games." />
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
          <h1 className="text-2xl font-bold text-navy-700">Games</h1>
          <p className="text-sm text-navy-400">
            {games.length} game{games.length !== 1 ? 's' : ''} scheduled
            {hasRecord && (
              <span className="ml-2 inline-flex items-center gap-1.5 font-semibold text-navy-600">
                <Trophy size={13} className="text-amber-500" />
                {record.w}-{record.l}{record.t > 0 ? `-${record.t}` : ''}
              </span>
            )}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowAddForm(true)}>
          <Plus size={16} />
          Add Game
        </Button>
      </div>

      {games.length === 0 ? (
        <EmptyState
          title="No Games Scheduled"
          description="Add your first game or practice to start building lineups."
          actionLabel="Add Game"
          onAction={() => setShowAddForm(true)}
        />
      ) : (
        <div className="space-y-3">
          {games.map((game) => (
            <Card key={game.id} hover padding="none" onClick={() => navigate(`/lineup/${game.id}`)}>
              <div className="flex items-center gap-4 p-4">
                {/* Date */}
                <div className="w-16 text-center shrink-0">
                  <div className="text-xs text-navy-300 uppercase font-medium">
                    {new Date(game.game_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                  <div className="text-2xl font-bold font-condensed text-navy-700">
                    {new Date(game.game_date + 'T12:00:00').getDate()}
                  </div>
                  <div className="text-xs text-navy-300 flex items-center justify-center gap-1">
                    {new Date(game.game_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                    {game.opponent && (
                      game.is_home
                        ? <Home size={10} className="text-field-green" />
                        : <Plane size={10} className="text-navy-400" />
                    )}
                  </div>
                </div>

                <div className="w-px h-12 bg-cream-300" />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-navy-700">
                      {game.opponent ? `${game.is_home ? 'vs' : '@'} ${game.opponent}` : 'Team Practice'}
                    </span>
                    <Badge variant={gameTypeVariant(game.game_type)} size="sm">
                      {game.game_type}
                    </Badge>
                    <GameResultBadge game={game} />
                  </div>
                  {game.location && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-navy-300">
                      <MapPin size={12} />
                      {game.location}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {game.game_type !== 'practice' && (
                    <button
                      onClick={() => openScoreEdit(game)}
                      className="p-2 rounded-lg hover:bg-cream-200 text-navy-400 hover:text-field-green transition-colors"
                      title="Enter score"
                    >
                      <Trophy size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/lineup/${game.id}`)}
                    className="p-2 rounded-lg hover:bg-cream-200 text-navy-400 hover:text-accent-red transition-colors"
                    title="Build lineup"
                  >
                    <ClipboardList size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(game.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-navy-400 hover:text-red-500 transition-colors"
                    title="Delete game"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Score Entry Modal */}
      <Modal open={!!scoreEditId} onClose={() => setScoreEditId(null)} title="Enter Game Score">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-600 mb-1">Our Score</label>
              <input
                type="number"
                min="0"
                value={scoreForm.score_us}
                onChange={(e) => setScoreForm(prev => ({ ...prev, score_us: e.target.value }))}
                className="input-field text-center text-2xl font-bold"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-600 mb-1">Their Score</label>
              <input
                type="number"
                min="0"
                value={scoreForm.score_them}
                onChange={(e) => setScoreForm(prev => ({ ...prev, score_them: e.target.value }))}
                className="input-field text-center text-2xl font-bold"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setScoreEditId(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleScoreSave}>Save Score</Button>
          </div>
        </div>
      </Modal>

      {/* Add Game Modal */}
      <Modal open={showAddForm} onClose={() => setShowAddForm(false)} title="Add Game">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-600 mb-1">Date *</label>
            <input
              type="date"
              value={formData.game_date}
              onChange={(e) => setFormData(prev => ({ ...prev, game_date: e.target.value }))}
              className="input-field"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-navy-600 mb-1">Type</label>
              <select
                value={formData.game_type}
                onChange={(e) => setFormData(prev => ({ ...prev, game_type: e.target.value as GameType }))}
                className="input-field"
              >
                <option value="game">Game</option>
                <option value="practice">Practice</option>
                <option value="scrimmage">Scrimmage</option>
                <option value="tournament">Tournament</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-600 mb-1">Home/Away</label>
              <select
                value={formData.is_home ? 'home' : 'away'}
                onChange={(e) => setFormData(prev => ({ ...prev, is_home: e.target.value === 'home' }))}
                className="input-field"
              >
                <option value="home">Home</option>
                <option value="away">Away</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-600 mb-1">Opponent</label>
            <input
              type="text"
              value={formData.opponent}
              onChange={(e) => setFormData(prev => ({ ...prev, opponent: e.target.value }))}
              className="input-field"
              placeholder="e.g. Eagles"
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-600 mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="input-field"
              placeholder="e.g. Central Park Field 3"
              maxLength={200}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-600 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="input-field resize-none"
              rows={2}
              maxLength={500}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" type="button" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={!formData.game_date}>Add Game</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
