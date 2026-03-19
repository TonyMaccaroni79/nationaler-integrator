const STEPS = [
  {
    title: 'Rohdaten aus dem Sektor',
    explanation:
      'Die ursprünglichen Daten entstehen immer im Sektor selbst: Industrie, Landwirtschaft, Energie, Forst, Abfall, Logistik. Beispiele: Sensorik, Satelliten, Bodenproben, Produktionsdaten, IoT-Systeme.',
  },
  {
    title: 'dMRV-Aufbereitung durch Dienstleister (z. B. Xange)',
    explanation:
      'dMRV-Provider wie Xange bereiten die Rohdaten auf: Monitoring, Satellitenanalyse, Modellierung, Methodologie-Anwendung. Sie liefern Berichte und strukturierte Daten, ersetzen aber NICHT die staatliche Validierung.',
  },
  {
    title: 'Übermittlung an den Nationalen Integrator',
    explanation:
      'Die aufbereiteten Daten werden über API, Upload oder Partner-Integration an den Nationalen Integrator übermittelt. Dies ist der erste staatliche Kontaktpunkt.',
  },
  {
    title: 'Staatliche dMRV-Validierung',
    explanation:
      'Der Nationale Integrator prüft Vollständigkeit, Methodologie, Plausibilität und Konsistenz. Dies ist die staatliche Qualitätsprüfung und kann nicht ausgelagert werden.',
  },
  {
    title: 'Permanenz- und Risikomodell',
    explanation:
      'Der Nationale Integrator berechnet Permanenz, Risiko, Dauerhaftigkeit und Reversibilitätsfaktoren. Dies ist ein staatliches Modell, unabhängig von der Registry.',
  },
  {
    title: 'Governance-Entscheidung (Autorisierung)',
    explanation:
      'Der Staat entscheidet: autorisiert / nicht autorisiert. Diese Entscheidung ist rechtsrelevant, Art-6-konform und ETF-konform.',
  },
  {
    title: 'Token-Minting über Xange (Registry)',
    explanation:
      'Erst nach staatlicher Freigabe wird über Xange ein digitaler Vermögenswert erzeugt. Xange ist hier der technische Ausgabekanal, nicht die Entscheidungsinstanz.',
  },
  {
    title: 'Audit-Trail',
    explanation:
      'Alle Schritte werden dokumentiert: Validierung, Autorisierung, Minting. Der Auditor prüft die Nachvollziehbarkeit der Prozesse, nicht die Rohdaten.',
  },
]

function StepIcon({ index }: { index: number }) {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: 'var(--accent)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {index + 1}
    </div>
  )
}

export function ProcessFlow() {
  return (
    <div className="stack">
      <section className="panel">
        <h2>CO₂-Governance-Prozesskette</h2>
        <p className="subtle">
          Vollständige logische Prozesskette: Schritte vor und innerhalb des Nationalen Integrators.
        </p>
      </section>

      <section className="panel">
        <div className="process-flow-timeline">
          {STEPS.map((step, index) => (
            <div key={index} className="process-flow-step">
              <StepIcon index={index} />
              <div className="process-flow-content">
                <h3 className="process-flow-title">{step.title}</h3>
                <p className="process-flow-explanation">{step.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
