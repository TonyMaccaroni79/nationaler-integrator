import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuthenticatedUser } from '../lib/authz.js'
import { validateDmrvData } from '../lib/dmrvValidator.js'
import { sendJson } from '../lib/http.js'

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' })
  }

  const auth = await requireAuthenticatedUser(req)
  if (!auth.ok) return sendJson(res, auth.status ?? 401, { error: auth.error })

  const body = parseBody<{ dmrvData?: unknown }>(req)
  if (!body || body.dmrvData === undefined) {
    return sendJson(res, 400, { error: 'Missing dmrvData in request body' })
  }

  const result = validateDmrvData(body.dmrvData as never)
  return sendJson(res, 200, result)
}

