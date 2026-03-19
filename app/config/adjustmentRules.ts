export type AdjustmentRule = {
  year: number
  applyImmediately: boolean
  inventoryUpdateFactor: number
}

export const adjustmentRules: AdjustmentRule[] = [
  { year: 2026, applyImmediately: true, inventoryUpdateFactor: 1 },
  { year: 2027, applyImmediately: true, inventoryUpdateFactor: 1 },
  { year: 2028, applyImmediately: true, inventoryUpdateFactor: 1 },
]
