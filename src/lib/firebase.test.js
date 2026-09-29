import { describe, expect, it, vi } from 'vitest'
import { firebaseApp, firebaseVapidKey, isFirebaseEnabled } from './firebase.js'

describe('firebase — modo degradado sin claves', () => {
  it('exporta app nula y está desactivado', () => {
    expect(firebaseApp).toBeNull()
    expect(isFirebaseEnabled()).toBe(false)
  })

  it('no emite errores por consola al importar/evaluar', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      expect(isFirebaseEnabled()).toBe(false)
      expect(firebaseApp).toBeNull()
      expect(spy).not.toHaveBeenCalled()
    } finally {
      spy.mockRestore()
    }
  })

  it('vapid ausente sin claves', () => {
    expect(firebaseVapidKey).toBeNull()
  })
})
