import { adjustmentRules } from '../config/adjustmentRules.js'

export interface AdjustmentModelInput {
  exportedITMOAmount: number
  adjustmentYear: number
}

export interface AdjustmentModelResult {
  adjustmentApplied: boolean
  adjustmentYear: number
  adjustmentAmount: number
}

/** Mock: computes corresponding adjustment. In production, would update national inventory. */
export function computeAdjustment(input: AdjustmentModelInput): AdjustmentModelResult {
  const { exportedITMOAmount, adjustmentYear } = input
  const rule = adjustmentRules.find((r) => r.year === adjustmentYear) ?? adjustmentRules[0]

  const adjustmentAmount = Math.round(exportedITMOAmount * rule.inventoryUpdateFactor * 100) / 100
  const adjustmentApplied = rule.applyImmediately && adjustmentAmount > 0

  return {
    adjustmentApplied,
    adjustmentYear: rule.year,
    adjustmentAmount,
  }
}
