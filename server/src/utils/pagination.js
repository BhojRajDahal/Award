/**
 * MySQL prepared statements do not accept bound LIMIT/OFFSET placeholders.
 * Coerce to safe integers and inline into SQL after validation.
 */
export function safeLimitOffset(limit = 50, offset = 0, maxLimit = 500) {
  const safeLimit = Math.min(Math.max(Math.floor(Number(limit)) || 50, 1), maxLimit);
  const safeOffset = Math.max(Math.floor(Number(offset)) || 0, 0);
  return { safeLimit, safeOffset, clause: `LIMIT ${safeLimit} OFFSET ${safeOffset}` };
}
