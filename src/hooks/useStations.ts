import { useEffect, useState } from 'react'
import {
  fetchStationsByProvince,
  fetchStationsNationwide,
  getCachedStationsSync,
} from '../services/stationsService'
import type { Station } from '../types'

interface StationsState {
  stations: Station[]
  loading: boolean
  error: string | null
}

export function useStations(provinceId: number | null) {
  const [state, setState] = useState<StationsState>(() => {
    const cached = getCachedStationsSync(provinceId)
    return {
      stations: cached ? cached.data : [],
      loading: cached ? !cached.isFresh : false,
      error: null,
    }
  })

  const [lastLoadedProvince, setLastLoadedProvince] = useState<number | null | undefined>(undefined)

  useEffect(() => {
    if (provinceId === lastLoadedProvince) return

    const cached = getCachedStationsSync(provinceId)
    if (cached) {
      setState({
        stations: cached.data,
        loading: !cached.isFresh,
        error: null,
      })
    } else {
      setState({
        stations: [],
        loading: true,
        error: null,
      })
    }

    let cancelled = false

    const handleBackgroundUpdate = (freshStations: Station[]) => {
      if (cancelled) return
      setState({ stations: freshStations, loading: false, error: null })
      setLastLoadedProvince(provinceId)
    }

    const promise =
      provinceId === null
        ? fetchStationsNationwide()
        : fetchStationsByProvince(provinceId, handleBackgroundUpdate)

    void promise
      .then((stations) => {
        if (cancelled) return
        setState({ stations, loading: false, error: null })
        setLastLoadedProvince(provinceId)
      })
      .catch(() => {
        if (cancelled) return
        // Si ya teníamos estaciones cacheadas, no borramos la pantalla
        setState((prev) => ({
          ...prev,
          loading: false,
          error: prev.stations.length === 0 ? 'No se pudieron cargar las estaciones de servicio.' : null,
        }))
      })

    return () => {
      cancelled = true
    }
  }, [provinceId, lastLoadedProvince])

  return state
}