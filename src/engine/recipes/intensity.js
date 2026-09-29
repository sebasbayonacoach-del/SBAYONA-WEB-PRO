// intensity - niveles de intensidad del movimiento (Fase 5).
//
// Tres intensidades y solo tres: el sistema no tiene modo "loco". Cada
// preset escala la amplitud (distancias), la velocidad (duraciones) y la
// simultaneidad maxima (cuantas cosas pueden moverse a la vez en una misma
// zona). Los presets son datos PUROS: las recetas y las páginas futuras los
// consumen sin reimplementar la regla.

/**
 * Presets de intensidad.
 *
 *  - quiet: calma maxima. Recorridos cortos, pocos elementos a la vez.
 *    Para paginas de lectura, datos y decision (planes, FAQ, checkout).
 *  - balanced: el estandar de BAYONA. Movimiento presente pero educado.
 *  - immersive: narrativa espacial completa (sticky, horizontal, capas).
 *    Reservado a secciones narrativas justificadas, nunca a la pagina entera.
 */
export const MOTION_INTENSITIES = Object.freeze({
  quiet: Object.freeze({
    id: 'quiet',
    label: 'Calma',
    amplitude: 0.5,
    speed: 0.8,
    simultaneity: 1,
  }),
  balanced: Object.freeze({
    id: 'balanced',
    label: 'Equilibrada',
    amplitude: 1,
    speed: 1,
    simultaneity: 2,
  }),
  immersive: Object.freeze({
    id: 'immersive',
    label: 'Inmersiva',
    amplitude: 1.4,
    speed: 1.15,
    simultaneity: 3,
  }),
})

/** Intensidad por defecto: el estandar de la marca. */
export const DEFAULT_INTENSITY = 'balanced'

/**
 * Resuelve el preset de intensidad por nombre. Fail-safe: cualquier nombre
 * no reconocido degrada a `balanced`.
 *
 * @param {string} [name]
 * @returns {{id: string, label: string, amplitude: number, speed: number, simultaneity: number}}
 */
export function resolveIntensity(name) {
  return MOTION_INTENSITIES[name] ?? MOTION_INTENSITIES[DEFAULT_INTENSITY]
}

/**
 * Escala una distancia (px) segun la amplitud de la intensidad.
 * @param {number} px Distancia base.
 * @param {string} [intensity] Nombre de intensidad.
 * @returns {number} Distancia escalada (0 si la base no es finita).
 */
export function scaleDistance(px, intensity = DEFAULT_INTENSITY) {
  if (!Number.isFinite(px)) return 0
  return px * resolveIntensity(intensity).amplitude
}

/**
 * Escala una duracion (s) segun la velocidad de la intensidad: mas velocidad
 * = menos duracion. Acota el resultado a un rango humano (0.1s..3s) para que
 * ninguna receta produzca parpadeos ni movimientos eternos.
 *
 * @param {number} seconds Duracion base.
 * @param {string} [intensity] Nombre de intensidad.
 * @returns {number} Duracion escalada en segundos.
 */
export function scaleDuration(seconds, intensity = DEFAULT_INTENSITY) {
  if (!Number.isFinite(seconds) || seconds <= 0) return 0.4
  const scaled = seconds / resolveIntensity(intensity).speed
  return Math.min(3, Math.max(0.1, scaled))
}
