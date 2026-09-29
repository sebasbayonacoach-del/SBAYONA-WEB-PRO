// Scene_Registry - catalogo de variantes de escena 3D (Requirement 25.1).
//
// Fuente unica que declara, por cada variante de escena, su componente React,
// sus parametros base (`SceneParams`) y los assets que necesita cargar. La
// escena 3D (Tareas 7-12) consume estas variantes a traves del provider.
//
// IMPORTANTE: los `defaults` son los valores de referencia para DESKTOP
// (calidad completa). La degradacion progresiva por dispositivo/capacidad
// (mobile, low-power, reduced-motion) NO se aplica aqui: la calcula la funcion
// pura `resolveSceneConfig` (Tarea 4.2) a partir de estos valores base.

import { lazy } from 'react'

/**
 * Parametros ajustables de una escena 3D. Los valores declarados en el
 * registro corresponden al perfil Desktop de calidad completa.
 *
 * @typedef {Object} SceneParams
 * @property {number} particleCount   Numero de particulas del sistema.
 * @property {number} instanceCount   Numero de instancias de malla renderizadas.
 * @property {number} bloomIntensity  Intensidad del post-proceso de bloom.
 * @property {number} dissolve        Progreso de disolucion, normalizado 0..1.
 * @property {number} glowIntensity   Intensidad del glow/emisivo.
 * @property {[number, number, number]} cameraPosition  Posicion de camara [x, y, z].
 */

/**
 * Definicion de una variante de escena en el registro.
 *
 * @typedef {Object} SceneVariant
 * @property {React.ComponentType|null} component  Componente R3F de la escena
 *   (null como placeholder hasta que se cablee en las Tareas 7-12).
 * @property {SceneParams} defaults  Parametros base (perfil Desktop).
 * @property {string[]} assets       Rutas de assets a precargar para la variante.
 */

/**
 * Catalogo de variantes de escena disponibles.
 *
 * @type {Record<string, SceneVariant>}
 */
