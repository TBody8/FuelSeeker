import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import type { Coordinates } from '../../types'

interface FlyToCenterProps {
  center: Coordinates
  counter: number
  zoom?: number
}

// Vuela la cámara al centro cuando cambia la localidad seleccionada.
export function FlyToCenter({ center, counter, zoom }: FlyToCenterProps) {
  const map = useMap()

  useEffect(() => {
    if (counter < 1) return
    const targetZoom = zoom ?? Math.max(map.getZoom(), 11)
    map.flyTo([center.lat, center.lng], targetZoom, {
      duration: 0.9,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counter, zoom])

  return null
}