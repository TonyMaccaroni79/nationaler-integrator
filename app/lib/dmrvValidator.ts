import type { DmrvValidationResult, JsonValue } from '../types/index.js'

function toRecord(input: JsonValue): Record<string, JsonValue> | null {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return null
  return input as Record<string, JsonValue>
}

export function validateDmrvData(dmrvData: JsonValue): DmrvValidationResult {
  const issues: string[] = []

  const record = toRecord(dmrvData)
  if (!record) {
    return {
      valid: false,
      issues: ['dMRV data must be a JSON object.'],
    }
  }

  const methodologyValue = record.methodologyId ?? record.methodology
  if (typeof methodologyValue !== 'string' || methodologyValue.trim().length < 3) {
    issues.push('Missing required dMRV field: methodologyId or methodology')
  }

  if (!('periodStart' in record)) issues.push('Missing required dMRV field: periodStart')
  if (!('periodEnd' in record)) issues.push('Missing required dMRV field: periodEnd')

  const activityCandidates = [
    record.activityData,
    record.co2_reduction_tons,
    record.co2e_reduction_tons,
    record.soil_carbon_increase_tons,
  ]
  const hasPositiveActivity = activityCandidates.some(
    (value) => typeof value === 'number' && !Number.isNaN(value) && value > 0,
  )
  if (!hasPositiveActivity) {
    issues.push(
      'Missing positive activity metric: activityData, co2_reduction_tons, co2e_reduction_tons, or soil_carbon_increase_tons.',
    )
  }

  const evidenceValue = record.evidenceRef ?? record.evidence
  if (typeof evidenceValue !== 'string' || evidenceValue.trim().length < 3) {
    issues.push('Missing required dMRV field: evidenceRef or evidence')
  }

  return { valid: issues.length === 0, issues }
}

