insert into sectors (name, description, dmrv_requirements)
values
  (
    'cement',
    'Cement production and clinker substitution projects.',
    '["Facility boundary evidence", "Fuel mix data", "Clinker ratio records", "Meter calibration logs"]'::jsonb
  ),
  (
    'steel',
    'Steel route transition and process efficiency projects.',
    '["Process route declaration", "Input-output mass balance", "Energy ledger", "Emission factor file"]'::jsonb
  ),
  (
    'energy',
    'Grid and generation decarbonization projects.',
    '["Metered generation", "Grid interaction records", "Fuel lifecycle statements", "Timestamped operation logs"]'::jsonb
  ),
  (
    'agriculture',
    'Soil and farm-practice carbon interventions.',
    '["Baseline method", "Activity evidence", "Sampling plan", "Leakage note"]'::jsonb
  ),
  (
    'forestry',
    'Afforestation, reforestation, and forest management projects.',
    '["Parcel boundary", "Biomass method", "Monitoring plan", "Reversal risk register"]'::jsonb
  ),
  (
    'waste',
    'Methane capture and waste-treatment projects.',
    '["Waste stream definition", "Capture meter data", "Downtime records", "Destruction efficiency"]'::jsonb
  ),
  (
    'logistics',
    'Fleet and logistics efficiency projects.',
    '["Fleet inventory", "Fuel records", "Distance telematics", "Methodology boundary"]'::jsonb
  )
on conflict (name) do update
set
  description = excluded.description,
  dmrv_requirements = excluded.dmrv_requirements;

insert into projects (sector_id, name, dmrv_data, permanence_score, status)
select
  s.id,
  'Holcim - Klinkerfaktor-Reduktion 2026',
  jsonb_build_object(
    'co2_reduction_tons', 1250,
    'methodology', 'Process optimization',
    'evidence', 'Sensor data + production logs',
    'methodologyId', 'AT-CEMENT-2026-v1',
    'periodStart', '2026-01-01',
    'periodEnd', '2026-12-31',
    'activityData', 1250,
    'evidenceRef', 'storage://evidence/holcim-2026.json',
    'storageYears', 85,
    'reversalBufferPct', 12,
    'permanenceScore', 65,
    'monitoringStrength', 'standard'
  ),
  65,
  'minted'
from sectors s
where s.name = 'cement'
and not exists (
  select 1 from projects p where p.name = 'Holcim - Klinkerfaktor-Reduktion 2026'
);

insert into projects (sector_id, name, dmrv_data, permanence_score, status)
select
  s.id,
  'RWA - Humusaufbau Pilotregion Marchfeld',
  jsonb_build_object(
    'soil_carbon_increase_tons', 42,
    'methodology', 'Soil carbon sampling + Sentinel-2 NDVI',
    'evidence', 'Lab samples + satellite data',
    'methodologyId', 'AT-AGRI-2026-v1',
    'periodStart', '2026-01-01',
    'periodEnd', '2026-12-31',
    'activityData', 42,
    'evidenceRef', 'storage://evidence/rwa-humus-2026.json',
    'storageYears', 120,
    'reversalBufferPct', 18,
    'permanenceScore', 82,
    'monitoringStrength', 'enhanced'
  ),
  82,
  'minted'
from sectors s
where s.name = 'agriculture'
and not exists (
  select 1 from projects p where p.name = 'RWA - Humusaufbau Pilotregion Marchfeld'
);

insert into projects (sector_id, name, dmrv_data, permanence_score, status)
select
  s.id,
  'Verbund - Biomasse Effizienzsteigerung 2026',
  jsonb_build_object(
    'co2e_reduction_tons', 780,
    'methodology', 'Combustion efficiency monitoring',
    'evidence', 'IoT sensor data',
    'methodologyId', 'AT-ENERGY-2026-v1',
    'periodStart', '2026-01-01',
    'periodEnd', '2026-12-31',
    'activityData', 780,
    'evidenceRef', 'storage://evidence/verbund-bio-2026.json',
    'storageYears', 70,
    'reversalBufferPct', 10,
    'permanenceScore', 58,
    'monitoringStrength', 'standard'
  ),
  58,
  'minted'
from sectors s
where s.name = 'energy'
and not exists (
  select 1 from projects p where p.name = 'Verbund - Biomasse Effizienzsteigerung 2026'
);

-- Keep seeded projects deterministic across re-runs.
update projects p
set
  sector_id = s.id,
  dmrv_data = jsonb_build_object(
    'co2_reduction_tons', 1250,
    'methodology', 'Process optimization',
    'evidence', 'Sensor data + production logs',
    'methodologyId', 'AT-CEMENT-2026-v1',
    'periodStart', '2026-01-01',
    'periodEnd', '2026-12-31',
    'activityData', 1250,
    'evidenceRef', 'storage://evidence/holcim-2026.json',
    'storageYears', 85,
    'reversalBufferPct', 12,
    'permanenceScore', 65,
    'monitoringStrength', 'standard'
  ),
  permanence_score = 65,
  status = 'minted'
from sectors s
where p.name = 'Holcim - Klinkerfaktor-Reduktion 2026'
and s.name = 'cement';

