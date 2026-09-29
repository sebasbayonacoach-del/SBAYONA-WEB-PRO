// Theme - tokens de marca BAYONA (Requirement 9).
//
// Fuente unica de color, tipografia y bordes del Experience_Engine. Es un
// ESPEJO de las variables CSS existentes en `src/styles.css` (`:root`): no se
// inventan colores, solo se reexponen como tokens de JavaScript para que la
// escena 3D, los shaders y la iluminacion consuman exactamente la misma paleta.
//
// Reglas de marca aplicadas:
//   - Orange como acento principal en todos los estados (R9.1, R9.3).
//   - Negros como fondos de superficie, sin blancos ni beige (R9.6).
//   - Sin verde neon ni colores saturados de estetica gaming (R9.4).
//   - Radio de borde 0 en todos los elementos (R9.5).
//   - Montserrat 900 en titulos, Inter 300/400 en cuerpo, DM Mono en datos
//     tecnicos (R9.7).

export const theme = {
  color: {
    // --- ORANGE ACCENTS (PRIMARY) ---
    orange: '#F4A261',
    orangeFire: '#E76F51',
    orangeDeep: '#D45D38',

    // --- LEGACY GOLD COMPATIBILITY ---
    gold: '#F4A261',
    goldBright: '#E76F51',

    // --- SUPPORTING NEUTRALS ---
    mediterranean: '#111111',
    deepBlue: '#0B0B0C',

    // --- BLACKS (SURFACES) ---
    black: '#050505',
    black2: '#0c0c0d',
    black3: '#141416',

    // --- NEUTRALS ---
    white: '#FFFFFF',
    muted: '#A3A3A3',
  },

  // Radio de borde 0 en todos los elementos (R9.5).
  radius: 0,

  // Familias tipograficas de marca (R9.7).
  font: {
    heading: '"Montserrat", Arial, sans-serif', // titulos
    body: '"Inter", "Montserrat", Arial, sans-serif', // cuerpo
    mono: '"DM Mono", monospace', // datos tecnicos
  },

  // Pesos tipograficos de marca (R9.7).
  fontWeight: {
    heading: 900, // Montserrat 900 en titulos
    bodyLight: 300, // Inter 300 en cuerpo
    body: 400, // Inter 400 en cuerpo
  },
}
