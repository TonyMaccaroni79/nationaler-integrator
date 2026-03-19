const USER_GROUPS = [
  {
    title: 'Banks',
    explanation:
      'Use the asset for Green Bonds, ESG reporting, credit risk mitigation and sustainable finance products.',
  },
  {
    title: 'Insurers',
    explanation:
      'Use it for Solvency-II-compliant sustainable investments and climate risk models.',
  },
  {
    title: 'Asset managers & funds',
    explanation:
      'Use the asset as underlying for Article 8/9 funds, Climate Transition Funds and impact products.',
  },
  {
    title: 'Companies',
    explanation:
      'Use the asset for Scope-3 reduction claims, CSRD reporting and supply chain compliance.',
  },
  {
    title: 'Ministries & government',
    explanation:
      'Use the asset for Article-6 reporting, ETF reporting, national inventories and sectoral climate plans.',
  },
  {
    title: 'International organisations',
    explanation:
      'Use it for climate finance, development programmes and international reporting.',
  },
  {
    title: 'Exchanges & trading venues',
    explanation:
      'Use the asset as qualified climate underlying for sustainable finance products.',
  },
  {
    title: 'Rating agencies',
    explanation:
      'Rate the asset for ESG ratings, sustainability scores and climate risk assessments.',
  },
]

function GroupIcon() {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        background: 'var(--accent)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      ◈
    </div>
  )
}

export function AssetUsage() {
  return (
    <div className="stack">
      <section className="panel">
        <h2>Who uses this asset?</h2>
        <p className="subtle">
          State-authorized, minted, audit-backed and Green-Finance-ready CO₂ assets can be used by
          the following groups.
        </p>
      </section>

      <section className="panel">
        <div className="asset-usage-grid">
          {USER_GROUPS.map((group, index) => (
            <div key={index} className="asset-usage-card">
              <GroupIcon />
              <div className="asset-usage-content">
                <h3 className="asset-usage-title">{group.title}</h3>
                <p className="asset-usage-explanation">{group.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
