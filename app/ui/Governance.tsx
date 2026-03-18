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
            </div>
          )}
          {selectedProject ? (
            <p className="subtle" style={{ marginTop: 12 }}>
              Permanence score: {selectedProject.permanence_score ?? '—'}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  )
}

