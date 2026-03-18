import { useState } from 'react'
import { useAppStore } from './store'

export function Mint() {
  const { state, actions } = useAppStore()
  const [projectId, setProjectId] = useState<string>(state.selectedProjectId ?? '')

  const selectedProject = state.projects.find((project) => project.id === (projectId || state.selectedProjectId))
  const selectedAuth =
    state.authorization?.authorized ?? (selectedProject?.status === 'authorized' || selectedProject?.status === 'minted')
  const canMintByRole = state.role === 'ministry'

  return (
    <div className="stack">
      <section className="panel">
        <h2>Minting (Xange Layer Mock)</h2>
        <p className="subtle">
          Request minting only after successful authorization. This endpoint generates a mock
          tokenId and records an audit event.
        </p>
      </section>

      <section className="grid">
        <div className="panel col-8">
          <label className="label" htmlFor="mint-project-select">
            Project
          </label>
          <select
            id="mint-project-select"
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

          <div className="row" style={{ marginTop: 12 }}>
            <button
              disabled={!selectedAuth || !canMintByRole}
              onClick={() => {
                const candidate = projectId || state.selectedProjectId
                if (candidate) void actions.runMinting(candidate)
              }}
            >
              Request Minting
            </button>
            <span className={`badge ${selectedAuth ? 'ok' : 'danger'}`}>
              authorization = {String(selectedAuth)}
            </span>
            {!canMintByRole ? (
              <span className="badge danger">Only ministry role can mint tokens.</span>
            ) : null}
            {state.error ? <span className="badge danger">{state.error}</span> : null}
          </div>
        </div>

        <div className="panel col-4">
          <h3>Minting result</h3>
          {state.mintedTokenId ? (
            <code>{state.mintedTokenId}</code>
          ) : (
            <p className="subtle">No token minted in this session.</p>
          )}
        </div>
      </section>
    </div>
  )
}

