import type { AuthorizeResponse, DmrvValidationResult, Sector } from '../types'

const ELIGIBLE_SECTORS = new Set([
  'cement',
  'steel',
  'energy',
  'agriculture',
  'forestry',
  'waste',
  'logistics',
])

export function checkSectorEligibility(sector: Sector): { eligible: boolean; reason?: string } {
  const eligible = ELIGIBLE_SECTORS.has(sector.name.toLowerCase())
  if (!eligible) {
    return { eligible: false, reason: `Sector "${sector.name}" is not in the current eligibility registry.` }
  }
  return { eligible: true }
}

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

  if (permanenceScore < 60) {
    return { authorized: false, reason: 'Permanence score below threshold (60).' }
  }

  return { authorized: true }
}

