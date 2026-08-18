import type { ChartOptions } from 'chart.js'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Tooltip,
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import { es } from 'date-fns/locale'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip,
  Legend,
  Filler,
)

// Paleta de marca: esmeralda (gasolina) y azul (gasóleo).
export const CHART_COLORS = {
  gasoline95: '#059669',
  gasoline95Soft: 'rgba(5, 150, 105, 0.12)',
  dieselA: '#2563eb',
  dieselASoft: 'rgba(37, 99, 235, 0.12)',
  grid: 'rgba(148, 163, 184, 0.18)',
  tick: '#94a3b8',
} as const

export function baseChartOptions(
  isDark: boolean,
  period: '1y' | '5y' = '1y',
): ChartOptions<'line'> {
  const is5y = period === '5y'
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    animation: {
      duration: 500,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: isDark ? '#cbd5e1' : '#475569',
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          font: { family: 'Manrope', size: 12, weight: 600 },
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#16213a' : '#ffffff',
        titleColor: isDark ? '#e2e8f0' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#475569',
        borderColor: isDark ? 'rgba(148,163,184,0.2)' : 'rgba(15,23,42,0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        titleFont: { family: 'Manrope', size: 12, weight: 700 },
        bodyFont: { family: 'Manrope', size: 12 },
        callbacks: {
          label: (ctx) => {
            const value = ctx.parsed.y as number
            const formatted = value.toFixed(3).replace('.', ',')
            return `  ${ctx.dataset.label}: ${formatted} €/L`
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: is5y ? 'year' : 'month',
          displayFormats: {
            month: 'MMM yy',
            year: 'yyyy',
          },
          tooltipFormat: "dd 'de' MMMM 'de' yyyy",
        },
        adapters: {
          date: { locale: es },
        },
        grid: {
          color: CHART_COLORS.grid,
        },
        ticks: {
          color: CHART_COLORS.tick,
          maxTicksLimit: is5y ? 6 : 8,
          font: { family: 'Manrope', size: 11, weight: is5y ? 700 : 500 },
        },
      },
      y: {
        grid: {
          color: CHART_COLORS.grid,
        },
        ticks: {
          color: CHART_COLORS.tick,
          font: { family: 'Manrope', size: 11 },
          callback: (value: string | number) => {
            const num = typeof value === 'number' ? value : parseFloat(value)
            if (Number.isNaN(num)) return `${value} €`
            return `${num.toLocaleString('es-ES', { maximumFractionDigits: 3 })} €`
          },
        },
      },
    },
  }
}

// Variante compacta para el gráfico dentro de una tarjeta (histórico).
// Misma configuración estructural, sin números en eje X.
export function baseChartCompact(isDark: boolean): ChartOptions<'line'> {
  const base = baseChartOptions(isDark)
  return {
    ...base,
    plugins: {
      ...base.plugins,
      legend: {
        display: false,
      },
    },
    scales: {
      ...base.scales,
      x: {
        ...(base.scales?.x ?? {}),
        ticks: {
          color: CHART_COLORS.tick,
          maxTicksLimit: 5,
          maxRotation: 0,
          font: { family: 'Manrope', size: 10 },
        },
      },
    },
  }
}