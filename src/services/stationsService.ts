import { fetchJsonWithRetry } from './api'
import { transformStations, type RawStationShape } from './transformers'
import type { Station } from '../types'

// Envoltorio de la respuesta del MITECO.
interface ApiResponse {
  Fecha: string
  ListaEESSPrecio: RawStationShape[]
  Nota: string
  ResultadoConsulta: string
}

const provinceCache = new Map<number, { timestamp: number; data: Station[] }>()
let nationwideCache: { timestamp: number; data: Station[] } | null = null
const CACHE_FRESH_MS = 15 * 60 * 1000 // 15 minutos (fresco)

function getStoredEntry(key: string): { timestamp: number; data: Station[] } | null {
  try {
    const raw = localStorage.getItem(`gasolineras:${key}`)
    if (!raw) return null
    const entry = JSON.parse(raw) as { timestamp: number; data: Station[] }
    if (Array.isArray(entry?.data)) {
      return entry
    }
  } catch {
    // fallback
  }
  return null
}

function storeEntry(key: string, data: Station[]): void {
  try {
    localStorage.setItem(
      `gasolineras:${key}`,
      JSON.stringify({ timestamp: Date.now(), data }),
    )
  } catch {
    // ignorar si localStorage está lleno
  }
}

/**
 * Obtiene síncronamente los datos de estaciones cacheados en memoria o localStorage (0 ms).
 */
export function getCachedStationsSync(provinceId: number | null): {
  data: Station[]
  isFresh: boolean
} | null {
  if (provinceId === null) {
    if (nationwideCache) {
      return {
        data: nationwideCache.data,
        isFresh: Date.now() - nationwideCache.timestamp < CACHE_FRESH_MS,
      }
    }
    const stored = getStoredEntry('nationwide')
    if (stored) {
      nationwideCache = stored
      return {
        data: stored.data,
        isFresh: Date.now() - stored.timestamp < CACHE_FRESH_MS,
      }
    }
    return null
  }

  const mem = provinceCache.get(provinceId)
  if (mem) {
    return {
      data: mem.data,
      isFresh: Date.now() - mem.timestamp < CACHE_FRESH_MS,
    }
  }

  const stored = getStoredEntry(`prov_${provinceId}`)
  if (stored) {
    provinceCache.set(provinceId, stored)
    return {
      data: stored.data,
      isFresh: Date.now() - stored.timestamp < CACHE_FRESH_MS,
    }
  }

  return null
}

export async function fetchStationsByProvince(
  provinceId: number,
  onBackgroundUpdate?: (stations: Station[]) => void,
): Promise<Station[]> {
  const cached = getCachedStationsSync(provinceId)

  // Si está fresco (<15 min), devolvemos inmediatamente
  if (cached?.isFresh) {
    return cached.data
  }

  // Si tenemos datos cacheados (stale), los notificamos y revalidamos en segundo plano
  const fetchPromise = (async () => {
    const res = await fetchJsonWithRetry<ApiResponse>(
      `/EstacionesTerrestres/FiltroProvincia/${provinceId}`,
    )
    const stations = transformStations(res.ListaEESSPrecio)
    const entry = { timestamp: Date.now(), data: stations }
    provinceCache.set(provinceId, entry)
    storeEntry(`prov_${provinceId}`, stations)
    if (onBackgroundUpdate) {
      onBackgroundUpdate(stations)
    }
    return stations
  })()

  if (cached) {
    // Stale-While-Revalidate: devuelve los cacheados mientras se actualiza en background
    void fetchPromise.catch(() => {
      // fallo silencioso en revalidación background
    })
    return cached.data
  }

  return fetchPromise
}

export async function fetchStationsByMunicipality(
  municipalityId: number,
): Promise<Station[]> {
  const stored = getStoredEntry(`mun_${municipalityId}`)
  if (stored && Date.now() - stored.timestamp < CACHE_FRESH_MS) {
    return stored.data
  }

  const res = await fetchJsonWithRetry<ApiResponse>(
    `/EstacionesTerrestres/FiltroMunicipio/${municipalityId}`,
  )
  const stations = transformStations(res.ListaEESSPrecio)
  storeEntry(`mun_${municipalityId}`, stations)
  return stations
}

export async function fetchStationsNationwide(): Promise<Station[]> {
  const cached = getCachedStationsSync(null)
  if (cached?.isFresh) return cached.data

  const res = await fetchJsonWithRetry<ApiResponse>('/EstacionesTerrestres/')
  const stations = transformStations(res.ListaEESSPrecio)
  const entry = { timestamp: Date.now(), data: stations }
  nationwideCache = entry
  storeEntry('nationwide', stations)
  return stations
}