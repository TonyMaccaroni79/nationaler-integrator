# National Integrator (Austria Article-6 Prototype)

Minimal full-stack prototype for a sovereign CO2 governance platform:

- Sector registry integration
- dMRV validation
- Governance authorization
- Minting (Xange mock)
- Audit trail
- Supabase Auth + RBAC (`ministry` and `auditor`)
- Admin screen (user list + role change)

Deployment targets:

- **Supabase** (database, auth, storage)
- **Vercel** (frontend + serverless APIs)
- **GitHub** (clean project structure)
- **NDC / ITMO** ([`app/lib/ndcModel.ts`](app/lib/ndcModel.ts), [`app/lib/itmoAuthorization.ts`](app/lib/itmoAuthorization.ts), [`app/api/itmo-details`](app/api/itmo-details.ts))
- **Additional UI**: Process chain (9 steps), Green Finance, Asset usage, ITMO & NDC (`#itmo`)

## Live demo checklist (Vercel + Supabase)

Before presenting:

1. **Vercel env vars** (Production): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — all set and matching the same Supabase project.
2. **Supabase SQL**: Run [`supabase/schema.sql`](supabase/schema.sql) (includes NDC/ITMO tables; or run the full migration set including [`supabase/migrations/20260320000000_ndc_itmo_tables.sql`](supabase/migrations/20260320000000_ndc_itmo_tables.sql)).
3. **Users**: At least one user with `profiles.role = ministry` for authorize, mint, bootstrap, and ITMO persistence; optional `auditor` for read-only paths.
4. **Data**: Example projects via [`supabase/seed.sql`](supabase/seed.sql) or Dashboard **Add example projects** (ministry).
5. **Browser**: Hard refresh (e.g. Cmd+Shift+R) so the latest frontend loads.

### Suggested demo flow (moderator)

1. **Reset demo** (ministry) — projects back to `draft` for authorize → mint.  
2. **Process chain** — end-to-end narrative.  
3. **dMRV Validation** — sample payload.  
4. **Governance Authorization** — submit request; note governance + ITMO/NDC summary.  
5. **Governance details** — full calculation.  
6. **Minting** — after authorization.  
7. **Audit trail** — traceability.  
8. **ITMO & NDC** — NDC linkage (ministry and auditor can view).  
9. **Green Finance** / **Asset usage** — downstream narrative.

Optional URL hint for screen shares: append `?demo=1` to show a prototype banner in the app.

### Live demo troubleshooting

| Symptom | Likely cause |
| -------- | ------------- |
| API returns non-JSON / “Unexpected token” | Missing or wrong `SUPABASE_*` on Vercel; redeploy after fixing env. |
| 401 on APIs | Not signed in or expired session; sign in again. |
| 403 on authorize / mint | User is `auditor`; use a `ministry` account. |
| 403 on ITMO details | Should not occur if schema is current — ITMO details allow any authenticated role. |
| Empty projects | Run `schema.sql` + `seed.sql` or **Add example projects**. |
| SQL errors on new tables | Run latest `schema.sql` or NDC/ITMO migration once. |

## Repository structure

```text
/app
  /api
  /ui
  /lib
  /types
/supabase
  schema.sql
  seed.sql
README.md
vercel.json
package.json
tsconfig.json
```

## Architecture

- **UI (`app/ui`)**: React + TypeScript SPA, neutral institutional styling, auth panel and role indicator.
- **API (`app/api`)**: Vercel serverless functions for validation, authorization, minting, audit.
- **Domain modules (`app/lib`)**:
  - `dmrvValidator.ts`
  - `permanenceModel.ts`
  - `governance.ts`
  - `registryMock.ts`
  - `audit.ts`
  - `authz.ts` (token + role enforcement)
  - `admin.ts` (admin user list + role updates)
- **Data (`supabase`)**:
  - `schema.sql` tables + RLS policies + profile trigger
  - `seed.sql` sector and Austrian example records

## Preloaded example projects

After running `schema.sql` and `seed.sql`, the database contains three preloaded projects:

1. **Holcim - Klinkerfaktor-Reduktion 2026**
   - Sector: `cement`
   - Permanence score: `65`
   - Authorized: `true`
   - Token: `AT-CEMENT-2026-001-HLCM`
2. **RWA - Humusaufbau Pilotregion Marchfeld**
   - Sector: `agriculture`
   - Permanence score: `82`
   - Authorized: `true`
   - Token: `AT-AGRI-2026-014-RWA-HUMUS`
3. **Verbund - Biomasse Effizienzsteigerung 2026**
   - Sector: `energy`
   - Permanence score: `58`
   - Authorized: `true`
   - Token: `AT-ENERGY-2026-009-VERBUND-BIO`

For each project, `seed.sql` also inserts audit entries for both authorization and minting.

## Supabase setup

