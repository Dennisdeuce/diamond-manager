import type { ReactNode } from 'react'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
}

function BaseballDiamondIllustration() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" className="text-navy-200">
      {/* Diamond/field shape */}
      <polygon points="48,12 84,48 48,84 12,48" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.5" />
      {/* Bases as small diamonds */}
      <rect x="44" y="8" width="8" height="8" rx="1" fill="currentColor" opacity="0.3" transform="rotate(45 48 12)" />
      <rect x="80" y="44" width="8" height="8" rx="1" fill="currentColor" opacity="0.3" transform="rotate(45 84 48)" />
      <rect x="44" y="80" width="8" height="8" rx="1" fill="currentColor" opacity="0.3" transform="rotate(45 48 84)" />
      <rect x="8" y="44" width="8" height="8" rx="1" fill="currentColor" opacity="0.3" transform="rotate(45 12 48)" />
      {/* Baseball in center */}
      <circle cx="48" cy="48" r="16" stroke="currentColor" strokeWidth="1.5" />
      <path d="M 38 40 Q 44 36, 48 36 Q 52 36, 58 40" stroke="#C8102E" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M 38 56 Q 44 60, 48 60 Q 52 60, 58 56" stroke="#C8102E" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
    </svg>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon ? (
        <div className="mb-4 text-navy-200">{icon}</div>
      ) : (
        <div className="mb-4">
          <BaseballDiamondIllustration />
        </div>
      )}
      <h3 className="text-lg font-bold text-navy-600 mb-1">{title}</h3>
      <p className="text-sm text-navy-300 max-w-sm mb-6">{description}</p>
      <div className="flex gap-3">
        {actionLabel && onAction && (
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button variant="outline" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
