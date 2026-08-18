import { useRef } from 'react'
import { Line } from 'react-chartjs-2'
import { Activity, Loader2 } from 'lucide-react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { HistoricalStationPoint, Station } from '../../types'
import { parseApiDate } from '../../utils/format'
import { baseChartCompact, CHART_COLORS } from './chartConfig'

gsap.registerPlugin(useGSAP)

interface HistoricalChartProps {
  station: Station
  data: HistoricalStationPoint[]
  loading: boolean
  isDark: boolean
}

export function HistoricalChart({
  station,
  data,
  loading,
  isDark,
}: HistoricalChartProps) {
  const chartWrapperRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (loading || !chartWrapperRef.current || data.length === 0) return
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReduced) return

      gsap.fromTo(
        chartWrapperRef.current,
        { autoAlpha: 0, scale: 0.98 },
        { autoAlpha: 1, scale: 1, duration: 0.25, ease: 'power2.out' },
      )
    },
    { dependencies: [loading, data], scope: chartWrapperRef },
  )

  if (loading) {
    return (
      <div
        className="flex h-40 flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center dark:border-slate-800 dark:bg-slate-800/30"
        role="status"
        aria-label="Cargando histórico de precios"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
          <Activity size={16} className="animate-pulse" />
        </div>
        <div className="space-y-1">
          <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-ink dark:text-slate-200">
            <Loader2 size={12} className="animate-spin text-emerald-500" />
            Cargando histórico de precios…
          </p>
          <p className="text-[10.5px] text-ink-faint dark:text-slate-400">
            Muestreo anual del Ministerio para la Transición Ecológica
          </p>
        </div>
        <div className="h-1 w-32 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div className="h-full w-full bg-emerald-500 animate-[shimmer_1.2s_infinite] bg-[length:200%_100%]" />
        </div>
      </div>
    )
  }

  const hasData = data.some(
    (d) => d.priceGasoline95 !== null || d.priceDieselA !== null,
  )

  if (!hasData) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 p-4 text-center dark:border-slate-800">
        <p className="text-xs text-ink-faint dark:text-slate-500">
          No hay registros históricos disponibles para esta estación.
        </p>
      </div>
    )
  }

  const sortedData = [...data].sort(
    (a, b) => parseApiDate(a.date).getTime() - parseApiDate(b.date).getTime(),
  )

  const chartData = {
    datasets: [
      {
        label: 'Gasolina 95',
        data: sortedData
          .filter((d) => d.priceGasoline95 !== null)
          .map((d) => ({
            x: parseApiDate(d.date).getTime(),
            y: d.priceGasoline95,
          })),
        borderColor: CHART_COLORS.gasoline95,
        backgroundColor: CHART_COLORS.gasoline95,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
        spanGaps: true,
      },
      {
        label: 'Gasóleo A',
        data: sortedData
          .filter((d) => d.priceDieselA !== null)
          .map((d) => ({
            x: parseApiDate(d.date).getTime(),
            y: d.priceDieselA,
          })),
        borderColor: CHART_COLORS.dieselA,
        backgroundColor: CHART_COLORS.dieselA,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
        spanGaps: true,
      },
    ],
  }

  return (
    <div ref={chartWrapperRef}>
      <p className="mb-2 text-[11px] font-semibold text-ink-soft dark:text-slate-400">
        Evolución del precio · {station.brand} · {station.municipality}
      </p>
      <div className="h-44">
        <Line data={chartData} options={baseChartCompact(isDark)} />
      </div>
    </div>
  )
}