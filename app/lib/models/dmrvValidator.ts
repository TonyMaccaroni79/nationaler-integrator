export interface DmrvValidatorInput {
  completeness: number
  methodologyCompliance: number
  evidenceQuality: number
  dataConsistency: number
  minScore: number
}

/**
 * Validates dMRV based on scoring dimensions (0–100 each).
 * All dimensions must meet minimum threshold.
 */
export function validateDmrv(input: DmrvValidatorInput): boolean {
  const { completeness, methodologyCompliance, evidenceQuality, dataConsistency, minScore } = input
  const scores = [completeness, methodologyCompliance, evidenceQuality, dataConsistency]
  const clamped = scores.map((s) => Math.max(0, Math.min(100, s)))
  return clamped.every((s) => s >= minScore)
}
