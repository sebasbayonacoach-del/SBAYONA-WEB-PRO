// LightingRig - plataforma de iluminacion de la escena 3D
// (Requirements 3.1, 3.2, 3.3, 3.4).
//
// La iluminacion se decide en DOS capas:
//   1. `lightingPlan(caps)` -> funcion PURA que describe, como datos planos, que
//      luces montar y si la escena proyecta sombras. Al no depender de React ni
//      de Three, es trivial de verificar en tests unitarios (Tarea 9.2).
//   2. `<LightingRig>` -> componente que mapea ese plan a primitivas de React
//      Three Fiber (`<ambientLight>`, `<spotLight>`, `<pointLight>`).
//
// Reglas de marca / adaptacion:
//   - Desktop monta un esquema rico de >=3 tipos de luz diferenciados (R3.1):
//     una ambiental tenue de relleno, una focal dorada que PROYECTA sombras
//     (R3.2) y dos puntuales de color -azul mediterraneo y naranja amanecer-
//     que aportan profundidad y calidez (R3.3). `shadows: true`.
//   - Mobile reduce el numero de luces (ambiental + una puntual dorada) y
//     DESACTIVA las sombras por coste de GPU (R3.4). Ninguna luz proyecta
//     sombras en este modo.
//   - Todos los colores provienen de `theme.color` (misma paleta que el resto
//     del engine); aqui no se inventan colores.
//
// NOTA: componente interno de la escena; no se exporta en el barrel del engine.

import { theme } from '../config/theme.js'

/**
 * @typedef {Object} PlannedLight
 * @property {'ambient'|'spot'|'point'} type  Tipo de luz a montar.
 * @property {string} color  Color en formato hex, tomado de `theme.color`.
 * @property {number} intensity  Intensidad de la luz.
 * @property {[number, number, number]} [position]  Posicion en la escena
 *   (no aplica a la luz ambiental, que es omnidireccional).
 * @property {boolean} [castShadow]  `true` si la luz proyecta sombras dinamicas.
 */

/**
 * @typedef {Object} LightingPlan
 * @property {boolean} shadows  Si la escena debe habilitar sombras dinamicas.
 * @property {PlannedLight[]} lights  Descripcion declarativa de las luces.
 */

/**
 * Calcula el plan de iluminacion segun las capacidades del dispositivo.
 *
 * Funcion PURA: mismas `caps` -> mismo plan, sin efectos secundarios. Desktop
 * recibe >=3 tipos de luz diferenciados con sombras activas (R3.1, R3.2, R3.3);
 * cualquier otro modo (Mobile o `caps` ausente) recibe un esquema reducido sin
 * sombras (R3.4).
 *
 * @param {import('../providers/capabilities.js').Capabilities} [caps]
 *   Capacidades vivas; solo se lee `mode` ('desktop' | 'mobile').
 * @returns {LightingPlan} Plan declarativo de luces y flag de sombras.
 */
export function lightingPlan(caps) {
  const isDesktop = caps?.mode === 'desktop'

  if (isDesktop) {
    // Desktop: esquema completo con sombras dinamicas (R3.1, R3.2, R3.3).
    return {
      shadows: true,
      lights: [
        // Ambiental tenue: relleno global suave para que las sombras no queden
        // completamente negras.
        { type: 'ambient', color: theme.color.white, intensity: 0.25 },
        // Focal dorada: luz clave que PROYECTA sombras (R3.2) y define el volumen.
        {
          type: 'spot',
          color: theme.color.gold,
          intensity: 2.4,
          position: [6, 9, 6],
          castShadow: true,
        },
        // Puntual azul mediterraneo: luz de contra fria para dar profundidad (R3.3).
        {
          type: 'point',
          color: theme.color.mediterranean,
          intensity: 1.4,
          position: [-6, -2, 4],
        },
        // Puntual naranja amanecer: acento calido secundario (R3.3).
        {
          type: 'point',
          color: theme.color.orange,
          intensity: 1.1,
          position: [4, -4, -5],
        },
      ],
    }
  }

  // Mobile (o sin caps): menos luces y SIN sombras por coste de GPU (R3.4).
  return {
    shadows: false,
    lights: [
      // Ambiental algo mas intensa para compensar la ausencia de luz clave.
      { type: 'ambient', color: theme.color.white, intensity: 0.5 },
      // Unica puntual dorada de relleno; sin castShadow.
      {
        type: 'point',
        color: theme.color.gold,
        intensity: 1.6,
        position: [3, 5, 5],
      },
    ],
  }
}

/**
 * Plataforma de iluminacion declarativa de la escena 3D.
 *
 * Traduce el resultado de `lightingPlan(caps)` a primitivas de React Three
 * Fiber. Cada entrada del plan se mapea a su etiqueta correspondiente
 * conservando `color`, `intensity`, `position` y `castShadow`.
 *
 * @param {Object} props
 * @param {import('../providers/capabilities.js').Capabilities} [props.caps]
 *   Capacidades vivas del dispositivo (determinan el plan de luces).
 * @returns {JSX.Element} Fragmento con las luces de la escena.
 */
export function LightingRig({ caps }) {
  const { lights } = lightingPlan(caps)

  return (
    <>
      {lights.map((light, index) => {
        const key = `${light.type}-${index}`

        if (light.type === 'ambient') {
          // La ambiental es omnidireccional: no lleva posicion ni sombras.
          return <ambientLight key={key} color={light.color} intensity={light.intensity} />
        }

        if (light.type === 'spot') {
          return (
            <spotLight
              key={key}
              color={light.color}
              intensity={light.intensity}
              position={light.position}
              castShadow={Boolean(light.castShadow)}
              angle={0.5}
              penumbra={0.8}
            />
          )
        }

        // Resto: luz puntual (point).
        return (
          <pointLight
            key={key}
            color={light.color}
            intensity={light.intensity}
            position={light.position}
          />
        )
      })}
    </>
  )
}
