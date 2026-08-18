import { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchNationalAverages,
  sampleDates,
} from '../services/historicalService'
import type { NationalAverage } from '../types'
import {
  NATIONAL_5Y_SAMPLES,
  NATIONAL_5Y_STEP_WEEKS,
  NATIONAL_SAMPLES,
  NATIONAL_STEP_WEEKS,
} from '../utils/constants'

interface NationalState {
  data: NationalAverage[]
  loading: boolean
  progress: number
  error: string | null
}

export function useNationalAverage(enabled: boolean, period: '1y' | '5y' = '1y') {
  const [state, setState] = useState<NationalState>({
    data: [],
    loading: false,
    progress: 0,
    error: null,
  })
  const requestId = useRef(0)

  const load = useCallback(async (currentPeriod: '1y' | '5y') => {
    const id = ++requestId.current
    const samples =
      currentPeriod === '5y' ? NATIONAL_5Y_SAMPLES : NATIONAL_SAMPLES
    const stepWeeks =
      currentPeriod === '5y' ? NATIONAL_5Y_STEP_WEEKS : NATIONAL_STEP_WEEKS

    const dates = sampleDates(samples, stepWeeks)

    setState((prev) => ({ ...prev, loading: true, progress: 0, error: null }))

    try {
      const data = await fetchNationalAverages(dates, (done, total) => {
        if (requestId.current === id) {
          setState((prev) => ({ ...prev, progress: done / total }))
        }
      })
      if (requestId.current !== id) return
      setState({ data, loading: false, progress: 1, error: null })
    } catch {
      if (requestId.current !== id) return
      setState({
        data: [],
        loading: false,
        progress: 0,
        error: 'No se pudo cargar la media nacional.',
      })
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      void load(period)
    } else {
      requestId.current += 1
    }
    return () => {
      requestId.current += 1
    }
  }, [enabled, period, load])

  return { ...state, load: () => load(period) }
}