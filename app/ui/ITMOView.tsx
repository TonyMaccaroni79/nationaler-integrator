import { useCallback, useEffect, useState } from 'react'
import { useAppStore } from './store'
import { fetchItmoDetails, type ItmoDetailsResponse } from './apiClient'
import { ITMOPanel } from './components/ITMOPanel'

export function ITMOView() {
  const { state } = useAppStore()
  const [projectId, setProjectId] = useState<string>('')
  const [details, setDetails] = useState<ItmoDetailsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadDetails = useCallback(async (id: string) => {
    if (!id) {
      setDetails(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await fetchItmoDetails(id)
      setDetails(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load ITMO details')
      setDetails(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const hash = window.location.hash
    const match = hash.match(/#itmo(?:\?projectId=([^&]+))?/)
    const paramId = match?.[1]
    if (paramId) {
      setProjectId(paramId)
      void loadDetails(paramId)
    }
  }, [loadDetails])

  const handleProjectChange = (id: string) => {
    setProjectId(id)
    if (id) {
      window.location.hash = `#itmo?projectId=${id}`
      void loadDetails(id)
    } else {
      setDetails(null)
    }
  }

  const selectedProject = state.projects.find((p) => p.id === projectId) ?? state.projects[0]
  const effectiveProjectId = projectId || selectedProject?.id

  return (
    <div className="stack">
      <section className="panel">
        <h2>ITMO & NDC</h2>
        <p className="subtle">
          NDC linkage, ITMO authorization and corresponding adjustments for state-authorized CO₂
          assets.
        </p>
      </section>

      <section className="panel">
        <label className="label" htmlFor="itmo-project-select">
          Select project
        </label>
        <select
          id="itmo-project-select"
          value={effectiveProjectId ?? ''}
          onChange={(e) => handleProjectChange(e.target.value)}
        >
          <option value="">— Select —</option>
          {state.projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.status})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => effectiveProjectId && loadDetails(effectiveProjectId)}
          disabled={!effectiveProjectId || loading}
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </section>

      {error ? (
        <section className="panel">
          <span className="badge danger">{error}</span>
        </section>
      ) : null}

      {loading && !details ? (
        <section className="panel">
          <p className="subtle">Loading ITMO details…</p>
        </section>
      ) : details ? (
        <ITMOPanel
          itmoEligible={details.itmo.itmoEligible}
          authorizationType={details.itmo.authorizationType}
          maxITMOExport={details.itmo.maxITMOExport}
          ndcCompatible={details.itmo.ndcCompatible}
          adjustmentApplied={details.itmo.adjustmentApplied}
          adjustmentAmount={details.itmo.adjustmentAmount}
          adjustmentYear={details.itmo.adjustmentYear}
        />
      ) : (
        <section className="panel">
          <p className="subtle">Select a project to view ITMO & NDC assessment.</p>
        </section>
      )}
    </div>
  )
}
