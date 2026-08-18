import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, CreditCard, ExternalLink, Navigation } from 'lucide-react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { FuelType, Station } from '../../types'
import { formatDistance } from '../../utils/geo'
import { formatPrice, stationMapsUrl } from '../../utils/format'
import { getStationAffiliation } from '../../utils/stationAffiliations'
import { Badge } from '../ui/Badge'

gsap.registerPlugin(useGSAP)

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
  const historyRef = useRef<HTMLDivElement>(null)

  const affiliation = getStationAffiliation(station.brand, station.address)

  // Auto-scroll al seleccionar desde el mapa o lista
  useEffect(() => {
    if (selected && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selected])

  // Micro-feedback táctil GSAP al seleccionar
  useGSAP(
    () => {
      if (!selected || !cardRef.current) return
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReduced) return

      gsap.fromTo(
        cardRef.current,
        { scale: 0.985 },
        { scale: 1, duration: 0.22, ease: 'back.out(1.5)' },
      )
    },
    { dependencies: [selected], scope: cardRef },
  )

  // Animación de despliegue suave del histórico
  useGSAP(
    () => {
      if (!expanded || !historyRef.current) return
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReduced) return

      gsap.fromTo(
        historyRef.current,
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.22, ease: 'power2.out' },
      )
    },
    { dependencies: [expanded], scope: historyRef },
  )

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
            {affiliation && (
              <span
                className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${affiliation.badgeClass}`}
              >
                <CreditCard size={10} />
                {affiliation.badgeText}
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

      {affiliation && (
        <div className={`mt-1.5 text-[10px] leading-tight ${affiliation.textClass}`}>
          {affiliation.note}
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

      {expanded ? (
        <div
          ref={historyRef}
          className="mt-2.5"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      ) : null}
    </article>
  )
}