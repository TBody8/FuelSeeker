export function formatPrice(price: number | null): string {
  if (price === null || Number.isNaN(price)) return '—'
  return `${price.toFixed(3).replace('.', ',')} €/L`
}

export function formatPriceCompact(price: number | null): string {
  if (price === null || Number.isNaN(price)) return '—'
  return price.toFixed(3).replace('.', ',')
}

export function stationMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

export function parseApiDate(dateStr: string): Date {
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    const [d, m, y] = parts
    return new Date(Number(y), Number(m) - 1, Number(d))
  }
  return new Date(dateStr)
}