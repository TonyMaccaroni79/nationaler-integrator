import { useCallback, useEffect, useState } from 'react'
import { useAppStore } from './store'
import { fetchGovernanceDetails, type GovernanceDetailsResponse } from './apiClient'

export function GovernanceDetails() {
  const { state } = useAppStore()
  const [projectId, setProjectId] = useState<string>('')
  const [details, setDetails] = useState<GovernanceDetailsResponse | null>(null)
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
      const data = await fetchGovernanceDetails(id)
      setDetails(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load governance details')
      setDetails(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash
      const match = hash.match(/#governance-details(?:\?projectId=([^&]+))?/)
      const paramId = match?.[1]
      if (paramId) {
        setProjectId(paramId)
        void loadDetails(paramId)
      }
    }
    parseHash()
    window.addEventListener('hashchange', parseHash)
    return () => window.removeEventListener('hashchange', parseHash)
  }, [loadDetails])

  const handleProjectChange = (id: string) => {
    setProjectId(id)
    if (id) {
      window.location.hash = `#governance-details?projectId=${id}`
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
        <h2>Governance Details</h2>
        <p className="subtle">
          View the full governance calculation breakdown: permanence, additionality, baseline, risk,
          reversibility, dMRV validation, and final authorization decision.
        </p>
      </section>

      <section className="panel">
        <label className="label" htmlFor="gov-project-select">
          Select project
        </label>
        <select
          id="gov-project-select"
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
          <p className="subtle">Loading governance details…</p>
        </section>
      ) : details ? (
        <GovernanceDetailsView data={details} />
      ) : (
        <section className="panel">
          <p className="subtle">Select a project to view governance details.</p>
        </section>
      )}
    </div>
  )
}

function GovernanceDetailsView({ data }: { data: GovernanceDetailsResponse }) {
  const g = data.governance
  const decision = g.decision ?? { authorized: false, reason: 'Unknown' }

  return (
    <div className="stack">
      <section className="panel">
        <h3>Project & Sector</h3>
        <div className="grid" style={{ marginTop: 8 }}>
          <div>
            <strong>Project:</strong> {data.projectName}
          </div>
          <div>
            <strong>Sector:</strong> {data.sectorName}
          </div>
          <div>
            <strong>Sector eligible:</strong>{' '}
            <span className={g.sectorEligible ? 'badge ok' : 'badge danger'}>
              {g.sectorEligible ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </section>

      <section className="panel">
        <h3>Permanence Score</h3>
        <div className="governance-detail-row">
          <span>Score:</span>
          <span className={g.permanenceScore >= (g.sectorRules?.minPermanence ?? 55) ? 'badge ok' : 'badge danger'}>
            {g.permanenceScore} / 100
          </span>
        </div>
        {g.sectorRules ? (
          <p className="subtle" style={{ marginTop: 8 }}>
            Threshold: {g.sectorRules.minPermanence} · Baseline: {g.sectorRules.baselinePermanence}
          </p>
        ) : null}
      </section>

      <section className="panel">
        <h3>Additionality</h3>
        <div className="governance-detail-row">
          <span>Result:</span>
          <span className={g.additionality ? 'badge ok' : 'badge danger'}>
            {g.additionality ? 'Met' : 'Not met'}
          </span>
        </div>
      </section>

      <section className="panel">
        <h3>Baseline Calculation</h3>
        <div className="governance-detail-row">
          <span>Baseline value:</span>
          <strong>{g.baseline}</strong>
        </div>
        {g.sectorRules ? (
          <p className="subtle" style={{ marginTop: 8 }}>
            Conservative adjustment factor: {g.sectorRules.conservativeAdjustmentFactor}
          </p>
        ) : null}
      </section>

      <section className="panel">
        <h3>Risk Factors</h3>
        <div className="governance-detail-row">
          <span>Combined risk factor (0–1):</span>
          <strong>{g.riskFactor}</strong>
        </div>
      </section>

      <section className="panel">
        <h3>Reversibility</h3>
        <div className="governance-detail-row">
          <span>Reversibility factor:</span>
          <strong>{g.reversibilityFactor}</strong>
        </div>
      </section>

      <section className="panel">
        <h3>dMRV Validation</h3>
        <div className="governance-detail-row">
          <span>Structural valid:</span>
          <span className={g.dmrvStructuralValid ? 'badge ok' : 'badge danger'}>
            {g.dmrvStructuralValid ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="governance-detail-row">
          <span>Overall valid:</span>
          <span className={g.dmrvValid ? 'badge ok' : 'badge danger'}>
            {g.dmrvValid ? 'Yes' : 'No'}
          </span>
        </div>
        {g.dmrvIssues.length > 0 ? (
          <div style={{ marginTop: 8 }}>
            <strong>Issues:</strong>
            <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
              {g.dmrvIssues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className={`panel ${decision.authorized ? 'ok' : 'danger'}`} style={{ borderLeftWidth: 4 }}>
        <h3>Final Authorization Decision</h3>
        <div className="governance-detail-row">
          <span>Result:</span>
          <span className={decision.authorized ? 'badge ok' : 'badge danger'}>
            {decision.authorized ? 'Authorized' : 'Rejected'}
          </span>
        </div>
        <p className="subtle" style={{ marginTop: 8 }}>
          {decision.reason}
        </p>
      </section>
    </div>
  )
}
