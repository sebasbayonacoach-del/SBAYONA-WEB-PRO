import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearErrorLog, ERROR_LOG_MAX, getErrorLog, reportError } from './errorReport.js'

describe('errorReport — punto único', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('registra en consola y en el log local sin lanzar', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const entry = reportError(new Error('fallo de prueba'), 'test-contexto')
    expect(entry.message).toBe('fallo de prueba')
    expect(spy).toHaveBeenCalledTimes(1)
    expect(getErrorLog()).toHaveLength(1)
    expect(getErrorLog()[0].contexto).toBe('test-contexto')
  })

  it('recorta el log a las últimas 50 entradas', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    for (let i = 0; i < ERROR_LOG_MAX + 10; i++) reportError(new Error(`e${i}`), 'bulk')
    const log = getErrorLog()
    expect(log).toHaveLength(ERROR_LOG_MAX)
    expect(log[log.length - 1].message).toBe(`e${ERROR_LOG_MAX + 9}`)
  })

  it('clearErrorLog vacía el log', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    reportError(new Error('x'), 'ctx')
    clearErrorLog()
    expect(getErrorLog()).toEqual([])
  })
})
