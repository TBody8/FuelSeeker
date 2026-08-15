import { useCallback, useEffect, useState } from 'react'
import type { Coordinates, GeolocationState } from '../types'
import { FALLBACK_CENTER } from '../utils/constants'

export interface UseGeolocationResult extends GeolocationState {
  coords: Coordinates
  isExact: boolean
  retry: () => void
}

function isValidCoordinates(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  )
}

async function fetchIpLocation(): Promise<Coordinates | null> {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) })
    if (res.ok) {
      const data = (await res.json()) as { latitude?: number; longitude?: number }
      if (isValidCoordinates(data.latitude, data.longitude)) {
        return { lat: data.latitude as number, lng: data.longitude as number }
      }
    }
  } catch {
    // Fallback seguro a centro predeterminado
  }
  return null
}

export function useGeolocation(): UseGeolocationResult {
  const [state, setState] = useState<GeolocationState & { isExact: boolean }>({
    coords: FALLBACK_CENTER,
    loading: true,
    error: null,
    permissionDenied: false,
    isExact: false,
  })

  const start = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    const tryIpFallback = async (denied: boolean, msg: string) => {
      const ipCoords = await fetchIpLocation()
      if (ipCoords) {
        setState({
          coords: ipCoords,
          loading: false,
          error: null,
          permissionDenied: false,
          isExact: false,
        })
      } else {
        setState({
          coords: FALLBACK_CENTER,
          loading: false,
          error: msg,
          permissionDenied: denied,
          isExact: false,
        })
      }
    }

    if (!('geolocation' in navigator)) {
      void tryIpFallback(false, 'Tu navegador no soporta geolocalización GPS.')
      return
    }

    const onExactSuccess = (pos: GeolocationPosition) => {
      setState({
        coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        loading: false,
        error: null,
        permissionDenied: false,
        isExact: true,
      })
    }

    const onLowAccuracyError = (err: GeolocationPositionError) => {
      const denied = err.code === err.PERMISSION_DENIED
      void tryIpFallback(
        denied,
        denied
          ? 'Permiso de ubicación denegado.'
          : 'No se pudo obtener la señal GPS.',
      )
    }

    const onHighAccuracyError = () => {
      // Si falla o da timeout la alta precisión (típico en interiores), probar con baja precisión (WiFi/red móvil)
      navigator.geolocation.getCurrentPosition(
        onExactSuccess,
        onLowAccuracyError,
        {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 120000,
        },
      )
    }

    navigator.geolocation.getCurrentPosition(
      onExactSuccess,
      onHighAccuracyError,
      {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 60000,
      },
    )
  }, [])

  useEffect(() => {
    start()
  }, [start])

  return {
    coords: state.coords ?? FALLBACK_CENTER,
    loading: state.loading,
    error: state.error,
    permissionDenied: state.permissionDenied,
    isExact: state.isExact,
    retry: start,
  }
}