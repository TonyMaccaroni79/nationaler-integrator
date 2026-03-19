import type { SectorRule } from '../../config/sectorRules.js'

export interface GovernanceDecisionInput {
  dmrvValid: boolean
  permanenceScore: number
  additionality: boolean
  sectorEligible: boolean
  sectorRules: SectorRule | null
}

export interface GovernanceDecisionOutput {
  authorized: boolean
  reason: string
}

/**
 * Final governance decision based on all model outputs and sector rules.
 */
export function computeGovernanceDecision(input: GovernanceDecisionInput): GovernanceDecisionOutput {
  const { dmrvValid, permanenceScore, additionality, sectorEligible, sectorRules } = input

  if (!sectorEligible) {
    return { authorized: false, reason: 'Sector failed eligibility checks.' }
  }

  if (!dmrvValid) {
    return { authorized: false, reason: 'dMRV validation failed.' }
  }

  if (!additionality) {
    return { authorized: false, reason: 'Additionality criteria not met.' }
  }

  const minPermanence = sectorRules?.minPermanence ?? 55
  if (permanenceScore < minPermanence) {
    return {
      authorized: false,
      reason: `Permanence score below threshold (${minPermanence}).`,
    }
  }

  return { authorized: true, reason: 'Authorized.' }
}
