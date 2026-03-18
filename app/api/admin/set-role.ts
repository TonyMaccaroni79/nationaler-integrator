import type { VercelRequest, VercelResponse } from '@vercel/node'
import { listAdminUsers, setUserRole } from '../../lib/admin.js'
import { appendAuditLog } from '../../lib/audit.js'
import { requireMinistryRole } from '../../lib/authz.js'
import { sendJson } from '../../lib/http.js'
import { serverSupabase } from '../../lib/serverSupabase.js'
import type { UserRole } from '../../types/index.js'

function parseBody<T>(req: VercelRequest): T | null {
  if (!req.body) return null
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as T
    } catch {
      return null
    }
  }
  return req.body as T
}

function isUserRole(value: unknown): value is UserRole {
  return value === 'ministry' || value === 'auditor'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' })
  }

  const auth = await requireMinistryRole(req)
  if (!auth.ok) return sendJson(res, auth.status ?? 403, { error: auth.error })

  const body = parseBody<{ userId?: string; role?: unknown }>(req)
  const userId = body?.userId?.trim()
  const role = body?.role

  if (!userId || !isUserRole(role)) {
    return sendJson(res, 400, { error: 'Missing or invalid userId/role' })
  }

  const usersBefore = await listAdminUsers()
  const target = usersBefore.find((u) => u.id === userId)
  if (!target) return sendJson(res, 404, { error: 'User not found in profiles' })

  const updated = await setUserRole(userId, role)

  // Write admin action to audit trail using a valid project_id placeholder.
  // We reuse the first project to keep the existing audit schema untouched.
  const { data: firstProject } = await serverSupabase
    .from('projects')
    .select('id')
    .limit(1)
    .maybeSingle()

  if (firstProject?.id) {
    await appendAuditLog(
      firstProject.id,
      'admin_set_role',
      `role change for ${updated.email}: ${target.role} -> ${updated.role}`,
    )
  }

  return sendJson(res, 200, { user: updated })
}

