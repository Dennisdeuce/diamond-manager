import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { ArrowLeft, Save, Share2, Trash2, Lock, Printer, Copy, Check, Wand2, AlertCircle } from 'lucide-react'
import { useLineup } from '../../hooks/useLineup'
import { usePlayers } from '../../hooks/usePlayers'
import { useGames } from '../../hooks/useGames'
import { usePositionHistory } from '../../hooks/usePositionHistory'
import { useAuth } from '../../contexts/AuthContext'
import { useTeam } from '../../contexts/TeamContext'
import { supabase } from '../../lib/supabase'
import { BattingOrderTab } from './BattingOrderTab'
import { FieldPositionsTab } from './FieldPositionsTab'
import { PlayerBench } from './PlayerBench'
import { ShareLineupModal } from './ShareLineupModal'
import { PrintableLineupCard, handlePrintLineup } from './PrintableLineupCard'
import { Tabs } from '../ui/Tabs'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { EmptyState } from '../ui/EmptyState'
import { autoSuggestBattingOrder, type SuggestMode } from '../../services/autoSuggest'
import { usePageTitle } from '../../hooks/usePageTitle'
import type { FieldPosition } from '../../types'

export function LineupBuilderPage() {
  usePageTitle('Lineup Builder')
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { isDemoMode } = useAuth()
  const { currentTeam } = useTeam()
  const { players } = usePlayers()
  const { games } = useGames()
  const { positionHistory } = usePositionHistory()
  const {
    draft,
    loading,
    saving,
    saveError,
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
  const [showCopyModal, setShowCopyModal] = useState(false)
  const [suggestMode, setSuggestMode] = useState<SuggestMode>('performance')
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const draftVersion = useRef(0)

  const game = games.find(g => g.id === gameId) || null

  // Autosave: debounce save on draft changes
  useEffect(() => {
    // Skip initial load and empty drafts
    if (loading || !gameId) return
    const hasAnyPlayer = draft.slots.some(s => s.playerId)
    if (!hasAnyPlayer) return

    draftVersion.current++
    const version = draftVersion.current

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)

    setAutoSaveStatus('idle')
    autoSaveTimer.current = setTimeout(async () => {
      if (version !== draftVersion.current) return // stale
      setAutoSaveStatus('saving')
      const success = await saveLineup(false)
      if (success) {
        setAutoSaveStatus('saved')
        setTimeout(() => setAutoSaveStatus('idle'), 2000)
      } else {
        setAutoSaveStatus('error')
        // Auto-clear error after 5s so user can retry
        setTimeout(() => setAutoSaveStatus('idle'), 5000)
      }
    }, 1500)

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [draft.slots]) // eslint-disable-line react-hooks/exhaustive-deps

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
    const suggestions = autoSuggestBattingOrder(players, [], suggestMode)
    if (suggestions.length > 0) {
      setFullBattingOrder(suggestions.map(s => ({ battingOrder: s.battingOrder, playerId: s.playerId })))
    }
  }

  const handleFinalize = async () => {
    await saveLineup(true)
    setAutoSaveStatus('saved')
  }

  // Copy lineup to another game
  const handleCopyToGame = async (targetGameId: string) => {
    const currentSlots = draft.slots.filter(s => s.playerId)
    if (currentSlots.length === 0) return

    if (isDemoMode) {
      // Demo mode: save to localStorage
      const copyDraft = {
        gameId: targetGameId,
        lineupId: null,
        slots: draft.slots.map(s => ({ ...s })),
        benchPlayerIds: [],
      }
      localStorage.setItem(`demo-lineup-${targetGameId}`, JSON.stringify(copyDraft))
    } else if (currentTeam) {
      // Authenticated: use RPC to create lineup in Supabase
      const entries = currentSlots.map(s => ({
        player_id: s.playerId!,
        batting_order: s.battingOrder,
        field_position: s.fieldPosition || 'BN',
      }))

      const { error } = await supabase.rpc('save_lineup_entries', {
        p_lineup_id: null,
        p_game_id: targetGameId,
        p_team_id: currentTeam.id,
        p_is_final: false,
        p_entries: entries,
      })

      if (error) {
        console.error('Copy lineup error:', error)
        return
      }
    }

    setShowCopyModal(false)
    navigate(`/lineup/${targetGameId}`)
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
  const otherGames = games.filter(g => g.id !== gameId)

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="max-w-4xl mx-auto no-print">
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
            {/* Autosave indicator */}
            {autoSaveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-xs text-navy-300 animate-pulse">
                <Save size={12} /> Saving...
              </span>
            )}
            {autoSaveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <Check size={12} /> Saved
              </span>
            )}
            {autoSaveStatus === 'error' && (
              <span className="flex items-center gap-1 text-xs text-red-600" title={saveError || 'Save failed'}>
                <AlertCircle size={12} /> Save failed
              </span>
            )}
            {isFinal && (
              <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <Lock size={12} /> Finalized
              </span>
            )}
            <span className="text-xs text-navy-300 hidden sm:inline flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="inline-block w-12 h-1.5 bg-cream-200 rounded-full overflow-hidden">
                  <span className="block h-full bg-accent-red rounded-full transition-all" style={{ width: `${(assignedCount / 9) * 100}%` }} />
                </span>
                {assignedCount}/9
              </span>
              <span className="text-navy-200">|</span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-12 h-1.5 bg-cream-200 rounded-full overflow-hidden">
                  <span className="block h-full bg-field-green rounded-full transition-all" style={{ width: `${(positionsAssigned / 9) * 100}%` }} />
                </span>
                {positionsAssigned}/9
              </span>
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

              {/* Auto-Suggest Controls (above tab content) */}
              {activeTab === 'batting' && (
                <div className="flex items-center justify-between mt-4 mb-2 gap-2 flex-wrap">
                  {/* Fair Play Toggle */}
                  <div className="flex items-center gap-2 bg-cream-100 rounded-lg p-1">
                    <button
                      onClick={() => setSuggestMode('performance')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                        suggestMode === 'performance'
                          ? 'bg-navy-500 text-white shadow-sm'
                          : 'text-navy-400 hover:text-navy-600'
                      }`}
                    >
                      Performance
                    </button>
                    <button
                      onClick={() => setSuggestMode('fairRotation')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                        suggestMode === 'fairRotation'
                          ? 'bg-field-green text-white shadow-sm'
                          : 'text-navy-400 hover:text-navy-600'
                      }`}
                    >
                      Fair Play
                    </button>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleAutoSuggest}>
                    <Wand2 size={14} />
                    Auto Suggest
                  </Button>
                </div>
              )}

              <div className={activeTab === 'batting' ? '' : 'mt-4'}>
                {activeTab === 'batting' ? (
                  <BattingOrderTab
                    draft={draft}
                    players={players}
                    onAutoSuggest={handleAutoSuggest}
                    onRemove={removeFromLineup}
                    hideAutoSuggest
                    positionHistory={positionHistory}
                  />
                ) : (
                  <FieldPositionsTab
                    draft={draft}
                    players={players}
                    positionHistory={positionHistory}
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
              <Button variant="secondary" className="w-full" onClick={handleFinalize} loading={saving}>
                <Lock size={16} />
                Finalize Lineup
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowShare(true)}>
                  <Share2 size={14} />
                  Share
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrintLineup}>
                  <Printer size={14} />
                  Print
                </Button>
              </div>
              {otherGames.length > 0 && (
                <Button variant="outline" className="w-full" size="sm" onClick={() => setShowCopyModal(true)}>
                  <Copy size={14} />
                  Copy to Another Game
                </Button>
              )}
              <Button variant="ghost" className="w-full text-navy-400" size="sm" onClick={clearLineup}>
                <Trash2 size={14} />
                Clear All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Lineup Card (hidden, shown only in print) */}
      <div className="hidden print:block">
        <PrintableLineupCard
          draft={draft}
          players={players}
          game={game}
          teamName={currentTeam?.name}
        />
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

      {/* Copy to Game Modal */}
      <Modal open={showCopyModal} onClose={() => setShowCopyModal(false)} title="Copy Lineup to Game">
        <div className="space-y-2">
          <p className="text-sm text-navy-400 mb-3">Select a game to copy this lineup to:</p>
          {otherGames.map(g => (
            <button
              key={g.id}
              onClick={() => handleCopyToGame(g.id)}
              className="w-full text-left p-3 rounded-lg border border-cream-300 hover:border-navy-300 hover:bg-cream-50 transition-all"
            >
              <div className="font-medium text-navy-700">
                {g.opponent ? `${g.is_home ? 'vs' : '@'} ${g.opponent}` : 'Practice'}
              </div>
              <div className="text-xs text-navy-400">
                {new Date(g.game_date + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric'
                })}
                {g.location && ` — ${g.location}`}
              </div>
            </button>
          ))}
          {otherGames.length === 0 && (
            <p className="text-sm text-navy-300 text-center py-4">No other games scheduled.</p>
          )}
        </div>
      </Modal>
    </DndContext>
  )
}
