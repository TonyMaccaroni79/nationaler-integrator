export interface BaselineModelInput {
  modeledProjection: number
  conservativeAdjustmentFactor: number
}

/**
 * Computes baseline value by applying conservative adjustment to modeled projection.
 */
export function computeBaseline(input: BaselineModelInput): number {
  const { modeledProjection, conservativeAdjustmentFactor } = input
  const factor = Math.max(0, Math.min(1, conservativeAdjustmentFactor))
  return Math.round(modeledProjection * factor * 1000) / 1000
}
