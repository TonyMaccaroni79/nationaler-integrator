import { useAppStore } from './store'

const modules = [
  { title: 'Sector Registry', description: 'Sector definitions and dMRV baselines.', link: '#sectors' },
  { title: 'dMRV Validation', description: 'Validation of monitoring and reporting payloads.', link: '#dmrv' },
  { title: 'Governance Authorization', description: 'Eligibility checks and authorization decisions.', link: '#governance' },
  { title: 'Permanence & Risk', description: 'Permanence score model integrated in authorization.', link: '#governance' },
  { title: 'Minting (Xange Layer)', description: 'Authorized issuance request and mock token output.', link: '#mint' },
  { title: 'Audit Trail', description: 'Transparent event log for oversight and assurance.', link: '#audit' },
]

export function Dashboard() {
  const { state, actions } = useAppStore()

  return (
    <div className="stack">
      <section className="panel">
        <h2>National Integrator Dashboard</h2>
        <p className="subtle">
          Demonstrates a sovereign national CO₂ governance flow for BMLUK: registry → validation
          → authorization → issuance → audit.
        </p>
        <div className="row" style={{ marginTop: 10 }}>
          <span className="badge">User: {state.userEmail ?? 'not signed in'}</span>
          <span className="badge">Role: {state.role ?? 'none'}</span>
        </div>
      </section>

      <section className="panel">
        <div className="row" style={{ gap: 10 }}>
          <button type="button" onClick={() => (window.location.hash = '#process-flow')}>
            Show process chain
          </button>
          <button type="button" onClick={() => (window.location.hash = '#green-finance')}>
            Green Finance
          </button>
        </div>
      </section>

      <section className="grid">
        {modules.map((module) => (
          <a key={module.title} href={module.link} className="panel col-6">
            <h3>{module.title}</h3>
            <p className="subtle">{module.description}</p>
          </a>
        ))}
      </section>

      <section className="panel">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h3>Project statuses</h3>
          <div className="row">
            {state.role === 'ministry' ? (
              <>
                <button onClick={() => void actions.runBootstrap()}>Add example projects</button>
                <button onClick={() => void actions.runResetDemo()}>Reset demo</button>
              </>
            ) : null}
            <button onClick={() => void actions.reloadCoreData()}>Refresh</button>
          </div>
          {state.role === 'ministry' ? (
            <p className="subtle" style={{ fontSize: 12, marginTop: 8 }}>
              Reset demo: sets example projects back to draft so you can demonstrate authorize → mint again.
            </p>
          ) : null}
        </div>
        {state.loading ? (
          <p className="subtle">Loading projects…</p>
        ) : state.error ? (
          <p className="subtle">
            <span className="badge danger">{state.error}</span>
          </p>
        ) : state.projects.length === 0 ? (
          <p className="subtle">
            No projects available. Run <code>supabase/schema.sql</code> and <code>supabase/seed.sql</code> in
            Supabase SQL Editor, or click &quot;Add example projects&quot; above (ministry only).
          </p>
        ) : (
          <div className="row">
            {state.projects.map((project) => (
              <span key={project.id} className="badge">
                {project.name}: {project.status}
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

