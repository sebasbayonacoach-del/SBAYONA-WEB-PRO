# WORLD-3D-STRATEGY — Estrategia de profundidad y 3D de BAYONA

> FASE 6 · **CIERRE TRANSVERSAL** (WORLD-3D-STRATEGY + contratos documentales). Partida: `9d00f12` (Bloque 5 verificado local + remoto, árbol limpio). Autorización del auditor: **SOLO CIERRE DE FASE 6 — NO Fase 7**.
> Documentos rectores: `PLAN-FASE-6-WORLD-BUILDING.md` (el plan asigna este documento al cierre transversal), `BAYONA-WORLD-BIBLE.md` (mundos 00–08), `SPATIAL-LANGUAGE.md` (gramática espacial), `PAGE-BLUEPRINTS.md` (blueprints + matriz M.2), `MOTION-MAP.md` (presupuestos), `DESIGN-SYSTEM.md`.
> Condiciones vinculantes vigentes: **DF-009** (evidencia), **DF-010** (territorio ≠ folclore), **DF-012** (anti-burocracia). **DP-5** intacto. **D-008** (V2.0 rector): gates re-ejecutados siempre.
> Estado: **PROPUESTA DOCUMENTAL VINCULANTE PARA FASE 7**. No implementa nada: cero escenas, cero shaders, cero geometrías, cero canvas, cero dependencias, cero cambios de producción.

---

## A. PROPÓSITO — qué decide y qué no decide este documento

**DECIDE:**
1. Qué significa "profundidad" en BAYONA y qué medios la expresan (2D, composición, movimiento, 3D real, o su ausencia deliberada).
2. Qué rutas y mundos pueden albergar profundidad espacial, con qué clasificación y bajo qué condiciones.
3. El protocolo de admisión y rechazo de cualquier futuro momento 3D.
4. La política de degradación: móvil, reduced-motion, sin WebGL, error de escena.
5. La auditoría del elemento de profundidad existente y de la infraestructura durmiente.
6. Lo que Fase 7 puede hacer, no puede hacer y debe escalar.

**NO DECIDE:**
- Geometrías, modelos, shaders, cámaras, iluminación, paletas de escena ni assets (eso es Fase 7).
- Cambios de producción de ningún tipo.
- La existencia de escenas concretas: este documento puede concluir razonablemente **"no se añade ningún momento 3D nuevo"** — y esa sería una decisión de máxima calidad, no una carencia.

**Regla fundamental (no negociable):** EL 3D NO ES UN ESTILO. Nunca se admite porque una ruta "sea importante", "sea premium" o porque Three.js ya esté instalado. Se admite solo si la profundidad espacial comunica algo que composición, fotografía, tipografía o motion 2D no comunican igual, y su beneficio justifica el coste cognitivo, técnico y de rendimiento.

## B. PRINCIPIO MADRE — qué significa la profundidad en BAYONA

La profundidad NO es "usar objetos 3D". Es la distancia percibida entre el visitante y la información. En BAYONA existen **ocho formas de profundidad**, y solo la última es WebGL:

| # | Tipo | Medio | Dónde ya vive (CONFIRMADO) |
|---|---|---|---|
| P1 | **Editorial** | jerarquía tipográfica, escala, blanco/negro | todas las rutas (DESIGN-SYSTEM §3) |
| P2 | **Entre planos** | capas CSS, z-index escalonado, scrim sobre foto | PageHero (`page-hero-backdrop` + canvas slot) |
| P3 | **Documental** | datos que se revelan por orden (`data-cascade`) | `/programs`, `/shop`, `/resources` |
| P4 | **Fotográfica** | profundidad de campo real de la imagen, scrim, recorte | testimonios, media de hero |
| P5 | **Espacial narrativa** | recorrido de estados con scroll (`cinematic-stage`) | diseñada para `/` y `/parkour-academy` (M.2, no implementada) |
| P6 | **Interactiva ligera** | tilt/hover/magnético con puntero fino | `useMagnetic`, `CustomCursor` (desktop sin reduced-motion) |
| P7 | **3D real (WebGL)** | escena tridimensional en tiempo real | **NINGUNA ruta hoy** (ver C: infraestructura durmiente) |
| P8 | **Ausencia intencional** | el plano único como decisión (calma, claridad) | embudo, planes, lectura, 404 |

**Reglas derivadas (HARD):**
1. `immersive ≠ 3D`. Una página puede ser inmersiva sin 3D (P5) y puede tener 3D y ser agotadora.
2. **La ausencia de profundidad se diseña igual que su presencia** (P8 es una decisión de primera clase: embudo, decisión y lectura la requieren).
3. El medio por defecto de BAYONA es P1–P4. P5/P6 exigen justificación. P7 exige justificación **más** las 8 puertas de admisión (sección I).

## C. INVENTARIO REAL — qué existe HOY (verificado contra código, no memoria)

> Verificado el 2026-08-28 sobre HEAD `9d00f12` leyendo los archivos. Todo lo de esta sección es **CONFIRMADO** salvo etiqueta contraria.

### C.1 El elemento de profundidad VIVO de `/about` no es WebGL

