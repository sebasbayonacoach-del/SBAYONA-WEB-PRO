import { beforeEach, describe, expect, it } from 'vitest'
import {
  applySiteTheme,
  initializeSiteTheme,
  readSiteTheme,
  SITE_THEME_KEY,
} from './siteTheme.js'

describe('BAYONA · preferencia día/noche', () => {
  beforeEach(() => {
    window.localStorage.removeItem(SITE_THEME_KEY)
    document.documentElement.removeAttribute('data-bayona-theme')
    document.documentElement.style.removeProperty('color-scheme')
  })

  it('mantiene noche como identidad predeterminada', () => {
    expect(readSiteTheme()).toBe('night')
    expect(initializeSiteTheme()).toBe('night')
    expect(document.documentElement.dataset.bayonaTheme).toBe('night')
  })

  it('activa día, lo guarda y lo restaura al recargar', () => {
    expect(applySiteTheme('day', { persist: true })).toBe('day')
    expect(window.localStorage.getItem(SITE_THEME_KEY)).toBe('day')
    expect(document.documentElement.dataset.bayonaTheme).toBe('day')
    expect(document.documentElement.style.colorScheme).toBe('light')
    document.documentElement.removeAttribute('data-bayona-theme')
    expect(initializeSiteTheme()).toBe('day')
    expect(document.documentElement.dataset.bayonaTheme).toBe('day')
  })

  it('permite regresar a noche y no acepta preferencias desconocidas', () => {
    applySiteTheme('day', { persist: true })
    applySiteTheme('night', { persist: true })
    expect(readSiteTheme()).toBe('night')
    expect(document.documentElement.style.colorScheme).toBe('dark')
    window.localStorage.setItem(SITE_THEME_KEY, 'auto')
    expect(initializeSiteTheme()).toBe('night')
  })
})
