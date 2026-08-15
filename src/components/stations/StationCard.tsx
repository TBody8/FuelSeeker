import { ChevronDown, ChevronUp, CreditCard, ExternalLink, Navigation } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { FuelType, Station } from '../../types'
import { formatDistance } from '../../utils/geo'
import { formatPrice, stationMapsUrl } from '../../utils/format'
import { Badge } from '../ui/Badge'

interface StationCardProps {
  station: Station
  fuelType: FuelType
  distanceKm: number
  marketRange: { min: number; max: number } | null
  cheapest: boolean
  selected: boolean
  onSelect: (station: Station) => void
  children?: React.ReactNode
}

export function StationCard({
  station,
  fuelType,
  distanceKm,
  marketRange,
  cheapest,
  selected,
  onSelect,
  children,
}: StationCardProps) {
  const [expanded, setExpanded] = useState(false)
  const cardRef = useRef<HTMLElement>(null)

  const isCostco =
    station.brand.toUpperCase().includes('COSTCO') ||
    station.address.toUpperCase().includes('COSTCO')

  // Auto-scroll al seleccionar desde el mapa o lista
  useEffect(() => {
    if (selected && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selected])

  const price =
    fuelType === 'gasoline95' ? station.priceGasoline95 : station.priceDieselA

  const priceTone =
    price !== null && marketRange
      ? (() => {
          const span = marketRange.max - marketRange.min
          if (span < 0.05) return 'text-ink dark:text-slate-100'
          const ratio = (price - marketRange.min) / span
          return ratio <= 0.33
            ? 'text-emerald-700 dark:text-emerald-400'
            : ratio >= 0.66
              ? 'text-red-600 dark:text-red-400'
              : 'text-amber-600 dark:text-amber-400'
        })()
      : 'text-ink dark:text-slate-100'

  const handleExpand = () => {
    setExpanded((prev) => !prev)
    onSelect(station)
  }

  return (
    <article
      ref={cardRef}
      onClick={() => onSelect(station)}
      className={`group cursor-pointer rounded-xl border p-2.5 transition-all duration-200 ${
        selected
          ? 'border-accent ring-2 ring-accent/30 bg-emerald-500/10 shadow-sm dark:border-emerald-500/60 dark:bg-emerald-500/15'
          : 'border-slate-200/80 bg-white/90 hover:border-slate-300 hover:shadow-tight dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1">
            {cheapest && (
              <Badge tone="accent" className="text-[10px] px-1.5 py-0">
                Más barata
              </Badge>
            )}
            {isCostco && (
              <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                <CreditCard size={10} />
                Solo Socios Costco
              </span>
            )}
          </div>
          <h3 className="truncate text-xs font-bold text-ink dark:text-slate-100 sm:text-sm">
            {station.brand}
          </h3>
          <p className="mt-0.5 line-clamp-1 text-[11px] leading-tight text-ink-soft dark:text-slate-400">
            {station.address}
          </p>
          <div className="mt-1 flex items-center gap-1 text-[10.5px] font-medium text-ink-faint dark:text-slate-500">
            <span className="inline-flex items-center gap-0.5">
              <Navigation size={10} aria-hidden="true" />
              {formatDistance(distanceKm)}
            </span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{station.municipality}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={`price-nums text-base font-extrabold leading-none sm:text-lg ${priceTone}`}
          >
            {formatPrice(price)}
          </span>
          <a
            href={stationMapsUrl(station.lat, station.lng)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-accent transition-colors duration-150 hover:text-accent-strong dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            <ExternalLink size={10} aria-hidden="true" />
            Maps
          </a>
        </div>
      </div>

      {isCostco && (
        <div className="mt-1.5 text-[10px] text-amber-700/90 dark:text-amber-300/90">
          * Tarifa exclusiva para miembros con suscripción activa a Costco
        </div>
      )}

      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 dark:border-slate-800/80">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleExpand()
          }}
          aria-expanded={expanded}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-faint transition-colors duration-150 hover:text-accent dark:hover:text-emerald-400"
        >
          {expanded ? (
            <>
              Ocultar <ChevronUp size={12} aria-hidden="true" />
            </>
          ) : (
            <>
              Evolución anual <ChevronDown size={12} aria-hidden="true" />
            </>
          )}
        </button>
      </div>

      {expanded ? <div className="mt-2.5" onClick={(e) => e.stopPropagation()}>{children}</div> : null}
    </article>
  )
}