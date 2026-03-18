import type { VercelRequest } from '@vercel/node'
import type { UserRole } from '../types'
import { serverSupabase } from './serverSupabase'

function extractBearerToken(req: VercelRequest): string | null {
  const header = req.headers.authorization
  if (!header) return null
  const [scheme, token] = header.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null
  return token
}

export async function requireAuthenticatedUser(req: VercelRequest): Promise<{
  ok: boolean
  status?: number
  error?: string
  userId?: string
  role?: UserRole
}> {
  const token = extractBearerToken(req)
  if (!token) return { ok: false, status: 401, error: 'Missing bearer token' }

  const { data, error } = await serverSupabase.auth.getUser(token)
  if (error || !data.user) return { ok: false, status: 401, error: 'Invalid or expired token' }

  const { data: profile, error: profileError } = await serverSupabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (profileError || !profile) {
    return { ok: false, status: 403, error: 'No RBAC profile found for user' }
  }

  return { ok: true, userId: data.user.id, role: profile.role as UserRole }
}

export async function requireMinistryRole(req: VercelRequest): Promise<{
  ok: boolean
  status?: number
  error?: string
  userId?: string
}> {
  const auth = await requireAuthenticatedUser(req)
  if (!auth.ok) return auth
  if (auth.role !== 'ministry') return { ok: false, status: 403, error: 'Ministry role required' }
  return { ok: true, userId: auth.userId }
}

