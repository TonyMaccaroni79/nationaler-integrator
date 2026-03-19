const STEPS = [
  {
    title: 'Raw data from the sector',
    explanation:
      'The original data always originates in the sector itself: industry, agriculture, energy, forestry, waste, logistics. Examples: sensors, satellites, soil samples, production data, IoT systems.',
  },
  {
    title: 'dMRV preparation by service providers (e.g. Xange)',
    explanation:
      'dMRV providers such as Xange prepare the raw data: monitoring, satellite analysis, modelling, methodology application. They deliver reports and structured data, but do NOT replace government validation.',
  },
  {
    title: 'Submission to the National Integrator',
    explanation:
      'The prepared data is submitted to the National Integrator via API, upload or partner integration. This is the first government point of contact.',
  },
  {
    title: 'Government dMRV validation',
    explanation:
      'The National Integrator checks completeness, methodology, plausibility and consistency. This is the government quality assurance and cannot be outsourced.',
  },
  {
    title: 'Permanence and risk model',
    explanation:
      'The National Integrator calculates permanence, risk, durability and reversibility factors. This is a government model, independent of the registry.',
  },
  {
    title: 'Governance decision (authorization)',
    explanation:
      'The state decides: authorized / not authorized. This decision is legally binding, Article-6-compliant and ETF-compliant.',
  },
  {
    title: 'Token minting via Xange (registry)',
    explanation:
      'Only after government approval is a digital asset created via Xange. Xange is the technical issuance channel here, not the decision-making authority.',
  },
  {
    title: 'Audit trail',
    explanation:
      'All steps are documented: validation, authorization, minting. The auditor verifies the traceability of processes, not the raw data.',
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
        <h2>CO₂ governance process flow</h2>
        <p className="subtle">
          Complete logical process chain: steps before and inside the National Integrator.
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
