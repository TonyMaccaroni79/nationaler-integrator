export interface AdditionalityModelInput {
  regulatoryBaseline: number
  financialAdditionalityScore: number
  technologicalAdditionalityScore: number
}

/**
 * Determines whether project meets additionality criteria.
 * Requires regulatory baseline above threshold and sufficient financial/technological scores.
 */
export function computeAdditionality(input: AdditionalityModelInput): boolean {
  const { regulatoryBaseline, financialAdditionalityScore, technologicalAdditionalityScore } = input
  const financialOk = financialAdditionalityScore >= 50
  const techOk = technologicalAdditionalityScore >= 50
  const baselineOk = regulatoryBaseline > 0
  return baselineOk && financialOk && techOk
}
