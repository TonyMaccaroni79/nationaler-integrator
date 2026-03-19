export interface ReversibilityModelInput {
  reversibilityProbability: number
  mitigationMeasuresScore: number
  mitigationFactor: number
}

/**
 * Computes reversibility factor from probability and mitigation score.
 * Higher mitigation score reduces effective reversibility.
 * Inputs: reversibilityProbability 0–1, mitigationMeasuresScore 0–100.
 */
export function computeReversibilityFactor(input: ReversibilityModelInput): number {
  const { reversibilityProbability, mitigationMeasuresScore, mitigationFactor } = input
  const prob = Math.max(0, Math.min(1, reversibilityProbability))
  const mitigation = Math.max(0, Math.min(100, mitigationMeasuresScore)) / 100
  const factor = prob * (1 - mitigation * mitigationFactor)
  return Math.round(factor * 1000) / 1000
}
