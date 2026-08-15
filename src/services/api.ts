import { HISTORICAL_CONCURRENCY } from '../utils/constants'

const API_BASE = '/api'

export class ApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    throw new ApiError(
      `La API respondió con estado ${res.status} para ${path}`,
      res.status,
    )
  }

  try {
    return (await res.json()) as T
  } catch {
    throw new ApiError(`Respuesta no válida (JSON) para ${path}`)
  }
}

export async function fetchJsonWithRetry<T>(
  path: string,
  options: { retries?: number; delayMs?: number } = {},
): Promise<T> {
  const { retries = 1, delayMs = 2000 } = options
  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetchJson<T>(path)
    } catch (err) {
      lastError = err
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }
  }

  throw lastError
}

// Resuelve un array de tareas con un límite de concurrencia (pool).
// Utilizado para las ~52 peticiones históricas sin saturar el servidor.
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let cursor = 0

  const worker = async (): Promise<void> => {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      results[index] = await mapper(items[index], index)
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => worker(),
  )
  await Promise.all(workers)

  return results
}

export const CONCURRENCY_LIMIT = HISTORICAL_CONCURRENCY