import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchStationHistory, sampleDates } from '../services/historicalService'
import type { HistoricalStationPoint, Station } from '../types'
import { HISTORICAL_SAMPLES, HISTORICAL_STEP_WEEKS } from '../utils/constants'

interface HistoricalState {
  data: HistoricalStationPoint[]
  loading: boolean
  progress: number
  error: string | null
}

export function useHistoricalPrices(station: Station | null, enabled = true) {
  const [state, setState] = useState<HistoricalState>({
    data: [],
    loading: false,
    progress: 0,
    error: null,
  })
  const requestId = useRef(0)

  const load = useCallback(async (target: Station) => {
    const id = ++requestId.current
    const dates = sampleDates(HISTORICAL_SAMPLES, HISTORICAL_STEP_WEEKS)

    setState({ data: [], loading: true, progress: 0, error: null })

    try {
      const data = await fetchStationHistory(target, dates)
      if (requestId.current !== id) return
      setState({ data, loading: false, progress: 1, error: null })
    } catch {
      if (requestId.current !== id) return
      setState({
        data: [],
        loading: false,
        progress: 0,
        error: 'No se pudo cargar el historial de precios.',
      })
    }
  }, [])

  useEffect(() => {
    if (!station || !enabled) {
      requestId.current += 1
      setState({ data: [], loading: false, progress: 0, error: null })
      return
    }
    void load(station)
  }, [station, enabled, load])

  return { ...state, load }
}