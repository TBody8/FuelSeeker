export interface Coordinates {
  lat: number
  lng: number
}

export type FuelType = 'gasoline95' | 'dieselA'

export interface Station {
  id: string
  postalCode: string
  address: string
  schedule: string
  lat: number
  lng: number
  municipality: string
  municipalityId: number | null
  province: string
  provinceId: number
  brand: string
  priceGasoline95: number | null
  priceDieselA: number | null
}

export interface Province {
  id: number
  name: string
  ccaaId: number
  ccaaName: string
}

export interface Municipality {
  id: number
  name: string
  provinceId: number
  provinceName: string
}

export interface FuelProduct {
  id: number
  name: string
  productId: string
}

export interface HistoricalPoint {
  date: string
  price: number | null
}

export interface HistoricalStationPoint {
  date: string
  priceGasoline95: number | null
  priceDieselA: number | null
}

export interface NationalAverage {
  date: string
  avgGasoline95: number
  avgDieselA: number
  stationCount: number
}

export interface GeolocationState {
  coords: Coordinates | null
  loading: boolean
  error: string | null
  permissionDenied: boolean
}

export type ThemeMode = 'light' | 'dark'

export interface ThemeContextValue {
  theme: ThemeMode
  toggleTheme: () => void
}

export interface StationsFilter {
  radiusKm: number
  center: Coordinates
}