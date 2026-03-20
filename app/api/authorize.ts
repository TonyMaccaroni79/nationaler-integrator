import type { VercelRequest, VercelResponse } from '@vercel/node'
import { appendAuditLog } from '../lib/audit.js'
import { requireMinistryRole } from '../lib/authz.js'
import { checkSectorEligibility } from '../lib/governance.js'
import { runGovernancePipeline } from '../lib/governancePipeline.js'
import { runNdcItmoPipeline } from '../lib/ndcItmoPipeline.js'
import { sendJson } from '../lib/http.js'
import { isMissingRelationError } from '../lib/postgrestErrors.js'
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

  const persistenceWarnings: string[] = []
  const itmoMigrationHint =
    'Run supabase/migrations/20260320000000_ndc_itmo_tables.sql (or full schema.sql) in the Supabase SQL Editor, then authorize again to persist ITMO/NDC rows.'

  const delItmo = await serverSupabase.from('itmo_authorizations').delete().eq('project_id', projectId)
  if (delItmo.error) {
    if (isMissingRelationError(delItmo.error)) {
      persistenceWarnings.push(`itmo_authorizations: ${delItmo.error.message}. ${itmoMigrationHint}`)
    } else {
      return sendJson(res, 500, { error: `itmo_authorizations: ${delItmo.error.message}` })
    }
  } else {
    const { error: itmoRowError } = await serverSupabase.from('itmo_authorizations').insert({
      project_id: projectId,
      authorization_type: ndcItmo.authorizationType,
      max_itmo_export: ndcItmo.maxITMOExport,
      itmo_eligible: ndcItmo.itmoEligible,
      ndc_compatible: ndcItmo.ndcCompatible,
    })
    if (itmoRowError) {
      if (isMissingRelationError(itmoRowError)) {
        persistenceWarnings.push(`itmo_authorizations: ${itmoRowError.message}. ${itmoMigrationHint}`)
      } else {
        return sendJson(res, 500, { error: `itmo_authorizations: ${itmoRowError.message}` })
      }
    }
  }

  if (persistenceWarnings.length === 0) {
    const delAdj = await serverSupabase.from('corresponding_adjustments').delete().eq('project_id', projectId)
    if (delAdj.error) {
      if (isMissingRelationError(delAdj.error)) {
        persistenceWarnings.push(`corresponding_adjustments: ${delAdj.error.message}. ${itmoMigrationHint}`)
      } else {
        return sendJson(res, 500, { error: `corresponding_adjustments: ${delAdj.error.message}` })
      }
    } else {
      const { error: adjError } = await serverSupabase.from('corresponding_adjustments').insert({
        project_id: projectId,
        adjustment_year: ndcItmo.adjustmentYear,
        adjustment_amount: ndcItmo.adjustmentAmount,
        adjustment_applied: ndcItmo.adjustmentApplied,
      })
      if (adjError) {
        if (isMissingRelationError(adjError)) {
          persistenceWarnings.push(`corresponding_adjustments: ${adjError.message}. ${itmoMigrationHint}`)
        } else {
          return sendJson(res, 500, { error: `corresponding_adjustments: ${adjError.message}` })
        }
      }
    }
  }

  await appendAuditLog(
    projectId,
    'authorize',
    `${result.decision.authorized ? 'authorized' : 'rejected'}: ${reason}`,
  )

  return sendJson(res, 200, {
    authorized: result.decision.authorized,
    reason,
    ...(persistenceWarnings.length ? { persistenceWarnings } : {}),
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
