import type {
  AdminUser,
  AuditEntry,
  AuthorizeResponse,
  DmrvValidationResult,
  GovernanceDetails,
  UserRole,
} from '../types'
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
  let data: unknown = {}
  if (text) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      const message = `API returned non-JSON response (${res.status}) on ${url}: ${text.slice(0, 140)}`
      throw new Error(message)
    }
  }

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

export async function runBootstrap() {
  return postJson<{ ok: boolean; projectsCreated: number }>('/api/bootstrap', {})
}

export async function runResetDemo() {
  return postJson<{ ok: boolean; projectsReset: number }>('/api/reset-demo', {})
}

export type GovernanceDetailsResponse = {
  projectId: string
  projectName: string
  sectorName: string
  governance: GovernanceDetails & { decision?: { authorized: boolean; reason: string } }
}

export async function fetchGovernanceDetails(projectId: string) {
  const params = new URLSearchParams({ projectId })
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) throw new Error('Authentication required. Please sign in.')

  const res = await fetch(`/api/governance-details?${params}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })
  const text = await res.text()
  let data: unknown = {}
  if (text) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      throw new Error(`API returned non-JSON response (${res.status}) on /api/governance-details: ${text.slice(0, 140)}`)
    }
  }
  if (!res.ok) {
    const message =
      typeof data === 'object' && data !== null && 'error' in data ? String((data as { error: string }).error) : `Request failed: ${res.status}`
    throw new Error(message)
  }
  return data as GovernanceDetailsResponse
}

