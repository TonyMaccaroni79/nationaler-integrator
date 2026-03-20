/**
 * Detect PostgREST / Supabase errors when a table or relation is missing from the schema cache.
 */
export function isMissingRelationError(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false
  const code = error.code ?? ''
  const msg = (error.message ?? '').toLowerCase()
  return (
    code === 'PGRST205' ||
    msg.includes('schema cache') ||
    (msg.includes('relation') && msg.includes('does not exist'))
  )
}
