import { Menu, RefreshCw } from 'lucide-react'
import { ThemeToggle } from '../ui/ThemeToggle'
import { Badge } from '../ui/Badge'

interface HeaderProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onOpenDrawer: () => void
}

export function Header({ theme, onToggleTheme, onOpenDrawer }: HeaderProps) {
  return (
    <header className="relative z-overlay border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70">
      <div className="mx-auto flex h-14 max-w-[1800px] items-center gap-2.5 px-3 sm:px-6">
        <button
          type="button"
          onClick={onOpenDrawer}
          aria-label="Abrir panel de búsqueda"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-ink-soft transition-colors duration-200 hover:text-accent md:hidden dark:border-slate-700 dark:text-slate-300"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2">
          <img
            src="/favicon.svg"
            alt="FuelSeeker logo"
            className="h-8 w-8 rounded-xl shadow-sm"
          />
          <div className="leading-tight">
            <h1 className="text-sm font-bold tracking-tight text-ink sm:text-base dark:text-white">
              FuelSeeker
            </h1>
            <p className="hidden text-[11px] text-ink-faint sm:block dark:text-slate-400">
              Precios oficiales MITECO
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Badge
            tone="neutral"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs"
          >
            <RefreshCw size={11} className="text-accent" aria-hidden="true" />
            <span className="sm:hidden font-semibold">30 min</span>
            <span className="hidden sm:inline">Se actualiza cada 30 min</span>
          </Badge>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  )
}