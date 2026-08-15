import type { Station } from '../../types'
import { useHistoricalPrices } from '../../hooks/useHistoricalPrices'
import { HistoricalChart } from '../charts/HistoricalChart'

interface StationHistoryProps {
  station: Station
  isDark: boolean
}

// Componente autocontenido: gestiona su propio ciclo de carga del histórico.
export function StationHistory({ station, isDark }: StationHistoryProps) {
  const { data, loading } = useHistoricalPrices(station)

  return <HistoricalChart station={station} data={data} loading={loading} isDark={isDark} />
}