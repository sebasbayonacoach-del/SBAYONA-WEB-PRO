/**
 * Cliente Supabase en modo degradado (FASE 1 SaaS).
 *
 * - Si existen `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`, crea el
 *   cliente real con `createClient` y `isCloudEnabled() === true`.
 * - Si faltan (caso actual: el proyecto Supabase aún no existe), exporta
 *   `supabase = null` y `isCloudEnabled() === false`. La app sigue
 *   funcionando en modo local/offline sin tirar ningún error por consola.
 */
import { createClient } from '@supabase/supabase-js'

function readEnv(value) {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null
}

// Vite necesita accesos estáticos para sustituir estas variables al compilar.
// Solo URL y clave pública: nunca service_role ni secretos OAuth en el cliente.
const supabaseUrl = readEnv(import.meta.env.VITE_SUPABASE_URL)
const supabaseAnonKey = readEnv(import.meta.env.VITE_SUPABASE_ANON_KEY)

let client = null

if (supabaseUrl && supabaseAnonKey) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey)
  } catch {
    client = null
  }
}

/** Cliente Supabase o `null` en modo local. */
export const supabase = client

/** `true` solo cuando hay cliente cloud real. */
export function isCloudEnabled() {
  return client !== null
}
