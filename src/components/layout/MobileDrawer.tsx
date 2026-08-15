import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function MobileDrawer({ open, onClose, children }: MobileDrawerProps) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-[1100] bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Panel de búsqueda de gasolineras"
        className={`fixed bottom-0 left-0 top-0 z-[1200] flex w-[min(92vw,400px)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden dark:bg-slate-900 ${
          open ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200/70 px-4 py-3 dark:border-slate-800">
          <p className="text-sm font-bold text-ink dark:text-white">Gasolineras & Precios</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft transition-colors duration-150 hover:bg-slate-100 hover:text-ink dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </>
  )
}