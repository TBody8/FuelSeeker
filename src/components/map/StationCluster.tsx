import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster'
import { useMap } from 'react-leaflet'
import type { Station } from '../../types'
import { buildStationIcon } from './stationIcon'
import { escapeHtml } from '../../utils/security'
import { getStationAffiliation } from '../../utils/stationAffiliations'

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
  const markersMapRef = useRef<Map<string, { marker: L.Marker; price: number | null }>>(new Map())
  const prevSelectedIdRef = useRef<string | null>(null)
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

  // Recrea los marcadores solo cuando cambia la lista de estaciones, combustible o rango
  useEffect(() => {
    const group = groupRef.current
    if (!group) return
    group.clearLayers()
    markersMapRef.current.clear()

    const markers = stations.map((station) => {
      const price =
        fuelType === 'gasoline95'
          ? station.priceGasoline95
          : station.priceDieselA

      const affiliation = getStationAffiliation(station.brand, station.address)

      const formattedPrice =
        price !== null ? `${price.toFixed(3).replace('.', ',')} €` : '—'

      const marker = L.marker([station.lat, station.lng], {
        icon: buildStationIcon({
          price,
          selected: false,
          marketRange,
        }),
        riseOnHover: true,
        zIndexOffset: 0,
      })

      const popupContent = `
        <div style="min-width: 160px;">
          ${
            affiliation
              ? `<span style="display:inline-block;font-size:10px;font-weight:700;background:rgba(217,119,6,0.18);color:#d97706;padding:2px 6px;border-radius:4px;margin-bottom:4px;">💳 ${escapeHtml(affiliation.badgeText)}</span>`
              : ''
          }
          <div style="font-weight:700;font-size:13px;">${escapeHtml(station.brand)}</div>
          <div style="font-size:11px;opacity:0.75;margin-top:2px;">${escapeHtml(station.address)}</div>
          <div style="font-size:15px;font-weight:800;margin-top:6px;font-variant-numeric:tabular-nums;color:var(--color-accent);">${formattedPrice}/L</div>
          ${
            affiliation
              ? `<div style="font-size:10px;opacity:0.8;margin-top:2px;color:#d97706;">${escapeHtml(affiliation.note)}</div>`
              : ''
          }
        </div>
      `
      marker.bindPopup(popupContent, { closeButton: false, offset: [0, -12] })

      marker.on('click', () => {
        onSelectRef.current(station)
      })

      markersMapRef.current.set(station.id, { marker, price })
      return marker
    })

    if (markers.length > 0) group.addLayers(markers)
    prevSelectedIdRef.current = null
  }, [stations, fuelType, marketRange, map])

  // Actualiza el icono y abre el popup de la estación seleccionada sin recrear todos los marcadores
  useEffect(() => {
    const prevId = prevSelectedIdRef.current
    if (prevId && prevId !== selectedId) {
      const prevData = markersMapRef.current.get(prevId)
      if (prevData) {
        prevData.marker.setIcon(
          buildStationIcon({
            price: prevData.price,
            selected: false,
            marketRange,
          }),
        )
        prevData.marker.setZIndexOffset(0)
      }
    }

    if (selectedId) {
      const curData = markersMapRef.current.get(selectedId)
      if (curData) {
        curData.marker.setIcon(
          buildStationIcon({
            price: curData.price,
            selected: true,
            marketRange,
          }),
        )
        curData.marker.setZIndexOffset(1000)

        // Si está dentro de un cluster, desglosa el cluster y abre el popup
        if (groupRef.current) {
          groupRef.current.zoomToShowLayer(curData.marker, () => {
            curData.marker.openPopup()
          })
        }
      }
    }

    prevSelectedIdRef.current = selectedId
  }, [selectedId, marketRange])

  return null
}