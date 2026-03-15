import { clsx } from 'clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  loading?: boolean
}

export function Button({ variant = 'primary', size = 'md', children, loading, className, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-accent-red hover:bg-accent-redLight text-white shadow-sm hover:shadow-md': variant === 'primary',
          'bg-navy-500 hover:bg-navy-400 text-white shadow-sm hover:shadow-md': variant === 'secondary',
          'border-2 border-navy-200 hover:border-navy-400 text-navy-600 hover:bg-navy-50': variant === 'outline',
          'text-navy-500 hover:bg-navy-50 hover:text-navy-700': variant === 'ghost',
          'bg-red-600 hover:bg-red-700 text-white shadow-sm': variant === 'danger',
        },
        {
          'px-3 py-1.5 text-sm gap-1.5': size === 'sm',
          'px-4 py-2 text-sm gap-2': size === 'md',
          'px-6 py-3 text-base gap-2': size === 'lg',
        },
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
