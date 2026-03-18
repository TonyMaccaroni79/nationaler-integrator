import type { VercelRequest, VercelResponse } from '@vercel/node'
import { listAdminUsers } from '../../lib/admin'
import { requireMinistryRole } from '../../lib/authz'
import { sendJson } from '../../lib/http'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' })
  }

  const auth = await requireMinistryRole(req)
  if (!auth.ok) return sendJson(res, auth.status ?? 403, { error: auth.error })

  const users = await listAdminUsers()
  return sendJson(res, 200, { users })
}

