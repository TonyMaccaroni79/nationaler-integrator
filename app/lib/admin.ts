import type { UserRole } from '../types/index.js'
import { serverSupabase } from './serverSupabase.js'

export type AdminUserRow = {
  id: string
  email: string
  role: UserRole
  created_at: string
}

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const { data, error } = await serverSupabase
    .from('profiles')
    .select('id, email, role, created_at')
    .order('email', { ascending: true })

  if (error) throw error
  return (data ?? []) as AdminUserRow[]
}

export async function setUserRole(userId: string, role: UserRole): Promise<AdminUserRow> {
  const { data, error } = await serverSupabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select('id, email, role, created_at')
    .single()

  if (error) throw error
  return data as AdminUserRow
}

