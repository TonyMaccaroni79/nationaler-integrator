export interface PermanenceModelInput {
  projectDurationYears: number
  riskFactor: number
  reversibilityFactor: number
  leakageRisk: number
  sectorBaselinePermanence: number
}

/**
 * Computes permanence score (0–100) from project and sector parameters.
 * Duration and sector baseline contribute positively; risk and reversibility reduce score.
 */
export function computePermanenceScore(input: PermanenceModelInput): number {
  const {
    projectDurationYears,
    riskFactor,
    reversibilityFactor,
    leakageRisk,
    sectorBaselinePermanence,
  } = input

  const durationScore = Math.min(40, (projectDurationYears / 100) * 40)
  const baselineScore = Math.min(40, (sectorBaselinePermanence / 100) * 40)
  const riskPenalty = (riskFactor + reversibilityFactor + leakageRisk) / 3
  const penalty = Math.min(30, riskPenalty * 30)
  const raw = durationScore + baselineScore - penalty
  const score = Math.max(0, Math.min(100, raw))
  return Math.round(score)
}
