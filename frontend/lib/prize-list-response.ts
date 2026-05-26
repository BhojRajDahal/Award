/**
 * Backend GET /api/prize and /api/prize/public return { items, pagination }.
 * Normalize to an array for UI that previously expected a bare list.
 */
export function prizesFromApiResponse(data: unknown): unknown[] {
  if (data == null) return []
  if (Array.isArray(data)) return data
  if (typeof data !== "object") return []
  const o = data as Record<string, unknown>
  if (Array.isArray(o.items)) return o.items
  if (Array.isArray(o.data)) return o.data as unknown[]
  if (Array.isArray(o.prizes)) return o.prizes as unknown[]
  return []
}
