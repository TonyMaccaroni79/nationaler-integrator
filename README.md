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
- **Permanence model**: `app/lib/permanenceModel.ts` computes risk-adjusted permanence for authorization.
- **Authorization**: `POST /api/authorize` combines dMRV validity, permanence, and sector eligibility.
- **Minting**: `POST /api/mint` only proceeds for authorized projects, then records token issuance.
- **Audit**: `POST /api/audit` returns timestamped audit records with authorization result, permanence, and dMRV validity.

## Sovereign governance alignment

- **Traceable chain**: project -> validation -> authorization -> minting -> audit
- **Role separation**: ministry operations separated from auditor oversight
- **Policy modularity**: validator, permanence model, governance logic isolated in `/app/lib`
- **Registry readiness**: minting abstracted for later sovereign registry integration

