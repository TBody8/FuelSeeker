export interface StationAffiliation {
  type: 'costco' | 'cooperative' | 'bonarea' | 'carrefour' | 'alcampo' | 'leclerc' | 'eroski'
  badgeText: string
  note: string
  badgeClass: string
  textClass: string
}

export function getStationAffiliation(brand: string, address: string = ''): StationAffiliation | null {
  const b = brand.toUpperCase()
  const a = address.toUpperCase()

  if (b.includes('COSTCO') || a.includes('COSTCO')) {
    return {
      type: 'costco',
      badgeText: 'Solo Socios Costco',
      note: '* Precio en surtidor exclusivo para miembros con suscripción activa a Costco.',
      badgeClass: 'bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
      textClass: 'text-amber-700/90 dark:text-amber-300/90',
    }
  }

  if (
    b.includes('COOP') ||
    b.includes('COOPERATIVA') ||
    b.includes('S. COOP') ||
    b.includes('S.COOP') ||
    b.includes('AGRÍCOLA') ||
    b.includes('AGRICOLA') ||
    b.includes('AGRARIA') ||
    a.includes('COOPERATIVA')
  ) {
    return {
      type: 'cooperative',
      badgeText: 'Cooperativa / Socios',
      note: '* Estación de cooperativa: precios de socio (puede requerir membresía local).',
      badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
      textClass: 'text-emerald-700/90 dark:text-emerald-300/90',
    }
  }

  if (b.includes('BONAREA') || b.includes('BONÀREA')) {
    return {
      type: 'bonarea',
      badgeText: 'bonÀrea',
      note: '* Red bonÀrea: precios directos con descuentos adicionales vía Tarjeta/App bonÀrea.',
      badgeClass: 'bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
      textClass: 'text-blue-700/90 dark:text-blue-300/90',
    }
  }

  if (b.includes('CARREFOUR')) {
    return {
      type: 'carrefour',
      badgeText: 'Club Carrefour',
      note: '* Acumula hasta un 8% en el Chequeahorro con la tarjeta El Club Carrefour.',
      badgeClass: 'bg-sky-500/15 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
      textClass: 'text-sky-700/90 dark:text-sky-300/90',
    }
  }

  if (b.includes('ALCAMPO') || b.includes('SIMPLY')) {
    return {
      type: 'alcampo',
      badgeText: 'Club Alcampo',
      note: '* Descuento directo o acumulable al repostar con la tarjeta Club Alcampo.',
      badgeClass: 'bg-rose-500/15 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
      textClass: 'text-rose-700/90 dark:text-rose-300/90',
    }
  }

  if (b.includes('LECLERC') || b.includes('E.LECLERC')) {
    return {
      type: 'leclerc',
      badgeText: 'Tarjeta E.Leclerc',
      note: '* Bonificación especial en tarjeta de fidelidad E.Leclerc.',
      badgeClass: 'bg-indigo-500/15 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
      textClass: 'text-indigo-700/90 dark:text-indigo-300/90',
    }
  }

  if (b.includes('EROSKI')) {
    return {
      type: 'eroski',
      badgeText: 'Eroski Club',
      note: '* Descuentos y ahorro acumulable con tarjeta Eroski Club / Travel Club.',
      badgeClass: 'bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-300',
      textClass: 'text-red-700/90 dark:text-red-300/90',
    }
  }

  return null
}
