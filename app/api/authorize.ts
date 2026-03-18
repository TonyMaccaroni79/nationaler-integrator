import type { VercelRequest, VercelResponse } from '@vercel/node'
import { appendAuditLog } from '../lib/audit'
import { requireMinistryRole } from '../lib/authz'
import { validateDmrvData } from '../lib/dmrvValidator'
import { authorizeProject, checkSectorEligibility } from '../lib/governance'
import { sendJson } from '../lib/http'
import { calculatePermanenceScore } from '../lib/permanenceModel'
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

  const { data: project, error: projectError } = await serverSupabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (projectError || !project) {
    return sendJson(res, 404, { error: 'Project not found' })
  }

  const { data: sector, error: sectorError } = await serverSupabase
    .from('sectors')
    .select('*')
    .eq('id', project.sector_id)
    .single()

  if (sectorError || !sector) {
    return sendJson(res, 400, { error: 'Sector not found for project' })
  }

  const dmrvValidation = validateDmrvData(project.dmrv_data)
  const permanenceScore = calculatePermanenceScore(project.dmrv_data)
  const sectorEligibility = checkSectorEligibility(sector)
  const authorization = authorizeProject(dmrvValidation, permanenceScore, sectorEligibility.eligible)
  const reason = authorization.reason ?? (authorization.authorized ? 'Authorized' : 'Rejected')

  const { error: updateProjectError } = await serverSupabase
    .from('projects')
    .update({
      permanence_score: permanenceScore,
      status: authorization.authorized ? 'authorized' : 'rejected',
    })
    .eq('id', projectId)

  if (updateProjectError) return sendJson(res, 500, { error: updateProjectError.message })

  const { error: authError } = await serverSupabase.from('authorizations').upsert(
    {
      project_id: projectId,
      authorized: authorization.authorized,
      reason,
    },
    { onConflict: 'project_id' },
  )

  if (authError) return sendJson(res, 500, { error: authError.message })

  await appendAuditLog(projectId, 'authorize', `${authorization.authorized ? 'authorized' : 'rejected'}: ${reason}`)

  return sendJson(res, 200, { authorized: authorization.authorized, reason })
}

