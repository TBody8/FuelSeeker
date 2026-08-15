import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster'
import { useMap } from 'react-leaflet'
import type { Station } from '../../types'
import { buildStationIcon } from './stationIcon'
import { escapeHtml } from '../../utils/security'

interface StationClusterProps {
  stations: Station[]
  selectedId: string | null
  fuelType: 'gasoline95' | 'dieselA'
  marketRange: { min: number; max: number } | null
  onSelect: (station: Station) => void
}

// Capa de agrupación de marcadores. Al renderizar cientos de estaciones,
// leaflet.markercluster las agrupa y "spiderfiza" al hacer zoom.
export function StationCluster({
  stations,
  selectedId,
  fuelType,
  marketRange,
  onSelect,
}: StationClusterProps) {
  const map = useMap()
  const groupRef = useRef<L.MarkerClusterGroup | null>(null)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  useEffect(() => {
    if (!map) return

    const group = L.markerClusterGroup({
      maxClusterRadius: 48,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount()
        const size =
          count < 15 ? 30 : count < 40 ? 38 : 46
        return L.divIcon({
          html: `<div style="width:${size}px;height:${size}px;font-size:${
            size > 30 ? 13 : 11
          }px">${count}</div>`,
          className: 'custom-cluster-icon',
          iconSize: [size, size] as [number, number],
        })
      },
    })

    groupRef.current = group
    group.addTo(map)

    return () => {
      map.removeLayer(group)
      groupRef.current = null
    }
  }, [map])

  // Recrea los marcadores al cambiar el conjunto de estaciones o el contexto.
  useEffect(() => {
    const group = groupRef.current
    if (!group) return
    group.clearLayers()

    const markers = stations.map((station) => {
      const price =
        fuelType === 'gasoline95'
          ? station.priceGasoline95
          : station.priceDieselA
      const isSelected = station.id === selectedId

      const isCostco =
        station.brand.toUpperCase().includes('COSTCO') ||
        station.address.toUpperCase().includes('COSTCO')

      const formattedPrice =
        price !== null ? `${price.toFixed(3).replace('.', ',')} €` : '—'

      const marker = L.marker([station.lat, station.lng], {
        icon: buildStationIcon({
          price,
          selected: isSelected,
          marketRange,
        }),
        riseOnHover: true,
        zIndexOffset: isSelected ? 1000 : 0,
      })

      const popupContent = `
        <div style="min-width: 160px;">
          ${
            isCostco
              ? '<span style="display:inline-block;font-size:10px;font-weight:700;background:rgba(217,119,6,0.18);color:#d97706;padding:2px 6px;border-radius:4px;margin-bottom:4px;">💳 Solo Socios Costco</span>'
              : ''
          }
          <div style="font-weight:700;font-size:13px;">${escapeHtml(station.brand)}</div>
          <div style="font-size:11px;opacity:0.75;margin-top:2px;">${escapeHtml(station.address)}</div>
          <div style="font-size:15px;font-weight:800;margin-top:6px;font-variant-numeric:tabular-nums;color:var(--color-accent);">${formattedPrice}/L</div>
          ${
            isCostco
              ? '<div style="font-size:10px;opacity:0.8;margin-top:2px;color:#d97706;">* Tarifa exclusiva para socios suscritos</div>'
              : ''
          }
        </div>
      `
      marker.bindPopup(popupContent, { closeButton: false, offset: [0, -12] })

      marker.on('click', () => {
        onSelectRef.current(station)
      })

      return marker
    })

    if (markers.length > 0) group.addLayers(markers)
  }, [stations, selectedId, fuelType, marketRange, map])

  return null
}