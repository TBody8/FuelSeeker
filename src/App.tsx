import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, ChevronRight, Fuel, List, X } from 'lucide-react'
import { Header } from './components/layout/Header'
import { MobileDrawer } from './components/layout/MobileDrawer'
import { Sidebar } from './components/layout/Sidebar'
import { RadiusSlider } from './components/controls/RadiusSlider'
import { NationalPriceWidget } from './components/charts/NationalPriceWidget'
import { useTheme } from './hooks/useTheme'
import { useGeolocation } from './hooks/useGeolocation'
import { useLocations } from './hooks/useLocations'
import { useStations } from './hooks/useStations'
import { useNearbyStations } from './hooks/useNearbyStations'
import { useNationalAverage } from './hooks/useNationalAverage'
import type { FuelType, Station } from './types'
import { DEFAULT_RADIUS_KM, PROVINCE_CENTERS } from './utils/constants'
import { formatPriceCompact } from './utils/format'
import { nearestProvinceName } from './utils/geo'

const MapView = lazy(() =>
  import('./components/map/MapView').then((m) => ({ default: m.MapView })),
)

// Histórico por estación: se carga solo al expandir una tarjeta (Chart.js).
const StationHistory = lazy(() =>
  import('./components/charts/StationHistory').then((m) => ({
    default: m.StationHistory,
  })),
)

