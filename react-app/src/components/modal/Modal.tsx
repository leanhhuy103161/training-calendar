import type { JSX, ReactNode } from 'react'
import { useEffect } from 'react'
import { cn } from '@/utils'

interface Props {
  readonly title: string
  readonly onClose: () => void
  readonly children: ReactNode
  readonly className?: string
}

export default function Modal({ title, onClose, children, className }: Props): JSX.Element {
  useEffect(() => {
    const handleKey = (e: globalThis.KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          'relative bg-white rounded-day shadow-lg p-4 w-72 font-sans mb-40',
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[13px] font-bold text-exercise-name">{title}</h2>
          <button
            onClick={onClose}
            className="p-0.5 border-none bg-transparent cursor-pointer text-day-header hover:text-exercise-name transition-colors"
            aria-label="Close dialog"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M1 1L11 11M11 1L1 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}
