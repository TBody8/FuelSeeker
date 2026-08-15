import { useEffect, useState } from 'react'
import {
  fetchStationsByProvince,
  fetchStationsNationwide,
} from '../services/stationsService'
import type { Station } from '../types'

interface StationsState {
  stations: Station[]
  loading: boolean
  error: string | null
}

export function useStations(provinceId: number | null) {
  const [state, setState] = useState<StationsState>({
    stations: [],
    loading: false,
    error: null,
  })

  const [lastLoadedProvince, setLastLoadedProvince] = useState<number | null | undefined>(undefined)

  useEffect(() => {
    if (provinceId === lastLoadedProvince) return

    setState({ stations: [], loading: true, error: null })

    let cancelled = false
    const promise =
      provinceId === null
        ? fetchStationsNationwide()
        : fetchStationsByProvince(provinceId)

    void promise
      .then((stations) => {
        if (cancelled) return
        setState({ stations, loading: false, error: null })
        setLastLoadedProvince(provinceId)
      })
      .catch(() => {
        if (cancelled) return
        setState({
          stations: [],
          loading: false,
          error: 'No se pudieron cargar las estaciones de servicio.',
        })
      })

    return () => {
      cancelled = true
    }
  }, [provinceId, lastLoadedProvince])

  return state
}