function MapFallback() {
  return <div aria-hidden="true" className="h-full w-full animate-pulse bg-slate-100 dark:bg-slate-900" />
}

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const geo = useGeolocation()
  const locations = useLocations()

  const [fuelType, setFuelTypeState] = useState<FuelType>(() => {
    try {
      const saved = localStorage.getItem('gasolineras_user_fuel')
      return saved === 'dieselA' || saved === 'gasoline95' ? saved : 'gasoline95'
    } catch {
      return 'gasoline95'
    }
  })

  const setFuelType = useCallback((type: FuelType) => {
    setFuelTypeState(type)
    try {
      localStorage.setItem('gasolineras_user_fuel', type)
    } catch {
      // ignore
    }
  }, [])

  const [radiusKm, setRadiusKmState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('gasolineras_user_radius')
      return saved ? Number(saved) : DEFAULT_RADIUS_KM
    } catch {
      return DEFAULT_RADIUS_KM
    }
  })

  const setRadiusKm = useCallback((radius: number) => {
    setRadiusKmState(radius)
    try {
      localStorage.setItem('gasolineras_user_radius', String(radius))
    } catch {
      // ignore
    }
  }, [])

  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileNationalOpen, setMobileNationalOpen] = useState(false)
  const [flyCounter, setFlyCounter] = useState(0)

  const isNationwide = locations.selectedProvince === null
  const hasUserLocation = !geo.loading && !geo.permissionDenied && geo.coords !== null

  const { stations, loading, error } = useStations(locations.selectedProvince)

  // Auto-selección inicial solo si el usuario no tiene una provincia previamente guardada
  useEffect(() => {
    const hasSavedPreference = localStorage.getItem('gasolineras_user_province') !== null
    if (hasSavedPreference) return
    if (locations.selectedProvince !== null) return
    if (geo.loading || geo.permissionDenied) return
    if (locations.provinces.length === 0) return

    const name = nearestProvinceName(geo.coords, PROVINCE_CENTERS)
    if (!name) return
    const province = locations.provinces.find((p) => p.name === name)
    if (!province) return

    locations.selectProvince(province.id)
    setFlyCounter((n) => n + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.loading, geo.permissionDenied, locations.selectedProvince, locations.provinces])

  // Centro de búsqueda y zoom: centrado exactamente en la persona (GPS) tipo Wallapop
  const { searchCenter, targetZoom } = useMemo(() => {
    if (isNationwide) {
      return {
        searchCenter: { lat: 40.4168, lng: -3.7038 },
        targetZoom: 6,
      }
    }

    if (locations.selectedMunicipality !== null) {
      const s = stations.find(
        (st) => st.municipalityId === locations.selectedMunicipality,
      )
      if (s) {
        return {
          searchCenter: { lat: s.lat, lng: s.lng },
          targetZoom: 12,
        }
      }
    }

    // Si tenemos la ubicación exacta del usuario, anclamos el radio directamente en sus coordenadas
    if (hasUserLocation) {
      return {
        searchCenter: geo.coords,
        targetZoom: 11,
      }
    }

    // Fallback: Centroide de la provincia seleccionada
    const provinceName = locations.provinces.find(
      (p) => p.id === locations.selectedProvince,
    )?.name

    if (provinceName && PROVINCE_CENTERS[provinceName]) {
      return {
        searchCenter: PROVINCE_CENTERS[provinceName],
        targetZoom: 9,
      }
    }

    return {
      searchCenter: geo.coords,
      targetZoom: 10,
    }
  }, [
    isNationwide,
    locations.selectedProvince,
    locations.selectedMunicipality,
    locations.provinces,
    stations,
    hasUserLocation,
    geo.coords,
  ])

  const handleProvinceChange = useCallback(
    (provinceId: number | null) => {
      locations.selectProvince(provinceId)
      setSelectedStationId(null)
      setFlyCounter((n) => n + 1)
    },
    [locations],
  )

  const handleMunicipalityChange = useCallback(
    (municipalityId: number | null) => {
      locations.setSelectedMunicipality(municipalityId)
      setSelectedStationId(null)
      setFlyCounter((n) => n + 1)
    },
    [locations],
  )

  const handleSelectStation = useCallback(
    (station: Station) => {
      setSelectedStationId(station.id)
      setMobileOpen(true)
    },
    [],
  )

  const nearby = useNearbyStations(
    stations,
    searchCenter,
    radiusKm,
    fuelType,
    isNationwide,
  )

  // Medias nacionales cargadas siempre
  const national = useNationalAverage(true)

  const renderHistory = useCallback(
    (s: Station) => (
      <Suspense
        fallback={
          <div className="flex h-40 items-center justify-center">
            <div className="skeleton h-4 w-1/2" aria-hidden="true" />
          </div>
        }
      >
        <StationHistory station={s} isDark={isDark} />
      </Suspense>
    ),
    [isDark],
  )

  const sidebarContent = (
    <Sidebar
      provinces={locations.provinces}
      municipalities={locations.municipalities}
      loadingProvinces={locations.loadingProvinces}
      loadingMunicipalities={locations.loadingMunicipalities}
      selectedProvince={locations.selectedProvince}
      selectedMunicipality={locations.selectedMunicipality}
      onProvinceChange={handleProvinceChange}
      onMunicipalityChange={handleMunicipalityChange}
      fuelType={fuelType}
      onFuelTypeChange={setFuelType}
      stationsLoading={loading}
      stationsError={error}
      sortedNearby={nearby.sorted}
      center={searchCenter}
      marketRange={nearby.marketRange}
      selectedId={selectedStationId}
      onSelect={handleSelectStation}
      count={nearby.sorted.length}
      renderHistory={renderHistory}
    />
  )

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenDrawer={() => setMobileOpen(true)}
      />

      {/* Barra superior minimalista para móvil: icono de Medias Nacionales y título con tono diferenciado */}
      <div className="flex shrink-0 items-center justify-between gap-1 border-b border-slate-200/80 bg-slate-100/95 px-2.5 py-1.5 shadow-sm backdrop-blur-md md:hidden dark:border-slate-800 dark:bg-slate-800/90">
        <button
          type="button"
          onClick={() => setMobileNationalOpen(true)}
          className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-ink dark:text-white"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <Activity size={13} />
          </span>
          <span>Medias España</span>
          <ChevronRight size={12} className="text-ink-faint" />
        </button>

        <div className="flex shrink-0 items-center gap-1.5 text-[11px] font-extrabold whitespace-nowrap price-nums">
          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            95: {national.data[0] ? `${formatPriceCompact(national.data[0].avgGasoline95)}€` : '…'}
          </span>
          <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            Diésel: {national.data[0] ? `${formatPriceCompact(national.data[0].avgDieselA)}€` : '…'}
          </span>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1">
        <aside className="hidden w-[380px] shrink-0 border-r border-slate-200/70 bg-white/80 backdrop-blur-xl md:block dark:border-slate-800 dark:bg-slate-900/70">
          {sidebarContent}
        </aside>

        <main className="relative min-h-0 flex-1">
          <Suspense fallback={<MapFallback />}>
            <MapView
              center={searchCenter}
              stations={nearby.nearby}
              radiusKm={radiusKm}
              fuelType={fuelType}
              selectedStationId={selectedStationId}
              theme={theme}
              flyCounter={flyCounter}
              targetZoom={targetZoom}
              showRadius={!isNationwide}
              userCoords={hasUserLocation ? geo.coords : null}
              loadingLocation={geo.loading}
              permissionDenied={geo.permissionDenied}
              onRetryLocation={geo.retry}
              onSelectStation={handleSelectStation}
            />
          </Suspense>

          {/* Widget de medios nacionales e histórico siempre visible (escritorio, inferior derecho) */}
          <div className="pointer-events-none absolute bottom-4 right-4 z-[900] hidden md:block">
            <NationalPriceWidget
              data={national.data}
              loading={national.loading}
              progress={national.progress}
              isDark={isDark}
            />
          </div>

          {/* Control flotante de radio en escritorio (desplazado a la derecha de los botones de zoom y centrado) */}
          {!isNationwide && (
            <div className="pointer-events-none absolute top-2.5 left-[92px] z-[900] hidden md:block">
              <RadiusSlider value={radiusKm} onChange={setRadiusKm} />
            </div>
          )}

          {/* Controles inferiores en móvil: Barra deslizante de radio + Botón para abrir gasolineras */}
          <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[1050] flex flex-col items-center gap-2 px-3 md:hidden">
            {!isNationwide && (
              <div className="pointer-events-auto w-full max-w-[290px]">
                <RadiusSlider value={radiusKm} onChange={setRadiusKm} />
              </div>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="pointer-events-auto flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-lift transition-transform duration-150 active:scale-95"
            >
              {isNationwide ? <Fuel size={17} /> : <List size={17} />}
              <span>
                {isNationwide
                  ? 'Ver Top 5 más baratas'
                  : `Ver ${nearby.sorted.length} gasolineras`}
              </span>
            </button>
          </div>
        </main>
      </div>

      {/* Modal / Bottom Drawer para Medias Nacionales en Móvil */}
      {mobileNationalOpen && (
        <div className="fixed inset-0 z-[1250] flex items-end justify-center bg-slate-950/60 backdrop-blur-sm md:hidden">
          <div className="relative max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white p-4 shadow-2xl dark:bg-slate-900">
            <div className="mb-2 flex items-center justify-between border-b border-slate-200/60 pb-2 dark:border-slate-800">
              <span className="text-xs font-bold text-ink dark:text-white">
                Medias Nacionales y Evolución
              </span>
              <button
                type="button"
                onClick={() => setMobileNationalOpen(false)}
                className="rounded-lg p-1.5 text-ink-soft hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>
            <NationalPriceWidget
              data={national.data}
              loading={national.loading}
              progress={national.progress}
              isDark={isDark}
            />
          </div>
        </div>
      )}

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
        {sidebarContent}
      </MobileDrawer>
    </div>
  )
}