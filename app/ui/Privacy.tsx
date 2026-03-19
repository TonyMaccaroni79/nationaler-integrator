export function Privacy() {
  return (
    <div className="stack">
      <section className="panel">
        <h2>Data protection / Datenschutz</h2>
        <p className="subtle">
          This prototype is for demonstration purposes only. No productive use of personal or
          project data is intended.
        </p>
      </section>

      <section className="panel">
        <h3>Responsible entity</h3>
        <p>
          The National Integrator prototype is operated for demonstration by the project owner
          (e.g. BMLUK or designated prototype operator). For production use, the responsible
          entity must be clearly defined.
        </p>
      </section>

      <section className="panel">
        <h3>Data processed</h3>
        <ul>
          <li>
            <strong>User accounts:</strong> Email address, authentication data (Supabase Auth)
          </li>
          <li>
            <strong>Profiles:</strong> Role assignment (ministry / auditor)
          </li>
          <li>
            <strong>Projects:</strong> Project names, dMRV data, permanence scores, status
          </li>
          <li>
            <strong>Audit log:</strong> Timestamps, actions, results (traceability)
          </li>
          <li>
            <strong>Authorizations and tokens:</strong> Authorization decisions and token records
          </li>
        </ul>
      </section>

      <section className="panel">
        <h3>Purpose</h3>
        <p>
          Data is processed for the purpose of demonstrating a sovereign CO₂ governance platform
          (Article‑6 prototype). This includes validation, authorization, minting simulation and audit
          trail.
        </p>
      </section>

      <section className="panel">
        <h3>Third-party services</h3>
        <p>
          The application uses <strong>Supabase</strong> (authentication, database) and{' '}
          <strong>Vercel</strong> (hosting, serverless APIs). For GDPR compliance, use EU regions
          when configuring these services (e.g. Supabase Frankfurt, Vercel eu-central-1).
        </p>
      </section>

      <section className="panel">
        <h3>Retention</h3>
        <p>
          As a prototype, data retention is limited. For production use, retention periods must be
          defined according to legal requirements.
        </p>
      </section>

      <section className="panel">
        <h3>Your rights (GDPR / DSGVO)</h3>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data (Art. 15 GDPR)</li>
          <li>Rectification of inaccurate data (Art. 16 GDPR)</li>
          <li>Erasure (Art. 17 GDPR)</li>
          <li>Restriction of processing (Art. 18 GDPR)</li>
          <li>Object to processing (Art. 21 GDPR)</li>
        </ul>
        <p className="subtle">
          Contact the responsible entity for any requests. For this prototype, account deletion can
          be requested from the operator.
        </p>
      </section>

      <section className="panel">
        <h3>Disclaimer</h3>
        <p className="subtle">
          This system is a prototype for demonstration purposes. It is not intended for productive
          use. Data protection measures for production deployment require additional steps (e.g.
          data processing agreements, privacy impact assessment, deletion concepts).
        </p>
      </section>
    </div>
  )
}
