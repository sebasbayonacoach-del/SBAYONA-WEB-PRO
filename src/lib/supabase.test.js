import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }))
vi.mock('@supabase/supabase-js', () => ({ createClient }))
beforeEach(() => {
  vi.resetModules()
  createClient.mockReset()
  vi.stubEnv('VITE_SUPABASE_URL', '')
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
})
afterEach(() => vi.unstubAllEnvs())

it('no activa la nube sin configuración', async () => {
  const { isCloudEnabled } = await import('./supabase.js')
  expect(isCloudEnabled()).toBe(false)
  expect(createClient).not.toHaveBeenCalled()
})

it('crea el cliente con las variables públicas de Vite', async () => {
  vi.stubEnv('VITE_SUPABASE_URL', ' https://example.supabase.co ')
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', ' clave-publica-prueba ')
  const client = { auth: {} }
  createClient.mockReturnValue(client)
  const { supabase, isCloudEnabled } = await import('./supabase.js')
  expect(createClient).toHaveBeenCalledWith('https://example.supabase.co', 'clave-publica-prueba')
  expect(supabase).toBe(client)
  expect(isCloudEnabled()).toBe(true)
})

it.each(['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'])(
  'no crea cliente con una sola variable: %s', async (name) => {
    vi.stubEnv(name, 'valor-publico-prueba')
    const { isCloudEnabled } = await import('./supabase.js')
    expect(isCloudEnabled()).toBe(false)
    expect(createClient).not.toHaveBeenCalled()
  },
)

it('degrada si el constructor rechaza una configuración inválida', async () => {
  vi.stubEnv('VITE_SUPABASE_URL', 'url-invalida')
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'clave-publica-prueba')
  createClient.mockImplementation(() => { throw new Error('Invalid URL') })
  const { supabase, isCloudEnabled } = await import('./supabase.js')
  expect(supabase).toBeNull()
  expect(isCloudEnabled()).toBe(false)
})
