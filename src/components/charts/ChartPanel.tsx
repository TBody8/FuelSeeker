import { BarChart3, ChevronDown, ChevronUp, LineChart } from 'lucide-react'
import type { HistoricalStationPoint, NationalAverage, Station } from '../../types'
import { HistoricalChart } from './HistoricalChart'
import { NationalChart } from './NationalChart'

export type ChartPanelTab = 'national' | 'station'

interface ChartPanelProps {
  isDark: boolean
  nationalData: NationalAverage[]
  nationalLoading: boolean
  nationalProgress: number
  selectedStation: Station | null
  stationHistory: HistoricalStationPoint[]
  stationHistoryLoading: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  tab: ChartPanelTab
  onTabChange: (tab: ChartPanelTab) => void
}

export function ChartPanel({
  isDark,
  nationalData,
  nationalLoading,
  nationalProgress,
  selectedStation,
  stationHistory,
  stationHistoryLoading,
  open,
  onOpenChange,
  tab,
  onTabChange,
}: ChartPanelProps) {
  const handleToggle = () => {
    if (!open && tab === 'station' && !selectedStation) {
      onTabChange('national')
    }
    onOpenChange(!open)
  }

  const selectTab = (next: ChartPanelTab) => {
    if (next === 'station' && !selectedStation) return
    onTabChange(next)
    onOpenChange(true)
  }

  return (
    <div className="glass pointer-events-auto overflow-hidden rounded-2xl">
      <div className="flex items-center gap-1.5 border-b border-slate-200/60 px-4 py-2.5 dark:border-slate-800">
        <button
          type="button"
          onClick={() => selectTab('national')}
          aria-pressed={tab === 'national' && open}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ${
            tab === 'national'
              ? 'bg-accent/10 text-accent-strong dark:text-emerald-300'
              : 'text-ink-soft hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 size={14} aria-hidden="true" />
          Media nacional
        </button>
        <button
          type="button"
          onClick={() => selectTab('station')}
          aria-pressed={tab === 'station' && open}
          disabled={!selectedStation}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${
            tab === 'station'
              ? 'bg-accent/10 text-accent-strong dark:text-emerald-300'
              : 'text-ink-soft hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <LineChart size={14} aria-hidden="true" />
          Estación seleccionada
        </button>

        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={open}
          aria-label={open ? 'Cerrar panel de gráficos' : 'Abrir panel de gráficos'}
          className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-lg text-ink-soft transition-colors duration-150 hover:bg-slate-100 hover:text-ink dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          {open ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {open ? (
        <div className="p-4">
          {tab === 'national' ? (
            <NationalChart
              data={nationalData}
              loading={nationalLoading}
              progress={nationalProgress}
              isDark={isDark}
            />
          ) : selectedStation ? (
            <HistoricalChart
              station={selectedStation}
              data={stationHistory}
              loading={stationHistoryLoading}
              isDark={isDark}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}