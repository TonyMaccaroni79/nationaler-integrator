import { useAppStore } from './store'

export function Admin() {
  const { state, actions } = useAppStore()

  if (state.role !== 'ministry') {
    return (
      <section className="panel">
        <h2>Admin</h2>
        <p className="subtle">Access denied. Only ministry role can access this screen.</p>
      </section>
    )
  }

  return (
    <div className="stack">
      <section className="panel">
        <h2>Admin</h2>
        <p className="subtle">
          User administration for role governance. This screen will list users and allow role
          changes (`ministry` / `auditor`).
        </p>
      </section>

      <section className="panel">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>Users</h3>
          <button onClick={() => void actions.loadAdminUsers()}>Refresh</button>
        </div>

        {state.adminUsers.length === 0 ? (
          <p className="subtle" style={{ marginTop: 10 }}>
            No users found (or not loaded yet).
          </p>
        ) : (
          <table style={{ marginTop: 10 }}>
            <thead>
              <tr>
                <th>Email</th>
                <th>User ID</th>
                <th>Role</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {state.adminUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>
                    <code>{user.id}</code>
                  </td>
                  <td>{user.role}</td>
                  <td>{new Date(user.created_at).toLocaleString()}</td>
                  <td>
                    <div className="row">
                      <button
                        disabled={user.role === 'auditor'}
                        onClick={() => void actions.updateUserRole(user.id, 'auditor')}
                      >
                        Set auditor
                      </button>
                      <button
                        disabled={user.role === 'ministry'}
                        onClick={() => void actions.updateUserRole(user.id, 'ministry')}
                      >
                        Set ministry
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {state.error ? <span className="badge danger">{state.error}</span> : null}
      </section>
    </div>
  )
}