- La ruta `/about` monta `GlobeTestimonials` (`src/components/GlobeTestimonials.jsx`, montado en `About.jsx`).
- Su "globo" es un **mapa 2D interactivo**: textura `earth-dark.jpg` servida **desde el CDN externo unpkg** (`https://unpkg.com/three-globe/example/img/earth-dark.jpg`) usada como `backgroundImage` con zoom por país (`MAP_FOCUS_PRESETS`: Colombia 7.2, España 6.4, Miami 9.2, Argentina 5.8) mediante `transform: scale()` de framer-motion.
- **15 marcadores reales** (`WORLD_MAP_MARKERS`): 10 en Bogotá, 3 en España (Valencia/Madrid), Miami, Buenos Aires — cada uno un `<button>` accesible (`aria-label`, `aria-pressed`) que abre la historia del testimonio con `aria-live`, imágenes lazy con `srcset` y espacio reservado "VIDEO PRÓXIMAMENTE".
- Reduced-motion: todas las transiciones a `duration: 0` / `initial: false` (CONFIRMADO).
- **Riesgo registrado (no se corrige en Fase 6):** dependencia de runtime de un CDN de terceros sin SRI — disponibilidad, privacidad y caché fuera de control del proyecto. Propuesta para Fase 7: **self-host de la textura**. Etiqueta: PROPUESTO.

### C.2 `Globe3D.jsx` — componente WebGL DORMANTE

