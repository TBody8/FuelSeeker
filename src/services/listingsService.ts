import { fetchJson } from './api'
import type { Municipality, Province } from '../types'
import { OFFICIAL_PROVINCES } from '../utils/provincesData'

interface MunicipalityRaw {
  IDMunicipio: string
  IDProvincia: string
  Municipio: string
  Provincia: string
}

const municipalitiesByProvince = new Map<number, Municipality[]>()

export async function fetchProvinces(): Promise<Province[]> {
  // Catálogo estático oficial: 0ms de red, respuesta instantánea
  return OFFICIAL_PROVINCES
}

export async function fetchMunicipalitiesByProvince(
  provinceId: number,
): Promise<Municipality[]> {
  const mem = municipalitiesByProvince.get(provinceId)
  if (mem) return mem

  try {
    const rawCache = localStorage.getItem(`gasolineras:mun_${provinceId}`)
    if (rawCache) {
      const parsed = JSON.parse(rawCache) as Municipality[]
      municipalitiesByProvince.set(provinceId, parsed)
      return parsed
    }
  } catch {
    // fallback
  }

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
  try {
    localStorage.setItem(
      `gasolineras:mun_${provinceId}`,
      JSON.stringify(municipalities),
    )
  } catch {
    // ignore
  }

  return municipalities
}