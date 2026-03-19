import type { JsonValue } from '../types/index.js'
import { sectorRules, type SectorRule } from '../config/sectorRules.js'
import { globalParameters } from '../config/globalParameters.js'
import { computeBaseline } from './models/baselineModel.js'
import { computeRiskFactor } from './models/riskModel.js'
import { computeReversibilityFactor } from './models/reversibilityModel.js'
import { computePermanenceScore } from './models/permanenceModel.js'
import { computeAdditionality } from './models/additionalityModel.js'
import { validateDmrv } from './models/dmrvValidator.js'
import { computeGovernanceDecision } from './models/governanceDecision.js'
import { validateDmrvData } from './dmrvValidator.js'

function toRecord(input: JsonValue): Record<string, JsonValue> | null {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return null
  return input as Record<string, JsonValue>
}

function num(val: JsonValue, fallback: number): number {
  const n = Number(val)
  return Number.isNaN(n) ? fallback : n
}

export interface GovernancePipelineResult {
  baseline: number
  riskFactor: number
  reversibilityFactor: number
  permanenceScore: number
  additionality: boolean
  dmrvValid: boolean
  dmrvStructuralValid: boolean
  dmrvIssues: string[]
  sectorEligible: boolean
  sectorRules: SectorRule | null
  decision: { authorized: boolean; reason: string }
}

export function runGovernancePipeline(
  dmrvData: JsonValue,
  sectorName: string,
  sectorEligible: boolean,
): GovernancePipelineResult {
  const record = toRecord(dmrvData) ?? {}
  const sectorKey = sectorName.toLowerCase().replace(/\s+/g, '_')
  const rules = sectorRules[sectorKey] ?? sectorRules.cement

  const structuralValidation = validateDmrvData(dmrvData)

  const modeledProjection = num(record.modeledProjection ?? record.baseline_tco2 ?? 100, 100)
  const baseline = computeBaseline({
    modeledProjection,
    conservativeAdjustmentFactor: rules.conservativeAdjustmentFactor,
  })

  const naturalRisk = num(record.naturalRisk ?? record.natural_risk ?? 0.2, 0.2)
  const operationalRisk = num(record.operationalRisk ?? record.operational_risk ?? 0.2, 0.2)
  const marketRisk = num(record.marketRisk ?? record.market_risk ?? 0.2, 0.2)
  const governanceRisk = num(record.governanceRisk ?? record.governance_risk ?? 0.2, 0.2)
  const riskFactor = computeRiskFactor({
    naturalRisk,
    operationalRisk,
    marketRisk,
    governanceRisk,
    weights: globalParameters.riskWeights,
  })

  const reversibilityProbability = num(
    record.reversibilityProbability ?? record.reversibility_probability ?? 0.3,
    0.3,
  )
  const mitigationMeasuresScore = num(
    record.mitigationMeasuresScore ?? record.mitigation_measures_score ?? 60,
    60,
  )
  const reversibilityFactor = computeReversibilityFactor({
    reversibilityProbability,
    mitigationMeasuresScore,
    mitigationFactor: globalParameters.reversibilityMitigationFactor,
  })

  const projectDurationYears = num(
    record.projectDurationYears ?? record.storageYears ?? record.project_duration ?? 30,
    30,
  )
  const leakageRisk = num(record.leakageRisk ?? record.leakage_risk ?? 0.1, 0.1)
  const permanenceScore = computePermanenceScore({
    projectDurationYears,
    riskFactor,
    reversibilityFactor,
    leakageRisk,
    sectorBaselinePermanence: rules.baselinePermanence,
  })

  const regulatoryBaseline = num(record.regulatoryBaseline ?? record.regulatory_baseline ?? 1, 1)
  const financialAdditionalityScore = num(
    record.financialAdditionalityScore ?? record.financial_additionality ?? 70,
    70,
  )
  const technologicalAdditionalityScore = num(
    record.technologicalAdditionalityScore ?? record.technological_additionality ?? 70,
    70,
  )
  const additionality = computeAdditionality({
    regulatoryBaseline,
    financialAdditionalityScore,
    technologicalAdditionalityScore,
    minScore: globalParameters.minAdditionalityScore,
  })

  const completeness = structuralValidation.valid ? 80 : 40
  const methodologyCompliance =
    (record.methodologyId ?? record.methodology) && String(record.methodologyId ?? record.methodology).trim().length >= 3
      ? 75
      : 30
  const evidenceQuality =
    (record.evidenceRef ?? record.evidence) && String(record.evidenceRef ?? record.evidence).trim().length >= 3
      ? 75
      : 30
  const dataConsistency = structuralValidation.valid ? 85 : 50
  const dmrvValid =
    structuralValidation.valid &&
    validateDmrv({
      completeness,
      methodologyCompliance,
      evidenceQuality,
      dataConsistency,
      minScore: globalParameters.minDmrvScore,
    })

  const decision = computeGovernanceDecision({
    dmrvValid,
    permanenceScore,
    additionality,
    sectorEligible,
    sectorRules: rules,
    defaultMinPermanence: globalParameters.defaultMinPermanence,
  })

  return {
    baseline,
    riskFactor,
    reversibilityFactor,
    permanenceScore,
    additionality,
    dmrvValid,
    dmrvStructuralValid: structuralValidation.valid,
    dmrvIssues: structuralValidation.issues,
    sectorEligible,
    sectorRules: rules,
    decision,
  }
}
