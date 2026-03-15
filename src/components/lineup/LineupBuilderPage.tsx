import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { ArrowLeft, Save, Share2, Trash2, Lock, Unlock } from 'lucide-react'
import { useLineup } from '../../hooks/useLineup'
import { usePlayers } from '../../hooks/usePlayers'
import { useGames } from '../../hooks/useGames'
import { useTeam } from '../../contexts/TeamContext'
import { BattingOrderTab } from './BattingOrderTab'
import { FieldPositionsTab } from './FieldPositionsTab'
import { PlayerBench } from './PlayerBench'
import { ShareLineupModal } from './ShareLineupModal'
import { Tabs } from '../ui/Tabs'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { EmptyState } from '../ui/EmptyState'
import { autoSuggestBattingOrder } from '../../services/autoSuggest'
import type { FieldPosition } from '../../types'

export function LineupBuilderPage() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { currentTeam } = useTeam()
  const { players } = usePlayers()
  const { games } = useGames()
  const {
    draft,
    loading,
    saving,
    isFinal,
    assignToBattingOrder,
    assignToFieldPosition,
    removeFromLineup,
    setFullBattingOrder,
    clearLineup,
    saveLineup,
    assignedPlayerIds,
  } = useLineup(gameId)

  const [activeTab, setActiveTab] = useState('batting')
  const [showShare, setShowShare] = useState(false)
  const [showAutoSuggest, setShowAutoSuggest] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const game = games.find(g => g.id === gameId) || null

  // Sensors for drag-drop
  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  const sensors = useSensors(pointerSensor, touchSensor)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current

    if (!activeData || activeData.type !== 'player') return

    const playerId = activeData.playerId as string

    if (overData?.type === 'batting-slot') {
      assignToBattingOrder(playerId, overData.battingOrder as number)
    } else if (overData?.type === 'field-position') {
      assignToFieldPosition(playerId, overData.position as FieldPosition)
    }
  }

  const handleAutoSuggest = () => {
    // For now, use empty batting history (enhanceable with Supabase data)
    const suggestions = autoSuggestBattingOrder(players, [])
    if (suggestions.length > 0) {
      setFullBattingOrder(suggestions.map(s => ({ battingOrder: s.battingOrder, playerId: s.playerId })))
      setShowAutoSuggest(false)
    }
  }

  const handleSave = async (finalize = false) => {
    await saveLineup(finalize)
    setSaveMessage(finalize ? 'Lineup finalized!' : 'Lineup saved!')
    setTimeout(() => setSaveMessage(null), 2000)
  }

  if (!gameId) {
    return <EmptyState title="No Game Selected" description="Select a game from the Games page to build a lineup." />
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

  const assignedCount = draft.slots.filter(s => s.playerId).length
  const positionsAssigned = draft.slots.filter(s => s.fieldPosition).length

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/games')} className="p-2 rounded-lg hover:bg-cream-200 text-navy-400">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-navy-700">
              {game?.opponent
                ? `${game.is_home ? 'vs' : '@'} ${game.opponent}`
                : game?.game_type === 'practice'
                  ? 'Practice'
                  : 'Lineup'}
            </h1>
            {game && (
              <p className="text-sm text-navy-400">
                {new Date(game.game_date + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isFinal && (
              <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <Lock size={12} /> Finalized
              </span>
            )}
            <span className="text-xs text-navy-300">
              {assignedCount}/9 batting | {positionsAssigned}/9 positions
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Area */}
          <div className="lg:col-span-2">
            <div className="card">
              <Tabs
                tabs={[
                  { id: 'batting', label: 'Batting Order' },
                  { id: 'field', label: 'Field Positions' },
                ]}
                activeTab={activeTab}
                onChange={setActiveTab}
              />
              <div className="mt-4">
                {activeTab === 'batting' ? (
                  <BattingOrderTab
                    draft={draft}
                    players={players}
                    onAutoSuggest={handleAutoSuggest}
                    onRemove={removeFromLineup}
                  />
                ) : (
                  <FieldPositionsTab
                    draft={draft}
                    players={players}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: Bench & Actions */}
          <div className="space-y-4">
            {/* Available Players */}
            <div className="card">
              <h3 className="text-sm font-semibold text-navy-600 mb-3">Available Players</h3>
              <PlayerBench players={players} assignedPlayerIds={assignedPlayerIds} />
            </div>

            {/* Actions */}
            <div className="card space-y-2">
              <Button variant="primary" className="w-full" onClick={() => handleSave(false)} loading={saving}>
                <Save size={16} />
                {saveMessage || 'Save Lineup'}
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => handleSave(true)} loading={saving}>
                <Lock size={16} />
                Finalize Lineup
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setShowShare(true)}>
                <Share2 size={16} />
                Share via Text
              </Button>
              <Button variant="ghost" className="w-full text-navy-400" onClick={clearLineup}>
                <Trash2 size={16} />
                Clear All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <Modal open={showShare} onClose={() => setShowShare(false)} title="Share Lineup" maxWidth="lg">
        <ShareLineupModal
          draft={draft}
          players={players}
          game={game}
          teamName={currentTeam?.name}
          onClose={() => setShowShare(false)}
        />
      </Modal>
    </DndContext>
  )
}
