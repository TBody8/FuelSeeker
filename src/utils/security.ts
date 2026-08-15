/**
 * Utilidades de seguridad para sanitización y prevención de inyecciones (XSS).
 */

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
}

const HTML_ESCAPE_REGEX = /[&<>"'/]/g

/**
 * Escapa caracteres HTML peligrosos para evitar inyecciones DOM-XSS al interpolar cadenas en plantillas.
 */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return ''
  return String(str).replace(HTML_ESCAPE_REGEX, (match) => HTML_ESCAPE_MAP[match] || match)
}