export const sceneRegistry = {
  signature: {
    component: lazy(() => import('../scene/SignatureScene.jsx')),
    defaults: {
      particleCount: 1200,
      instanceCount: 24,
      bloomIntensity: 0.5,
      dissolve: 0,
      glowIntensity: 0.35,
      cameraPosition: [0, 0, 5],
    },
    assets: [],
  },

  // ── TRAYECTORIA · greybox del laboratorio (Lote 2, FASE A) ───────────────
  // NO es una escena de producción: solo la monta el laboratorio DOM de
  // /design-system (playground `noindex`), nunca una ruta pública. Autorizada
  // como EVALUACIÓN AISLADA por docs/DECISIONS.md (D-009); la admisión pública
  // sigue cerrada y la sigue vigilando 3D-ADMISSION-RECORD.md y el guard
  // src/test/fase7aSceneGovernance.test.js.
  // `assets: []` es un contrato, no un detalle: el greybox es 100 % procedural
  // (cero descargas de modelos/texturas). Si alguien añade un asset aquí, tiene
  // que pasar por el presupuesto de carga del MASTERPLAN, no por este fichero.
  trajectory: {
    component: lazy(() => import('../scene/TrajectoryScene.jsx')),
    defaults: {
      // Sin sistema de partículas ni cumulo instanciado: los valores bajos no
      // son un ajuste de calidad, son la ausencia del subsistema (y dejan
      // constar en el registro para que `resolveSceneConfig` no los infle).
      particleCount: 0,
      instanceCount: 3,
      bloomIntensity: 0,
      dissolve: 0,
      glowIntensity: 0,
      // Encuadre inicial del <Canvas>. Debe coincidir con el de la primera
      // estación (VIEWS.understand.wide.position, en el módulo de datos de la
      // maqueta): la escena corta al suyo en el primer montaje, así que un
      // número suelto distinto no produce un salto visible — produce un primer
      // fotograma con otro encuadre y la mentira silenciosa de que «el registro
      // dice una cosa y la escena otra». La igualdad la vigila
      // src/test/fase7aSceneGovernance.test.js; aquí no se importa el módulo de
      // datos a propósito: shared config no puede conocer una escena del lab.
      cameraPosition: [7.81, 4.49, 9.84],
    },
    assets: [],
  },

  // ── FASE 11 · escenas inmersivas de producción (PLAN_3D_INMERSIVO.md §3.4)
  // Aprobadas para rutas públicas; cargan SOLO vía lazy() y degradan por
  // dispositivo a través de resolveSceneConfig.
  hero: {
    component: lazy(() => import('../scene/HeroScene.jsx')),
    defaults: {
      particleCount: 3000,
      instanceCount: 0,
      bloomIntensity: 0.8,
      dissolve: 0,
      glowIntensity: 0.6,
      cameraPosition: [0, 0.4, 6],
    },
    assets: [],
  },
  globe: {
    component: lazy(() => import('../scene/GlobeScene.jsx')),
    defaults: {
      particleCount: 600,
      instanceCount: 0,
      bloomIntensity: 0.3,
      dissolve: 0,
      glowIntensity: 0.25,
      cameraPosition: [0, 0, 4],
    },
    assets: [],
  },
  parkour: {
    component: lazy(() => import('../scene/ParkourScene.jsx')),
    defaults: {
      particleCount: 800,
      instanceCount: 12,
      bloomIntensity: 0.4,
      dissolve: 0,
      glowIntensity: 0.3,
      cameraPosition: [0, 2, 8],
    },
    assets: [],
  },
  showroom: {
    component: lazy(() => import('../scene/ShowroomScene.jsx')),
    defaults: {
      particleCount: 1000,
      instanceCount: 4,
      bloomIntensity: 0.6,
      dissolve: 0,
      glowIntensity: 0.5,
      cameraPosition: [0, 1, 7],
    },
    assets: [],
  },
  showcase: {
    component: lazy(() => import('../scene/PhoneScene.jsx')),
    defaults: {
      particleCount: 400,
      instanceCount: 0,
      bloomIntensity: 0.4,
      dissolve: 0,
      glowIntensity: 0.3,
      cameraPosition: [0, 0.3, 4],
    },
    assets: [],
  },
  hologram: {
    component: lazy(() => import('../scene/HologramCard.jsx')),
    defaults: {
      particleCount: 350,
      instanceCount: 0,
      bloomIntensity: 0.35,
      dissolve: 0,
      glowIntensity: 0.25,
      cameraPosition: [0, 0, 2.2],
    },
    assets: [],
  },
  // ── SUMINISTRO bayona-3d-supply (aplicar-supply.cjs) ──────────────
  barbell: { component: lazy(() => import('../scene/BarbellScene.jsx')), defaults: { particleCount: 0, instanceCount: 0, bloomIntensity: 0.2, dissolve: 0, glowIntensity: 0.25, cameraPosition: [2.3, 0.75, 1.8] }, assets: [] },
  dumbbells: { component: lazy(() => import('../scene/DumbbellRackScene.jsx')), defaults: { particleCount: 0, instanceCount: 12, bloomIntensity: 0.2, dissolve: 0, glowIntensity: 0.25, cameraPosition: [1.7, 1.0, 2.7] }, assets: [] },
  kettlebell: { component: lazy(() => import('../scene/KettlebellScene.jsx')), defaults: { particleCount: 0, instanceCount: 10, bloomIntensity: 0.2, dissolve: 0, glowIntensity: 0.25, cameraPosition: [0.9, 0.32, 1.15] }, assets: [] },
  weightstack: { component: lazy(() => import('../scene/WeightStackScene.jsx')), defaults: { particleCount: 0, instanceCount: 20, bloomIntensity: 0.2, dissolve: 0, glowIntensity: 0.25, cameraPosition: [1.0, 0.46, 1.3] }, assets: [] },
  plyobox: { component: lazy(() => import('../scene/PlyoBoxScene.jsx')), defaults: { particleCount: 0, instanceCount: 0, bloomIntensity: 0.2, dissolve: 0, glowIntensity: 0.25, cameraPosition: [0.95, 0.42, 1.15] }, assets: [] },
  punchbag: { component: lazy(() => import('../scene/PunchBagScene.jsx')), defaults: { particleCount: 0, instanceCount: 0, bloomIntensity: 0.2, dissolve: 0, glowIntensity: 0.25, cameraPosition: [1.7, 1.35, 2.3] }, assets: [] },
  bench: { component: lazy(() => import('../scene/BenchScene.jsx')), defaults: { particleCount: 0, instanceCount: 7, bloomIntensity: 0.2, dissolve: 0, glowIntensity: 0.25, cameraPosition: [1.15, 0.62, 1.35] }, assets: [] },
  platetree: { component: lazy(() => import('../scene/PlateTreeScene.jsx')), defaults: { particleCount: 0, instanceCount: 9, bloomIntensity: 0.2, dissolve: 0, glowIntensity: 0.25, cameraPosition: [1.2, 0.55, 1.35] }, assets: [] },
  scale: { component: lazy(() => import('../scene/ScaleScene.jsx')), defaults: { particleCount: 0, instanceCount: 0, bloomIntensity: 0.2, dissolve: 0, glowIntensity: 0.25, cameraPosition: [0, 1.0, 2.4] }, assets: [] },
  timer: { component: lazy(() => import('../scene/IntervalTimerScene.jsx')), defaults: { particleCount: 0, instanceCount: 0, bloomIntensity: 0.2, dissolve: 0, glowIntensity: 0.25, cameraPosition: [0, 0.34, 0.45] }, assets: [] },
  recovery: { component: lazy(() => import('../scene/RecoveryKitScene.jsx')), defaults: { particleCount: 0, instanceCount: 0, bloomIntensity: 0.2, dissolve: 0, glowIntensity: 0.25, cameraPosition: [0, 0.14, 0.95] }, assets: [] },
  pullupbar: { component: lazy(() => import('../scene/PullUpBarScene.jsx')), defaults: { particleCount: 0, instanceCount: 0, bloomIntensity: 0.2, dissolve: 0, glowIntensity: 0.25, cameraPosition: [0, 1.15, 2.6] }, assets: [] },
  viewer: { component: lazy(() => import('../scene/ProductViewerScene.jsx')), defaults: { particleCount: 0, instanceCount: 0, bloomIntensity: 0.2, dissolve: 0, glowIntensity: 0.25, cameraPosition: [1.6, 0.9, 1.9], object: 'barbell', structure: false }, assets: [] },

}
