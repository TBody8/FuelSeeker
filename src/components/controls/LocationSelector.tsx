import { ChevronDown, Loader2, MapPin } from 'lucide-react'
import type { Municipality, Province } from '../../types'

interface LocationSelectorProps {
  provinces: Province[]
  municipalities: Municipality[]
  loadingProvinces: boolean
  loadingMunicipalities: boolean
  selectedProvince: number | null
  selectedMunicipality: number | null
  userHomeProvinceId?: number | null
  onProvinceChange: (provinceId: number | null) => void
  onMunicipalityChange: (municipalityId: number | null) => void
}

export function LocationSelector({
  provinces,
  municipalities,
  loadingProvinces,
  loadingMunicipalities,
  selectedProvince,
  selectedMunicipality,
  userHomeProvinceId,
  onProvinceChange,
  onMunicipalityChange,
}: LocationSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label
          htmlFor="province"
          className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-ink-soft dark:text-slate-300"
        >
          <MapPin size={11} aria-hidden="true" className="text-accent" />
          Provincia
        </label>
        <div className="relative">
          <select
            id="province"
            value={selectedProvince ?? ''}
            onChange={(e) => {
              const val = e.target.value
              onProvinceChange(val ? Number(val) : null)
            }}
            disabled={loadingProvinces}
            className="w-full appearance-none truncate rounded-lg border border-slate-200 bg-white py-1.5 pl-2.5 pr-7 text-xs font-semibold text-ink transition-colors duration-200 hover:border-slate-300 focus:border-accent disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            {loadingProvinces ? (
              <option>Cargando…</option>
            ) : (
              <>
                <option value="">Toda España (Top 5)</option>
                {provinces.map((p) => {
                  const isHome = userHomeProvinceId === p.id
                  return (
                    <option key={p.id} value={p.id}>
                      {isHome ? `📍 ${p.name} (Cerca de mí)` : p.name}
                    </option>
                  )
                })}
              </>
            )}
          </select>
          <ChevronDown
            size={14}
            aria-hidden="true"
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-faint"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="municipality"
          className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-ink-soft dark:text-slate-300"
        >
          <MapPin size={11} aria-hidden="true" className="text-accent" />
          Localidad
        </label>
        <div className="relative">
          <select
            id="municipality"
            value={selectedMunicipality ?? ''}
            onChange={(e) => {
              const val = e.target.value
              onMunicipalityChange(val ? Number(val) : null)
            }}
            disabled={!selectedProvince || loadingMunicipalities}
            className="w-full appearance-none truncate rounded-lg border border-slate-200 bg-white py-1.5 pl-2.5 pr-7 text-xs font-semibold text-ink transition-colors duration-200 hover:border-slate-300 focus:border-accent disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            {!selectedProvince ? (
              <option>Toda la provincia</option>
            ) : loadingMunicipalities ? (
              <option>Cargando…</option>
            ) : (
              <>
                <option value="">Toda la provincia</option>
                {municipalities.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </>
            )}
          </select>
          <ChevronDown
            size={14}
            aria-hidden="true"
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          {loadingMunicipalities ? (
            <Loader2
              size={12}
              aria-hidden="true"
              className="absolute right-6 top-1/2 -translate-y-1/2 animate-spin-slow text-accent"
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}