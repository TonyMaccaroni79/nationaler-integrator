import type { NdcTarget } from '../config/ndcTargets.js'

export interface NdcModelInput {
  sector: string
  year: number
  domesticReductions: number
  requestedITMOAmount: number
}

export interface NdcModelResult {
  ndcRemaining: number
  exportableAmount: number
  ndcCompatible: boolean
  ndcTarget: number
}

export function computeNdcModel(
  input: NdcModelInput,
  targets: NdcTarget[],
): NdcModelResult {
  const sectorKey = input.sector.toLowerCase().replace(/\s+/g, '_')
  const target = targets.find(
    (t) => t.sector === sectorKey && t.year === input.year,
  ) ?? targets[0]

  const ndcRemaining = Math.max(0, target.ndcTarget - input.domesticReductions)
  const exportableAmount = ndcRemaining * Math.max(0, Math.min(1, target.allowedExportShare))
  const ndcCompatible = exportableAmount >= input.requestedITMOAmount

  return {
    ndcRemaining,
    exportableAmount: Math.round(exportableAmount * 100) / 100,
    ndcCompatible,
    ndcTarget: target.ndcTarget,
  }
}
