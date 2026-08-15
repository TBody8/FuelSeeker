import { Moon, Sun } from 'lucide-react'

interface ThemeToggleProps {
  theme: 'light' | 'dark'
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark'
  const label = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className="group inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-ink-soft transition-colors duration-200 hover:border-accent hover:text-accent dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:text-emerald-400"
    >
      {isDark ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
    </button>
  )
}