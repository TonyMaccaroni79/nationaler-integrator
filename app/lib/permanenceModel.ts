import type { JsonValue } from '../types'

export function calculatePermanenceScore(dmrvData: JsonValue): number {
  // Prototype scoring model. In production this should become a calibrated,
  // sector-aware model with documented assumptions and regulatory versioning.
  if (typeof dmrvData !== 'object' || dmrvData === null || Array.isArray(dmrvData)) return 0

  const record = dmrvData as Record<string, JsonValue>
  const storageYears = Number(record.storageYears ?? 0)
  const reversalBufferPct = Number(record.reversalBufferPct ?? 0)
  const monitoringStrength = String(record.monitoringStrength ?? 'standard')

  const yearsScore = Math.min(60, Math.max(0, (storageYears / 100) * 60))
  const bufferScore = Math.min(30, Math.max(0, (reversalBufferPct / 20) * 30))
  const monitorScore = monitoringStrength === 'enhanced' ? 10 : monitoringStrength === 'standard' ? 7 : 4

  return Math.round(Math.min(100, yearsScore + bufferScore + monitorScore))
}

