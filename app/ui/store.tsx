/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type {
  AdminUser,
  AuditEntry,
  AuthorizeResponse,
  DmrvValidationResult,
  Profile,
  Project,
  Sector,
  UserRole,
} from '../types'
import { authorizeProject, fetchAdminUsers, fetchAudit, requestMint, runBootstrap, setAdminUserRole, validateDmrv } from './apiClient'

type AppState = {
  authenticated: boolean
  userEmail: string | null
  role: UserRole | null
  authLoading: boolean
  sectors: Sector[]
  projects: Project[]
  selectedProjectId: string | null
  dmrvValidation: DmrvValidationResult | null
  authorization: AuthorizeResponse | null
  mintedTokenId: string | null
  auditEntries: AuditEntry[]
  adminUsers: AdminUser[]
  loading: boolean
  error: string | null
}

type AppActions = {
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  setSelectedProjectId: (projectId: string) => void
  reloadCoreData: () => Promise<void>
  runBootstrap: () => Promise<void>
  runDmrvValidation: (dmrvData: unknown) => Promise<void>
  runAuthorization: (projectId: string) => Promise<void>
  runMinting: (projectId: string) => Promise<void>
  loadAudit: () => Promise<void>
  loadAdminUsers: () => Promise<void>
  updateUserRole: (userId: string, role: UserRole) => Promise<void>
}

