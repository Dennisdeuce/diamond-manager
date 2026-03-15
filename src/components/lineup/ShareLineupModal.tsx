import { useState, useEffect } from 'react'
import { Copy, Share2, Check } from 'lucide-react'
import { Button } from '../ui/Button'
import { formatLineupText, shareLineup } from '../../services/shareLineup'
import type { Player, DraftLineup, Game } from '../../types'

interface ShareLineupModalProps {
  draft: DraftLineup
  players: Player[]
  game?: Game | null
  teamName?: string
  onClose: () => void
}

export function ShareLineupModal({ draft, players, game, teamName, onClose }: ShareLineupModalProps) {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setText(formatLineupText(draft, players, game, teamName))
  }, [draft, players, game, teamName])

  const handleCopy = async () => {
    const success = await shareLineup(text)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text })
      } catch { /* user cancelled */ }
    } else {
      handleCopy()
    }
  }

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="input-field font-mono text-xs resize-none"
        rows={18}
      />
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onClose}>Close</Button>
        <Button variant="secondary" onClick={handleCopy}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
          <Button variant="primary" onClick={handleShare}>
            <Share2 size={16} />
            Share
          </Button>
        )}
      </div>
    </div>
  )
}
