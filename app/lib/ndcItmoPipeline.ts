import type { JsonValue } from '../types/index.js'
import { ndcTargets } from '../config/ndcTargets.js'
import { computeNdcModel } from './ndcModel.js'
import { computeItmoAuthorization } from './itmoAuthorization.js'
import { computeAdjustment } from './adjustmentModel.js'
import type { GovernancePipelineResult } from './governancePipeline.js'

function extractProjectReduction(dmrvData: JsonValue): number {
  if (typeof dmrvData !== 'object' || dmrvData === null || Array.isArray(dmrvData)) return 0
  const r = dmrvData as Record<string, JsonValue>
  const candidates = [
    r.co2_reduction_tons,
    r.co2e_reduction_tons,
    r.soil_carbon_increase_tons,
    r.activityData,
  ]
  for (const c of candidates) {
    const n = Number(c)
    if (!Number.isNaN(n) && n > 0) return n
  }
  return 0
}

function extractYear(dmrvData: JsonValue): number {
  if (typeof dmrvData !== 'object' || dmrvData === null || Array.isArray(dmrvData)) return 2026
  const r = dmrvData as Record<string, JsonValue>
  const periodEnd = String(r.periodEnd ?? r.period_end ?? '2026-12-31')
  const year = parseInt(periodEnd.slice(0, 4), 10)
  return Number.isNaN(year) ? 2026 : year
}

export interface NdcItmoPipelineResult {
  ndcRemaining: number
  exportableAmount: number
  ndcCompatible: boolean
  ndcTarget: number
  itmoEligible: boolean
  authorizationType: 'domestic' | 'ITMO' | 'both'
  maxITMOExport: number
  adjustmentApplied: boolean
  adjustmentYear: number
  adjustmentAmount: number
}

export function runNdcItmoPipeline(
  dmrvData: JsonValue,
  sectorName: string,
  governanceResult: GovernancePipelineResult,
): NdcItmoPipelineResult {
  const projectReduction = extractProjectReduction(dmrvData)
  const year = extractYear(dmrvData)
  const sectorKey = sectorName.toLowerCase().replace(/\s+/g, '_')

  const domesticReductions = 0
  const ndcResult = computeNdcModel(
    {
      sector: sectorKey,
      year,
      domesticReductions,
      requestedITMOAmount: projectReduction,
    },
    ndcTargets,
  )

  const itmoResult = computeItmoAuthorization({
    governanceAuthorized: governanceResult.decision.authorized,
    ndcCompatible: ndcResult.ndcCompatible,
    exportableAmount: ndcResult.exportableAmount,
    requestedITMOAmount: projectReduction,
    projectReductionTons: projectReduction,
  })

  const exportedAmount = itmoResult.itmoEligible
    ? Math.min(projectReduction, ndcResult.exportableAmount)
    : 0
  const adjustmentResult = computeAdjustment({
    exportedITMOAmount: exportedAmount,
    adjustmentYear: year,
  })

  return {
    ndcRemaining: ndcResult.ndcRemaining,
    exportableAmount: ndcResult.exportableAmount,
    ndcCompatible: ndcResult.ndcCompatible,
    ndcTarget: ndcResult.ndcTarget,
    itmoEligible: itmoResult.itmoEligible,
    authorizationType: itmoResult.authorizationType,
    maxITMOExport: itmoResult.maxITMOExport,
    adjustmentApplied: adjustmentResult.adjustmentApplied,
    adjustmentYear: adjustmentResult.adjustmentYear,
    adjustmentAmount: adjustmentResult.adjustmentAmount,
  }
}
