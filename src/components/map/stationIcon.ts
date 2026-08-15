import type { DivIcon } from 'leaflet'
import L from 'leaflet'

interface MarkerStyleOptions {
  price: number | null
  selected: boolean
  marketRange: { min: number; max: number } | null
}

// Construye un divIcon con el precio de la estación y color según el rango.
// El precio "alto/bajo" se calcula relativo al rango de estaciones cercanas,
// de modo que el verde siempre indica "barato" en context local.
export function buildStationIcon({
  price,
  selected,
  marketRange,
}: MarkerStyleOptions): DivIcon {
  let tone = 'neutral'
  if (price !== null && marketRange) {
    const span = marketRange.max - marketRange.min
    if (span < 0.05) {
      tone = 'neutral'
    } else {
      const ratio = (price - marketRange.min) / span
      tone = ratio <= 0.33 ? 'cheap' : ratio >= 0.66 ? 'expensive' : 'mid'
    }
  }

  const toneColor =
    tone === 'cheap'
      ? '#059669'
      : tone === 'expensive'
        ? '#dc2626'
        : tone === 'mid'
          ? '#d97706'
          : '#475569'

  const label = price !== null ? `${price.toFixed(3).replace('.', ',')} €` : '—'

  const html = `
    <div class="station-marker ${selected ? 'station-marker--selected' : ''}" style="--marker-color:${toneColor}">
      <span class="station-marker__price">${label}</span>
    </div>
  `

  return L.divIcon({
    html,
    className: '',
    iconSize: selected ? [68, 40] : [62, 34],
    iconAnchor: selected ? [34, 20] : [31, 17],
    popupAnchor: [0, -selected ? 20 : 17],
  })
}