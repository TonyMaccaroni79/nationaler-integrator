import { useEffect } from 'react'
import { useAppStore } from './store'

export function Audit() {
  const { state, actions } = useAppStore()

  useEffect(() => {
    void actions.loadAudit()
  }, [actions])

  return (
    <div className="stack">
      <section className="panel">
        <h2>Audit Trail</h2>
        <p className="subtle">
          Institutional traceability of authorization and issuance actions (prototype table backed
          by Supabase).
        </p>
      </section>

      <section className="panel">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h3>Audit entries</h3>
          <button onClick={() => void actions.loadAudit()}>Refresh</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>timestamp</th>
              <th>projectId</th>
              <th>action</th>
              <th>result</th>
              <th>authorization result</th>
              <th>permanence score</th>
              <th>dMRV validity</th>
            </tr>
          </thead>
          <tbody>
            {state.auditEntries.length === 0 ? (
              <tr>
                <td colSpan={7}>No audit entries yet.</td>
              </tr>
            ) : (
              state.auditEntries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.timestamp}</td>
                  <td>{entry.project_id}</td>
                  <td>{entry.action}</td>
                  <td>{entry.result}</td>
                  <td>{entry.authorization_result ?? 'n/a'}</td>
                  <td>{entry.permanence_score ?? 'n/a'}</td>
                  <td>{entry.dmrv_validity ?? 'unknown'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}

