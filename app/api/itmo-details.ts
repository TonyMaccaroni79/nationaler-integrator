import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuthenticatedUser } from '../lib/authz.js'
import { checkSectorEligibility } from '../lib/governance.js'
import { runGovernancePipeline } from '../lib/governancePipeline.js'
import { runNdcItmoPipeline } from '../lib/ndcItmoPipeline.js'
import { sendJson } from '../lib/http.js'
import { serverSupabase } from '../lib/serverSupabase.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' })
  }

  const auth = await requireAuthenticatedUser(req)
  if (!auth.ok) return sendJson(res, auth.status ?? 403, { error: auth.error })

  const projectId =
    req.method === 'GET'
      ? (req.query.projectId as string)?.trim()
      : typeof req.body === 'object' && req.body !== null && 'projectId' in req.body
        ? String((req.body as { projectId?: string }).projectId ?? '').trim()
        : ''

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
  const governanceResult = runGovernancePipeline(
    project.dmrv_data,
    sector.name,
    sectorEligibility.eligible,
  )
  const ndcItmo = runNdcItmoPipeline(project.dmrv_data, sector.name, governanceResult)

  return sendJson(res, 200, {
    projectId,
    projectName: project.name,
    sectorName: sector.name,
    itmo: {
      itmoEligible: ndcItmo.itmoEligible,
      authorizationType: ndcItmo.authorizationType,
      maxITMOExport: ndcItmo.maxITMOExport,
      ndcCompatible: ndcItmo.ndcCompatible,
      adjustmentApplied: ndcItmo.adjustmentApplied,
      adjustmentAmount: ndcItmo.adjustmentAmount,
      adjustmentYear: ndcItmo.adjustmentYear,
    },
  })
}
