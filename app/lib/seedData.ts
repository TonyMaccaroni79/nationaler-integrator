import { serverSupabase } from './serverSupabase.js'

const SECTORS = [
  { name: 'cement', description: 'Cement production and clinker substitution projects.', dmrv_requirements: ['Facility boundary evidence', 'Fuel mix data', 'Clinker ratio records', 'Meter calibration logs'] },
  { name: 'steel', description: 'Steel route transition and process efficiency projects.', dmrv_requirements: ['Process route declaration', 'Input-output mass balance', 'Energy ledger', 'Emission factor file'] },
  { name: 'energy', description: 'Grid and generation decarbonization projects.', dmrv_requirements: ['Metered generation', 'Grid interaction records', 'Fuel lifecycle statements', 'Timestamped operation logs'] },
  { name: 'agriculture', description: 'Soil and farm-practice carbon interventions.', dmrv_requirements: ['Baseline method', 'Activity evidence', 'Sampling plan', 'Leakage note'] },
  { name: 'forestry', description: 'Afforestation, reforestation, and forest management projects.', dmrv_requirements: ['Parcel boundary', 'Biomass method', 'Monitoring plan', 'Reversal risk register'] },
  { name: 'waste', description: 'Methane capture and waste-treatment projects.', dmrv_requirements: ['Waste stream definition', 'Capture meter data', 'Downtime records', 'Destruction efficiency'] },
  { name: 'logistics', description: 'Fleet and logistics efficiency projects.', dmrv_requirements: ['Fleet inventory', 'Fuel records', 'Distance telematics', 'Methodology boundary'] },
]

const EXAMPLE_NAMES = [
  'Holcim - Klinkerfaktor-Reduktion 2026',
  'RWA - Humusaufbau Pilotregion Marchfeld',
  'Verbund - Biomasse Effizienzsteigerung 2026',
]

const PROJECTS = [
  {
    name: 'Holcim - Klinkerfaktor-Reduktion 2026',
    sectorName: 'cement',
    dmrv_data: { co2_reduction_tons: 1250, methodology: 'Process optimization', evidence: 'Sensor data + production logs', methodologyId: 'AT-CEMENT-2026-v1', periodStart: '2026-01-01', periodEnd: '2026-12-31', activityData: 1250, evidenceRef: 'storage://evidence/holcim-2026.json', storageYears: 85, reversalBufferPct: 12, permanenceScore: 65, monitoringStrength: 'standard' },
    permanence_score: 65,
    status: 'minted' as const,
    token_id: 'AT-CEMENT-2026-001-HLCM',
  },
  {
    name: 'RWA - Humusaufbau Pilotregion Marchfeld',
    sectorName: 'agriculture',
    dmrv_data: { soil_carbon_increase_tons: 42, methodology: 'Soil carbon sampling + Sentinel-2 NDVI', evidence: 'Lab samples + satellite data', methodologyId: 'AT-AGRI-2026-v1', periodStart: '2026-01-01', periodEnd: '2026-12-31', activityData: 42, evidenceRef: 'storage://evidence/rwa-humus-2026.json', storageYears: 120, reversalBufferPct: 18, permanenceScore: 82, monitoringStrength: 'enhanced' },
    permanence_score: 82,
    status: 'minted' as const,
    token_id: 'AT-AGRI-2026-014-RWA-HUMUS',
  },
  {
    name: 'Verbund - Biomasse Effizienzsteigerung 2026',
    sectorName: 'energy',
    dmrv_data: { co2e_reduction_tons: 780, methodology: 'Combustion efficiency monitoring', evidence: 'IoT sensor data', methodologyId: 'AT-ENERGY-2026-v1', periodStart: '2026-01-01', periodEnd: '2026-12-31', activityData: 780, evidenceRef: 'storage://evidence/verbund-bio-2026.json', storageYears: 70, reversalBufferPct: 10, permanenceScore: 58, monitoringStrength: 'standard' },
    permanence_score: 58,
    status: 'minted' as const,
    token_id: 'AT-ENERGY-2026-009-VERBUND-BIO',
  },
]

export async function runBootstrap(): Promise<{ projectsCreated: number; error?: string }> {
  const sb = serverSupabase

  for (const sector of SECTORS) {
    const { error } = await sb.from('sectors').upsert(sector, { onConflict: 'name' })
    if (error) return { projectsCreated: 0, error: `sectors: ${error.message}` }
  }

  const { data: sectors } = await sb.from('sectors').select('id, name')
  if (!sectors?.length) return { projectsCreated: 0, error: 'No sectors found after insert' }

  const sectorById = new Map(sectors.map((s) => [s.name, s.id]))
  let projectsCreated = 0

  for (const proj of PROJECTS) {
    const sectorId = sectorById.get(proj.sectorName)
    if (!sectorId) continue

    const { data: existing } = await sb.from('projects').select('id').eq('name', proj.name).maybeSingle()
    if (existing) continue

    const { data: inserted, error: insertErr } = await sb
      .from('projects')
      .insert({
        sector_id: sectorId,
        name: proj.name,
        dmrv_data: proj.dmrv_data,
        permanence_score: proj.permanence_score,
        status: proj.status,
      })
      .select('id')
      .single()

    if (insertErr) return { projectsCreated, error: `projects: ${insertErr.message}` }
    if (!inserted) continue

    projectsCreated++

    await sb.from('authorizations').upsert({ project_id: inserted.id, authorized: true, reason: 'Authorized' }, { onConflict: 'project_id' })
    await sb.from('tokens').insert({ project_id: inserted.id, token_id: proj.token_id }).then(() => {})
    await sb.from('audit_log').insert({ project_id: inserted.id, action: 'authorize', result: 'authorized: Authorized' }).then(() => {})
    await sb.from('audit_log').insert({ project_id: inserted.id, action: 'mint', result: `minted ${proj.token_id}` }).then(() => {})
  }

  return { projectsCreated }
}

/** Resets example projects to draft state for demo. Deletes existing, recreates fresh. */
export async function runResetDemo(): Promise<{ projectsReset: number; error?: string }> {
  const sb = serverSupabase

  const { data: toDelete } = await sb.from('projects').select('id').in('name', EXAMPLE_NAMES)
  if (toDelete?.length) {
    for (const p of toDelete) {
      const { error } = await sb.from('projects').delete().eq('id', p.id)
      if (error) return { projectsReset: 0, error: `delete: ${error.message}` }
    }
  }

  const { data: sectors } = await sb.from('sectors').select('id, name')
  if (!sectors?.length) return { projectsReset: 0, error: 'No sectors found' }

  const sectorById = new Map(sectors.map((s) => [s.name, s.id]))
  let projectsReset = 0

  for (const proj of PROJECTS) {
    const sectorId = sectorById.get(proj.sectorName)
    if (!sectorId) continue

    const { data: inserted, error: insertErr } = await sb
      .from('projects')
      .insert({
        sector_id: sectorId,
        name: proj.name,
        dmrv_data: proj.dmrv_data,
        permanence_score: null,
        status: 'draft',
      })
      .select('id')
      .single()

    if (insertErr) return { projectsReset, error: `projects: ${insertErr.message}` }
    if (!inserted) continue

    projectsReset++
  }

  return { projectsReset }
}
