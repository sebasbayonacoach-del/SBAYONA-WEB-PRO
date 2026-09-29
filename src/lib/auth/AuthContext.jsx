/**
 * AuthContext (FASE 1 SaaS + OAuth Google).
 *
 * Provee `{ user, tier, loading, signUp, signIn, signInWithGoogle, signOut }`.
 *
 * - CON nube (`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`): Supabase Auth
 *   real + lectura del `tier` desde la tabla `profiles`. Google funciona si
 *   además está configurado el proveedor en Supabase (ver docs/SAAS-SETUP.md).
 * - SIN nube (estado actual): modo local. Usuario invitado persistido en
 *   `localStorage` (`bayona_guest_user`), siempre `tier: 'free'`. Google
 *   devuelve `pendingSetup: true` para que la UI lo explique sin romper.
 *
 * Sin errores por consola en ningún caso. Mensajes principales en español.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { isCloudEnabled, supabase } from '../supabase.js'

const AuthContext = createContext(null)

const GUEST_KEY = 'bayona_guest_user'
const AUTH_SESSION_TIMEOUT_MS = 3500

function withTimeout(promise, ms = AUTH_SESSION_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error('auth-session-timeout')), ms)
    }),
  ])
}

function readGuest() {
  for (const storageName of ['localStorage', 'sessionStorage']) {
    try {
      const storage = typeof window !== 'undefined' ? window[storageName] : null
      const raw = storage?.getItem(GUEST_KEY)
      if (!raw) continue
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && parsed.email) return parsed
    } catch {
      // El navegador puede bloquear un storage concreto; probamos el siguiente.
    }
  }
  return null
}

function writeGuest(user) {
  for (const storageName of ['localStorage', 'sessionStorage']) {
    try {
      const storage = typeof window !== 'undefined' ? window[storageName] : null
      if (user) storage?.setItem(GUEST_KEY, JSON.stringify(user))
      else storage?.removeItem(GUEST_KEY)
    } catch {
      // Storage lleno o bloqueado: el modo local sigue en memoria.
    }
  }
}

/** Traduce los errores de Supabase Auth a castellano. */
export function toSpanishAuthError(error) {
  const message = String(error?.message ?? '')
  if (/invalid login credentials/i.test(message)) return 'El correo o la contraseña no son válidos.'
  if (/user already registered/i.test(message)) return 'Ya existe una cuenta con ese correo. Prueba a entrar.'
  if (/email not confirmed/i.test(message)) return 'Tienes que confirmar tu correo antes de entrar. Revisa tu bandeja.'
  if (/password.*(short|least|characters)/i.test(message)) return 'La contraseña es demasiado corta (mínimo 6 caracteres).'
  if (/invalid email/i.test(message)) return 'Ese correo no parece válido. Revísalo.'
  if (message.trim() !== '') return message
  return 'Ha ocurrido un error con tu cuenta. Inténtalo de nuevo.'
}

async function fetchTier(userId) {
  if (!supabase || !userId) return 'free'
  try {
    const { data } = await supabase.from('profiles').select('tier').eq('id', userId).maybeSingle()
    return typeof data?.tier === 'string' && data.tier !== '' ? data.tier : 'free'
  } catch {
    return 'free'
  }
}