const AppCtx = createContext<{ state: AppState; actions: AppActions } | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [sectors, setSectors] = useState<Sector[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [dmrvValidation, setDmrvValidation] = useState<DmrvValidationResult | null>(null)
  const [authorization, setAuthorization] = useState<AuthorizeResponse | null>(null)
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null)
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (error) throw error
    const profile = data as Profile
    setRole(profile.role)
  }, [])

  const reloadCoreData = useCallback(async () => {
    if (!authenticated) {
      setSectors([])
      setProjects([])
      setAuditEntries([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const [{ data: sectorsData, error: sectorsError }, { data: projectsData, error: projectsError }] = await Promise.all([
        supabase.from('sectors').select('*').order('name', { ascending: true }),
        supabase.from('projects').select('*').order('name', { ascending: true }),
      ])

      if (sectorsError) throw sectorsError
      if (projectsError) throw projectsError

      setSectors((sectorsData ?? []) as Sector[])
      const nextProjects = (projectsData ?? []) as Project[]
      setProjects(nextProjects)

      if (!selectedProjectId && nextProjects.length > 0) {
        setSelectedProjectId(nextProjects[0].id)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [authenticated, selectedProjectId])

  const loadAudit = useCallback(async () => {
    setError(null)
    try {
      const entries = (await fetchAudit()) as AuditEntry[]
      setAuditEntries(entries)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load audit entries')
    }
  }, [])

  const runBootstrapAction = useCallback(async () => {
    if (role !== 'ministry') {
      setError('Only ministry role can bootstrap example data.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await runBootstrap()
      await reloadCoreData()
      await loadAudit()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bootstrap failed')
    } finally {
      setLoading(false)
    }
  }, [loadAudit, reloadCoreData, role])

  const loadAdminUsers = useCallback(async () => {
    if (role !== 'ministry') {
      setAdminUsers([])
      return
    }

    setError(null)
    try {
      const { users } = await fetchAdminUsers()
      setAdminUsers(users)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load admin users')
    }
  }, [role])

  const updateUserRole = useCallback(
    async (userId: string, nextRole: UserRole) => {
      if (role !== 'ministry') {
        setError('Only ministry role can update user roles.')
        return
      }

      setError(null)
      try {
        await setAdminUserRole(userId, nextRole)
        await loadAdminUsers()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to update user role')
      }
    },
    [loadAdminUsers, role],
  )

  const runDmrvValidation = useCallback(async (dmrvData: unknown) => {
    setError(null)
    try {
      const result = await validateDmrv(dmrvData)
      setDmrvValidation(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Validation failed')
    }
  }, [])

  const runAuthorization = useCallback(async (projectId: string) => {
    if (role !== 'ministry') {
      setError('Only ministry role can authorize projects.')
      return
    }
    setError(null)
    try {
      const result = await authorizeProject(projectId)
      setAuthorization(result)
      await reloadCoreData()
      await loadAudit()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Authorization failed')
    }
  }, [loadAudit, reloadCoreData, role])

  const runMinting = useCallback(async (projectId: string) => {
    if (role !== 'ministry') {
      setError('Only ministry role can request minting.')
      return
    }
    setError(null)
    try {
      const result = await requestMint(projectId)
      setMintedTokenId(result.tokenId)
      await reloadCoreData()
      await loadAudit()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Minting failed')
    }
  }, [loadAudit, reloadCoreData, role])

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      return
    }

    const user = data.user
    if (!user) {
      setError('Sign-in failed: missing user in session.')
      return
    }

    setAuthenticated(true)
    setUserEmail(user.email ?? null)
    try {
      await loadProfile(user.id)
      await reloadCoreData()
      await loadAudit()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load profile or data. Run seed.sql in Supabase if users have no profiles.')
    }
  }, [loadAudit, loadProfile, reloadCoreData])

  const signOut = useCallback(async () => {
    setError(null)
    await supabase.auth.signOut()
    setAuthenticated(false)
    setUserEmail(null)
    setRole(null)
    setSelectedProjectId(null)
    setSectors([])
    setProjects([])
    setDmrvValidation(null)
    setAuthorization(null)
    setMintedTokenId(null)
    setAuditEntries([])
    setAdminUsers([])
  }, [])

  useEffect(() => {
    const bootstrapAuth = async () => {
      setAuthLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.user) {
          setAuthenticated(false)
          setUserEmail(null)
          setRole(null)
          setAuthLoading(false)
          return
        }

        setAuthenticated(true)
        setUserEmail(session.user.email ?? null)
        await loadProfile(session.user.id)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to bootstrap auth')
      } finally {
        setAuthLoading(false)
      }
    }

    void bootstrapAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setAuthenticated(false)
        setUserEmail(null)
        setRole(null)
        setSelectedProjectId(null)
        setSectors([])
        setProjects([])
        setAuditEntries([])
        setAdminUsers([])
        return
      }
      setAuthenticated(true)
      setUserEmail(session.user.email ?? null)
      void loadProfile(session.user.id)
    })

    return () => subscription.unsubscribe()
  }, [loadProfile])

  useEffect(() => {
    if (!authenticated) return
    void reloadCoreData()
    void loadAudit()
  }, [authenticated, loadAudit, reloadCoreData])

  useEffect(() => {
    if (!authenticated || role !== 'ministry') {
      setAdminUsers([])
      return
    }
    void loadAdminUsers()
  }, [authenticated, loadAdminUsers, role])

  const state = useMemo<AppState>(
    () => ({
      authenticated,
      userEmail,
      role,
      authLoading,
      sectors,
      projects,
      selectedProjectId,
      dmrvValidation,
      authorization,
      mintedTokenId,
      auditEntries,
      adminUsers,
      loading,
      error,
    }),
    [
      auditEntries,
      authLoading,
      authenticated,
      authorization,
      dmrvValidation,
      error,
      loading,
      mintedTokenId,
      projects,
      role,
      sectors,
      selectedProjectId,
      userEmail,
      adminUsers,
    ],
  )

  const actions = useMemo<AppActions>(
    () => ({
      signIn,
      signOut,
      setSelectedProjectId,
      reloadCoreData,
      runBootstrap: runBootstrapAction,
      runDmrvValidation,
      runAuthorization,
      runMinting,
      loadAudit,
      loadAdminUsers,
      updateUserRole,
    }),
    [
      loadAdminUsers,
      loadAudit,
      reloadCoreData,
      runAuthorization,
      runBootstrapAction,
      runDmrvValidation,
      runMinting,
      signIn,
      signOut,
      updateUserRole,
    ],
  )

  return <AppCtx.Provider value={{ state, actions }}>{children}</AppCtx.Provider>
}

export function useAppStore() {
  const value = useContext(AppCtx)
  if (!value) throw new Error('useAppStore must be used inside AppProvider')
  return value
}

