export const PUBLIC_ROUTES = Object.freeze([
  '/',
  '/about',
  '/programs',
  '/parkour-academy',
  '/plan/raiz',
  '/plan/fuerza',
  '/plan/rendimiento',
  '/plan/elite',
  '/shop',
  '/app',
  '/community',
  '/resources',
  '/faq',
  '/checkout',
  '/order-confirmation',
  '/onboarding',
  '/entrar',
])

/**
 * Rutas internas: declaradas en el router pero fuera del contenido público
 * (noindex, Disallow en robots.txt, fuera del sitemap). Los inventarios de
 * rutas públicas las excluyen y se inventarían por separado.
 */
/*
 * `/panel` (el mando de cinco pantallas, declarado en App.jsx justo detrás de
 * `/app`) va aquí y no en las públicas: está tras `RequireAuth`, así que un
 * visitante sin sesión no lo ve — se le devuelve a `/entrar?next=/panel`. El
 * orden importa: `baselineContract.test.js` compara con `toEqual`, que es
 * sensible al orden de declaración en el enrutador, y `/panel` precede a
 * `/design-system`.
 */
export const INTERNAL_ROUTES = Object.freeze(['/panel', '/design-system'])


export const VISUAL_QA_VIEWPORTS = Object.freeze([
  Object.freeze({ name: 'móvil-375', width: 375, height: 812 }),
  Object.freeze({ name: 'tableta-768', width: 768, height: 1024 }),
  Object.freeze({ name: 'escritorio-1440', width: 1440, height: 900 }),
])

export const VISUAL_QA_MOTION_MODES = Object.freeze([
  Object.freeze({ name: 'movimiento-normal', reducedMotion: 'no-preference', expected: false }),
  Object.freeze({ name: 'movimiento-reducido', reducedMotion: 'reduce', expected: true }),
])
