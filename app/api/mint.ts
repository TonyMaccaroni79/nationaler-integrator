import type { VercelRequest, VercelResponse } from '@vercel/node'
import { appendAuditLog } from '../lib/audit'
import { requireMinistryRole } from '../lib/authz'
import { sendJson } from '../lib/http'
import { mintTokenId } from '../lib/registryMock'
import { serverSupabase } from '../lib/serverSupabase'

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

  const auth = await requireMinistryRole(req)
  if (!auth.ok) return sendJson(res, auth.status ?? 403, { error: auth.error })

  const body = parseBody<{ projectId?: string }>(req)
  const projectId = body?.projectId?.trim()
  if (!projectId) {
    return sendJson(res, 400, { error: 'Missing projectId' })
  }

  const { data: authorization, error: authError } = await serverSupabase
    .from('authorizations')
    .select('*')
    .eq('project_id', projectId)
    .single()

  if (authError || !authorization || !authorization.authorized) {
    return sendJson(res, 403, { error: 'Project is not authorized for minting' })
  }

  const tokenId = mintTokenId(projectId)
  const { error: tokenError } = await serverSupabase.from('tokens').insert({
    project_id: projectId,
    token_id: tokenId,
  })

  if (tokenError) return sendJson(res, 500, { error: tokenError.message })

  await serverSupabase.from('projects').update({ status: 'minted' }).eq('id', projectId)
  await appendAuditLog(projectId, 'mint', `minted ${tokenId}`)

  return sendJson(res, 200, { tokenId })
}

