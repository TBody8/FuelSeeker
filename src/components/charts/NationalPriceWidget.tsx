import { useRef, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { Activity, ChevronDown, ChevronUp, Fuel, TrendingUp } from 'lucide-react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { NationalAverage } from '../../types'
import { formatPriceCompact, parseApiDate } from '../../utils/format'
import { baseChartOptions, CHART_COLORS } from './chartConfig'

gsap.registerPlugin(useGSAP)

interface NationalPriceWidgetProps {
  data: NationalAverage[]
  loading: boolean
  progress: number
  isDark: boolean
  period?: '1y' | '5y'
  onPeriodChange?: (period: '1y' | '5y') => void
}

export function NationalPriceWidget({
  data,
  loading,
  progress,
  isDark,
  period = '1y',
  onPeriodChange,
}: NationalPriceWidgetProps) {
  const [expanded, setExpanded] = useState(false)
  const chartContainerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!expanded || !chartContainerRef.current) return
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReduced) return

      gsap.fromTo(
        chartContainerRef.current,
        { autoAlpha: 0, y: -6, scale: 0.98 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.24, ease: 'power2.out' },
      )
    },
    { dependencies: [expanded], scope: chartContainerRef },
  )

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
        pointRadius: period === '5y' ? 1.5 : 2,
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
        pointRadius: period === '5y' ? 1.5 : 2,
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
        <div
          ref={chartContainerRef}
          className="mt-3 border-t border-slate-200/60 pt-3 dark:border-slate-800"
        >
          {/* Selector elegante de periodo temporal */}
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[11px] font-bold text-ink dark:text-slate-200">
              Evolución de precios
            </span>
            <div className="flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800 text-[10.5px]">
              <button
                type="button"
                onClick={() => onPeriodChange?.('1y')}
                className={`rounded-md px-2.5 py-0.5 font-bold transition-all duration-150 ${
                  period === '1y'
                    ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-400'
                    : 'text-ink-faint hover:text-ink dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                1 Año
              </button>
              <button
                type="button"
                onClick={() => onPeriodChange?.('5y')}
                className={`rounded-md px-2.5 py-0.5 font-bold transition-all duration-150 ${
                  period === '5y'
                    ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-400'
                    : 'text-ink-faint hover:text-ink dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                5 Años
              </button>
            </div>
          </div>

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
                <Line data={chartData} options={baseChartOptions(isDark, period)} />
              </div>
              <p className="mt-1.5 text-[10px] text-ink-faint dark:text-slate-500">
                {period === '5y'
                  ? 'Evolución de los últimos 5 años (muestreo trimestral MITECO).'
                  : 'Evolución del último año (muestreo mensual MITECO).'}
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

