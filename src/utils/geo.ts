import type { Coordinates } from '../types'

const EARTH_RADIUS_KM = 6371

export function haversineKm(a: Coordinates, b: Coordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

export function isWithinRadius(
  point: Coordinates,
  center: Coordinates,
  radiusKm: number,
): boolean {
  return haversineKm(point, center) <= radiusKm
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  if (km < 10) return `${km.toFixed(1)} km`
  return `${Math.round(km)} km`
}

// Devuelve el nombre de la provincia (clave de PROVINCE_CENTERS) más cercana a un punto.
export function nearestProvinceName(
  point: Coordinates,
  centers: Record<string, Coordinates>,
): string | null {
  let best: string | null = null
  let bestDist = Infinity
  for (const [name, center] of Object.entries(centers)) {
    const d = haversineKm(point, center)
    if (d < bestDist) {
      bestDist = d
      best = name
    }
  }
  return best
}