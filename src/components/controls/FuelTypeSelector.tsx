import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { FuelType } from '../../types'

gsap.registerPlugin(useGSAP)

interface FuelTypeSelectorProps {
  value: FuelType
  onChange: (value: FuelType) => void
}

const options: { value: FuelType; label: string }[] = [
  { value: 'gasoline95', label: 'Gasolina 95' },
  { value: 'dieselA', label: 'Gasóleo A' },
]

export function FuelTypeSelector({ value, onChange }: FuelTypeSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!pillRef.current) return
      const isGasoline = value === 'gasoline95'
      gsap.to(pillRef.current, {
        xPercent: isGasoline ? 0 : 100,
        duration: 0.24,
        ease: 'power2.out',
      })
    },
    { dependencies: [value], scope: containerRef },
  )

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label="Tipo de carburante"
      className="relative grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
    >
      {/* Indicador deslizante animado con GSAP */}
      <div
        ref={pillRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm ring-1 ring-black/5 dark:bg-slate-700 dark:ring-white/10"
      />

      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`relative z-10 rounded-lg py-1.5 text-xs font-bold transition-colors duration-150 ${
              active
                ? 'text-ink dark:text-white'
                : 'text-ink-soft hover:text-ink dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}