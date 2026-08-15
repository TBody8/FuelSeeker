import type { Station } from '../types'

// La API del MITECO devuelve claves en castellano (codificadas en latin-1 en
// alguna cabecera antigua, pero el body llega como UTF-8/JSON válido).
// Con filtro por producto el precio viene en "PrecioProducto"; sin filtro,
// cada precio llega en su propia clave ("Precio Gasolina 95 E5", "Precio Gasoleo A"...).

interface RawStation {
  'C.P.': string
  'Dirección': string
  'Horario': string
  'Latitud': string
  'Longitud (WGS84)': string
  'Municipio': string
  'Localidad'?: string
  'Provincia': string
  'IDProvincia': string
  'IDMunicipio'?: string
  'Rótulo': string
  'IDEESS': string
  'PrecioProducto'?: string
  'Precio Gasolina 95 E5'?: string
  'Precio Gasoleo A'?: string
  'Precio Gasóleo A'?: string
  [key: string]: string | undefined
}

export type RawStationShape = RawStation

function parseCoord(value: string): number {
  const parsed = Number.parseFloat(value.trim().replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : 0
}

function parsePrice(value: string | undefined | null): number | null {
  if (value === undefined || value === null || value === '') return null
  const parsed = Number.parseFloat(String(value).trim().replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

export function transformStation(raw: RawStation): Station {
  return {
    id: raw['IDEESS'],
    postalCode: raw['C.P.'],
    address: raw['Dirección'],
    schedule: raw['Horario'],
    lat: parseCoord(raw['Latitud']),
    lng: parseCoord(raw['Longitud (WGS84)']),
    municipality: raw['Municipio'],
    municipalityId: raw['IDMunicipio']
      ? Number.parseInt(raw['IDMunicipio'], 10)
      : null,
    province: raw['Provincia'],
    provinceId: Number.parseInt(raw['IDProvincia'], 10) || 0,
    brand: (raw['Rótulo'] || '').toUpperCase(),
    priceGasoline95: parsePrice(
      raw['PrecioProducto'] ?? raw['Precio Gasolina 95 E5'],
    ),
    priceDieselA: parsePrice(
      raw['PrecioProducto'] ?? raw['Precio Gasoleo A'] ?? raw['Precio Gasóleo A'],
    ),
  }
}

export function transformStations(rawList: RawStation[]): Station[] {
  return rawList.map(transformStation)
}

// Reasigna el precio según el producto consultado cuando la respuesta viene
// de un endpoint filtrado por producto ("PrecioProducto").
export function transformProductStation(
  raw: RawStation,
  product:
    | 'Gasolina 95 E5'
    | 'Gasoleo A',
): Station {
  const station = transformStation(raw)
  const price = parsePrice(raw['PrecioProducto'])
  if (product === 'Gasolina 95 E5') {
    station.priceGasoline95 = price
    station.priceDieselA = station.priceDieselA ?? price
  } else {
    station.priceDieselA = price
    station.priceGasoline95 = station.priceGasoline95 ?? price
  }
  return station
}

export function transformProductStations(
  rawList: RawStation[],
  product: 'Gasolina 95 E5' | 'Gasoleo A',
): Station[] {
  return rawList.map((r) => transformProductStation(r, product))
}