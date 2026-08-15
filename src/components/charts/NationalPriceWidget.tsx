import { useState } from 'react'
import { Line } from 'react-chartjs-2'
import { Activity, ChevronDown, ChevronUp, Fuel, TrendingUp } from 'lucide-react'
import type { NationalAverage } from '../../types'
import { formatPriceCompact, parseApiDate } from '../../utils/format'
import { baseChartOptions, CHART_COLORS } from './chartConfig'

interface NationalPriceWidgetProps {
  data: NationalAverage[]
  loading: boolean
  progress: number
  isDark: boolean
}

export function NationalPriceWidget({
  data,
  loading,
  progress,
  isDark,
}: NationalPriceWidgetProps) {
  const [expanded, setExpanded] = useState(false)

  // Datos ordenados cronológicamente para el gráfico
  const sortedData = [...data].sort(
    (a, b) => parseApiDate(a.date).getTime() - parseApiDate(b.date).getTime(),
  )

  const latest = data.length > 0 ? data[0] : null
  const previous = data.length > 1 ? data[1] : null

  const diffGasoline =
    latest && previous ? latest.avgGasoline95 - previous.avgGasoline95 : 0
  const diffDiesel =
    latest && previous ? latest.avgDieselA - previous.avgDieselA : 0

  const chartData = {
    datasets: [
      {
        label: 'Gasolina 95',
        data: sortedData.map((d) => ({
          x: parseApiDate(d.date).getTime(),
          y: d.avgGasoline95,
        })),
        borderColor: CHART_COLORS.gasoline95,
        backgroundColor: CHART_COLORS.gasoline95Soft,
        fill: true,
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
      {
        label: 'Gasóleo A',
        data: sortedData.map((d) => ({
          x: parseApiDate(d.date).getTime(),
          y: d.avgDieselA,
        })),
        borderColor: CHART_COLORS.dieselA,
        backgroundColor: CHART_COLORS.dieselASoft,
        fill: false,
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
    ],
  }

  return (
    <div className="glass pointer-events-auto w-full max-w-sm rounded-2xl p-3 shadow-lift transition-all duration-200 sm:max-w-md">
      {/* Cabecera / Barra siempre visible */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <Activity size={15} />
          </span>
          <div>
            <h3 className="text-xs font-bold text-ink dark:text-white">
              Media Nacional (España)
            </h3>
            <p className="text-[10px] text-ink-faint dark:text-slate-400">
              Datos oficiales MITECO
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Ocultar gráfico nacional' : 'Ver gráfico nacional'}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-ink-soft transition-colors duration-150 hover:bg-slate-100 hover:text-ink dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <span>{expanded ? 'Minimizar' : 'Ver gráfico'}</span>
          {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>

      {/* Tarjetas de medias actuales siempre visibles */}
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/50 p-2 dark:border-emerald-500/20 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">
              Gasolina 95
            </span>
            <Fuel size={12} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="price-nums text-base font-extrabold text-emerald-700 dark:text-emerald-400">
              {latest ? `${formatPriceCompact(latest.avgGasoline95)} €` : '—'}
            </span>
            {diffGasoline !== 0 && (
              <span
                className={`flex items-center text-[10px] font-bold ${
                  diffGasoline < 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {diffGasoline < 0 ? '↓' : '↑'}{' '}
                {Math.abs(diffGasoline).toFixed(3)}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-blue-500/20 bg-blue-50/50 p-2 dark:border-blue-500/20 dark:bg-blue-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-blue-800 dark:text-blue-300">
              Gasóleo A
            </span>
            <TrendingUp size={12} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="price-nums text-base font-extrabold text-blue-700 dark:text-blue-400">
              {latest ? `${formatPriceCompact(latest.avgDieselA)} €` : '—'}
            </span>
            {diffDiesel !== 0 && (
              <span
                className={`flex items-center text-[10px] font-bold ${
                  diffDiesel < 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {diffDiesel < 0 ? '↓' : '↑'} {Math.abs(diffDiesel).toFixed(3)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Gráfico expandible */}
      {expanded && (
        <div className="mt-3 border-t border-slate-200/60 pt-3 dark:border-slate-800">
          {loading ? (
            <div className="flex h-44 flex-col items-center justify-center gap-2">
              <div className="h-2 w-3/4 max-w-xs overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full bg-accent transition-all duration-200"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-ink-faint dark:text-slate-400">
                Cargando histórico nacional ({Math.round(progress * 100)}%)…
              </p>
            </div>
          ) : data.length > 0 ? (
            <div>
              <div className="h-44">
                <Line data={chartData} options={baseChartOptions(isDark)} />
              </div>
              <p className="mt-1.5 text-[10px] text-ink-faint dark:text-slate-500">
                Evolución del último año (muestreo mensual) en todas las E.S. de España.
              </p>
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-xs text-ink-faint dark:text-slate-400">
              Cargando medias nacionales…
            </div>
          )}
        </div>
      )}
    </div>
  )
}
