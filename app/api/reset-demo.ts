import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireMinistryRole } from '../lib/authz.js'
import { runResetDemo } from '../lib/seedData.js'
import { sendJson } from '../lib/http.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' })
  }

  const auth = await requireMinistryRole(req)
  if (!auth.ok) return sendJson(res, auth.status ?? 403, { error: auth.error })

  try {
    const result = await runResetDemo()
    if (result.error) {
      return sendJson(res, 500, { error: result.error })
    }
    return sendJson(res, 200, { ok: true, projectsReset: result.projectsReset })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Reset demo failed'
    return sendJson(res, 500, { error: msg })
  }
}
