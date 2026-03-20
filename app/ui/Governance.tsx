import { useMemo, useState } from 'react'
import { useAppStore } from './store'

export function Governance() {
  const { state, actions } = useAppStore()
  const [projectId, setProjectId] = useState<string>('')
  const canAuthorize = state.role === 'ministry'

  const selectedProject = useMemo(
    () => state.projects.find((project) => project.id === (projectId || state.selectedProjectId)),
    [projectId, state.projects, state.selectedProjectId],
  )

  return (
    <div className="stack">
      <section className="panel">
        <h2>Governance Authorization</h2>
        <p className="subtle">
          Submit a project for policy checks (dMRV validity, permanence score and sector
          eligibility).
        </p>
      </section>

      <section className="grid">
        <div className="panel col-8">
          <div className="stack">
            <label className="label" htmlFor="project-select">
              Select project
            </label>
            <select
              id="project-select"
              value={projectId || state.selectedProjectId || ''}
              onChange={(event) => {
                const value = event.target.value
                setProjectId(value)
                actions.setSelectedProjectId(value)
              }}
            >
              {state.projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.status})
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                const candidate = projectId || state.selectedProjectId
                if (candidate) void actions.runAuthorization(candidate)
              }}
              disabled={!state.projects.length || !canAuthorize}
            >
              Submit Authorization Request
            </button>
            {!canAuthorize ? (
              <span className="badge danger">Only ministry role can authorize projects.</span>
            ) : null}
            {state.error ? <span className="badge danger">{state.error}</span> : null}
            {state.authorization?.persistenceWarnings?.length ? (
              <div className="stack" style={{ gap: 6 }}>
                {state.authorization.persistenceWarnings.map((w) => (
                  <span key={w} className="badge warn" style={{ whiteSpace: 'normal', textAlign: 'left' }}>
                    {w}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="panel col-4">
          <h3>Authorization Result</h3>
          {!state.authorization ? (
            <p className="subtle">No authorization result yet.</p>
          ) : (
            <div className="stack">
              <span className={`badge ${state.authorization.authorized ? 'ok' : 'danger'}`}>
                {state.authorization.authorized ? 'authorized' : 'not authorized'}
              </span>
              <p className="subtle">{state.authorization.reason ?? 'No reason provided.'}</p>
              {state.authorization.persistenceWarnings?.length ? (
                <div className="stack" style={{ gap: 6, marginTop: 8 }}>
                  {state.authorization.persistenceWarnings.map((w) => (
                    <span key={w} className="badge warn" style={{ whiteSpace: 'normal', fontSize: 12 }}>
                      {w}
                    </span>
                  ))}
                </div>
              ) : null}
              {state.authorization.ndcItmo ? (
                <div className="stack" style={{ marginTop: 12 }}>
                  <h4 style={{ margin: 0, fontSize: 13, color: 'var(--accent)' }}>ITMO &amp; NDC</h4>
                  <p className="subtle" style={{ fontSize: 12 }}>
                    <span className={state.authorization.ndcItmo.itmoEligible ? 'badge ok' : 'badge danger'}>
                      {state.authorization.ndcItmo.itmoEligible ? 'ITMO eligible' : 'ITMO not eligible'}
                    </span>
                  </p>
                  <ul className="subtle" style={{ fontSize: 12, margin: 0, paddingLeft: 18 }}>
                    <li>NDC compatible: {state.authorization.ndcItmo.ndcCompatible ? 'yes' : 'no'}</li>
                    <li>Max ITMO export: {state.authorization.ndcItmo.maxITMOExport.toFixed(2)} t CO₂e</li>
                    <li>Authorization type: {state.authorization.ndcItmo.authorizationType}</li>
                    <li>
                      Adjustment:{' '}
                      {state.authorization.ndcItmo.adjustmentApplied ? 'applied' : 'not applied'} (
                      {state.authorization.ndcItmo.adjustmentAmount.toFixed(2)} t,{' '}
                      {state.authorization.ndcItmo.adjustmentYear})
                    </li>
                  </ul>
                  <a href="#itmo" style={{ fontSize: 12 }}>
                    Open full ITMO &amp; NDC screen →
                  </a>
                </div>
              ) : null}
            </div>
          )}
          {selectedProject ? (
            <>
              <p className="subtle" style={{ marginTop: 12 }}>
                Permanence score: {selectedProject.permanence_score ?? '—'}
              </p>
              <a
                href={`#governance-details?projectId=${selectedProject.id}`}
                style={{ marginTop: 8, display: 'inline-block' }}
              >
                View full governance details →
              </a>
            </>
          ) : null}
        </div>
      </section>
    </div>
  )
}

