import { Sparkles, TrendingDown, Trophy } from 'lucide-react'
import type { FuelType, Municipality, Province, Station } from '../../types'
import { FuelTypeSelector } from '../controls/FuelTypeSelector'
import { LocationSelector } from '../controls/LocationSelector'
import { StationList } from '../stations/StationList'

interface SidebarProps {
  provinces: Province[]
  municipalities: Municipality[]
  loadingProvinces: boolean
  loadingMunicipalities: boolean
  selectedProvince: number | null
  selectedMunicipality: number | null
  userHomeProvinceId?: number | null
  isUserNearby?: boolean
  onProvinceChange: (provinceId: number | null) => void
  onMunicipalityChange: (municipalityId: number | null) => void
  fuelType: FuelType
  onFuelTypeChange: (fuelType: FuelType) => void
  stationsLoading: boolean
  stationsError: string | null
  sortedNearby: Station[]
  center: { lat: number; lng: number }
  marketRange: { min: number; max: number } | null
  selectedId: string | null
  onSelect: (station: Station) => void
  count: number
  renderHistory: (station: Station) => React.ReactNode
}

export function Sidebar({
  provinces,
  municipalities,
  loadingProvinces,
  loadingMunicipalities,
  selectedProvince,
  selectedMunicipality,
  userHomeProvinceId,
  isUserNearby = false,
  onProvinceChange,
  onMunicipalityChange,
  fuelType,
  onFuelTypeChange,
  stationsLoading,
  stationsError,
  sortedNearby,
  center,
  marketRange,
  selectedId,
  onSelect,
  count,
  renderHistory,
}: SidebarProps) {
  const isNationwide = selectedProvince === null
  const currentProvinceName = provinces.find((p) => p.id === selectedProvince)?.name

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 space-y-2 border-b border-slate-200/60 p-2.5 dark:border-slate-800">
        <FuelTypeSelector value={fuelType} onChange={onFuelTypeChange} />
        <LocationSelector
          provinces={provinces}
          municipalities={municipalities}
          loadingProvinces={loadingProvinces}
          loadingMunicipalities={loadingMunicipalities}
          selectedProvince={selectedProvince}
          selectedMunicipality={selectedMunicipality}
          userHomeProvinceId={userHomeProvinceId}
          onProvinceChange={onProvinceChange}
          onMunicipalityChange={onMunicipalityChange}
        />
        {isNationwide && (
          <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
            <Sparkles size={13} className="shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Top 5 gasolineras más baratas de España</span>
          </div>
        )}
      </div>

      <div className="shrink-0 border-b border-slate-200/60 px-3 py-1.5 dark:border-slate-800">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft dark:text-slate-300">
          {isNationwide ? (
            <>
              <Trophy size={13} className="text-amber-500" aria-hidden="true" />
              <span>Top 5 más baratas ({fuelType === 'gasoline95' ? 'Gasolina 95' : 'Gasóleo A'})</span>
            </>
          ) : (
            <>
              <TrendingDown size={13} className="text-accent" aria-hidden="true" />
              {count > 0 ? (
                <span>
                  {count} {count === 1 ? 'gasolinera' : 'gasolineras'} {isUserNearby ? 'cerca de ti' : currentProvinceName ? `en ${currentProvinceName}` : ''} · de más barata a más cara
                </span>
              ) : (
                <span>Sin resultados en el radio</span>
              )}
            </>
          )}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        <StationList
          stations={sortedNearby}
          loading={stationsLoading}
          error={stationsError}
          fuelType={fuelType}
          center={center}
          marketRange={marketRange}
          selectedId={selectedId}
          onSelect={onSelect}
          renderHistory={renderHistory}
        />
      </div>
    </div>
  )
}