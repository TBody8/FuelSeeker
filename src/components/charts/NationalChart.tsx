import { Line } from 'react-chartjs-2'
import type { NationalAverage } from '../../types'
import { formatPriceCompact } from '../../utils/format'
import { baseChartOptions, CHART_COLORS } from './chartConfig'

interface NationalChartProps {
  data: NationalAverage[]
  loading: boolean
  progress: number
  isDark: boolean
}

export function NationalChart({ data, loading, progress, isDark }: NationalChartProps) {
  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3" role="status">
        <div className="h-2.5 w-full max-w-md overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-accent transition-all duration-200 ease-out"
            style={{ width: `${Math.round(progress * 100)}%` }}
            aria-hidden="true"
          />
        </div>
        <p className="text-xs font-medium text-ink-faint dark:text-slate-400">
          Cargando medias nacionales… {Math.round(progress * 100)}%
        </p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-ink-faint dark:text-slate-500">
          No hay datos nacionales disponibles todavía.
        </p>
      </div>
    )
  }

  const labels = data.map((d) => d.date)
  const latest = data[data.length - 1]

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Gasolina 95',
        data: data.map((d) => d.avgGasoline95),
        borderColor: CHART_COLORS.gasoline95,
        backgroundColor: CHART_COLORS.gasoline95Soft,
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
      },
      {
        label: 'Gasóleo A',
        data: data.map((d) => d.avgDieselA),
        borderColor: CHART_COLORS.dieselA,
        backgroundColor: CHART_COLORS.dieselASoft,
        fill: false,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
      },
    ],
  }

  return (
    <div>
      <div className="mb-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200/70 bg-white/60 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-900/50">
          <p className="text-[11px] font-semibold text-ink-faint dark:text-slate-400">
            Media nacional Gasolina 95
          </p>
          <p className="price-nums text-lg font-bold text-emerald-700 dark:text-emerald-400">
            {formatPriceCompact(latest.avgGasoline95)} €/L
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/70 bg-white/60 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-900/50">
          <p className="text-[11px] font-semibold text-ink-faint dark:text-slate-400">
            Media nacional Gasóleo A
          </p>
          <p className="price-nums text-lg font-bold text-blue-700 dark:text-blue-400">
            {formatPriceCompact(latest.avgDieselA)} €/L
          </p>
        </div>
      </div>
      <div className="h-56">
        <Line data={chartData} options={baseChartOptions(isDark)} />
      </div>
      <p className="mt-2 text-[11px] text-ink-faint dark:text-slate-500">
        Media nacional aproximada del último año (muestreo mensual) en todas las
        estaciones de España. Fuente: MITECO.
      </p>
    </div>
  )
}