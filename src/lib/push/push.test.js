import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getStoredPushToken, PUSH_TOKEN_KEY, requestPushPermission } from './usePush.js'
import { registerNativePush } from './nativePush.js'

describe('push — modo sin claves: no-op sin errores', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('requestPushPermission no hace nada y no pide permiso', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const requestSpy = vi.fn()
    const originalNotification = globalThis.Notification
    globalThis.Notification = { requestPermission: requestSpy, permission: 'default' }
    try {
      const result = await requestPushPermission()
      expect(result.ok).toBe(false)
      expect(requestSpy).not.toHaveBeenCalled()
      expect(window.localStorage.getItem(PUSH_TOKEN_KEY)).toBeNull()
      expect(getStoredPushToken()).toBeNull()
      expect(errorSpy).not.toHaveBeenCalled()
    } finally {
      if (originalNotification === undefined) delete globalThis.Notification
      else globalThis.Notification = originalNotification
      errorSpy.mockRestore()
    }
  })

  it('registerNativePush es no-op fuera de la app nativa', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = await registerNativePush()
    expect(result.ok).toBe(false)
    expect(errorSpy).not.toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})
