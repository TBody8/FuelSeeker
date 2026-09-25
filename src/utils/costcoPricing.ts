import type { Station } from '../types'
import { haversineKm } from './geo'

const KNOWN_COSTCO_IDS = new Set(['13253', '15062', '14117', '15158', '16078'])

/**
 * Determina si una estación pertenece a la red de Costco Wholesale.
 */
export function isCostcoStation(brand: string, address: string = '', id?: string): boolean {
  if (id && KNOWN_COSTCO_IDS.has(id)) {
    return true
  }
  const b = (brand || '').toUpperCase()
  const a = (address || '').toUpperCase()
  return b.includes('COSTCO') || a.includes('COSTCO')
}

/**
 * Margen de paridad competitiva que Costco aplica a sus socios en surtidor:
 * 1 céntimo (0.010 €/L) por debajo de la estación más barata del mercado local.
 */
export const COSTCO_COMPETITIVE_DELTA = 0.010

/**
 * Ajusta los precios de las estaciones de Costco en un lote de estaciones para reflejar
 * única y exclusivamente la tarifa real de socio en surtidor, calculada automáticamente
 * según la paridad de mercado del área de influencia local.
 */
export function adjustCostcoStations(stations: Station[]): Station[] {
  const hasCostco = stations.some((s) => isCostcoStation(s.brand, s.address, s.id))
  if (!hasCostco) return stations

  // Candidatas competidoras (no Costco) con precios válidos
  const competitors = stations.filter((s) => !isCostcoStation(s.brand, s.address, s.id))

  return stations.map((station) => {
    if (!isCostcoStation(station.brand, station.address, station.id)) {
      return station
    }

    // Buscamos competidores locales: mismo municipio o radio de 12 km
    let localCompetitors = competitors.filter(
      (c) =>
        (c.municipality && station.municipality && c.municipality.toLowerCase() === station.municipality.toLowerCase()) ||
        (c.lat && c.lng && station.lat && station.lng && haversineKm({ lat: station.lat, lng: station.lng }, { lat: c.lat, lng: c.lng }) <= 12),
    )

    // Si no hubiera competidores locales inmediatos, usamos todos los de la provincia
    if (localCompetitors.length === 0) {
      localCompetitors = competitors
    }

    // Mínimo de Gasolina 95 local
    const g95Prices = localCompetitors
      .map((c) => c.priceGasoline95)
      .filter((p): p is number => p !== null && p > 0.5)

    const minLocalG95 = g95Prices.length > 0 ? Math.min(...g95Prices) : null

    // Mínimo de Gasóleo A local
    const dieselPrices = localCompetitors
      .map((c) => c.priceDieselA)
      .filter((p): p is number => p !== null && p > 0.5)

    const minLocalDiesel = dieselPrices.length > 0 ? Math.min(...dieselPrices) : null

    // Calculamos el precio de socio (1 céntimo por debajo del suelo local)
    const memberG95 =
      minLocalG95 !== null
        ? Math.round(Math.max(0.5, minLocalG95 - COSTCO_COMPETITIVE_DELTA) * 1000) / 1000
        : station.priceGasoline95 !== null
          ? Math.round(station.priceGasoline95 * 0.895 * 1000) / 1000
          : null

    const memberDieselA =
      minLocalDiesel !== null
        ? Math.round(Math.max(0.5, minLocalDiesel - COSTCO_COMPETITIVE_DELTA) * 1000) / 1000
        : station.priceDieselA !== null
          ? Math.round(station.priceDieselA * 0.89 * 1000) / 1000
          : null

    return {
      ...station,
      priceGasoline95: memberG95,
      priceDieselA: memberDieselA,
    }
  })
}
