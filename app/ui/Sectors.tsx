import { useMemo, useState } from 'react'
import { useAppStore } from './store'

export function Sectors() {
  const { state } = useAppStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = useMemo(() => {
    if (state.sectors.length === 0) return null
    if (!selectedId) return state.sectors[0]
    return state.sectors.find((s) => s.id === selectedId) ?? state.sectors[0]
  }, [selectedId, state.sectors])

  return (
    <div className="stack">
      <section className="panel">
        <h2>Sector Overview</h2>
        <p className="subtle">Sector registry records loaded directly from Supabase.</p>
      </section>

      <section className="grid">
        <div className="panel col-4">
          <h3>All sectors</h3>
          <div className="stack">
            {state.sectors.map((sector) => (
              <button key={sector.id} onClick={() => setSelectedId(sector.id)} style={{ textAlign: 'left' }}>
                <strong>{sector.name}</strong>
              </button>
            ))}
          </div>
        </div>

        <div className="panel col-8">
          <h3>{selected?.name ?? 'No sector selected'}</h3>
          <p className="subtle">{selected?.description}</p>
          <p className="label" style={{ marginTop: 12 }}>
            dmrvRequirements
          </p>
          <ul>
            {(selected?.dmrv_requirements ?? []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}

