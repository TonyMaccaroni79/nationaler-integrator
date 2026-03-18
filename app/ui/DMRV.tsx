import { useState } from 'react'
import { useAppStore } from './store'

export function DMRV() {
  const { state, actions } = useAppStore()
  const [payload, setPayload] = useState(
    JSON.stringify(
      {
        methodologyId: 'AT-FOREST-2026-v1',
        periodStart: '2026-01-01',
        periodEnd: '2026-03-31',
        activityData: 1234.56,
        evidenceRef: 'storage://evidence/report-001.pdf',
        storageYears: 100,
        reversalBufferPct: 15,
        monitoringStrength: 'standard',
      },
      null,
      2,
    ),
  )

  const onValidate = async () => {
    try {
      const dmrvData = JSON.parse(payload)
      await actions.runDmrvValidation(dmrvData)
    } catch {
      await actions.runDmrvValidation(payload)
    }
  }

  return (
    <div className="stack">
      <section className="panel">
        <h2>dMRV Validation</h2>
        <p className="subtle">Submit mock dMRV data and evaluate basic validation results.</p>
      </section>

      <section className="grid">
        <div className="panel col-8">
          <p className="label">dMRV Data (JSON preferred)</p>
          <textarea value={payload} onChange={(event) => setPayload(event.target.value)} />
          <div className="row" style={{ marginTop: 10 }}>
            <button onClick={() => void onValidate()}>Validate dMRV</button>
            {state.error ? <span className="badge danger">{state.error}</span> : null}
          </div>
        </div>

        <div className="panel col-4">
          <h3>Validation Result</h3>
          {!state.dmrvValidation ? (
            <p className="subtle">No validation run yet.</p>
          ) : (
            <div className="stack">
              <span className={`badge ${state.dmrvValidation.valid ? 'ok' : 'danger'}`}>
                {state.dmrvValidation.valid ? 'valid' : 'invalid'}
              </span>
              <p className="label">issues[]</p>
              {state.dmrvValidation.issues.length === 0 ? (
                <p className="subtle">No issues found.</p>
              ) : (
                <ul>
                  {state.dmrvValidation.issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

