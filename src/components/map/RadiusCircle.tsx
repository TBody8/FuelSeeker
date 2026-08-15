import { Circle } from 'react-leaflet'

interface RadiusCircleProps {
  center: [number, number]
  radiusKm: number
}

export function RadiusCircle({ center, radiusKm }: RadiusCircleProps) {
  return (
    <Circle
      center={center}
      radius={radiusKm * 1000}
      pathOptions={{
        color: '#059669',
        weight: 1.5,
        opacity: 0.6,
        fillColor: '#059669',
        fillOpacity: 0.06,
        dashArray: '6 6',
      }}
    />
  )
}