1. Create a Supabase project.
2. Run SQL scripts in order (mandatory):
   1. `supabase/schema.sql`
   2. `supabase/seed.sql`
3. In Supabase Authentication, create users (example):
   - `ministry@bmluk.gv.at`
   - `auditor@bmluk.gv.at`
4. Assign roles in `profiles` table:
   - `ministry` for ministry operators
   - `auditor` for oversight users

`schema.sql` includes:

- `profiles` table with role check constraint
- trigger for automatic profile creation on sign-up
- RLS policies where only `ministry` can authorize/mint (write paths)
- policy for ministry to read all profiles for admin operations

## Supabase re-run (non-technical, step by step)

You can keep your existing Supabase project. Deleting it is not required.

### Option A: keep the current project (recommended)

1. Open [Supabase](https://supabase.com), sign in, open your project.
2. Click **SQL Editor** in the left menu.
3. Click **New query**.
4. Open local file `supabase/schema.sql`, copy all text, paste in SQL Editor.
5. Click **Run**.
6. Click **New query** again.
7. Open local file `supabase/seed.sql`, copy all text, paste in SQL Editor.
8. Click **Run**.
9. Open **Authentication** -> **Users**.
10. Create users (if not present):
    - `ministry@bmluk.gv.at`
    - `auditor@bmluk.gv.at`
11. Open **Table Editor** -> `profiles`.
12. Check and set roles:
    - ministry account -> `ministry`
    - auditor account -> `auditor`
13. Start the app with `npm run dev`, sign in, and test both roles.

### Option B: start fully clean (optional)

1. Create a new Supabase project.
2. Repeat steps from Option A.
3. Update `.env` values for the new project URL/keys.

### Supabase CLI (optional, for automated setup)

1. Create an access token at [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens).
2. Run:
   ```bash
   export SUPABASE_ACCESS_TOKEN=your_token
   npm run supabase:setup
   ```
   This links the project, pushes the schema, and runs the seed.

### Verification

After running `schema.sql` and `seed.sql` (or `npm run supabase:setup`), verify in Supabase SQL Editor:

```sql
SELECT COUNT(*) FROM projects;  -- Expected: 3
SELECT name, status FROM projects ORDER BY name;
```

### Troubleshooting

- If SQL says object already exists, run the scripts in the same order again (the schema is mostly idempotent).
- If a user can sign in but has no role, check `profiles` table for that user ID/email.
- If Admin screen is missing, log in with a user whose `profiles.role` is `ministry`.
- **No projects on Dashboard:** Run `schema.sql` first in Supabase SQL Editor. Then either run `seed.sql` or, as ministry user, click **Bootstrap example projects** on the Dashboard to create the three example projects via API.

## Data & Privacy (GDPR / DSGVO)

The application processes personal and project data. For GDPR compliance:

### Data flow

- **User accounts:** Email, auth tokens — stored in Supabase Auth
- **Profiles:** Role (ministry/auditor) — stored in Supabase `profiles` table
- **Projects:** Names, dMRV data, permanence scores — Supabase `projects` table
- **Audit log:** Actions, timestamps, results — Supabase `audit_log` table
- **Authorizations, tokens:** Supabase tables

Frontend and API requests are served via Vercel; database and auth via Supabase.

### EU hosting

- **Supabase:** Create the project in an EU region (e.g. Frankfurt) in the Supabase dashboard
- **Vercel:** Set function region to `eu-central-1` (Frankfurt) or `eu-west-1` in project settings

### GDPR measures in this prototype

- Row Level Security (RLS) restricts data access by role
- Role-based access: only `ministry` can authorize/mint; `auditor` has read-only access
- This is a prototype for demonstration; no productive use of personal data is intended

### For production use

- Data Processing Agreement (DPA) with Supabase; review Vercel DPA
- Privacy impact assessment (Datenschutz-Folgenabschätzung) if required
- Define retention periods and deletion procedures for audit log and project data
- dMRV data may contain business secrets — access control via RLS is in place

The application includes a **Data protection** page (`#privacy`) with a summary of processed data, purpose, third-party services, and user rights.

## Environment variables

Create `.env` (or copy from `.env.example`):

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

- `VITE_*`: frontend client connection
- `SUPABASE_*`: serverless API connection

## RBAC behavior

- **auditor**
  - can view dashboards and audit data
  - can run dMRV validation
  - cannot authorize or mint
- **ministry**
  - full workflow access including authorization and minting
  - can access Admin screen to list users and update roles

APIs enforce bearer-token authentication; `authorize` and `mint` enforce `ministry` role.

## Local run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

Quality checks:

```bash
npm run lint
npm run build
```

## Vercel deployment

1. Push repository to GitHub.
2. Import project in Vercel.
3. Add env vars (Production, Preview, Development):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy.

`vercel.json` configures API rewrites and function runtime.

## GitHub bootstrap

```bash
git init
git add .
git commit -m "National Integrator prototype with RBAC"
git branch -M main
git remote add origin <repo-url>
git push -u origin main
```

## Governance flow implemented

- **dMRV validation**: `POST /api/validate-dmrv` validates payloads and returns `valid` + `issues`.
- **Modular governance**: [`app/lib/models/`](app/lib/models/), config in [`app/config/`](app/config/).
- **Authorization**: `POST /api/authorize` runs governance pipeline, NDC/ITMO pipeline, persists `itmo_authorizations` and `corresponding_adjustments` (when DB tables exist), returns `governance` and `ndcItmo` in the JSON body.
- **ITMO preview**: `GET /api/itmo-details?projectId=` — any authenticated user (`ministry` or `auditor`).
- **Minting**: `POST /api/mint` only proceeds for authorized projects, then records token issuance.
- **Audit**: `POST /api/audit` returns timestamped audit records with authorization result, permanence, and dMRV validity.

## Sovereign governance alignment

- **Traceable chain**: project -> validation -> authorization -> minting -> audit
- **Role separation**: ministry operations separated from auditor oversight
- **Policy modularity**: validator, permanence model, governance logic isolated in `/app/lib`
- **Registry readiness**: minting abstracted for later sovereign registry integration

## Path to production (from this prototype)

This section is **non-legal guidance** for planning. Production use of Article 6, ITMOs, NDC accounting, and market-facing instruments requires **institutional decisions, contracts, and counsel**—not only code changes.

### Do you need to throw away the repo?

| Area | Typical approach |
|------|------------------|
| **Codebase** | **Evolve**, don’t necessarily restart: the governance-chain idea and modular config stay useful. Expect **major rewrites** of registry linkage, ITMO state machines, and inventory integration. |
| **Law & governance** | **New formalization**: mandates, authorizations, cooperative approaches with partner states, administrative procedure—not implemented by this app alone. |
| **Stack (Vercel + Supabase)** | **May remain** after risk assessment, DPA, and EU-hosting requirements; some public-sector setups require **different hosting** (other cloud or on-prem). |
| **Demo logic** | **Replace** simplified NDC/ITMO models with rules agreed with inventory/Article 6 units; demo seed data is not production data. |

### 1. Legal & institutional

- Clarify **which authority** authorizes what (Article 6.2 cooperative approaches vs other channels); internal responsibilities and **administrative acts** where required.
- **Bilateral or multilateral agreements** before productive ITMO transfers.
- Align with **NDC and national GHG inventory** (who books what, when); **corresponding adjustments** must tie to real inventory processes—not only DB mock fields.
- **Data protection**: DPA, TOM, retention/deletion; dMRV may include **trade secrets**.
- **Financial markets**: If instruments are marketed to investors or resemble securities, involve **financial regulation** (e.g. MiCA, prospectus rules, national law)—“digital commodity” is not a universal legal category.
- **Liability & insurance** for miscounting, double counting, or wrongful authorization.

### 2. Article 6 & ITMO granularity (product vs prototype)

- Full **ITMO lifecycle**: state authorization, **unique identifiers**, registry records, **first transfer**, transfer chain, no double counting.
- **Corresponding adjustments** integrated with the **official inventory system**, not only `corresponding_adjustments` table semantics.
- Distinguish **Article 6.2 vs 6.4** (and other tools) and scope the product accordingly.
- **Methodology / baseline governance**: versioned rules, accredited validation where required, dispute and reversal/correction processes.

### 3. Technical architecture

- **Authoritative workflow**: consider stronger patterns (event log, workflow engine) for state transitions that must be audit-proof.
- **Real registry APIs** replacing mock minting / internal `tokens` only where appropriate to national design.
- **Identity & access**: e-government ID, mTLS, segregated environments, key management (HSM for high assurance).
- **Availability & DR**: backups, failover, RTO/RPO suitable for an agency.
- **Observability**: structured audit of *who* triggered *which* transition; API versioning and **idempotency** for external integrations.

### 4. Data & security

- Migration discipline; **RLS** and optional column-level protection for sensitive payloads.
- **Service role keys** only on server; never in the browser.
- Documented **retention** aligned with law.

### 5. Process & quality

- **Four-eyes** or similar controls for production authorization where policy requires it.
- Load tests, security testing, acceptance with domain experts.
- Operator training and **incident runbooks**.

### 6. Green Finance / EU Taxonomy

- Treat **separately** from Article 6 ITMO plumbing: taxonomy and CSRD readiness usually need **dedicated assessments or partner bank workflows**, not implied by “minted” alone.
- Exports/reports for due diligence may matter more than extra UI labels.

For a **live demonstration** of the current build, see **Live demo checklist** and **Suggested demo flow** earlier in this README.

