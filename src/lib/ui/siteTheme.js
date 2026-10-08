/**
 * Preferencia visual explícita de BAYONA.
 * Noche es el estado inicial de marca; día solo se activa por decisión
 * del visitante y se conserva entre rutas y sesiones en este navegador.
 */
export const SITE_THEME_KEY = 'bayona-site-theme'

export function readSiteTheme() {
  try {
    return window.localStorage.getItem(SITE_THEME_KEY) === 'day' ? 'day' : 'night'
  } catch {
    return 'night'
  }
}

export function applySiteTheme(value, { persist = false } = {}) {
  const theme = value === 'day' ? 'day' : 'night'

  if (typeof document !== 'undefined') {
    document.documentElement.dataset.bayonaTheme = theme
    document.documentElement.style.colorScheme = theme === 'day' ? 'light' : 'dark'
  }

  if (persist) {
    try {
      window.localStorage.setItem(SITE_THEME_KEY, theme)
    } catch {
      // Modo privado o almacenamiento bloqueado: el botón sigue funcionando.
    }
  }

  return theme
}

export function initializeSiteTheme() {
  return applySiteTheme(readSiteTheme())
}
