export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[]

export type Sector = {
  id: string
  name: string
  description: string
  dmrv_requirements: string[]
}

export type Project = {
  id: string
  sector_id: string
  name: string
  dmrv_data: JsonValue
  permanence_score: number | null
  status: 'draft' | 'authorized' | 'rejected' | 'minted'
}

export type Authorization = {
  id: string
  project_id: string
  authorized: boolean
  reason: string
}

export type AuditEntry = {
  id: string
  project_id: string
  timestamp: string
  action: string
  result: string
  authorization_result?: string
  permanence_score?: number | null
  dmrv_validity?: 'valid' | 'invalid' | 'unknown'
}

export type TokenRecord = {
  id: string
  project_id: string
  token_id: string
  minted_at: string
}

export type DmrvValidationResult = {
  valid: boolean
  issues: string[]
}

export type AuthorizeResponse = {
  authorized: boolean
  reason?: string
  governance?: GovernanceDetails
}

export type SectorRule = {
  minPermanence: number
  baselinePermanence: number
  conservativeAdjustmentFactor: number
}

export type GovernanceDetails = {
  baseline: number
  riskFactor: number
  reversibilityFactor: number
  permanenceScore: number
  additionality: boolean
  dmrvValid: boolean
  dmrvStructuralValid: boolean
  dmrvIssues: string[]
  sectorEligible: boolean
  sectorRules: SectorRule | null
  decision?: { authorized: boolean; reason: string }
}

export type UserRole = 'ministry' | 'auditor'

export type Profile = {
  id: string
  email: string
  role: UserRole
}

export type AdminUser = {
  id: string
  email: string
  role: UserRole
  created_at: string
}

