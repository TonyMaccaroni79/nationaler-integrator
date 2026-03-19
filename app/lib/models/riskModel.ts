export interface RiskModelInput {
  naturalRisk: number
  operationalRisk: number
  marketRisk: number
  governanceRisk: number
}

/**
 * Computes a combined risk factor (0–1) from individual risk components.
 * Uses weighted average; all inputs expected in 0–1 range.
 */
export function computeRiskFactor(input: RiskModelInput): number {
  const { naturalRisk, operationalRisk, marketRisk, governanceRisk } = input
  const weights = [0.25, 0.25, 0.25, 0.25]
  const values = [naturalRisk, operationalRisk, marketRisk, governanceRisk]
  const clamped = values.map((v) => Math.max(0, Math.min(1, v)))
  const factor = clamped.reduce((sum, v, i) => sum + v * weights[i], 0)
  return Math.round(factor * 1000) / 1000
}
