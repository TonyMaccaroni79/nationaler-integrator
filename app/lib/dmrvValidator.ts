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

  const requiredFields = ['methodologyId', 'periodStart', 'periodEnd', 'activityData', 'evidenceRef']
  for (const field of requiredFields) {
    if (!(field in record)) issues.push(`Missing required dMRV field: ${field}`)
  }

  const activityData = record.activityData
  if (typeof activityData !== 'number' || Number.isNaN(activityData) || activityData <= 0) {
    issues.push('activityData must be a positive number.')
  }

  const evidenceRef = record.evidenceRef
  if (typeof evidenceRef !== 'string' || evidenceRef.trim().length < 3) {
    issues.push('evidenceRef must be a non-empty string.')
  }

  return { valid: issues.length === 0, issues }
}

