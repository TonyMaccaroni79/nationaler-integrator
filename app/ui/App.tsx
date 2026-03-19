import { useEffect, useMemo, useState } from 'react'
import { AppProvider } from './store'
import './ui.css'
import { Dashboard } from './Dashboard'
import { Sectors } from './Sectors'
import { DMRV } from './DMRV'
import { Governance } from './Governance'
import { Mint } from './Mint'
import { Audit } from './Audit'
import { Admin } from './Admin'
import { ProcessFlow } from './ProcessFlow'
import { useAppStore } from './store'

type Route = 'dashboard' | 'sectors' | 'dmrv' | 'governance' | 'mint' | 'audit' | 'admin' | 'process-flow'

const ROUTES: Route[] = ['dashboard', 'sectors', 'dmrv', 'governance', 'mint', 'audit', 'admin', 'process-flow']

function normalizeRoute(hash: string): Route {
  const candidate = hash.replace('#', '')
  if (ROUTES.includes(candidate as Route)) return candidate as Route
  return 'dashboard'
}

function Shell() {
  const { state, actions } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [route, setRoute] = useState<Route>(() => normalizeRoute(window.location.hash))

  useEffect(() => {
    const onHashChange = () => setRoute(normalizeRoute(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const content = useMemo(() => {
    switch (route) {
      case 'sectors':
        return <Sectors />
      case 'dmrv':
        return <DMRV />
      case 'governance':
        return <Governance />
      case 'mint':
        return <Mint />
      case 'audit':
        return <Audit />
      case 'admin':
        return <Admin />
      case 'process-flow':
        return <ProcessFlow />
      case 'dashboard':
      default:
        return <Dashboard />
    }
  }, [route])

  function goBack() {
    // Hash router fallback: if no history exists, return to dashboard.
    if (window.history.length > 1) {
      window.history.back()
      return
    }
    window.location.hash = '#dashboard'
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <h1>National Integrator</h1>
          <p>Austria · Sovereign Article‑6 prototype</p>
        </div>

        <div className="panel stack" style={{ marginBottom: 10 }}>
          <h3 style={{ margin: 0 }}>Access Control</h3>
          {state.authLoading ? (
            <p className="subtle">Loading session...</p>
          ) : state.authenticated ? (
            <>
              <span className="badge">Signed in: {state.userEmail ?? 'unknown'}</span>
              <span className="badge">Role: {state.role ?? 'unknown'}</span>
              <button onClick={() => void actions.signOut()}>Sign out</button>
            </>
          ) : (
            <>
              <label className="label" htmlFor="auth-email">
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="user@bmluk.gv.at"
              />
              <label className="label" htmlFor="auth-password">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                onClick={() => void actions.signIn(email, password)}
                disabled={!email || !password}
              >
                Sign in
              </button>
            </>
          )}
          {state.error ? <span className="badge danger">{state.error}</span> : null}
        </div>

        <nav className="nav">
          <a href="#dashboard" className={route === 'dashboard' ? 'active' : ''}>
            Dashboard
          </a>
          <a href="#sectors" className={route === 'sectors' ? 'active' : ''}>
            Sector Registry
          </a>
          <a href="#dmrv" className={route === 'dmrv' ? 'active' : ''}>
            dMRV Validation
          </a>
          <a href="#governance" className={route === 'governance' ? 'active' : ''}>
            Governance Authorization
          </a>
          <a href="#mint" className={route === 'mint' ? 'active' : ''}>
            Minting (Xange Layer)
          </a>
          <a href="#audit" className={route === 'audit' ? 'active' : ''}>
            Audit Trail
          </a>
          <a href="#process-flow" className={route === 'process-flow' ? 'active' : ''}>
            Prozesskette
          </a>
          {state.role === 'ministry' ? (
            <a href="#admin" className={route === 'admin' ? 'active' : ''}>
              Admin
            </a>
          ) : null}
        </nav>
      </aside>
      <main className="main">
        {state.authenticated ? (
          <div className="main-topbar">
            <button type="button" className="back-button" onClick={goBack}>
              Back
            </button>
          </div>
        ) : null}
        {state.authenticated ? (
          content
        ) : (
          <section className="panel">
            <h2>Sign in required</h2>
            <p className="subtle">
              Use a Supabase user account. Roles are resolved from the <code>profiles</code> table
              (`ministry` or `auditor`).
            </p>
          </section>
        )}
      </main>
    </div>
  )
}

export function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}

