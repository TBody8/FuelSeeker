import { Radar } from 'lucide-react'
import { RADIUS_MAX_KM, RADIUS_MIN_KM } from '../../utils/constants'

interface RadiusSliderProps {
  value: number
  onChange: (value: number) => void
  embedded?: boolean
}

export function RadiusSlider({ value, onChange, embedded = false }: RadiusSliderProps) {
  const min = RADIUS_MIN_KM
  const max = RADIUS_MAX_KM

  const content = (
    <>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Radar size={15} className="text-accent" aria-hidden="true" />
          <span className="text-xs font-semibold text-ink-soft dark:text-slate-300">
            Radio de búsqueda
          </span>
        </div>
        <span className="price-nums rounded-md bg-accent-soft px-2 py-0.5 text-xs font-bold text-accent-strong dark:text-emerald-300">
          {value} km
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Radio de búsqueda en kilómetros"
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-emerald-600 dark:bg-slate-700"
        style={{
          background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${
            ((value - min) / (max - min)) * 100
          }%, var(--color-line) ${
            ((value - min) / (max - min)) * 100
          }%, var(--color-line) 100%)`,
        }}
      />

      <div className="mt-1 flex justify-between text-[11px] font-medium text-ink-faint dark:text-slate-400">
        <span>{min} km</span>
        <span>{max} km</span>
      </div>
    </>
  )

  if (embedded) {
    return (
      <div className="rounded-lg border border-slate-200/60 bg-slate-50/60 px-2.5 py-1.5 dark:border-slate-800 dark:bg-slate-800/40">
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Radar size={13} className="text-accent" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-ink-soft dark:text-slate-300">
              Radio de búsqueda
            </span>
          </div>
          <span className="price-nums rounded bg-accent-soft px-1.5 py-0.5 text-[11px] font-bold text-accent-strong dark:text-emerald-300">
            {value} km
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="Radio de búsqueda en kilómetros"
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-emerald-600 dark:bg-slate-700"
          style={{
            background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${
              ((value - min) / (max - min)) * 100
            }%, var(--color-line) ${
              ((value - min) / (max - min)) * 100
            }%, var(--color-line) 100%)`,
          }}
        />
      </div>
    )
  }

  return (
    <div className="glass pointer-events-auto w-full max-w-[260px] rounded-2xl p-3.5 shadow-lift">
      {content}
    </div>
  )
}