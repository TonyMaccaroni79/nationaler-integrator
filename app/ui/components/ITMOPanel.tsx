export interface ITMOPanelProps {
  itmoEligible: boolean
  authorizationType: string
  maxITMOExport: number
  ndcCompatible: boolean
  adjustmentApplied: boolean
  adjustmentAmount: number
  adjustmentYear: number
}

export function ITMOPanel({
  itmoEligible,
  authorizationType,
  maxITMOExport,
  ndcCompatible,
  adjustmentApplied,
  adjustmentAmount,
  adjustmentYear,
}: ITMOPanelProps) {
  return (
    <div className="stack">
      <section className="panel">
        <h2>ITMO & NDC assessment</h2>
        <div className="row" style={{ marginBottom: 14 }}>
          <span className={`badge ${itmoEligible ? 'ok' : 'danger'}`}>
            {itmoEligible ? 'Eligible' : 'Not eligible'}
          </span>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <div className="panel">
            <h3 className="asset-usage-title">NDC compatibility</h3>
            <p className="asset-usage-explanation">
              {ndcCompatible ? 'Yes' : 'No'} — Project fits within NDC export allowance.
            </p>
          </div>
          <div className="panel">
            <h3 className="asset-usage-title">Max exportable ITMO amount</h3>
            <p className="asset-usage-explanation">
              {maxITMOExport.toFixed(2)} t CO₂e — Maximum tons that can be exported as ITMOs.
            </p>
          </div>
          <div className="panel">
            <h3 className="asset-usage-title">Authorization type</h3>
            <p className="asset-usage-explanation">
              {authorizationType} — Domestic use only, ITMO export, or both.
            </p>
          </div>
          <div className="panel">
            <h3 className="asset-usage-title">Adjustment status</h3>
            <p className="asset-usage-explanation">
              {adjustmentApplied ? 'Applied' : 'Not applied'} — Corresponding adjustment for year{' '}
              {adjustmentYear} ({adjustmentAmount.toFixed(2)} t CO₂e).
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