- Globo low-poly WebGL real (`icosahedronGeometry`, flat shading, materiales de marca #0B0B0C/#F4A261/#E76F51) con **3 marcadores semánticos**: Colombia (origen y experiencia), España/Europa (formación y desarrollo actual), Internacional (visión) — `GLOBE_MARKERS`.
- **Ningún archivo de producción lo importa** (verificado por grep: solo tests y un comentario histórico en `AppErrorBoundary.jsx`). Estado: **DORMANTE/LEGACY** — candidato a reutilización o retirada en Fase 7; decisión que NO se toma aquí.
- Está **técnicamente ejemplar** y sirve como patrón de referencia: `supportsWebGL()`, `GlobeErrorBoundary → GlobeFallback` (lista HTML accesible), manejo de `webglcontextlost` → fallback, `resolveGlobeConfig` con reduced-motion (rotación 0, `frameloop: 'demand'`, controles desactivados) y DPR acotado, OrbitControls acotados (sin pan/zoom), `figcaption` honesto ("no representan clientes ni sedes").

### C.3 Infraestructura de escenas DORMANTE (`SceneMount` + variante `signature`)

- `SceneMount` está **cableado en `PageHero`** (Layout.jsx: `{scene && <SceneMount config={scene} className="page-hero-canvas" />}`), pero **NINGUNA ruta declara `scene=`** (verificado por grep sobre `src/pages`). Resultado: **coste WebGL cero en todas las rutas hoy**.
- `sceneRegistry` declara **una sola variante**: `signature` → `SignatureScene.jsx` con `React.lazy` (defaults desktop: 1200 partículas, 24 instancias, bloom 0.5, cámara [0,0,5]).
- `resolveSceneConfig` (`src/engine/config/sceneConfig.js`): función PURA fail-safe — variante desconocida o `enabled:false` → `null` (no se monta nada); degradación móvil real: `MOBILE_MAX_PARTICLES = 400`, `MOBILE_MAX_INSTANCES = 8`, DoF y aberración cromática OFF en móvil, DPR acotado `clampDpr` (2 desktop / 1.5 móvil).
- `Scene3D` con `React.lazy` → **code-splitting real**: `vendor-three` (826.94 kB / gzip 222.32 kB, medido en build) y `SignatureScene` (100.16 kB / gzip 25.99 kB) son chunks que **solo se descargan al montar una escena** (R22.7 CONFIRMADO).
- `SceneErrorBoundary`: retira el lienzo en silencio y reporta `trackEvent('scene_3d_error')`; la página sigue viva.

### C.4 Capacidades y handoff (contratos estables para Fase 7)

- `capabilities.js`: desktop ⇔ `(hover: hover) && (pointer: fine) && width > 768`; `dprLimit` 2/1.5; `pointerEffectsEnabled` = desktop && !reducedMotion; defaults SSR-safe mobile.
- `scrollHandoff.js`: `createHandoffSnapshot()` congelado con exactamente `progress (0..1) · velocity (px) · direction (-1|0|1) · viewport {width,height} · reducedMotion · mode · dprLimit`; `useScrollHandoff()` compone engine + capacidades y degrada seguro fuera del provider. **La escena decide su mapeo; el módulo solo garantiza datos normalizados.**

### C.5 Resumen del inventario

| Pieza | Estado | Coste hoy | Nota |
|---|---|---|---|
| GlobeTestimonials (mapa 2D + 15 marcadores) | **VIVO** en `/about` | textura CDN (peso NO MEDIDO) | self-host propuesto F7 |
| Globe3D.jsx (globo WebGL) | DORMANTE | 0 (no importado) | patrón de referencia; destino en F7 |
| SceneMount + `signature` (SignatureScene) | DORMANTE (cableado, sin ruta) | 0 (chunks lazy no descargados) | infraestructura lista, SIN uso |
| vendor-three | chunk lazy existente | 0 hasta montar escena | 826.94 kB / 222.32 gzip |
| capabilities / resolveSceneConfig / SceneErrorBoundary / scrollHandoff | VIVOS y testeados | — | la gobernanza de Fase 7 ya existe |

**Conclusión:** la infraestructura 3D está construida, probada y **sin usar**. BAYONA puede decidir sin prisa; ningún coste corre hoy.

## D. AUDITORÍA — hallazgo y corrección declarada (D-07a)

1. **Corrección declarada:** la documentación heredada afirmaba "Globe3D vivo en `/about`". El código vivo muestra que lo vivo es **GlobeTestimonials (mapa 2D)** y que Globe3D.jsx no tiene imports de producción. Por la jerarquía del Bloque 5 (código vivo > documentos), la matriz M.2 se **reinterpreta** en un único punto: la fila `/about` **conserva su clasificación EXISTENTE/EXCEPCIONAL**, pero el medio existente es el **mapa 2D interactivo** (P2/P6), no WebGL (P7). El concepto —profundidad-mapa-de-presencia para los mundos 00/05— permanece intacto; cambia el medio real. Corrección registrada aquí y referenciada al contradiction ledger de PAGE-BLUEPRINTS (ese documento no se toca: describía la intención; este describe la realidad).
2. **Globe3D.jsx dormante:** su calidad (a11y, fallback, reduced-motion, error handling) lo convierte en **patrón de referencia obligatorio** para cualquier escena futura. No se propone su activación: no hay ruta con necesidad P7 demostrada salvo `/parkour-academy` CONDICIONAL.
3. **El mapa 2D de `/about` es la prueba viviente del principio madre:** profundidad semántica (personas reales sobre el mundo) lograda **sin WebGL**. Es el estándar que toda propuesta 3D debe superar.

## E. PRUEBA DE NECESIDAD (obligatoria ANTES del gate de admisión)

Toda propuesta de momento espacial/3D responde las **17 preguntas**. Cualquier "no sé" cuenta en contra:

1. ¿Qué significado aporta? 2. ¿Qué desaparecería si se elimina? 3. ¿Puede una imagen 2D hacerlo mejor? 4. ¿Puede el texto hacerlo mejor? 5. ¿Puede el motion 2D hacerlo mejor? 6. ¿Aumenta la comprensión? 7. ¿Aumenta la memoria? 8. ¿Aumenta la identidad? 9. ¿Aumenta la conversión? 10. ¿Aumenta la carga cognitiva? 11. ¿Aumenta el peso? 12. ¿Aumenta el riesgo técnico? 13. ¿Funciona en móvil? 14. ¿Funciona con reduced-motion? 15. ¿Funciona con GPU modesta? 16. ¿Funciona sin interacción del usuario? 17. ¿Sigue siendo bueno si falla WebGL?

**Regla:** si no se puede defender con evidencia → clasificación **NO NECESARIO**. No se negocian las 13–17: son veto técnico.

## F. GATE DE ADMISIÓN (8 puertas, en orden — fallar una crítica = NO ADMITIR)

| Puerta | Pregunta | Tipo |
|---|---|---|
| G1 SIGNIFICADO | ¿Representa una idea importante del mundo/ruta? | Crítica |
| G2 NECESIDAD | ¿El 3D comunica mejor que la mejor alternativa 2D? (prueba E.3–E.5) | Crítica |
| G3 EXPERIENCIA | ¿Mejora la comprensión o la relación con la página? | Crítica |
| G4 COSTE | ¿Cabe en el presupuesto real? (vendor-three 222 kB gzip + SignatureScene 26 kB gzip hoy; medido, no inventado) | Crítica |
| G5 CAPABILITIES | ¿Existe degradación correcta por modo/DPR (`resolveSceneConfig`)? | Crítica |
| G6 ACCESIBILIDAD | ¿La experiencia se comprende sin 3D (fallback semántico, no caja vacía)? | Crítica |
| G7 REDUCED-MOTION | ¿Sigue funcionando sin movimiento, preservando el significado? | Crítica |
| G8 MOBILE | ¿Existe versión móvil razonable (no "desktop reducido")? | Crítica |

**Resultado:** las 8 en verde → admisible como CONDICIONAL (todavía requiere implementación validada en `/design-system` antes de ruta pública). Cualquier roja → NO ADMITIR. **No existe admisión por acumulación de puntos: una propuesta con 40/40 en la matriz de admisión (sección N) puede seguir siendo mala idea — el veto humano decide.**

**Veto humano obligatorio (última instancia):** *"¿Esto hace que BAYONA sea más BAYONA o simplemente más tecnológica?"*

## G. CLASIFICACIÓN POR RUTA (cruce PAGE-BLUEPRINTS × WORLD-BIBLE × esta estrategia)

Clasificación heredada de la matriz M.2 del Bloque 5 (CONFIRMADO) + condición de admisión/rechazo + fallback conceptual. **Cadena trazable:** ruta → función → mundo → necesidad espacial → clasificación → condición → fallback.

| Ruta | Mundo | Clasificación 3D | Razón | Condición de admisión (única vía) | Fallback conceptual |
|---|---|---|---|---|---|
| `/` | 00+02 | PROHIBIDO | El momento immersive vive en cinematic-stage (P5); el reparto de puertas es tipográfico | — | 2D por diseño |
| `/about` | 00+05 | **EXISTENTE/EXCEPCIONAL** | Mapa 2D vivo con 15 personas reales (GlobeTestimonials) — profundidad-mapa-de-presencia | Ya admitido (realidad de código) | El mapa YA ES el fallback digno |
| `/onboarding` | 00+07 | PROHIBIDO | El umbral sin chrome ES el momento fuerte | — | 2D por diseño |
| `/programs` | 07+02 | PROHIBIDO | Los datos y el precio mandan (decisión) | — | 2D por diseño |
| `/plan/raiz` | 07+01 | PROHIBIDO | Decisión pura; dignidad del retorno | — | 2D por diseño |
| `/plan/fuerza` | 07+01+02 | PROHIBIDO | Ídem | — | 2D por diseño |
| `/plan/rendimiento` | 07+02 | PROHIBIDO | Ídem; la evaluación es texto y datos | — | 2D por diseño |
| `/plan/elite` | 07+08 | PROHIBIDO | Relación y escasez real; DP-5 intacto | — | 2D por diseño |
| `/parkour-academy` | 03+05 | **POSIBLE CON JUSTIFICACIÓN** | Trayectoria/control: la única idea con potencial P7 real (Bloque 3: JUSTIFICADO) | Las 8 puertas (F) + presupuesto + fallback previo + validación en `/design-system` | Pila de estados estática (gramática móvil de cinematic-stage) |
| `/shop` | 04+08 | PROHIBIDO | Catálogo utilitario; el 3D no vende zapatillas | — | 2D por diseño |
| `/app` | 02+06 | PROHIBIDO | Claridad de estado ("no existe todavía") | — | 2D por diseño |
| `/community` | 05+08 | PROHIBIDO | F6-05: la comunidad NO usa el globo; su voz es el rail | — | 2D por diseño |
| `/resources` | 06+00 | PROHIBIDO | El conocimiento se lee, no se contempla | — | 2D por diseño |
| `/faq` | 07+06 | PROHIBIDO | Claridad absoluta (auditor §7) | — | 2D por diseño |
| `/checkout` | 07 | **PROHIBIDO ABSOLUTO** | Embudo: claridad > espectáculo (HARD) | NO EXISTE — no hay excepción estética | 2D por diseño |
| `/order-confirmation` | 08 | PROHIBIDO | CONTINUIDAD serena; no segunda venta | — | 2D por diseño |
| `/entrar` (alias) | 00 | PROHIBIDO | Sin identidad propia (hereda de `/onboarding`) | — | — |
| `*` (404) | — | PROHIBIDO | Recoloca, no vende | — | 2D por diseño |
| `/design-system` | — | (excluida) | Playground interno: admite demostraciones técnicas bajo contrato, sin mundo | Solo dentro del playground (noindex) | — |

**Balance: 1 EXISTENTE (medio 2D), 1 CONDICIONAL (`/parkour-academy`), 16 PROHIBIDO + 1 excluida. Este documento NO propone ningún momento 3D nuevo** — ese es su hallazgo de mayor calidad, defendido en la sección M.

## H. ESTRATEGIA POR MUNDO (00–08) — profundidad que le pertenece y que no

> Los mundos NO son estilos 3D (prohibida la literalidad: ORIGEN=esfera, CUERPO=anatomía, MÉTODO=geometría, MOVIMIENTO=partículas, EXPERIENCIA=objetos flotantes, COMUNIDAD=nodos, CONOCIMIENTO=biblioteca 3D, DECISIÓN=tarjetas flotantes, CONTINUIDAD=camino infinito). La profundidad pertenece al mundo por **función**, no por tema.

| Mundo | Profundidad que le pertenece | Que NO le pertenece | Evidencia | Riesgo espectáculo | 3D | Fallback / qué queda sin WebGL |
|---|---|---|---|---|---|---|
| 00 ORIGEN | P1/P2 editorial + presencia real (mapa de personas) | Abstracción simbólica del "origen" | GlobeTestimonials vivo; puerta D11 | Medio | 0 nuevo | El mapa 2D ya cumple: todo queda |
| 01 CUERPO | P4 fotográfica: cuerpo real, esfuerzo, biografía | Avatar, escaneo, anatomía, maniquí | testimonials.js (marco editorial) | Alto si se objetifica | 0 | Fotografía: el cuerpo real sigue ahí |
| 02 MÉTODO | P3 documental: datos que se revelan | Geometría abstracta del "método" | conversionContent.js (3 pasos) | Bajo | 0 | data-cascade |
| 03 MOVIMIENTO | P5 espacial: trayectoria, equilibrio, transferencia, progresión | Velocidad por velocidad; cámara épica | Blueprint §9; Bloque 3 JUSTIFICADO | **Alto** | Único candidato: CONDICIONAL (8 puertas) | Estados apilados estáticos: la progresión se cuenta igual |
| 04 EXPERIENCIA | P3/P2 utilitaria | Objetos flotantes de productos | J4/J6; shop sin checkout | Bajo | 0 | Catálogo 2D |
| 05 COMUNIDAD | Presencia y relación (personas, continuidad) | **Red de nodos decorativa** (trampa clásica) | F6-05; rail vivo | Medio | 0 | Rail de voces |
| 06 CONOCIMIENTO | P1 editorial pura | Biblioteca 3D, estanterías metafóricas | J1 | Bajo | 0 | — |
| 07 DECISIÓN | **Ausencia intencional (P8)** — la claridad como profundidad | Todo movimiento ornamental | M.3 HARD; auditor §7 | — | 0 | 2D |
| 08 CONTINUIDAD | P1/P2 relacional-temporal | "Segundo impacto", camino infinito | D7; blueprint §16 | Bajo | 0 | — |

**Regla de cuerpo (01 y transversal):** si la profundidad toca el cuerpo humano, respeta biografía, esfuerzo, escucha, recuperación, realidad y variabilidad. Prohibidos: avatar, escaneo futurista, modelo anatómico, escultura sin persona, abstracción tecnológica del cuerpo.

## I. PERFORMANCE Y DEGRADACIÓN — clases de experiencia espacial

Performance es parte de la dirección creativa, no una tarea de ingeniería posterior. Clases conceptuales para Fase 7 (estrategia, no API):

| Clase | Definición | Cuándo puede existir | Carga | Pausa/destrucción | Móvil | Reduced-motion | Sin WebGL / error |
|---|---|---|---|---|---|---|---|
| **A — sin WebGL** | La experiencia completa vive sin canvas (estado actual del sitio) | Siempre; es el estado por defecto de 18/19 entradas | 0 | — | Idéntica | Idéntica | Es el estado normal |
| **B — profundidad CSS/composición** | P1–P4 (scrim, capas, drift con `Parallax`) | Donde la matriz lo admita; ya cubierto por engine | Mínima (transform/opacity) | CSS | Factor 0.4 integrado | Imagen fija (factor 0) | Igual |
| **C — interacción espacial ligera** | P6 (tilt/hover/magnético) | Solo desktop sin reduced-motion (`pointerEffectsEnabled`) | Baja | Automática al salir | No aplica (modo touch = sin P6) | Desactivada | Igual |
| **D — WebGL excepcional** | P7 (escena real) | SOLO `/parkour-academy` tras 8 puertas + validación en `/design-system`; nada más hoy | vendor-three 222 kB gzip + escena 26 kB gzip, SOLO al montar (lazy, R22.7) | `frameloop: 'demand'` cuando no hay interacción; fuera de viewport → pausar; error → `SceneErrorBoundary` retira en silencio | Deber ser la primera pregunta, no la última; `resolveSceneConfig` ya degrada (≤400 partículas, ≤8 instancias, sin DoF) | `frameloop 'demand'`, rotación 0, controles off (patrón Globe3D) | `supportsWebGL()` false o `webglcontextlost` → fallback semántico (patrón GlobeFallback): **nunca una caja vacía** |

**Regla de presupuesto:** *una nueva escena debe justificar su coste* — ninguna aparece gratis en la arquitectura. No significa que todas compartan techo: significa que cada una defiende el suyo con medición. **Sin números inventados:** lo único medido hoy es el bundle de build (chunks arriba); LCP/CLS/INP por ruta siguen sin medir (heredado de la Fase 1: NO MEDIDO) — Fase 7 debe medir antes y después de cualquier escena.

**Coste de atención (no solo técnico):** una escena cuenta como carga de atención aunque esté en background. No es "gratis" por ser sutil: entra en el presupuesto de atención de M.4 del Bloque 5 y en el motion budget del engine.

## J. 3D + SCROLL Y 3D + MOTION BUDGET

**3D + scroll:** la relación futura se apoya en `useScrollHandoff()` (CONFIRMADO: snapshot congelado con `progress · velocity · direction · viewport · reducedMotion · mode · dprLimit`). Reglas de gobierno:
1. **El scroll controla la experiencia, nunca al revés.** Prohibido el scroll hijacking: ningún bloqueo del visitante para "ver la animación" (SPATIAL-LANGUAGE: la secuencia se recorre, no se secuestra).
2. La escena **decide su mapeo** (progress → cámara, velocity → inercia) dentro de su `useFrame`; el handoff solo garantiza datos normalizados y seguros (fail-safe fuera del provider).
3. `direction` y `velocity` permiten inercia con calma; prohibidos rebotes/overshoot (reglas de calma del engine).
4. La escena se pausa fuera de viewport (`frameloop: 'demand'` como patrón) — el scroll no paga por lo que no se ve.

**3D + motion budget:** una escena 3D es **consumidor de primera clase** del presupuesto: ocupa zona (`hero`/`background`), compite por la intensidad (`quiet`/`balanced`/`immersive` con límites 6/8/10 de `checkBudget`), y NO puede crear un sistema paralelo de movimiento. Coherencia con el engine (verificada, sin modificarlo):
- `quiet` no se vuelve "espacialmente muerto": la profundidad editorial (P1–P4) ya vive en quiet.
- `immersive` no se vuelve exceso técnico: el único momento immersive de la ruta ES el momento (escena O receta, nunca ambos).
- `balanced` no es comodín: mantiene su definición (comportamiento por defecto, hasta 2 simultáneos).
- Las 8 recetas siguen siendo el único vocabulario de motion 2D; el 3D no reinterpreta recetas ni crea "recetas 3D".
- El 3D **entra en el sistema existente** (capabilities → resolveSceneConfig → SceneMount → SceneErrorBoundary → fallback) o no entra.

## K. ANTI-PATTERNS 3D (prohibiciones específicas de BAYONA)

Lista mínima vinculante (ampliada con lo descubierto en el repo):

1. Esfera decorativa sin significado; partículas porque sí; humo digital.
2. Wireframes genéricos; grids futuristas; túneles sci-fi; planetas decorativos.
3. Neón y glow excesivo (el bloom ya tiene presupuesto en el engine — no se multiplica).
4. "Futurismo fitness": mancuernas/músculos/barras 3D como iconografía; ADN helicoidal; neuronas falsas.
5. Maniquíes anatómicos y escaneos corporales (regla de cuerpo, H).
6. Cromados de lujo vacío; hologramas; HUDs; interfaces de videojuego.
7. El mismo objeto 3D repetido en varias rutas (mundo ≠ tema reutilizable).
8. Cámara espectacular que destruye legibilidad; escena imposible de comprender sin movimiento.
9. 3D detrás de un CTA crítico o que monopoliza la atención (presupuesto de atención, M.4 Bloque 5).
10. 3D para ocultar una mala arquitectura de información.
11. Simulación costosa sin beneficio perceptible (coste sin memoria, sección N).
12. Red de nodos sociales en COMUNIDAD (F6-05).
13. Paisaje español, banderas, arquitectura turística o símbolos culturales decorativos (DF-010).
14. FOMO visual y efectos que secuestran el scroll (sección J).
15. "3D de demostración": una escena que existe para impresionar a otros diseñadores (test de diseñador, sección Q).
16. Duplicar el globo/la presencia del mapa fuera de `/about` (F6-04/F6-05 ya vigentes).

## L. LAS DOS LISTAS OBLIGATORIAS

### L.1 "NO NECESITA 3D" — las ausencias defendidas

- **`/checkout`, `/order-confirmation`, `/plan/*` NO necesitan 3D** porque su valor es la confianza y la claridad; el coste cognitivo de una escena competiría directamente con la decisión (HARD; auditor §7).
- **`/faq`, `/resources` NO necesitan 3D aunque podrían usarlo** (una "biblioteca 3D" es imaginable) porque su función es la recuperación de contenido: cualquier profundidad técnica ralentiza exactamente lo que prometen (velocidad de respuesta/uso).
- **`/community` sería PEOR con 3D** porque la pertenencia se expresa con voces reales (rail), y una red de nodos convertiría personas en métrica visual — justo lo que el marco editorial de testimonials.js prohíbe.
- **`/about` NO necesita MÁS 3D**: su mapa 2D ya demuestra la profundidad-mapa-de-presencia con mejor coste y mejor accesibilidad que un WebGL equivalente. Es el estándar, no el límite a superar.
- **`/programs`, `/shop`, `/app` NO necesitan 3D** porque comparar/comprar/entender un estado no gana nada espacial; data-cascade ya ordena la jerarquía.
- **404 NO necesita 3D** porque su única métrica es recolocar en el menor tiempo posible.
- **`/` NO necesita 3D en su hero** porque el reparto de puertas es tipográfico por decisión (D11) y el momento immersive ya tiene dueño (cinematic-stage, P5).
- **`/onboarding` NO necesita 3D** porque su momento fuerte es la ausencia de chrome: un canvas ensuciaría el umbral más limpio del sitio.

### L.2 "3D SOLO SI…" — umbrales explícitos (no "podría ser interesante")

- **`/parkour-academy`: 3D SOLO SI** (1) las 8 puertas (F) pasan con evidencia, (2) la trayectoria demuestra mejor comprensión de equilibrio/transferencia/progresión que la pila de estados de cinematic-stage, (3) el coste total (chunks lazy + FPS medido en móvil real) se justifica, (4) el fallback de pila estática está construido y validado ANTES, (5) la escena pasa por `/design-system` antes de la ruta pública, (6) Sebastián + auditor aprueban el resultado del gate.
- **Cualquier otro momento 3D futuro (hoy ninguno): 3D SOLO SI** nace de una evidencia nueva de negocio/experiencia (no de una capacidad técnica), pasa las 8 puertas, y se registra como D-xx en DECISIONS.md.

## M. MATRIZ DE ADMISIÓN PUNTUADA (herramienta, no verdad automática)

Para evaluar CUALQUIER propuesta futura (hoy solo tiene candidato real `/parkour-academy`). Cada dimensión 0–5:

SIGNIFICADO · DIFERENCIACIÓN · CLARIDAD · MEMORIA · COMPATIBILIDAD MÓVIL · FALLBACK · COSTE TÉCNICO (5 = coste mínimo) · RIESGO DE ESPECTÁCULO (5 = riesgo nulo)

**Reglas:** (1) la suma NO admite: una pieza con 40/40 puede ser una mala idea; (2) cualquier dimensión con 0–1 es veto aunque la suma sea alta; (3) el veto humano cierra siempre: *"¿Esto hace que BAYONA sea más BAYONA o simplemente más tecnológica?"*.

**Candidato actual (`/parkour-academy` trayectoria):** puntuación preliminar PROPUESTA — significado 4 (trayectoria es la idea central del mundo 03) · diferenciación 5 (única ruta con potencial P7) · claridad 3 (riesgo de competir con la escalera de niveles) · memoria 4 · móvil 2 (pendiente de demostrar; GPUS móviles y el gesto táctil son el mayor riesgo) · fallback 4 (pila estática ya definida por la gramática) · coste técnico 3 (222 kB gzip + FPS por medir) · riesgo espectáculo 2 (el mundo 03 tiene el riesgo más alto del sistema). **Suma 27/40 — NO admisible todavía: móvil (2) y riesgo espectáculo (2) no superan el veto hasta que Fase 7 demuestre lo contrario.** La no-admisión hoy es el resultado correcto y defendible.

## N. PRINCIPIO DE MEMORIA Y PRINCIPIO DE SUSTITUCIÓN

**Memoria:** un momento espacial merece existir solo si puede ser recordado por su significado. Test: *"¿cómo lo describiría una persona al día siguiente?"* — MAL: "había una cosa 3D muy guapa"; BIEN: "entendí la progresión porque vi la escalera". El mapa de `/about` pasa este test (personas reales sobre el mundo); un globo decorativo no.

**Sustitución:** para cada posible momento 3D, la versión IDEAL, REDUCIDA, SIN WEBGL y REDUCED-MOTION debe contar **la misma idea**. Si la idea depende de la tecnología, el concepto está mal planteado y se reformula (o se rechaza). Verificado contra lo vivo: el mapa de `/about` sostiene su significado en las cuatro versiones (es el caso de referencia).

## O. REGISTRO FINAL DE CONSISTENCIA (cruce de los 4 documentos)

Cruce WORLD-BIBLE × SPATIAL-LANGUAGE × PAGE-BLUEPRINTS × WORLD-3D-STRATEGY (+ código vivo). Sin armonización silenciosa:

| # | Hallazgo | Fuente A | Fuente B | Resolución | Impacto futuro |
|---|---|---|---|---|---|
| W1 | "Globe3D vivo en /about" vs realidad (GlobeTestimonials 2D vivo; Globe3D sin imports) | Blueprints B02/M.2 + BIBLE | Código (`About.jsx`, grep de imports) | **Código gana**: medio real = mapa 2D; clasificación EXISTENTE/EXCEPCIONAL se conserva con medio corregido | Fase 7: decidir destino de Globe3D.jsx (reusar/retirar), nunca "activarlo porque existía" |
| W2 | Textura del mapa servida desde unpkg (CDN externo, sin SRI) | Código vivo | Política de calidad/privacidad | Mantener en F6 (no se toca producción); PROPUESTO self-host en Fase 7 | F7: self-host con caché e integridad; riesgo de disponibilidad cerrado |
| W3 | Variante `signature` + SceneMount cableados sin ninguna ruta que los use | Código (Layout.jsx, sceneRegistry) vs blueprints (ninguna escena declarada) | Coherente: infraestructura lista, demanda no demostrada | Mantener dormante; cualquier activación pasa por las 8 puertas | F7: activar SOLO si `/parkour-academy` supera el gate; si no, retirada de código muerto candidata |
| W4 | Bloque 3 clasifica MOVIMIENTO "JUSTIFICADO"; la prueba de admisión puntuada da 27/40 con móvil=2 | BIBLE Parte II | Esta estrategia (M) | REFINADA: JUSTIFICADO = *admite evaluación*, no *garantiza escena*; hoy NO admisible | F7 decide con medición real en móvil |
| W5 | `SCROLL-STORY-MATRIX` marca 3D futuro en filas donde esta estrategia dice PROHIBIDO | Matriz F5 (heredada) | M.2 + G | **Gana la matriz actual**: corrección explícita ya declarada en Bloque 4 (§sección de correcciones) y aquí consolidada | Fase 7 lee M.2/G como vigentes, no la matriz F5 |
| W6 | Sin duplicación: este documento no repite blueprints ni matriz — cruza y decide 3D | Este doc | PAGE-BLUEPRINTS | Cumple DF-012 | — |

## P. IMPLEMENTATION READINESS (Fase 7 puede empezar sin inventar el significado)

| Caso | Ruta | ¿Puede Fase 7 empezar sin inventar significado? | Ambigüedad restante |
|---|---|---|---|
| A | `/` | SÍ — puerta D11 + cinematic-stage immersive + CTA seco (M.2) + 3D PROHIBIDO (G) | Libre execution (sana) |
| B | `/about` | SÍ — mapa 2D vivo es la realidad; Fase 7 conserva/mejora, no inventa | W2 (self-host textura, propuesta) |
| C | `/programs` | SÍ — comparativa + data-cascade + precio delante; 3D PROHIBIDO | Ninguna relevante |
| D | `/plan/fuerza` | SÍ — quiet, ficha argumental, sistema compartido (M.13 Bloque 5) | Voz editorial ya spec'd |
| E | `/checkout` | SÍ — HARD total: quiet-transition única, cero técnicas | Ninguna (HARD) |
| F | `/parkour-academy` | SÍ para TODO lo no-3D (escalera, grupos, registro); el 3D queda CONDICIONAL con las 8 puertas | La escena en sí: ABIERTA CON DUEÑO (gate + auditoría) |

**Ninguna ruta exige a Fase 7 inventar significado.** Las ambigüedades restantes tienen dueño y condición.

## Q. LIBERTAD CREATIVA (FIJO / GUIADO / LIBRE / PROHIBIDO)

La meta NO es cinco páginas idénticas: es **libertad creativa dentro de límites coherentes**.

| Nivel | Qué abarca | Ejemplos |
|---|---|---|
| **FIJO** | Propósito, pregunta, momento irreductible, geometría de información, mundo, intensidad, 3D (clasificación), prohibiciones HARD | Todo lo de M.2 (Bloque 5) |
| **GUIADO** | Recetas por zona (pares documentados), text motion, transiciones entre estados, tratamiento de imagen (marco editorial) | M.2 columnas de zona; blueprints §X.10 |
| **LIBRE** | Composición fina dentro de la geometría; ritmo de revelado; crop/fotografía; micro-escala de animación; voz editorial concreta | "Cómo se ve" dentro del contrato |
| **PROHIBIDO** | M.3 (16 decisiones negativas) + anti-patterns (K) + folclore territorial + inventar vocabulario | HARD |

## R. WORLD BUILDING — PRUEBA FINAL DE CALIDAD (15/15 respondidas)

1. ¿Cada mundo necesita existir? **SÍ** — verificado en Bloque 3 (matriz de diferenciación, 0 fusiones; W.3 declara las 3 debilidades). 2. ¿Cada ruta tiene función única? **SÍ** — Bloque 4 TEST 1–4 + M.13 (18/18). 3. ¿Cada clasificación 3D tiene razón? **SÍ** — G (columna Razón por fila). 4. ¿Hay alguna escena propuesta solo por atractivo? **NO** — este documento no propone ninguna escena. 5. ¿Alguna ruta demasiado diseñada? **`/` y `/parkour-academy` están en el límite** (M.5 ALTO) — con degradaciones escritas. 6. ¿Alguna insuficientemente diferenciada? **NO** (M.13). 7. ¿La claridad siempre gana? **SÍ** — HARD transversal (CTA) + embudo blindado. 8. ¿La experiencia sigue siendo BAYONA sin 3D? **SÍ** — el sitio entero ya funciona sin WebGL hoy (inventario C). 9. ¿Puede funcionar sin movimiento? **SÍ** — reduced-motion respetado en lo vivo y exigido en las clases I. 10. ¿En móvil? **SÍ** — degradación real (`resolveSceneConfig`) + móvil como primera pregunta (clase D). 11. ¿Con reduced-motion? **SÍ** — ídem. 12. ¿Puede fallar el 3D sin romper la página? **SÍ** — SceneErrorBoundary + GlobeErrorBoundary + GlobeFallback verificados en código. 13. ¿Hay evidencia para las decisiones caras? **SÍ** para lo EXISTENTE (código) y las 8 puertas para lo CONDICIONAL. 14. ¿Fase 7 sabrá qué NO hacer? **SÍ** — M.3 + K + L.1 + M.12 MUST NOT. 15. ¿Fase 8 sabrá qué implementar sin reinterpretar el negocio? **SÍ** — M.2 (matriz) + M.12 (contrato) + handoff.

## S. AUTOAUDITORÍA DEL DOCUMENTO (tests A–O del auditor)

| Test | Respuesta real |
|---|---|
| A ¿3D por inercia? | NO — inventario demuestra que todo lo 3D está dormante y sin demanda |
| B ¿Propuestas de cualquier marca? | NO — cada ausencia/condición cita evidencia del repo (D11, F6-04/05, auditor §7) |
| C ¿Decoración disfrazada de significado? | NO — no se propone ninguna escena; las ausencias son el resultado |
| D ¿Rutas de decisión contaminadas? | NO — 3D PROHIBIDO/ABSOLUTO en planes/checkout/confirmación/faq (G, M.3) |
| E ¿Mobile como degradación tardía? | NO — clase D exige móvil como primera pregunta; `resolveSceneConfig` ya degrada |
| F ¿Reduced-motion conserva significado? | SÍ — patrón Globe3D (rotación 0, demand) + sustitución (N) |
| G ¿Fallback digno? | SÍ — GlobeFallback semántico como patrón; pila estática para academia |
| H ¿Globe3D realmente auditado? | SÍ — C.2/D: dormante, sin imports, técnicamente ejemplar |
| I ¿Performance inventado? | NO — solo bundle medido; LCP/CLS/INP marcados NO MEDIDO |
| J ¿API conceptual nueva innecesaria? | NO — se conservan taxonomía HARD/STRONG/COND/OPEN del Bloque 5 y las 4 clasificaciones 3D |
| K ¿Contradice PAGE-BLUEPRINTS? | NO — corrige un punto (medio real de /about) por jerarquía, registrado (D, O-W1) |
| L ¿Contradice SPATIAL-LANGUAGE? | NO — P5/P8 son coherentes con sus estados y clases |
| M ¿Contradice WORLD-BIBLE? | NO — W4 refina JUSTIFICADO → evaluación condicionada |
| N ¿Folclore territorial? | NO — K.13 prohíbe; territorio = presencia real (GlobeTestimonials) |
| O ¿Profundidad confundida con 3D? | NO — 8 tipos (P1–P8); P8 es la ausencia intencional |

## T. HANDOFF A FASE 7 Y PLAN DE VALIDACIÓN

**FASE 7 PUEDE:** implementar todo lo FIJO/GUIADO de M.2 (Bloque 5) y de esta estrategia · evaluar el 3D de `/parkour-academy` pasando las 8 puertas con medición real · proponer profundidad B/C donde la matriz lo admita · decidir el destino de `Globe3D.jsx` (reusar/retirar, con registro) · self-hostear la textura del mapa (W2).

**FASE 7 NO PUEDE:** activar escenas fuera de la clasificación (G) · diseñar escenas antes del fallback · saltarse `/design-system` como banco de pruebas · crear vocabulario/recetas/tokens nuevos · secuestrar el scroll · tocar producción sin gate · convertir PROPUESTO en CONFIRMADO.

**FASE 7 DEBE ESCALAR** (a `docs/DECISIONS.md` → auditor → Sebastián): cualquier excepción a M.3 · la admisión/rechazo final de la escena de academia (resultado de las 8 puertas) · conflictos de fuente no resueltos por M.0 (Bloque 5) · decisiones HIGH cost (M.6 Bloque 5).

**PLAN DE VALIDACIÓN Fase 7:** (1) medir LCP/CLS/INP por ruta ANTES de implementar (hoy NO MEDIDO); (2) prototipar la escena candidata en `/design-system` (noindex) con fallback ya construido; (3) medir de nuevo con la escena montada y sin montar (comparación de chunks y FPS móvil real); (4) pasar la matriz de admisión (M) con datos medidos; (5) veto humano + auditoría.

## U. STOP Y ESTADO

- **Fase 6 queda COMPLETA en su componente transversal:** mundos (B3) + gramática (B2) + blueprints (B4) + matriz (B5) + **estrategia 3D (este documento)**.
- **Conclusión central del documento: NO se añade ningún momento 3D nuevo en Fase 7 salvo el candidato condicional de `/parkour-academy`, que hoy NO supera su propio gate (27/40, móvil=2).** La web ya es espacial sin WebGL (inventario C): P1–P4 en todas las rutas, mapa-presencia vivo en `/about`, infraestructura P7 lista y dormante.
- **STOP ABSOLUTO:** no iniciar Fase 7 — 3D Contextual, ni implementar escenas, hasta la auditoría externa.
- DP-5 intacto · DF-009/DF-010/DF-012 vigentes · LA WEB ES ESPAÑOLA.

**El resultado más impresionante de esta estrategia es una decisión: la contención.**









