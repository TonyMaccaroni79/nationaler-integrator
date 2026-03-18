import type { VercelRequest, VercelResponse } from '@vercel/node'
import { listAuditLog } from '../lib/audit'
import { requireAuthenticatedUser } from '../lib/authz'
import { sendJson } from '../lib/http'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' })
  }

  const auth = await requireAuthenticatedUser(req)
  if (!auth.ok) return sendJson(res, auth.status ?? 401, { error: auth.error })

  const entries = await listAuditLog()
  return sendJson(res, 200, entries)
}

