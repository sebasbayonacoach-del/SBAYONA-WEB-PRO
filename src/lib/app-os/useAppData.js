/**
 * BAYONA OS · hook de estado del área de miembros (WAVE 0-2).
 *
 * Une las tres únicas fuentes reales que existen hoy:
 *   · identidad + `tier` → AuthContext (Supabase Auth o invitado local)
 *   · sesiones locales     → localStorage (`bayona_progress_count`)
 *   · sesiones en la nube  → Supabase `progress_logs` (RLS por usuario)
 *
 * Devuelve además la PROCEDENCIA de cada bloque (`sources`), porque la
 * interfaz debe poder decir de dónde sale cada dato. Sin dato → `empty`,
 * nunca un número inventado.
 */
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import AuthContext from '../auth/AuthContext.jsx'
import {
  buildDailySeries,
  buildMilestones,
  buildStreak,
  buildWeekSummary,
  fetchRecentLogs,
  insertSessionLog,
  readLocalSessions,
  todayIso,
  writeLocalSessions,
} from './progressStore.js'

/** Nombre real si el proveedor lo aporta (Google); si no, el correo. */
export function identityNameOf(user) {
  const meta = user?.user_metadata?.full_name ?? user?.user_metadata?.name
  if (typeof meta === 'string' && meta.trim() !== '') return meta.trim()
  if (typeof user?.email === 'string' && user.email !== '') return user.email
  return ''
}

/** Saludo por hora local. No implica nada más que la hora. */
export function greetingFor(date = new Date()) {
  const hour = date.getHours()
  if (hour < 6) return 'BUENAS NOCHES'
  if (hour < 13) return 'BUENOS DÍAS'
  if (hour < 20) return 'BUENAS TARDES'
  return 'BUENAS NOCHES'
}

export function useAppData() {
  const auth = useContext(AuthContext)
  const user = auth?.user ?? null
  const tier = auth?.tier ?? 'free'
  const authLoading = auth?.loading ?? false

  const [logs, setLogs] = useState([])
  const [cloud, setCloud] = useState({ enabled: false, loading: false, error: null })
  const [localSessions, setLocalSessions] = useState(0)
  const [localLoaded, setLocalLoaded] = useState(false)

  useEffect(() => {
    setLocalSessions(readLocalSessions())
    setLocalLoaded(true)
  }, [])

  useEffect(() => {
    if (authLoading) return undefined
    if (!user?.id) {
      setLogs([])
      setCloud({ enabled: false, loading: false, error: null })
      return undefined
    }
    let cancelled = false
    setCloud((current) => ({ ...current, loading: true, error: null }))
    fetchRecentLogs(user.id).then((result) => {
      if (cancelled) return
      setLogs(result.rows)
      setCloud({ enabled: result.enabled, loading: false, error: result.error ?? null })
    })
    return () => { cancelled = true }
  }, [authLoading, user?.id])

  const registerSession = useCallback(async () => {
    const next = writeLocalSessions(readLocalSessions() + 1)
    setLocalSessions(next)
    if (!user?.id) return { persisted: false }
    const result = await insertSessionLog(user.id)
    if (result.persisted) {
      const refreshed = await fetchRecentLogs(user.id)
      setLogs(refreshed.rows)
      setCloud({ enabled: refreshed.enabled, loading: false, error: refreshed.error ?? null })
    }
    return result
  }, [user?.id])

  /**
   * Cierre de sesión limpio. Además de cerrar la sesión de Supabase (o del
   * invitado local), borra el contador guardado en ESTE dispositivo: es
   * actividad personal y no debe sobrevivir a la sesión en un equipo
   * compartido. El historial real de la cuenta no se toca.
   */
  const signOutClean = useCallback(async () => {
    try {
      await auth?.signOut?.()
    } finally {
      writeLocalSessions(0)
      setLocalSessions(0)
      setLogs([])
    }
    return { error: null }
  }, [auth])

  return useMemo(() => {
    const hasCloudRows = logs.length > 0
    const paid = String(tier ?? 'free').toLowerCase() !== 'free'
    return {
      status: authLoading || !localLoaded ? 'loading' : 'ready',
      user,
      tier,
      paid,
      tierLabel: paid ? String(tier).toUpperCase() : 'GRATIS',
      name: identityNameOf(user),
      greeting: greetingFor(),
      today: todayIso(),
      localSessions,
      logs,
      cloud,
      hasCloudRows,
      week: buildWeekSummary(logs),
      streak: hasCloudRows ? buildStreak(logs) : null,
      daily: hasCloudRows ? buildDailySeries(logs, 14) : [],
      milestones: buildMilestones(logs),
      registerSession,
      signOutClean,
      sources: {
        identity: user ? (user.id?.startsWith?.('local-') ? 'local' : 'cloud') : 'none',
        tier: user && !user.id?.startsWith?.('local-') ? 'cloud' : 'local',
        sessionsLocal: localSessions > 0 ? 'real' : 'empty',
        sessionsCloud: hasCloudRows ? 'real' : cloud.enabled ? 'empty' : 'unavailable',
      },
    }
  }, [authLoading, localLoaded, user, tier, localSessions, logs, cloud, registerSession, signOutClean])
}

export default useAppData