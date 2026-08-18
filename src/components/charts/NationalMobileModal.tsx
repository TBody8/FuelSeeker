import { useEffect, useRef } from 'react'
import { Activity, X } from 'lucide-react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { NationalPriceWidget } from './NationalPriceWidget'
import type { NationalAverage } from '../../types'

gsap.registerPlugin(useGSAP)

interface NationalMobileModalProps {
  open: boolean
  onClose: () => void
  data: NationalAverage[]
  loading: boolean
  progress: number
  isDark: boolean
  period?: '1y' | '5y'
  onPeriodChange?: (period: '1y' | '5y') => void
}

export function NationalMobileModal({
  open,
  onClose,
  data,
  loading,
  progress,
  isDark,
  period = '1y',
  onPeriodChange,
}: NationalMobileModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  useGSAP(
    () => {
      if (!open) return
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (backdropRef.current) {
        gsap.fromTo(
          backdropRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.24, ease: 'power2.out' },
        )
      }

      if (drawerRef.current) {
        gsap.fromTo(
          drawerRef.current,
          { yPercent: prefersReduced ? 0 : 100 },
          { yPercent: 0, duration: 0.28, ease: 'power2.out' },
        )
      }
    },
    { dependencies: [open] },
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[1250] flex items-end justify-center md:hidden">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Medias Nacionales y Evolución"
        className="relative z-10 max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white p-4 shadow-2xl dark:bg-slate-900"
      >
        <div className="mb-3 flex items-center justify-between border-b border-slate-200/60 pb-2.5 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Activity size={14} />
            </span>
            <span className="text-xs font-bold text-ink dark:text-white">
              Medias Nacionales y Evolución
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <NationalPriceWidget
          data={data}
          loading={loading}
          progress={progress}
          isDark={isDark}
          period={period}
          onPeriodChange={onPeriodChange}
        />
      </div>
    </div>
  )
}
