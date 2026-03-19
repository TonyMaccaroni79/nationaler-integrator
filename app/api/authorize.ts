import type { VercelRequest, VercelResponse } from '@vercel/node'
import { appendAuditLog } from '../lib/audit.js'
import { requireMinistryRole } from '../lib/authz.js'
import { checkSectorEligibility } from '../lib/governance.js'
import { runGovernancePipeline } from '../lib/governancePipeline.js'
import { runNdcItmoPipeline } from '../lib/ndcItmoPipeline.js'
import { sendJson } from '../lib/http.js'
import { serverSupabase } from '../lib/serverSupabase.js'

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

  const sectorEligibility = checkSectorEligibility(sector)
  const result = runGovernancePipeline(
    project.dmrv_data,
    sector.name,
    sectorEligibility.eligible,
  )

  const ndcItmo = runNdcItmoPipeline(project.dmrv_data, sector.name, result)

  const reason = result.decision.reason ?? (result.decision.authorized ? 'Authorized' : 'Rejected')

  const { error: updateProjectError } = await serverSupabase
    .from('projects')
    .update({
      permanence_score: result.permanenceScore,
      status: result.decision.authorized ? 'authorized' : 'rejected',
    })
    .eq('id', projectId)

  if (updateProjectError) return sendJson(res, 500, { error: updateProjectError.message })

  const { error: authError } = await serverSupabase.from('authorizations').upsert(
    {
      project_id: projectId,
      authorized: result.decision.authorized,
      reason,
    },
    { onConflict: 'project_id' },
  )

  if (authError) return sendJson(res, 500, { error: authError.message })

  await appendAuditLog(
    projectId,
    'authorize',
    `${result.decision.authorized ? 'authorized' : 'rejected'}: ${reason}`,
  )

  return sendJson(res, 200, {
    authorized: result.decision.authorized,
    reason,
    governance: {
      baseline: result.baseline,
      riskFactor: result.riskFactor,
      reversibilityFactor: result.reversibilityFactor,
      permanenceScore: result.permanenceScore,
      additionality: result.additionality,
      dmrvValid: result.dmrvValid,
      dmrvStructuralValid: result.dmrvStructuralValid,
      dmrvIssues: result.dmrvIssues,
      sectorEligible: result.sectorEligible,
      sectorRules: result.sectorRules,
    },
    ndcItmo: {
      ndcCompatible: ndcItmo.ndcCompatible,
      itmoEligible: ndcItmo.itmoEligible,
      authorizationType: ndcItmo.authorizationType,
      maxITMOExport: ndcItmo.maxITMOExport,
      adjustmentApplied: ndcItmo.adjustmentApplied,
      adjustmentAmount: ndcItmo.adjustmentAmount,
      adjustmentYear: ndcItmo.adjustmentYear,
    },
  })
}
