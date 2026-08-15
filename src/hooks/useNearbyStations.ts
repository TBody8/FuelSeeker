import { useMemo } from 'react'
import type { Coordinates, FuelType, Station } from '../types'
import { haversineKm, isWithinRadius } from '../utils/geo'

export interface MarketRange {
  min: number
  max: number
}

export interface NearbyStationsResult {
  nearby: Station[]
  sorted: Station[]
  cheapest: Station | null
  mostExpensive: Station | null
  averagePrice: number | null
  marketRange: MarketRange | null
}

function stationPrice(station: Station, fuelType: FuelType): number | null {
  return fuelType === 'gasoline95' ? station.priceGasoline95 : station.priceDieselA
}

export function useNearbyStations(
  stations: Station[],
  center: Coordinates,
  radiusKm: number,
  fuelType: FuelType,
  isNationwide = false,
): NearbyStationsResult {
  return useMemo(() => {
    if (isNationwide) {
      const valid = stations.filter((s) => {
        const p = stationPrice(s, fuelType)
        return p !== null && p > 0
      })

      const sortedAll = [...valid].sort((a, b) => {
        const pa = stationPrice(a, fuelType) as number
        const pb = stationPrice(b, fuelType) as number
        return pa - pb
      })

      const top5 = sortedAll.slice(0, 5)
      const prices = top5.map((s) => stationPrice(s, fuelType) as number)
      const cheapest = top5.length > 0 ? top5[0] : null
      const mostExpensive = top5.length > 0 ? top5[top5.length - 1] : null
      const averagePrice =
        prices.length > 0
          ? prices.reduce((sum, p) => sum + p, 0) / prices.length
          : null

      const marketRange: MarketRange | null =
        prices.length >= 2
          ? { min: prices[0], max: prices[prices.length - 1] }
          : prices.length === 1
            ? { min: prices[0], max: prices[0] }
            : null

      return {
        nearby: top5,
        sorted: top5,
        cheapest,
        mostExpensive,
        averagePrice,
        marketRange,
      }
    }

    // Solo estaciones dentro del radio Y con precio del combustible elegido.
    const within = stations.filter((s) => {
      if (!isWithinRadius({ lat: s.lat, lng: s.lng }, center, radiusKm)) return false
      return stationPrice(s, fuelType) !== null
    })

    const withDistance = within.map((s) => ({
      station: s,
      distanceKm: haversineKm({ lat: s.lat, lng: s.lng }, center),
    }))

    const sorted = [...withDistance].sort((a, b) => {
      const pa = stationPrice(a.station, fuelType) as number
      const pb = stationPrice(b.station, fuelType) as number
      return pa - pb
    })

    const prices = sorted.map((item) => stationPrice(item.station, fuelType) as number)

    const cheapest = sorted.length > 0 ? sorted[0].station : null
    const mostExpensive =
      sorted.length > 0 ? sorted[sorted.length - 1].station : null
    const averagePrice =
      prices.length > 0
        ? prices.reduce((sum, p) => sum + p, 0) / prices.length
        : null

    const marketRange: MarketRange | null =
      prices.length >= 2
        ? { min: prices[0], max: prices[prices.length - 1] }
        : prices.length === 1
          ? { min: prices[0], max: prices[0] }
          : null

    return {
      nearby: withDistance.map((item) => item.station),
      sorted: sorted.map((item) => item.station),
      cheapest,
      mostExpensive,
      averagePrice,
      marketRange,
    }
  }, [stations, center, radiusKm, fuelType, isNationwide])
}