update projects p
set
  sector_id = s.id,
  dmrv_data = jsonb_build_object(
    'soil_carbon_increase_tons', 42,
    'methodology', 'Soil carbon sampling + Sentinel-2 NDVI',
    'evidence', 'Lab samples + satellite data',
    'methodologyId', 'AT-AGRI-2026-v1',
    'periodStart', '2026-01-01',
    'periodEnd', '2026-12-31',
    'activityData', 42,
    'evidenceRef', 'storage://evidence/rwa-humus-2026.json',
    'storageYears', 120,
    'reversalBufferPct', 18,
    'permanenceScore', 82,
    'monitoringStrength', 'enhanced'
  ),
  permanence_score = 82,
  status = 'minted'
from sectors s
where p.name = 'RWA - Humusaufbau Pilotregion Marchfeld'
and s.name = 'agriculture';

update projects p
set
  sector_id = s.id,
  dmrv_data = jsonb_build_object(
    'co2e_reduction_tons', 780,
    'methodology', 'Combustion efficiency monitoring',
    'evidence', 'IoT sensor data',
    'methodologyId', 'AT-ENERGY-2026-v1',
    'periodStart', '2026-01-01',
    'periodEnd', '2026-12-31',
    'activityData', 780,
    'evidenceRef', 'storage://evidence/verbund-bio-2026.json',
    'storageYears', 70,
    'reversalBufferPct', 10,
    'permanenceScore', 58,
    'monitoringStrength', 'standard'
  ),
  permanence_score = 58,
  status = 'minted'
from sectors s
where p.name = 'Verbund - Biomasse Effizienzsteigerung 2026'
and s.name = 'energy';

insert into authorizations (project_id, authorized, reason)
select p.id, true, 'Authorized'
from projects p
where p.name in (
  'Holcim - Klinkerfaktor-Reduktion 2026',
  'RWA - Humusaufbau Pilotregion Marchfeld',
  'Verbund - Biomasse Effizienzsteigerung 2026'
)
on conflict (project_id) do update
set
  authorized = excluded.authorized,
  reason = excluded.reason;

insert into tokens (project_id, token_id)
select p.id, 'AT-CEMENT-2026-001-HLCM'
from projects p
where p.name = 'Holcim - Klinkerfaktor-Reduktion 2026'
and not exists (
  select 1 from tokens t where t.project_id = p.id or t.token_id = 'AT-CEMENT-2026-001-HLCM'
);

insert into tokens (project_id, token_id)
select p.id, 'AT-AGRI-2026-014-RWA-HUMUS'
from projects p
where p.name = 'RWA - Humusaufbau Pilotregion Marchfeld'
and not exists (
  select 1 from tokens t where t.project_id = p.id or t.token_id = 'AT-AGRI-2026-014-RWA-HUMUS'
);

insert into tokens (project_id, token_id)
select p.id, 'AT-ENERGY-2026-009-VERBUND-BIO'
from projects p
where p.name = 'Verbund - Biomasse Effizienzsteigerung 2026'
and not exists (
  select 1 from tokens t where t.project_id = p.id or t.token_id = 'AT-ENERGY-2026-009-VERBUND-BIO'
);

insert into audit_log (project_id, action, result)
select p.id, 'authorize', 'authorized: Authorized'
from projects p
where p.name in (
  'Holcim - Klinkerfaktor-Reduktion 2026',
  'RWA - Humusaufbau Pilotregion Marchfeld',
  'Verbund - Biomasse Effizienzsteigerung 2026'
)
and not exists (
  select 1 from audit_log a
  where a.project_id = p.id
    and a.action = 'authorize'
    and a.result = 'authorized: Authorized'
);

insert into audit_log (project_id, action, result)
select p.id, 'mint', 'minted AT-CEMENT-2026-001-HLCM'
from projects p
where p.name = 'Holcim - Klinkerfaktor-Reduktion 2026'
and not exists (
  select 1 from audit_log a
  where a.project_id = p.id
    and a.action = 'mint'
    and a.result = 'minted AT-CEMENT-2026-001-HLCM'
);

insert into audit_log (project_id, action, result)
select p.id, 'mint', 'minted AT-AGRI-2026-014-RWA-HUMUS'
from projects p
where p.name = 'RWA - Humusaufbau Pilotregion Marchfeld'
and not exists (
  select 1 from audit_log a
  where a.project_id = p.id
    and a.action = 'mint'
    and a.result = 'minted AT-AGRI-2026-014-RWA-HUMUS'
);

insert into audit_log (project_id, action, result)
select p.id, 'mint', 'minted AT-ENERGY-2026-009-VERBUND-BIO'
from projects p
where p.name = 'Verbund - Biomasse Effizienzsteigerung 2026'
and not exists (
  select 1 from audit_log a
  where a.project_id = p.id
    and a.action = 'mint'
    and a.result = 'minted AT-ENERGY-2026-009-VERBUND-BIO'
);

-- Optional RBAC bootstrap: if these users exist in Supabase Auth, map roles.
update profiles
set role = 'ministry'
where id in (
  select id from auth.users where email in ('ministry@bmluk.gv.at')
);

update profiles
set role = 'auditor'
where id in (
  select id from auth.users where email in ('auditor@bmluk.gv.at')
);

