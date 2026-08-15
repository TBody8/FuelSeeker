import { fetchJson } from './api'
import type { Municipality, Province } from '../types'

interface ProvinceRaw {
  IDPovincia: string
  IDCCAA: string
  Provincia: string
  CCAA: string
}

interface MunicipalityRaw {
  IDMunicipio: string
  IDProvincia: string
  Municipio: string
  Provincia: string
}

const provincesCache: Province[] | null = null
const municipalitiesByProvince = new Map<number, Municipality[]>()

function parseProvince(raw: ProvinceRaw): Province {
  return {
    id: Number.parseInt(raw['IDPovincia'], 10) || 0,
    name: raw['Provincia'],
    ccaaId: Number.parseInt(raw['IDCCAA'], 10) || 0,
    ccaaName: raw['CCAA'],
  }
}

export async function fetchProvinces(): Promise<Province[]> {
  if (provincesCache) return provincesCache

  const raw = await fetchJson<ProvinceRaw[]>(`/Listados/Provincias/`)
  const provinces = raw.map(parseProvince)
  return provinces
}

export async function fetchMunicipalitiesByProvince(
  provinceId: number,
): Promise<Municipality[]> {
  const cached = municipalitiesByProvince.get(provinceId)
  if (cached) return cached

  const raw = await fetchJson<MunicipalityRaw[]>(
    `/Listados/MunicipiosPorProvincia/${provinceId}`,
  )
  const municipalities = raw.map((r) => ({
    id: Number.parseInt(r['IDMunicipio'], 10) || 0,
    name: r['Municipio'],
    provinceId: Number.parseInt(r['IDProvincia'], 10) || 0,
    provinceName: r['Provincia'],
  }))
  municipalitiesByProvince.set(provinceId, municipalities)
  return municipalities
}