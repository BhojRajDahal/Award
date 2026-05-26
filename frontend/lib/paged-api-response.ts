/**
 * Many list endpoints return { items, pagination }. Normalize to an array for legacy UI code.
 */
export function itemsFromPagedApiResponse<T = unknown>(data: unknown): T[] {
  if (data == null) return []
  if (Array.isArray(data)) return data as T[]
  if (typeof data !== "object") return []
  const o = data as Record<string, unknown>
  if (Array.isArray(o.items)) return o.items as T[]
  if (Array.isArray(o.data)) return o.data as T[]
  if (Array.isArray(o.applications)) return o.applications as T[]
  return []
}
