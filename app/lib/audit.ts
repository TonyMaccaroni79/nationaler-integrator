import { serverSupabase } from './serverSupabase.js'

export async function appendAuditLog(projectId: string, action: string, result: string) {
  const { error } = await serverSupabase.from('audit_log').insert({
    project_id: projectId,
    action,
    result,
  })

  if (error) throw error
}

export async function listAuditLog() {
  const { data, error } = await serverSupabase
    .from('audit_log')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(200)

  if (error) throw error
  return data ?? []
}

