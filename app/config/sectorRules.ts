export const ELIGIBLE_SECTORS = new Set([
  'cement',
  'steel',
  'energy',
  'agriculture',
  'forestry',
  'waste',
  'logistics',
])

export type SectorRule = {
  minPermanence: number
  baselinePermanence: number
  conservativeAdjustmentFactor: number
}

export const sectorRules: Record<string, SectorRule> = {
  cement: {
    minPermanence: 50,
    baselinePermanence: 70,
    conservativeAdjustmentFactor: 0.9,
  },
  agriculture: {
    minPermanence: 60,
    baselinePermanence: 80,
    conservativeAdjustmentFactor: 0.85,
  },
  energy: {
    minPermanence: 55,
    baselinePermanence: 65,
    conservativeAdjustmentFactor: 0.92,
  },
  forestry: {
    minPermanence: 65,
    baselinePermanence: 75,
    conservativeAdjustmentFactor: 0.88,
  },
  steel: {
    minPermanence: 50,
    baselinePermanence: 68,
    conservativeAdjustmentFactor: 0.9,
  },
  waste: {
    minPermanence: 52,
    baselinePermanence: 66,
    conservativeAdjustmentFactor: 0.91,
  },
  logistics: {
    minPermanence: 48,
    baselinePermanence: 62,
    conservativeAdjustmentFactor: 0.93,
  },
}
