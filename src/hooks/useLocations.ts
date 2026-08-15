import { useCallback, useEffect, useState } from 'react'
import {
  fetchMunicipalitiesByProvince,
  fetchProvinces,
} from '../services/listingsService'
import type { Municipality, Province } from '../types'

interface LocationsState {
  provinces: Province[]
  municipalities: Municipality[]
  loadingProvinces: boolean
  loadingMunicipalities: boolean
  error: string | null
}

export function useLocations() {
  const [state, setState] = useState<LocationsState>({
    provinces: [],
    municipalities: [],
    loadingProvinces: true,
    loadingMunicipalities: false,
    error: null,
  })

  const [selectedProvince, setSelectedProvince] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('gasolineras_user_province')
      if (saved === 'null') return null
      return saved !== null ? Number(saved) : null
    } catch {
      return null
    }
  })
  const [selectedMunicipality, setSelectedMunicipalityState] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('gasolineras_user_municipality')
      if (saved === 'null') return null
      return saved !== null ? Number(saved) : null
    } catch {
      return null
    }
  })

  const setSelectedMunicipality = useCallback((municipalityId: number | null) => {
    setSelectedMunicipalityState(municipalityId)
    try {
      if (municipalityId === null) {
        localStorage.removeItem('gasolineras_user_municipality')
      } else {
        localStorage.setItem('gasolineras_user_municipality', String(municipalityId))
      }
    } catch {
      // ignore
    }
  }, [])

  const loadProvinces = useCallback(async () => {
    try {
      const provinces = await fetchProvinces()
      setState((prev) => ({
        ...prev,
        provinces,
        loadingProvinces: false,
      }))
    } catch {
      setState((prev) => ({
        ...prev,
        loadingProvinces: false,
        error: 'No se pudieron cargar las provincias.',
      }))
    }
  }, [])

  const selectProvince = useCallback(
    async (provinceId: number | null) => {
      setSelectedProvince(provinceId)
      setSelectedMunicipality(null)
      try {
        if (provinceId === null) {
          localStorage.setItem('gasolineras_user_province', 'null')
          localStorage.removeItem('gasolineras_user_municipality')
        } else {
          localStorage.setItem('gasolineras_user_province', String(provinceId))
          localStorage.removeItem('gasolineras_user_municipality')
        }
      } catch {
        // ignore
      }

      if (provinceId === null) {
        setState((prev) => ({
          ...prev,
          municipalities: [],
          loadingMunicipalities: false,
          error: null,
        }))
        return
      }
      setState((prev) => ({
        ...prev,
        municipalities: [],
        loadingMunicipalities: true,
        error: null,
      }))
      try {
        const municipalities = await fetchMunicipalitiesByProvince(provinceId)
        setState((prev) => ({
          ...prev,
          municipalities,
          loadingMunicipalities: false,
        }))
      } catch {
        setState((prev) => ({
          ...prev,
          loadingMunicipalities: false,
          error: 'No se pudieron cargar los municipios.',
        }))
      }
    },
    [setSelectedMunicipality],
  )

  // Carga inicial de municipios si había una provincia guardada
  useEffect(() => {
    if (selectedProvince !== null && state.municipalities.length === 0) {
      void fetchMunicipalitiesByProvince(selectedProvince).then((municipalities) => {
        setState((prev) => ({ ...prev, municipalities }))
      })
    }
  }, [selectedProvince, state.municipalities.length])

  useEffect(() => {
    void loadProvinces()
  }, [loadProvinces])

  return {
    provinces: state.provinces,
    municipalities: state.municipalities,
    loadingProvinces: state.loadingProvinces,
    loadingMunicipalities: state.loadingMunicipalities,
    error: state.error,
    selectedProvince,
    selectedMunicipality,
    selectProvince,
    setSelectedMunicipality,
  }
}