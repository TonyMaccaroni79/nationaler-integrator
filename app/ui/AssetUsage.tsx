const USER_GROUPS = [
  {
    title: 'Banken',
    explanation:
      'Nutzen das Asset für Green Bonds, ESG-Reporting, Kreditrisikominderung und nachhaltige Finanzprodukte.',
  },
  {
    title: 'Versicherungen',
    explanation:
      'Nutzen es für Solvency-II-konforme nachhaltige Investments und Klimarisikomodelle.',
  },
  {
    title: 'Asset Manager & Fonds',
    explanation:
      'Setzen das Asset als Underlying für Artikel-8/9-Fonds, Climate Transition Funds und Impact-Produkte ein.',
  },
  {
    title: 'Unternehmen',
    explanation:
      'Verwenden das Asset für Scope-3-Reduktionsnachweise, CSRD-Reporting und Lieferketten-Compliance.',
  },
  {
    title: 'Ministerien & Staat',
    explanation:
      'Nutzen das Asset für Art-6-Reporting, ETF-Reporting, nationale Inventare und sektorale Klimapläne.',
  },
  {
    title: 'Internationale Organisationen',
    explanation:
      'Setzen es für Klimafinanzierung, Entwicklungsprogramme und internationale Berichterstattung ein.',
  },
  {
    title: 'Börsen & Handelsplätze',
    explanation:
      'Nutzen das Asset als qualifiziertes Klima-Underlying für nachhaltige Finanzprodukte.',
  },
  {
    title: 'Rating-Agenturen',
    explanation:
      'Bewerten das Asset für ESG-Ratings, Sustainability Scores und Climate-Risk-Assessments.',
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
        <h2>Wer nutzt dieses Asset?</h2>
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
