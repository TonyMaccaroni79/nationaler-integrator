import type { AdminUser, AuditEntry, AuthorizeResponse, DmrvValidationResult, UserRole } from '../types'
import { supabase } from '../lib/supabaseClient'

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const token = session?.access_token
  if (!token) throw new Error('Authentication required. Please sign in.')

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  const data = text ? (JSON.parse(text) as unknown) : {}

  if (!res.ok) {
    const message =
      typeof data === 'object' && data !== null && 'error' in data ? String((data as { error: string }).error) : `Request failed: ${res.status}`
    throw new Error(message)
  }

  return data as T
}

export async function validateDmrv(dmrvData: unknown) {
  return postJson<DmrvValidationResult>('/api/validate-dmrv', { dmrvData })
}

export async function authorizeProject(projectId: string) {
  return postJson<AuthorizeResponse>('/api/authorize', { projectId })
}

export async function requestMint(projectId: string) {
  return postJson<{ tokenId: string }>('/api/mint', { projectId })
}

export async function fetchAudit() {
  return postJson<AuditEntry[]>('/api/audit', {})
}

export async function fetchAdminUsers() {
  return postJson<{ users: AdminUser[] }>('/api/admin/users', {})
}

export async function setAdminUserRole(userId: string, role: UserRole) {
  return postJson<{ user: AdminUser }>('/api/admin/set-role', { userId, role })
}

