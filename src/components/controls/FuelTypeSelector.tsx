import type { FuelType } from '../../types'

interface FuelTypeSelectorProps {
  value: FuelType
  onChange: (value: FuelType) => void
}

const options: { value: FuelType; label: string }[] = [
  { value: 'gasoline95', label: 'Gasolina 95' },
  { value: 'dieselA', label: 'Gasóleo A' },
]

export function FuelTypeSelector({ value, onChange }: FuelTypeSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Tipo de carburante"
      className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-0.5 dark:bg-slate-800"
    >
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`rounded-lg py-1.5 text-xs font-bold transition-all duration-200 ${
              active
                ? 'bg-white text-ink shadow-sm dark:bg-slate-700 dark:text-white'
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