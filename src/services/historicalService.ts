import { fetchJsonWithRetry, mapWithConcurrency } from './api'
import { transformStations, type RawStationShape } from './transformers'
import type { HistoricalStationPoint, NationalAverage, Station } from '../types'

interface ApiResponse {
  Fecha: string
  ListaEESSPrecio: RawStationShape[]
  Nota: string
  ResultadoConsulta: string
}

const sessionCache = new Map<string, unknown>()

function cacheKey(...parts: string[]): string {
  return `gasolineras:${parts.join(':')}`
}

function readCache<T>(key: string): T | undefined {
  if (sessionCache.has(key)) return sessionCache.get(key) as T
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as T
    sessionCache.set(key, parsed)
    return parsed
  } catch {
    return undefined
  }
}

function writeCache<T>(key: string, value: T): void {
  sessionCache.set(key, value)
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage puede estar lleno; la caché en memoria es suficiente.
  }
}

export function toApiDate(date: Date): string {
  const d = new Date(date)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}-${mm}-${d.getFullYear()}`
}

// Genera fechas de muestreo hacia atrás desde ayer (D-1).
// La API histórica de MITECO no permite consultar la fecha en curso.
export function sampleDates(
  samples: number,
  stepWeeks = 1,
  end?: Date,
): string[] {
  const dates: string[] = []
  const cursor = end ? new Date(end) : new Date()
  if (!end) {
    cursor.setDate(cursor.getDate() - 1) // Iniciar en ayer
  }
  for (let i = 0; i < samples; i++) {
    dates.push(toApiDate(cursor))
    cursor.setDate(cursor.getDate() - 7 * stepWeeks)
  }
  return dates
}

export type ProgressCallback = (done: number, total: number) => void

// --- Histórico de UNA estación (endpoint ligero por provincia) ---
// El endpoint histórico por provincia devuelve todas las estaciones de la
// provincia en esa fecha con todos sus precios; localizamos la nuestra por id.
export async function fetchStationHistory(
  station: Station,
  dates: string[],
): Promise<HistoricalStationPoint[]> {
  const mapByDate = new Map<string, HistoricalStationPoint>()

  const missing = dates.filter((date) => {
    const cached = readCache<HistoricalStationPoint>(
      stationCacheKey(station, date),
    )
    if (cached) {
      mapByDate.set(date, cached)
      return false
    }
    return true
  })

  await mapWithConcurrency(missing, 8, async (date) => {
    const res = await fetchJsonWithRetry<ApiResponse>(
      `/EstacionesTerrestresHist/FiltroProvincia/${date}/${station.provinceId}`,
    )
    const stations = transformStations(res.ListaEESSPrecio)
    // Guardar en caché todas las estaciones de la provincia para esta fecha (bulk cache)
    for (const s of stations) {
      const p: HistoricalStationPoint = {
        date,
        priceGasoline95: s.priceGasoline95,
        priceDieselA: s.priceDieselA,
      }
      writeCache(cacheKey('hist', String(station.provinceId), s.id, date), p)
      if (s.id === station.id) {
        mapByDate.set(date, p)
      }
    }
    // Si la estación no existía en esa fecha específica
    if (!mapByDate.has(date)) {
      const emptyPoint: HistoricalStationPoint = {
        date,
        priceGasoline95: null,
        priceDieselA: null,
      }
      writeCache(cacheKey('hist', String(station.provinceId), station.id, date), emptyPoint)
      mapByDate.set(date, emptyPoint)
    }
  })

  return dates
    .map((date) => mapByDate.get(date))
    .filter((p): p is HistoricalStationPoint => Boolean(p))
}

function stationCacheKey(station: Station, date: string): string {
  return cacheKey('hist', String(station.provinceId), station.id, date)
}

// --- Medias nacionales (serie temporal) ---
// Estrategia de rendimiento: consumimos el endpoint por producto + fecha
// (`FiltroProducto/{FECHA}/{IDProducto}`), varios órdenes de magnitud más
// ligero que el nacional completo. Respuestas cacheadas en sessionStorage.
interface NationalEntry {
  avgGasoline95: number
  avgDieselA: number
  stationCount: number
}

export async function fetchNationalAverages(
  dates: string[],
  onProgress?: ProgressCallback,
): Promise<NationalAverage[]> {
  const entriesByDate = new Map<string, NationalEntry>()

  const missing = dates.filter((date) => {
    const cached = readCache<NationalEntry>(cacheKey('national', date))
    if (cached) {
      entriesByDate.set(date, cached)
      return false
    }
    return true
  })

  let done = dates.length - missing.length
  const total = dates.length
  onProgress?.(done, total)

  await mapWithConcurrency(missing, 3, async (date) => {
    const entry = await nationalSnapshotEntry(date)
    writeCache(cacheKey('national', date), entry)
    entriesByDate.set(date, entry)
    done += 1
    onProgress?.(done, total)
  })

  return dates
    .map((date) => {
      const e = entriesByDate.get(date)
      if (!e) return undefined
      return { date, ...e }
    })
    .filter((r): r is NationalAverage => Boolean(r))
}

// Media nacional de ambos productos para una fecha dada (2 llamadas en paralelo).
async function nationalSnapshotEntry(date: string): Promise<NationalEntry> {
  const [g95, g4] = await Promise.all([
    productSnapshot(date, 1, 'priceGasoline95'),
    productSnapshot(date, 4, 'priceDieselA'),
  ])
  return {
    avgGasoline95: g95.avg,
    avgDieselA: g4.avg,
    stationCount: Math.max(g95.count, g4.count),
  }
}

async function productSnapshot(
  date: string,
  productId: number,
  priceKey: 'priceGasoline95' | 'priceDieselA',
): Promise<{ avg: number; count: number }> {
  const res = await fetchJsonWithRetry<ApiResponse>(
    `/EstacionesTerrestresHist/FiltroProducto/${date}/${productId}`,
  )
  const stations = transformStations(res.ListaEESSPrecio)
  let sum = 0
  let count = 0
  for (const s of stations) {
    const price = s[priceKey]
    if (price !== null) {
      sum += price
      count++
    }
  }
  return { avg: count > 0 ? sum / count : 0, count }
}