async function fetchTierFailSafe(userId) {
  try {
    return await withTimeout(fetchTier(userId))
  } catch {
    return 'free'
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [tier, setTier] = useState('free')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function init() {
      if (isCloudEnabled() && supabase) {
        try {
          const { data } = await withTimeout(supabase.auth.getSession())
          const sessionUser = data?.session?.user ?? null
          if (cancelled) return
          setUser(sessionUser)
          setTier(sessionUser ? await fetchTierFailSafe(sessionUser.id) : 'free')
        } catch {
          if (!cancelled) {
            setUser(null)
            setTier('free')
          }
        } finally {
          if (!cancelled) setLoading(false)
        }
        return
      }
      // Modo local: invitado persistido, sin red.
      if (!cancelled) {
        setUser(readGuest())
        setTier('free')
        setLoading(false)
      }
    }

    init()

    // Solo con nube: seguir cambios de sesión.
    let subscription = null
    if (isCloudEnabled() && supabase) {
      try {
        const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (cancelled) return
          const nextUser = session?.user ?? null
          setUser(nextUser)
          try {
            setTier(nextUser ? await fetchTierFailSafe(nextUser.id) : 'free')
          } catch {
            setTier('free')
          }
          setLoading(false)
        })
        subscription = data?.subscription ?? null
      } catch {
        subscription = null
      }
    }

    return () => {
      cancelled = true
      try {
        subscription?.unsubscribe?.()
      } catch {
        // Sin ruido: desuscribirse nunca debe romper el árbol.
      }
    }
  }, [])

  const signUp = useCallback(async (email, password) => {
    const cleanEmail = String(email ?? '').trim()
    if (cleanEmail === '' || String(password ?? '') === '') {
      return { user: null, error: 'Escribe tu correo y una contraseña para crear la cuenta.' }
    }
    if (isCloudEnabled() && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({ email: cleanEmail, password })
        if (error) return { user: data?.user ?? null, error: toSpanishAuthError(error) }
        const nextUser = data?.user ?? null
        setUser(nextUser)
        setTier(nextUser ? await fetchTierFailSafe(nextUser.id) : 'free')
        return { user: nextUser, error: null }
      } catch (error) {
        return { user: null, error: toSpanishAuthError(error) }
      }
    }
    // Modo local: invitado inmediato, sin red.
    const guest = { id: `local-${Date.now()}`, email: cleanEmail }
    writeGuest(guest)
    setUser(guest)
    setTier('free')
    return { user: guest, error: null }
  }, [])

  const signIn = useCallback(async (email, password) => {
    const cleanEmail = String(email ?? '').trim()
    if (cleanEmail === '' || String(password ?? '') === '') {
      return { user: null, error: 'Escribe tu correo y tu contraseña para entrar.' }
    }
    if (isCloudEnabled() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password })
        if (error) return { user: null, error: toSpanishAuthError(error) }
        const nextUser = data?.user ?? null
        setUser(nextUser)
        setTier(nextUser ? await fetchTierFailSafe(nextUser.id) : 'free')
        return { user: nextUser, error: null }
      } catch (error) {
        return { user: null, error: toSpanishAuthError(error) }
      }
    }
    const guest = { id: `local-${Date.now()}`, email: cleanEmail }
    writeGuest(guest)
    setUser(guest)
    setTier('free')
    return { user: guest, error: null }
  }, [])

  /**
   * Acceso con Google (OAuth). Con nube redirige a Google y la sesión vuelve
   * por `onAuthStateChange` (retorna `redirected: true`). Sin nube retorna
   * `pendingSetup: true` para que la UI lo explique sin romper nada.
   */
  const signInWithGoogle = useCallback(async () => {
    if (isCloudEnabled() && supabase) {
      try {
        const redirectTo =
          typeof window !== 'undefined' ? `${window.location.origin}/app` : undefined
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo },
        })
        if (error) return { user: null, error: toSpanishAuthError(error) }
        return { user: null, error: null, redirected: true }
      } catch (error) {
        return { user: null, error: toSpanishAuthError(error) }
      }
    }
    return { user: null, error: null, pendingSetup: true }
  }, [])

  const signOut = useCallback(async () => {
    if (isCloudEnabled() && supabase) {
      try {
        await supabase.auth.signOut()
      } catch {
        // Salir localmente aunque la red falle.
      }
    } else {
      writeGuest(null)
    }
    setUser(null)
    setTier('free')
    return { error: null }
  }, [])

  const value = useMemo(
    () => ({ user, tier, loading, signUp, signIn, signInWithGoogle, signOut }),
    [user, tier, loading, signUp, signIn, signInWithGoogle, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>.')
  return ctx
}

export default AuthContext
