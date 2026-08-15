import { Crosshair, NavigationOff } from 'lucide-react'
import type { Coordinates } from '../../types'

interface LocateButtonProps {
  userCoords: Coordinates | null
  loading: boolean
  permissionDenied: boolean
  onLocate: () => void
  onRetry?: () => void
}

export function LocateButton({
  userCoords,
  loading,
  permissionDenied,
  onLocate,
  onRetry,
}: LocateButtonProps) {
  const hasLocation = !loading && !permissionDenied && userCoords !== null

  return (
    <button
      type="button"
      onClick={hasLocation ? onLocate : onRetry}
      title={
        loading
          ? 'Buscando ubicación…'
          : hasLocation
            ? 'Centrar mapa en mi ubicación actual'
            : 'Ubicación no disponible (pulsa para reintentar)'
      }
      aria-label="Centrar en mi ubicación"
      className={`pointer-events-auto flex h-[34px] w-[34px] items-center justify-center rounded-lg border shadow-md transition-all duration-150 ${
        hasLocation
          ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-accent active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-emerald-400'
          : 'border-slate-200 bg-slate-100 text-slate-400 opacity-70 hover:opacity-100 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-600'
      }`}
    >
      {hasLocation ? (
        <Crosshair size={17} className="shrink-0" />
      ) : (
        <div className="relative flex items-center justify-center">
          <NavigationOff size={16} className="shrink-0" />
        </div>
      )}
    </button>
  )
}
