import { PackageSearch } from 'lucide-react'
import type { FuelType, Station } from '../../types'
import { haversineKm } from '../../utils/geo'
import { StationCard } from './StationCard'
import { StationCardSkeleton } from './StationCardSkeleton'

interface StationListProps {
  stations: Station[]
  loading: boolean
  error: string | null
  fuelType: FuelType
  center: { lat: number; lng: number }
  marketRange: { min: number; max: number } | null
  selectedId: string | null
  onSelect: (station: Station) => void
  renderHistory: (station: Station) => React.ReactNode
}

export function StationList({
  stations,
  loading,
  error,
  fuelType,
  center,
  marketRange,
  selectedId,
  onSelect,
  renderHistory,
}: StationListProps) {
  if (loading) {
    return (
      <div className="space-y-2.5" role="status" aria-label="Cargando estaciones">
        {Array.from({ length: 6 }).map((_, i) => (
          <StationCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <PackageSearch className="h-8 w-8 text-ink-faint" aria-hidden="true" />
        <p className="text-sm text-ink-soft dark:text-slate-400">{error}</p>
      </div>
    )
  }

  if (stations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <PackageSearch className="h-8 w-8 text-ink-faint" aria-hidden="true" />
        <p className="text-sm text-ink-soft dark:text-slate-400">
          No hay estaciones con precios en este radio.
        </p>
        <p className="text-xs text-ink-faint dark:text-slate-500">
          Prueba a ampliar el radio de búsqueda.
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-2.5">
      {stations.map((station, index) => (
        <li key={station.id} className="animate-fade-up">
          <StationCard
            station={station}
            fuelType={fuelType}
            distanceKm={haversineKm(
              { lat: station.lat, lng: station.lng },
              center,
            )}
            marketRange={marketRange}
            cheapest={index === 0}
            selected={station.id === selectedId}
            onSelect={onSelect}
          >
            {renderHistory(station)}
          </StationCard>
        </li>
      ))}
    </ul>
  )
}