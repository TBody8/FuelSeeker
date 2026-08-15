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

const provinceCache = new Map<number, Station[]>()
let nationwideCache: Station[] | null = null
const CACHE_TTL_MS = 20 * 60 * 1000 // 20 minutos (MITECO actualiza cada 30 min)

function getStoredStations(key: string): Station[] | null {
  try {
    const raw = localStorage.getItem(`gasolineras:${key}`)
    if (!raw) return null
    const { timestamp, data } = JSON.parse(raw) as { timestamp: number; data: Station[] }
    if (Date.now() - timestamp < CACHE_TTL_MS) {
      return data
    }
  } catch {
    // fallback a null si falla el parseo
  }
  return null
}

function storeStations(key: string, data: Station[]): void {
  try {
    localStorage.setItem(
      `gasolineras:${key}`,
      JSON.stringify({ timestamp: Date.now(), data }),
    )
  } catch {
    // ignorar si localStorage está lleno
  }
}

export async function fetchStationsByProvince(provinceId: number): Promise<Station[]> {
  const mem = provinceCache.get(provinceId)
  if (mem) return mem

  const stored = getStoredStations(`prov_${provinceId}`)
  if (stored) {
    provinceCache.set(provinceId, stored)
    return stored
  }

  const data = await fetchJsonWithRetry<ApiResponse>(
    `/EstacionesTerrestres/FiltroProvincia/${provinceId}`,
  )
  const stations = transformStations(data.ListaEESSPrecio)
  provinceCache.set(provinceId, stations)
  storeStations(`prov_${provinceId}`, stations)
  return stations
}

export async function fetchStationsByMunicipality(
  municipalityId: number,
): Promise<Station[]> {
  const stored = getStoredStations(`mun_${municipalityId}`)
  if (stored) return stored

  const data = await fetchJsonWithRetry<ApiResponse>(
    `/EstacionesTerrestres/FiltroMunicipio/${municipalityId}`,
  )
  const stations = transformStations(data.ListaEESSPrecio)
  storeStations(`mun_${municipalityId}`, stations)
  return stations
}

export async function fetchStationsNationwide(): Promise<Station[]> {
  if (nationwideCache) return nationwideCache

  const stored = getStoredStations('nationwide')
  if (stored) {
    nationwideCache = stored
    return stored
  }

  const data = await fetchJsonWithRetry<ApiResponse>('/EstacionesTerrestres/')
  const stations = transformStations(data.ListaEESSPrecio)
  nationwideCache = stations
  storeStations('nationwide', stations)
  return stations
}