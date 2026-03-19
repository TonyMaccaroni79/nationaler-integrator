import type { AuthorizeResponse, DmrvValidationResult, Sector } from '../types/index.js'
import { ELIGIBLE_SECTORS } from '../config/sectorRules.js'

export function checkSectorEligibility(sector: Sector): { eligible: boolean; reason?: string } {
  const eligible = ELIGIBLE_SECTORS.has(sector.name.toLowerCase())
  if (!eligible) {
    return { eligible: false, reason: `Sector "${sector.name}" is not in the current eligibility registry.` }
  }
  return { eligible: true }
}

/** @deprecated Use governance pipeline and computeGovernanceDecision instead */
export function authorizeProject(
  dmrvValidation: DmrvValidationResult,
  permanenceScore: number,
  sectorEligible: boolean,
): AuthorizeResponse {
  if (!sectorEligible) {
    return { authorized: false, reason: 'Sector failed eligibility checks.' }
  }

  if (!dmrvValidation.valid) {
    return { authorized: false, reason: 'dMRV validation failed.' }
  }

  const minPermanence = 55
  if (permanenceScore < minPermanence) {
    return { authorized: false, reason: `Permanence score below threshold (${minPermanence}).` }
  }

  return { authorized: true }
}

