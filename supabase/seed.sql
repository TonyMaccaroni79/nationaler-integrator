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
  'Demo Forestry Pilot',
  jsonb_build_object(
    'methodologyId', 'AT-FOREST-2026-v1',
    'periodStart', '2026-01-01',
    'periodEnd', '2026-03-31',
    'activityData', 1250.7,
    'evidenceRef', 'storage://reports/forestry-pilot-q1.pdf',
    'storageYears', 100,
    'reversalBufferPct', 15,
    'monitoringStrength', 'standard'
  ),
  null,
  'draft'
from sectors s
where s.name = 'forestry'
and not exists (
  select 1 from projects p where p.name = 'Demo Forestry Pilot'
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

