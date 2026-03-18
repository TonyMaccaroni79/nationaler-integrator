import type { VercelRequest, VercelResponse } from '@vercel/node'
import { listAuditLog } from '../lib/audit.js'
import { requireAuthenticatedUser } from '../lib/authz.js'
import { validateDmrvData } from '../lib/dmrvValidator.js'
import { sendJson } from '../lib/http.js'
import { serverSupabase } from '../lib/serverSupabase.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' })
  }

  const auth = await requireAuthenticatedUser(req)
  if (!auth.ok) return sendJson(res, auth.status ?? 401, { error: auth.error })

  const entries = await listAuditLog()
  const projectIds = [...new Set(entries.map((entry) => entry.project_id))]

  if (projectIds.length === 0) {
    return sendJson(res, 200, entries)
  }

  const [{ data: projects, error: projectsError }, { data: authorizations, error: authzError }] = await Promise.all([
    serverSupabase.from('projects').select('id, permanence_score, dmrv_data').in('id', projectIds),
    serverSupabase.from('authorizations').select('project_id, authorized, reason').in('project_id', projectIds),
  ])

  if (projectsError) return sendJson(res, 500, { error: projectsError.message })
  if (authzError) return sendJson(res, 500, { error: authzError.message })

  const projectMap = new Map((projects ?? []).map((project) => [project.id, project]))
  const authzMap = new Map((authorizations ?? []).map((authorization) => [authorization.project_id, authorization]))

  const enriched = entries.map((entry) => {
    const project = projectMap.get(entry.project_id)
    const authorization = authzMap.get(entry.project_id)
    const dmrvValidity = project
      ? validateDmrvData(project.dmrv_data).valid
        ? 'valid'
        : 'invalid'
      : 'unknown'

    return {
      ...entry,
      authorization_result: authorization
        ? authorization.authorized
          ? 'authorized'
          : `not authorized (${authorization.reason})`
        : 'n/a',
      permanence_score: project?.permanence_score ?? null,
      dmrv_validity: dmrvValidity,
    }
  })

  return sendJson(res, 200, enriched)
}

