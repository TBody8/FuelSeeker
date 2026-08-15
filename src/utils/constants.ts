export const PRODUCT_IDS = {
  gasoline95: 1,
  dieselA: 4,
} as const

export const FALLBACK_CENTER = { lat: 40.4168, lng: -3.7038 } as const

export const DEFAULT_RADIUS_KM = 10

export const RADIUS_MIN_KM = 1
export const RADIUS_MAX_KM = 50

export const HISTORICAL_SAMPLES = 26
export const HISTORICAL_STEP_WEEKS = 2
export const HISTORICAL_CONCURRENCY = 8
// La serie nacional usa muestreo mensual: los snapshots nacionales sin
// comprimir pesan ~4 MB cada uno, por lo que 52 semanas serían inviables.
export const NATIONAL_SAMPLES = 13
export const NATIONAL_STEP_WEEKS = 4

export const Z_INDEX = {
  base: 0,
  raised: 10,
  overlay: 20,
  drawer: 30,
  modal: 40,
  toast: 50,
} as const

// Centroides aproximados de las provincias (para centrar el mapa al elegir
// provincia cuando aún no hay estaciones cargadas). Nombre en mayúsculas.
export const PROVINCE_CENTERS: Record<string, { lat: number; lng: number }> = {
  ALBACETE: { lat: 38.9942, lng: -1.8564 },
  ALICANTE: { lat: 38.3435, lng: -0.4888 },
  ALMERÍA: { lat: 36.8414, lng: -2.4633 },
  'ARABA/ÁLAVA': { lat: 42.8465, lng: -2.6721 },
  ASTURIAS: { lat: 43.3623, lng: -5.8484 },
  ÁVILA: { lat: 40.6564, lng: -4.6817 },
  BADAJOZ: { lat: 38.8797, lng: -6.9704 },
  'BALEARS (ILLES)': { lat: 39.4697, lng: 2.8752 },
  BARCELONA: { lat: 41.3902, lng: 2.1541 },
  BIZKAIA: { lat: 43.2636, lng: -2.935 },
  BURGOS: { lat: 42.3389, lng: -3.7185 },
  CÁCERES: { lat: 39.4765, lng: -6.3709 },
  CÁDIZ: { lat: 36.525, lng: -6.6406 },
  CANTABRIA: { lat: 43.1828, lng: -4.0459 },
  'CASTELLÓN / CASTELLÓ': { lat: 39.9362, lng: -0.1469 },
  CEUTA: { lat: 35.8893, lng: -5.3198 },
  'CIUDAD REAL': { lat: 38.5165, lng: -3.6228 },
  CÓRDOBA: { lat: 37.6028, lng: -4.8118 },
  'CORUÑA (A)': { lat: 43.3224, lng: -8.5244 },
  CUENCA: { lat: 40.0646, lng: -2.0323 },
  GIPUZKOA: { lat: 43.0177, lng: -2.1162 },
  GIRONA: { lat: 41.9928, lng: 2.82 },
  GRANADA: { lat: 37.2065, lng: -3.7928 },
  GUADALAJARA: { lat: 40.5256, lng: -3.3816 },
  HUELVA: { lat: 37.2563, lng: -6.9504 },
  HUESCA: { lat: 41.9658, lng: -0.2482 },
  JAÉN: { lat: 37.7508, lng: -3.5904 },
  LEÓN: { lat: 42.6209, lng: -5.6069 },
  LLEIDA: { lat: 41.6227, lng: 0.5946 },
  LUGO: { lat: 43.0004, lng: -7.5464 },
  MADRID: { lat: 40.4168, lng: -3.7038 },
  MÁLAGA: { lat: 36.7779, lng: -4.82 },
  MELILLA: { lat: 35.2923, lng: -2.9381 },
  MURCIA: { lat: 37.9419, lng: -1.2087 },
  NAVARRA: { lat: 42.7117, lng: -1.6771 },
  OURENSE: { lat: 42.2453, lng: -7.7435 },
  PALENCIA: { lat: 42.0097, lng: -4.5328 },
  'PALMAS (LAS)': { lat: 28.0989, lng: -15.4923 },
  PONTEVEDRA: { lat: 42.4312, lng: -8.6445 },
  'RIOJA (LA)': { lat: 42.4662, lng: -2.4455 },
  SALAMANCA: { lat: 40.9114, lng: -5.8705 },
  'SANTA CRUZ DE TENERIFE': { lat: 28.4872, lng: -16.3005 },
  SEGOVIA: { lat: 40.9999, lng: -4.1214 },
  SEVILLA: { lat: 37.4338, lng: -5.7804 },
  SORIA: { lat: 41.7769, lng: -2.4792 },
  TARRAGONA: { lat: 41.1416, lng: 1.1402 },
  TERUEL: { lat: 40.6102, lng: -0.8738 },
  TOLEDO: { lat: 39.7667, lng: -4.0628 },
  'VALENCIA / VALÈNCIA': { lat: 39.5651, lng: -0.4252 },
  VALLADOLID: { lat: 41.6286, lng: -4.7445 },
  ZAMORA: { lat: 41.5622, lng: -5.965 },
  ZARAGOZA: { lat: 41.7022, lng: -0.9293 },
} as const