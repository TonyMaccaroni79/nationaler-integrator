export interface AdditionalityModelInput {
  regulatoryBaseline: number
  financialAdditionalityScore: number
  technologicalAdditionalityScore: number
  minScore: number
}

/**
 * Determines whether project meets additionality criteria.
 * Requires regulatory baseline above threshold and sufficient financial/technological scores.
 */
export function computeAdditionality(input: AdditionalityModelInput): boolean {
  const { regulatoryBaseline, financialAdditionalityScore, technologicalAdditionalityScore, minScore } = input
  const financialOk = financialAdditionalityScore >= minScore
  const techOk = technologicalAdditionalityScore >= minScore
  const baselineOk = regulatoryBaseline > 0
  return baselineOk && financialOk && techOk
}
