import { useEffect, useMemo, useRef } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Coordinates, FuelType, Station } from '../../types'
import { RadiusCircle } from './RadiusCircle'
import { StationCluster } from './StationCluster'
import { FlyToCenter } from './FlyToCenter'
import { LocateButton } from '../controls/LocateButton'

const userLocationIcon = L.divIcon({
  className: '',
  html: '<div class="user-location-marker"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

function LocateControl({
  userCoords,
  loading,
  permissionDenied,
  onLocate,
  onRetry,
}: {
  userCoords: Coordinates | null
  loading: boolean
  permissionDenied: boolean
  onLocate?: () => void
  onRetry?: () => void
}) {
  const map = useMap()

  const handleLocate = () => {
    if (userCoords) {
      map.flyTo([userCoords.lat, userCoords.lng], 14, { duration: 0.8 })
      onLocate?.()
    }
  }

  return (
    <div className="leaflet-top leaflet-left" style={{ left: '46px', top: '10px' }}>
      <div className="leaflet-control m-0">
        <LocateButton
          userCoords={userCoords}
          loading={loading}
          permissionDenied={permissionDenied}
          onLocate={handleLocate}
          onRetry={onRetry}
        />
      </div>
    </div>
  )
}

function FlyToStation({ station }: { station: Station | null }) {
  const map = useMap()
  const prevIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!station) {
      prevIdRef.current = null
      return
    }
    if (station.id !== prevIdRef.current) {
      prevIdRef.current = station.id
      const currentZoom = map.getZoom()
      const targetZoom = currentZoom < 14 ? 14 : currentZoom
      map.flyTo([station.lat, station.lng], targetZoom, {
        duration: 0.8,
        easeLinearity: 0.25,
      })
    }
  }, [station, map])

  return null
}

interface MapViewProps {
  center: Coordinates
  stations: Station[]
  radiusKm: number
  fuelType: FuelType
  selectedStationId: string | null
  theme: 'light' | 'dark'
  flyCounter: number
  targetZoom?: number
  showRadius?: boolean
  userCoords?: Coordinates | null
  loadingLocation?: boolean
  permissionDenied?: boolean
  onRetryLocation?: () => void
  onLocateMe?: () => void
  onSelectStation: (station: Station) => void
}

export function MapView({
  center,
  stations,
  radiusKm,
  fuelType,
  selectedStationId,
  theme,
  flyCounter,
  targetZoom,
  showRadius = true,
  userCoords,
  loadingLocation = false,
  permissionDenied = false,
  onRetryLocation,
  onLocateMe,
  onSelectStation,
}: MapViewProps) {
  // Rango de precios del mercado actual (contexto para colorear marcadores).
  const marketRange = useMemo(() => {
    const prices = stations
      .map((s) => (fuelType === 'gasoline95' ? s.priceGasoline95 : s.priceDieselA))
      .filter((p): p is number => p !== null)
    if (prices.length === 0) return null
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    }
  }, [stations, fuelType])

  const selectedStation = useMemo(
    () => stations.find((s) => s.id === selectedStationId) ?? null,
    [stations, selectedStationId],
  )

  const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

  const tileAttribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> colaboradores'

  return (
    <MapContainer
      key={theme}
      center={[center.lat, center.lng]}
      zoom={targetZoom ?? 6}
      minZoom={4}
      maxZoom={19}
      zoomControl={true}
      className="h-full w-full"
    >
      <TileLayer url={tileUrl} attribution={tileAttribution} maxZoom={19} />

      <LocateControl
        userCoords={userCoords ?? null}
        loading={loadingLocation}
        permissionDenied={permissionDenied}
        onLocate={onLocateMe}
        onRetry={onRetryLocation}
      />

      {flyCounter > 0 ? (
        <FlyToCenter center={center} counter={flyCounter} zoom={targetZoom} />
      ) : null}

      <FlyToStation station={selectedStation} />

      {showRadius && radiusKm > 0 ? (
        <RadiusCircle center={[center.lat, center.lng]} radiusKm={radiusKm} />
      ) : null}

      {userCoords ? (
        <Marker
          position={[userCoords.lat, userCoords.lng]}
          icon={userLocationIcon}
          zIndexOffset={1000}
        >
          <Popup>
            <div className="text-xs font-bold text-ink dark:text-white">
              📍 Tu ubicación actual
            </div>
          </Popup>
        </Marker>
      ) : null}

      <StationCluster
        stations={stations}
        selectedId={selectedStationId}
        fuelType={fuelType}
        marketRange={marketRange}
        onSelect={onSelectStation}
      />
    </MapContainer>
  )
}