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
  const { state } = useAppStore()

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

      <section className="grid">
        {modules.map((module) => (
          <a key={module.title} href={module.link} className="panel col-6">
            <h3>{module.title}</h3>
            <p className="subtle">{module.description}</p>
          </a>
        ))}
      </section>

      <section className="panel">
        <h3>Project statuses</h3>
        {state.projects.length === 0 ? (
          <p className="subtle">No projects available in Supabase yet.</p>
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

