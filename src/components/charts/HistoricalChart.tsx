import { Line } from 'react-chartjs-2'
import type { HistoricalStationPoint, Station } from '../../types'
import { parseApiDate } from '../../utils/format'
import { baseChartCompact, CHART_COLORS } from './chartConfig'

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
  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center" role="status">
        <p className="text-xs text-ink-faint dark:text-slate-400">
          Cargando histórico…
        </p>
      </div>
    )
  }

  const hasData = data.some(
    (d) => d.priceGasoline95 !== null || d.priceDieselA !== null,
  )

  if (!hasData) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-xs text-ink-faint dark:text-slate-500">
          No hay histórico disponible para esta estación.
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
    <div>
      <p className="mb-2 text-[11px] font-semibold text-ink-soft dark:text-slate-400">
        Evolución del precio · {station.brand} · {station.municipality}
      </p>
      <div className="h-44">
        <Line data={chartData} options={baseChartCompact(isDark)} />
      </div>
    </div>
  )
}