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
      {icon && <div className="mb-4 text-navy-200">{icon}</div>}
      {!icon && (
        <div className="mb-4">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="text-navy-200">
            <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M 25 30 Q 40 20, 55 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M 25 50 Q 40 60, 55 50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
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
