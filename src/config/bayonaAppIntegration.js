/** Public BAYONA App build verified 2026-10-09 (HTTP 200).
 * The deployed app denies framing (X-Frame-Options: DENY), intentionally.
 * Never embed it in an iframe; link to the real, separately hosted application.
 * ?source=pwa is supported by landing-boot.js and opens the actual role picker.
 */
export const BAYONA_APP_PUBLIC_URL = 'https://bayona-app-one.vercel.app/'
export const BAYONA_APP_ENTRY_URL = 'https://bayona-app-one.vercel.app/?source=pwa'
export const BAYONA_APP_ROLE_IMAGE = '/images/bayona-live-app/role-selection-20261009.png'
export const BAYONA_APP_MOBILE_IMAGE = '/images/bayona-live-app/role-picker-mobile-crop-20261009.png'

export const BAYONA_APP_SPACES = Object.freeze([
  {
    id: 'personal',
    number: '01',
    label: 'MI APP',
    title: 'Tu espacio personal',
    description: 'Tu día, entrenamiento, nutrición, recuperación y progreso en una experiencia propia.',
    note: 'Para cualquier persona que quiera organizar su entrenamiento; no hace falta ser atleta.',
  },
  {
    id: 'coach',
    number: '02',
    label: 'COACH STUDIO',
    title: 'Tu espacio de entrenador',
    description: 'Herramientas de planificación, gestión de clientes y seguimiento profesional.',
    note: 'Los permisos y las funciones de gestión dependen del acceso autorizado en la aplicación.',
  },
])
