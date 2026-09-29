// Experience_Engine - barrel publico del motor visual (Requirement 24.1).
//
// Punto unico de entrada para consumir el motor desde la app existente:
//   import { ExperienceProvider, useCapabilities } from './engine'
//
// Los exports se habilitan de forma incremental conforme se implementan los
// modulos en las tareas del plan (.kiro/specs/premium-3d-experience/tasks.md):
// se descomenta cada linea al crear su modulo.

// --- Provider raiz (Tarea 16) ---
export { ExperienceProvider, useEngineScroll, useScrollState } from './providers/ExperienceProvider.jsx'

// --- Capability_Manager (Tarea 3) ---
export {
  CapabilityProvider,
  CapabilityContext,
  resolveMode,
  pointerEffectsEnabled,
} from './providers/CapabilityProvider.jsx'
export { useCapabilities } from './hooks/useCapabilities.js'

// --- Configuracion / tokens (Tareas 2 y 4) ---
export { theme } from './config/theme.js'
export { motionTokens, tierDuration, tierEase, distancePx } from './config/motionTokens.js'
export { sceneRegistry } from './config/sceneRegistry.js'
export { resolveSceneConfig, clampDpr } from './config/sceneConfig.js'
export { resolveMotionProfile } from './config/motionProfile.js'

// --- Design System 2.0 (Fase 3): tokens responsivos y presets 3D ---
export { BREAKPOINTS, minWidth, maxWidth } from './config/breakpoints.js'
export {
  cameraPresets,
  materialPresets,
  depthLayers,
  sceneMotion,
  resolveCameraPreset,
  resolveMaterialPreset,
} from './config/scenePresets.js'

// --- Scroll y ciclo de vida de recursos (Tarea 5) ---
export { useLenis } from './hooks/useLenis.js'
export { useScrollProgress } from './hooks/useScrollProgress.js'
export { useSticky } from './hooks/useSticky.js'
export { useDisposable, createDisposableRegistry } from './hooks/useDisposable.js'

// --- Scroll Storytelling (Fase 5) ---
export { useSectionProgress, resolveRange, SECTION_RANGES } from './scroll/useSectionProgress.js'
export {
  useScrollHandoff,
  createHandoffSnapshot,
  readViewport,
} from './scroll/scrollHandoff.js'
export {
  StickyStage,
  resolveStageLength,
  resolveStageIndex,
  STAGE_DEFAULT_LENGTH,
} from './scroll/StickyStage.jsx'
export { HorizontalPassage, PASSAGE_DEFAULT_LENGTH } from './scroll/HorizontalPassage.jsx'

// --- Recipes: intensidad, recetario y contrato de pagina (Fase 5) ---
export {
  MOTION_INTENSITIES,
  DEFAULT_INTENSITY,
  resolveIntensity,
  scaleDistance,
  scaleDuration,
} from './recipes/intensity.js'
export { MOTION_RECIPES, RECIPE_LIST, resolveRecipe, recipesUseKnownTokens } from './recipes/index.js'
export { MOTION_BUDGETS, resolveBudget, checkBudget } from './recipes/motionBudget.js'
export {
  DEFAULT_PAGE_MOTION,
  TEXT_MOTION_MODES,
  resolvePageMotionContract,
  validatePageMotionContract,
  describeMotionOffer,
} from './recipes/pageMotionContract.js'

// --- Escena 3D (Tareas 7-12) ---
// Fase 7B (hallazgo 7A-01): estas reexportaciones se retiraron del barrel a
// proposito. `Scene3D.jsx` importa `@react-three/fiber` de forma estatica, y
// cualquier `export ... from` aqui hacia que el barrel (consumido por el shell
// via main.jsx/App.jsx) arrastrara el grafo de fiber — que incluye su propia
// copia de react-dom — al chunk de entrada de TODAS las rutas (vendor-three,
// 216,48 kB gzip). El consumidor real (`Layout.jsx`) ya importa `SceneMount`
// por ruta directa, y `Scene3D` no tiene consumidores externos. Para montar
// escenas: `import { SceneMount } from '../engine/scene/SceneMount.jsx'`.
// Lo vigila src/test/fase7aSceneGovernance.test.js.

// --- Motion_System (Tarea 14) ---
export { Reveal } from './motion/Reveal.jsx'
export { TextReveal } from './motion/TextReveal.jsx'
export { useReveal, useScrollLinked } from './hooks/useReveal.js'
export { PageTransition } from './motion/PageTransition.jsx'
export { MagneticButton } from './motion/MagneticButton.jsx'
export { useMagnetic, magneticOffset } from './hooks/useMagnetic.js'
export { RippleButton } from './motion/RippleButton.jsx'
export { useTilt, tiltAngles } from './hooks/useTilt.js'

// --- Tipografia cinetica (Fase 5) ---
export { Marquee, MARQUEE_BASE_DURATION } from './motion/Marquee.jsx'
export { TextMask } from './motion/TextMask.jsx'

// --- Efectos globales (Tarea 15) ---
export { CustomCursor } from './effects/CustomCursor.jsx'
export { GrainOverlay } from './effects/GrainOverlay.jsx'
export { GlowTreatment } from './effects/GlowTreatment.jsx'
export { Parallax } from './effects/Parallax.jsx'

// --- Loader de marca (Tarea 16) ---
export { Loader } from './effects/Loader.jsx'
