# PLAN OPERATIVO FINAL — FASE 6 · WORLD BUILDING (BAYONA WEB)

> Presentado según PROMPT MAESTRO — FASE 6 · WORLD BUILDING V1.0 §33 (PASO E).
> **AUDITADO Y APROBADO CON CORRECCIONES (ChatGPT, 2026-08-27): "🟢 APROBADO PARA AVANZAR, con correcciones obligatorias al plan antes de implementar".** Las 4 correcciones obligatorias + el checkpoint de verificación quedan incorporados en esta versión. **Prompt rector: PROMPT MAESTRO V2.0** (sustituye a V1.0 como norma de ejecución de Fase 6).
> Estado: **FASE 6 AUTORIZADA** — plan auditado; checkpoint de verificación (PASOS 1–3 de V2.0) ejecutado de verdad; **STOP antes del BLOQUE 1** hasta que el auditor revise este informe de verificación con Sebastián.
> Fecha: 2026-08-27 · Repo: github.com/sebascontigo/bayona · Rama: main
> Ubicación canónica: raíz del repo (instrucción de Sebastián 2026-08-27: todos los documentos del agente a Git). Cualquier copia fuera del repo es redundante.

---

## 0. PRE-FLIGHT REPORT (PASOS A–B ejecutados de verdad)

| Comprobación | Resultado | Clasificación |
|---|---|---|
| HEAD real al iniciar | `bfcf6b4` = origin/main, árbol limpio, 0 commits remotos por delante | CONFIRMADO (git fetch + rev-parse) |
| Commits posteriores a la sincronización | Ninguno | CONFIRMADO |
| D-004 (push directo) | Vigente (docs/DECISIONS.md) | CONFIRMADO |
| **DF-006** | **Confirmación explícita de Sebastián existe**: (1) "dale, avancemos" citado en el veredicto del auditor; (2) veredicto ChatGPT "🟢 B — APROBADA PARA AVANZAR" + "Confirmamos DF-006 así: DF-006 APROBADA: FASE 6 = WORLD BUILDING" con regla absoluta documental; (3) entrega del PROMPT MAESTRO FASE 6. Registrada como **APROBADA** en docs/DECISIONS.md según protocolo §25 | CONFIRMADO |
| DP-5 | PENDIENTE (solo Sebastián). **Fuera de Fase 6** (§26): no se tocará el claim ELITE en ningún blueprint | CONFIRMADO |
| Definición vigente de Fase 6 | WORLD BUILDING, 5 bloques, 100% documental y estratégica | CONFIRMADO |
| Rutas reales | **Inventario normalizado pendiente de esta corrección** — ver §0.1 (corrección obligatoria #4 del auditor): el sitio tiene 16 rutas públicas canónicas + 1 alias + fallback 404 + 1 ruta interna. El número "17" designa DOS conjuntos distintos según la fuente (ver §0.1). Verificado contra `src/lib/seo/routeMeta.js`, no copiado | CONFIRMADO |
| Registro documental | Commit `d8fd587` (solo docs/) pushed; HEAD = origin/main; árbol limpio | CONFIRMADO |
| Convención de referencias | Aplicado el criterio del auditor: los docs versionados no congelan el HEAD vivo; registran commit auditado / último commit de código (`70606dd`) / commits documentales / fecha | CONFIRMADO |

### 0.1 CHECKPOINT DE VERIFICACIÓN V2.0 (PASOS 1–3, ejecutados de verdad el 2026-08-27 sobre `046a37c`)

Ordenado por el auditor antes de empezar el Bloque 1. Resultados reales, no copiados:

| Comprobación | Resultado real | Clasificación |
|---|---|---|
| HEAD local = origin/main | `046a37ce67679cd351ef9f84cf461dc5ae3471c7` en ambos; árbol limpio; 0 commits por delante/detrás | CONFIRMADO (git fetch + rev-parse) |
| `046a37c` existe en origin/main y contiene el plan | Verificado en GitHub y en local; cadena 70606dd (código) → 2de0a6c → bfcf6b4 → d8fd587 → 046a37c (docs) | CONFIRMADO |
| Gate tests (`npm test`) | **71/71 archivos · 381/381 tests passed** (36.63 s) — ejecución actual, no histórica | CONFIRMADO |
| Gate lint (`npm run lint`) | **0 errores · 16 warnings** — ejecución actual | CONFIRMADO |
| Gate build (`npm run build`) | **OK, built in 12.03 s; vendor-three 826.94 kB (gzip 222.32 kB)** — ejecución actual | CONFIRMADO |
| Gate E2E (`npm run test:visual`) | **41 passed (3.6 min)** — ejecución actual | CONFIRMADO |
| Recetas del engine | 8 ids exactos re-verificados por grep en `src/engine/recipes/index.js` | CONFIRMADO |
| Intensidades / presupuestos / rangos | `quiet/balanced/immersive`; pesos hero 3 / body 2 / supporting 1 / cta 2 / background 0; `traverse/enter/pin/exit` — re-verificados en fuente | CONFIRMADO |
| 3D vivo | **Globe3D es la única escena viva**: montada en `/about` vía `GlobeTestimonials` (About.jsx:194). `sceneRegistry` registra una sola variante (`signature`, lazy) que **no está montada en ninguna página**; ningún `PageHero` recibe prop `scene` | CONFIRMADO |
| Planes de membresía | 4 ids en `offerings.js`: RAIZ / FUERZA / RENDIMIENTO / ELITE → 4 rutas `/plan/*` derivadas | CONFIRMADO |
| Contradicciones materiales detectadas | Ninguna que cambie definición de mundos, alcance de rutas, DP-5, o exija código/deps. Sí se detectó la ambigüedad del doble "17" (resuelta en §0.2, era documental) | CONFIRMADO |

### 0.2 INVENTARIO DE RUTAS NORMALIZADO (corrección obligatoria #4 — vinculante para D-01)

**Ambigüedad detectada y resuelta:** el número "17" aparece en dos fuentes con conjuntos DISTINTOS:
- `ROUTE_META` (`routeMeta.js`) tiene **17 claves** = 16 rutas públicas canónicas (13 estáticas + 4 `/plan/*` − 1 interna que también es estática) + 1 ruta interna (`/design-system`). Es decir: 13 estáticas + 4 planes = 17 claves, de las cuales 1 es interna.
- El contrato de baseline (`baselineContract.test.js`, ROUTES.md) habla de **"17 rutas públicas"** = 16 canónicas + 1 alias (`/entrar`).

Para que D-01 no pueda fallar por discrepancia de categorías, Fase 6 usa desde aquí **exclusivamente** estas cuatro categorías:

| Categoría | Definición | Rutas exactas | Total |
|---|---|---|---|
| **A. Rutas públicas canónicas** | Ruta con contenido propio y pathname propio en `ROUTE_META` | `/`, `/about`, `/programs`, `/parkour-academy`, `/shop`, `/app`, `/community`, `/resources`, `/faq`, `/onboarding`, `/checkout`*, `/order-confirmation`*, `/plan/raiz`, `/plan/fuerza`, `/plan/rendimiento`, `/plan/elite` (* = noindex de embudo, públicas pero no indexables) | **16** (14 indexables + 2 embudo noindex) |
| **B. Alias** | Renderiza el componente de otra ruta; solo la canónica se indexa (`ROUTE_ALIASES`) | `/entrar` → `/onboarding` | **1** |
| **C. Fallback 404** | Metadatos de ruta inexistente (`NOT_FOUND_META`, path `/404`); nunca se indexa | catch-all `*` → NotFound | **1** |
| **D. Ruta interna** | En `ROUTE_META` pero fuera del sitio público (noindex + Disallow en robots + fuera de sitemap) | `/design-system` | **1** |

Reglas de categoría para los documentos de Fase 6:
1. "Ruta pública" = solo categoría A. "Las 17 del contrato de baseline" = A (16) + B (1). `ROUTE_META` (17 claves) = A (16) + D (1).
2. Los blueprints (Bloque 4) cubren: **16 de A + 1 de B (como alias, remitiendo a su canónica) + 1 de C + nota para la de D**. Total de entradas de blueprint: 18 + 1 nota.
3. D-01 valida contra estas categorías exactas: toda ruta de categoría A tiene blueprint; todo blueprint apunta a una ruta existente de A, B o C; la categoría D se documenta como nota, no como blueprint completo.
4. El sitemap (`indexableRoutes()`) contiene exactamente las 14 indexables de A — ni alias, ni embudo, ni interna, ni 404.

**Lectura obligatoria completada (PASO C):** docs/ central (6 docs) + BASELINE, ROUTES, DESIGN-SYSTEM, FASE3-VEREDICTO, FASE4-ARQUITECTURA-EXPERIENCIA, ROUTE-JOURNEYS, PAGE-EXPERIENCE-MATRIX, PHASE5-MOTION-ENGINE, MOTION-MAP, SCROLL-STORY-MATRIX, CONTEXTO-MAESTRO-CONTINUIDAD + fuentes de identidad fuera del repo (`BAYONA_CONTEXT_DOCUMENTS/BAYONA_05_DOCUMENTO_MAESTRO.md` §6–7, solo lectura) + fuentes comerciales vivas (`src/config/offerings.js`, `conversionContent.js`, `shopCatalog.js`, `testimonials.js`, `chapters.js`).

**Archivos que se crearían (si se aprueba):** `BAYONA-WORLD-BIBLE.md`, `SPATIAL-LANGUAGE.md`, `PAGE-BLUEPRINTS.md`, `WORLD-3D-STRATEGY.md` (raíz del repo, convención de docs de fase) + 1 fichero de tests documentales + actualización de docs/ central al cierre.

**Archivos explícitamente PROHIBIDO tocar:** todo `src/pages/` (páginas públicas), `src/components/` de producción, `src/engine/` (solo se lee), `src/styles/`, `src/config/` (catálogo/precios/WhatsApp), `routeMeta`/SEO/sitemap/robots, `package.json` (cero dependencias), `vercel.json`, embudo (checkout/order-confirmation). El diff de Fase 6 debe ser: **solo .md nuevos + tests documentales + docs/ central**.

**CONTRATO DE ALCANCE DE CÓDIGO (corrección obligatoria #3 del auditor — resuelve la tensión "100% documental" vs "fichero de tests nuevo"):** Fase 6 produce **0 cambios de código de producción**. La regla exacta es: *"Fase 6 puede añadir código de test exclusivamente para validar documentación, pero no puede modificar código de producción."* Límites del test documental (V2.0 §5): NO puede cambiar el runtime ni el bundle, NO puede añadir dependencias, NO puede reemplazar tests existentes, NO puede usar `skip`/`only`. Leer código de producción está permitido (y es obligatorio para verificar); escribirlo, no.

---

## 1. MAPA DE VOCABULARIO EXISTENTE (PASO D — vinculante, verificado contra el código)

Regla: **nada de sinónimos**. Si un concepto ya tiene nombre en el engine, Fase 6 usa ese nombre.

| Concepto | Vocabulario vigente | Fuente |
|---|---|---|
| Intensidades | `quiet` (calma máxima) · `balanced` (estándar BAYONA, default) · `immersive` (narrativa espacial completa) | `src/engine/recipes/intensity.js` |
| Recetas (8) | `editorial-reveal`, `editorial-slide`, `compact-rail`, `cinematic-stage`, `data-cascade`, `image-drift`, `horizontal-passage`, `quiet-transition` | `src/engine/recipes/index.js` |
| Zonas de presupuesto | `hero` (peso 3) · `body` (2) · `supporting` (1) · `cta` (2) · `background` (0) + `checkBudget()` | `src/engine/recipes/motionBudget.js` |
| Rangos de sección | `traverse` · `enter` · `pin` · `exit` | `src/engine/scroll/useSectionProgress.js` |
| Duraciones | conjunto cerrado `fast/base/slow/curtain` | `src/engine/config/motionTokens.js` |
| Easings | `exit/travel/transform` (+ niveles micro/standard/emphasis/cinematic) | ídem |
| Distancias | `near/medium/far` | ídem |
| Contrato de página | `resolvePageMotionContract()` / `validatePageMotionContract()` / `describePageMotionContract()` | `src/engine/recipes/pageMotionContract.js` |
| Handoff 3D | `useScrollHandoff()` / `createHandoffSnapshot()` (7 campos fail-safe) | `src/engine/scroll/scrollHandoff.js` |
| Superficies DS | `--ds-surface-background #050505 / deep #0B0B0C / raised #0c0c0d / content #111111 / overlay #141416` + glass | `src/styles/ds-tokens.css` |
| Color DS | acento `#F4A261` / fire `#E76F51` / deep `#D45D38`; ink/muted/dim | ídem |
| Tipografía DS | escala display→h1→h2→h3→h4→lead→body→body-small→eyebrow + numeric; Montserrat/Inter/DM Mono | ídem |
| Radios DS | sharp 0 (defecto de marca) / control 10 / float 16 / round | ídem |
| Grupos IA (Fase 4) | ENTRENAR / EXPERIENCIAS / CONOCER / APRENDER / EMBUDO / ENTRAR | PAGE-EXPERIENCE-MATRIX.md |
| Journeys (Fase 4) | J1–J10 | ROUTE-JOURNEYS.md |

---

## 2. BLOQUES, TAREAS Y ARCHIVOS

### BLOQUE 1 — ADN VISUAL DE BAYONA → `BAYONA-WORLD-BIBLE.md` (Parte I)
Decisión de formato: **un solo documento maestro** (BIBLE). No se crea `BAYONA-WORLD-FOUNDATION.md` aparte: §5 lo permite expresamente para evitar duplicación ("BIBLE ± FOUNDATION, sin duplicar"). La BIBLE tendrá dos partes: Parte I = ADN (Bloque 1), Parte II = Mundos (Bloque 3).

Tareas:
1. **Qué NO es BAYONA / qué SÍ es** — desde evidencia real: CONTEXTO-MAESTRO §0/§34–38, DOCUMENTO_MAESTRO §7 ("oscura, moderna, editorial, cinematográfica sin exceso, adulta, directa, estructural, premium, útil y clara"; no fitness motivacional, no hype), D-001 (Awwwards-luxury), visión del propietario ("profundidad + movimiento + narrativa + precisión + coherencia").
2. **Los 10 principios mínimos** (§6): progresión · precisión · tensión · recuperación · materia · profundidad · humanidad · acompañamiento · territorio · decisión. Cada uno con: definición → traducción visual/espacial/de movimiento (usando vocabulario del §1) → riesgo → anti-patrón (ejemplo malo/mejor según §27).
3. **Curva emocional maestra**, verificada contra los journeys reales J1–J10 (ROUTE-JOURNEYS.md) — no inventada: descubrir → orientar → comparar → decidir → configurar → contactar → continuar, con sus tensiones y recuperaciones.
4. **Materialidad**: literal (superficies/tokens reales `--ds-*`, fotografía existente, tipografía vigente) · sugerida (textura, grano, luz como cualidad documental) · prohibida (neon, glow excesivo, glassmorphism indiscriminado — CONTEXTO-MAESTRO §38).
5. **Luz**: 6 tipos definidos sobre los tokens existentes (sin inventar paleta): luz de fondo (superficies), luz de acento (#F4A261/fire/deep), luz de plano (sombras `--ds-shadow-lift*`), luz tipográfica (jerarquía ink/muted/dim), luz fotográfica, luz de escena (3D, remitida a WORLD-3D-STRATEGY).
6. **Profundidad**: 5 planos documentales (fondo / contenido / elevado / overlay / inmersivo) mapeados 1:1 a las 5 superficies `--ds-surface-*` + el plano 3D como excepción justificada.
7. **Densidad y ritmo**: compatibilidad explícita con `intensity.js` (quiet/balanced/immersive), `motionBudget.js` (zonas) y `pageMotionContract.js`. Reglas de calma heredadas de MOTION-MAP.
8. **Autoauditoría del bloque** (cierre): test anti-genericidad (§27: ¿esto podría ser de cualquier gym? → rehacer) y anti-copia (§29: prohibido Nike/Apple/Arc'teryx/Porsche/Aesop/Gymshark/plantillas Awwwards).

### BLOQUE 2 — GRAMÁTICA ESPACIAL → `SPATIAL-LANGUAGE.md`
Tareas:
1. **La secuencia espacial**: Entrada → aproximación → tensión → inmersión → descubrimiento → decisión → salida. Con regla explícita: **NO se aplica mecánicamente** (§8) — cada página toma los estados que su función permite; "la experiencia no debe forzar la narrativa: la claridad gana" (§9).
2. **Definición de cada estado**: qué produce en el visitante + qué gramática del engine lo implementa (p. ej. Entrada ≈ `enter`/`editorial-reveal` en zona hero; inmersión ≈ `pin` + `cinematic-stage`/`sticky`; decisión ≈ `quiet-transition` + zona cta sin retraso). **Nota vinculante (auditor):** estas correspondencias son **conceptuales, no APIs** — SPATIAL-LANGUAGE es un documento de lenguaje espacial; no define, modifica ni compromete ninguna API del engine. La implementación real sigue siendo exclusiva de Fase 8.
3. **Transiciones permitidas y prohibidas** entre estados (p. ej. prohibido entrar en inmersión sin aproximación; prohibida tensión en páginas de decisión).
4. **Clases de página** (heredadas de Fase 4/5): lectura/decisión (quiet, nunca sticky ni horizontal), narrativa (balanced/immersive, máx. un momento immersive), umbral/orientación, embudo (claridad absoluta), recuperación (404).
5. **Reglas de mobile y reduced-motion** para la gramática (CONTEXTO-MAESTRO §43/§44): la secuencia se conserva, la complejidad se reduce.

### BLOQUE 3 — MUNDOS 00–08 → `BAYONA-WORLD-BIBLE.md` (Parte II)
Nombres conceptuales de partida (validados contra las rutas reales; pueden ajustarse con justificación durante la escritura): **00 ORIGEN · 01 CUERPO · 02 MÉTODO · 03 MOVIMIENTO · 04 EXPERIENCIA · 05 COMUNIDAD · 06 CONOCIMIENTO · 07 DECISIÓN · 08 CONTINUIDAD.**

Tareas:
1. **9 mundos × 14 atributos** (§11.1–11.14): función narrativa · emoción objetivo · materialidad · movimiento (intensidad + recetas) · profundidad (planos) · sonido visual (ritmo/grafismo, sin audio real) · luz dominante · densidad · uso permitido · antiuso · clasificación 3D (**prohibido / opcional / justificado / excepcional**) · receta principal · receta secundaria · rutas que lo habitan.
2. Cada mundo **construido desde evidencia real**: identidad (Bloque 1), catálogo real (RAÍZ/FUERZA/RENDIMIENTO/ELITE, shop, BAYONA+, parkour), journeys J1–J10, grupos IA de Fase 4. "LOS MUNDOS NO SON TEMAS DECORATIVOS" (§12): cada uno existe porque una función del negocio lo necesita.
3. **Recetas**: solo las 8 existentes, o marcadas `FUTURA` con justificación (nunca recetas inventadas como si existieran).
4. **Matriz de diferenciación**: prueba de que no hay dos mundos intercambiables (si dos filas son casi iguales → fusionar o redefinir).
5. Regla 3D por mundo alineada con §39 del CONTEXTO-MAESTRO (Fuerza: tensión/masa; Rendimiento: velocidad/trayectoria; Élite: precisión/control; Comunidad: sistema/conexión; Parkour: trayectoria/libertad — direcciones conceptuales, no implementaciones).

### BLOQUE 4 — BLUEPRINTS → `PAGE-BLUEPRINTS.md`
Tareas:
1. **Blueprint por cada ruta real, según las categorías normalizadas de §0.2** (corrección obligatoria #4): 16 blueprints de categoría A + 1 entrada de categoría B (`/entrar`, como alias remitiendo a `/onboarding`) + 1 entrada de categoría C (fallback 404) + nota para la categoría D (`/design-system`). Verificadas contra `routeMeta.js`/ROUTES.md (no asumidas). **El documento DEBE abrir con una sección "COBERTURA DEL DOCUMENTO"** que liste exactamente qué cubre (A: 16, B: 1, C: 1, D: nota) citando §0.2 — es la referencia contra la que valida D-01, de modo que el test no pueda fallar por usar una categoría de "ruta" distinta a la del documento.
2. Cada blueprint: mundo asignado · secuencia espacial (estados del Bloque 2 que usa) · intensidad · recetas · sticky/horizontal/parallax · text motion · 3D (clasificación del mundo + decisión concreta de ruta) · objetivo narrativo · qué NO hace (antiuso) · coherencia con su rol Fase 4 (PAGE-EXPERIENCE-MATRIX) y su journey dominante.
3. **Consistencia con SCROLL-STORY-MATRIX (Fase 5)**: la matriz de Fase 5 es la propuesta vigente; un blueprint puede refinarla o corregirla **solo con nota explícita y justificada** (p. ej. cambiar intensidad requiere justificar presupuesto y calma).
4. Regla de oro (§14): no todas las páginas deben ser espectaculares; en conversión la estética sirve a la claridad; el CTA primario nunca se retrasa por movimiento.

### BLOQUE 5 — MATRIZ DE DECISIÓN → **sección final de `PAGE-BLUEPRINTS.md`**
Decisión de formato: sección dentro de PAGE-BLUEPRINTS.md, **no** `WORLD-DECISION-MATRIX.md` separado (§15 lo permite y evita duplicación).
- Tabla única: Ruta × Mundo × Intensidad × Receta × Sticky × Horizontal × Parallax × TextMotion × 3D.
- Es la tabla que Fase 8 (migración) convertirá en contratos `resolvePageMotionContract()`.

### REGLA TRANSVERSAL — `WORLD-3D-STRATEGY.md`
Tareas:
1. **"EL 3D NO ES UN ESTILO"**: criterio de admisión (¿qué idea de la página representa este objeto? — CONTEXTO-MAESTRO §39).
2. **Dónde sí / dónde no**: hoy solo existe Globe3D en `/about` (CONFIRMADO); el resto se decide por mundo (clasificación del Bloque 3) y por función de ruta.
3. **Presupuesto real**: ligado al warning de build `vendor-three` 826.94 kB (CONFIRMADO en gates), PERFORMANCE-BASELINE y code-splitting existente (Scene3D/R3F en chunk propio; las rutas sin escena no lo descargan). Toda escena nueva propuesta en Fase 7 debe caber en este presupuesto.
4. **Fallback ANTES de la escena, no después** (§16): cadena existente sceneRegistry → resolveSceneConfig → SceneMount → SceneErrorBoundary (CONFIRMADA en BASELINE §4); cada escena futura define su degradación estática en el blueprint.
5. **Mobile/reduced-motion/DPR**: reglas §43/§44 del CONTEXTO-MAESTRO + `dprLimit` del handoff snapshot.

---

## 3. TESTS DOCUMENTALES (operacionalización de V2.0 §22; ajustables en la auditoría)

Un fichero nuevo de tests (vitest, lectura de .md — sin tocar suite existente; prohibido `skip`/`only`; el test documental NO cambia runtime ni bundle ni añade dependencias ni reemplaza tests existentes — contrato de alcance, §0):

| ID | Qué verifica |
|---|---|
| D-01 | Cobertura exacta de rutas **según las categorías de §0.2**: toda ruta de categoría A tiene blueprint en PAGE-BLUEPRINTS; todo blueprint apunta a ruta existente de A, B o C; la categoría D consta como nota; la sección COBERTURA DEL DOCUMENTO coincide con el inventario real de `routeMeta.js` (ni rutas inventadas ni omitidas, ni discrepancia de categorías) |
| D-02 | Toda receta citada en los docs de Fase 6 es una de las 8 existentes o está marcada `FUTURA — NO IMPLEMENTADA` |
| D-03 | Toda intensidad citada es `quiet`/`balanced`/`immersive` |
| D-04 | Cada mundo 00–08 declara los 14 atributos (incl. clasificación 3D y sonido visual) |
| D-05 | El 3D de cada blueprint respeta WORLD-3D-STRATEGY (páginas de decisión/lectura sin 3D; nada clasificado "PROHIBIDO" usado) |
| D-06 | Anti-sinónimos: los docs de Fase 6 no introducen vocabulario paralelo para conceptos ya nombrados (p. ej. calm/medium/intense) |
| D-07 | **Dividido, según V2.0 §22:** (a) parte ESTRUCTURAL automatizable: los blueprints que apartan de SCROLL-STORY-MATRIX llevan nota de corrección explícita (test de presencia de nota); (b) parte de REVISIÓN HUMANA: la coherencia semántica blueprint↔matriz la revisan Sebastián/auditor y se registra en el informe final. **Si automatizar D-07 exigiera interpretación semántica imposible, NO se falsifica la prueba**: se deja la parte estructural y el resto va a revisión humana documentada |

**Gates como no-regresión (V2.0 §23):** `npm test` (381 vigentes + los D nuevos, todos verdes) · `npm run lint` 0 errores · `npm run build` OK · `npm run test:visual` 41/41. **Regla del auditor (corrección #1): los números 381/381 · 0/16 · 41/41 son HISTÓRICOS hasta que cada gate se re-ejecute de verdad en el momento correspondiente; está prohibido copiarlos sin ejecución actual.** Baseline re-ejecutada de verdad el 2026-08-27 sobre `046a37c` (ver §0.1): 381/381 · 0 errores/16 warnings · build OK (vendor-three 826.94 kB) · 41/41. En cada commit de Fase 6 los gates se re-ejecutan y se reporta el número real del momento. Ningún gate se "arregla" tocando código: si un gate se mueve, es regresión y se revierte.

---

## 4. COMMITS PREVISTOS (§23: atómicos, semánticos, D-004 vigente)

| # | Contenido | Diff esperado |
|---|---|---|
| 0 | **HECHO** — `d8fd587`: DF-006 APROBADA registrada + convención de referencias + pre-vuelo (AUDIT-LOG 005) | solo docs/ |
| 0.5 | **HECHO** — `046a37c`: plan operativo subido a la raíz del repo (instrucción de Sebastián) + AUDIT-LOG 006 | 1 .md + docs/ |
| 0.6 | **HECHO (este commit)**: checkpoint de verificación V2.0 (PASOS 1–3 reales) + 4 correcciones obligatorias aplicadas al plan + docs centrales (D-008, AUDIT-LOG 007) | plan .md + docs/ |
| 1 | Fase 6 (Bloque 1): BAYONA-WORLD-BIBLE Parte I — ADN visual + autoauditoría | 1 .md nuevo |
| 2 | Fase 6 (Bloque 2): SPATIAL-LANGUAGE — gramática espacial | 1 .md nuevo |
| 3 | Fase 6 (Bloque 3): BAYONA-WORLD-BIBLE Parte II — mundos 00–08 + matriz de diferenciación | edición del .md del commit 1 |
| 4 | Fase 6 (Bloques 4+5): PAGE-BLUEPRINTS — blueprints según categorías de §0.2 + matriz de decisión | 1 .md nuevo |
| 5 | Fase 6 (transversal + cierre): WORLD-3D-STRATEGY + tests D-01…D-07 + actualización docs/ central (PROJECT-STATE, ROADMAP, HANDOFF, AUDIT-LOG 008) + informe final A–R | 1 .md nuevo + 1 test + docs/ |

Cada commit: gates de no-regresión verificados antes del push; push directo (D-004); verificación HEAD = origin/main tras cada push.

---

## 5. RIESGOS Y MITIGACIÓN

| Riesgo | Mitigación |
|---|---|
| Genericidad: mundos que podrían ser de cualquier fitness | Cada mundo anclado en evidencia real (catálogo, journeys, tokens); autoauditoría §27 con ejemplos malo/mejor; test D-04 |
| Espectáculo sobre claridad | Páginas de decisión/lectura en quiet; CTA nunca retrasado; regla "la claridad gana" (§9); tests D-05/D-07 |
| Duplicación de vocabulario | Mapa del §1 vinculante; test D-06 |
| Rutas inventadas u omitidas | Inventario verificado contra routeMeta; test D-01 |
| Scope creep hacia código | Diff de Fase 6 = solo .md + tests documentales; verificación `git diff --stat` por commit; prohibiciones del pre-flight |
| Contradicción con matrices Fase 4/5 | Corrección solo con nota explícita justificada; test D-07 |
| Contaminación de DP-5 | Claim ELITE intacto en blueprints (§26); ninguna reinterpretación |
| Copia de estéticas ajenas | Regla §29 explícita en la autoauditoría del Bloque 1 |
| Contexto limitado del agente | Un bloque por commit; cada bloque autocontenido; lecturas dirigidas ya completadas |
| Persecución circular de SHAs | Convención del auditor aplicada: no congelar HEAD vivo en docs |

---

## 6. CRITERIOS DE ACEPTACIÓN (por bloque)

- **Bloque 1:** 10 principios completos (definición + traducción + riesgo + anti-patrón); materialidad/luz/profundidad mapeadas a tokens reales; curva emocional verificada contra J1–J10; anti-genericidad y anti-copia pasadas.
- **Bloque 2:** secuencia completa con regla de aplicación no mecánica; cada estado mapeado a gramática existente del engine; clases de página con sus restricciones; mobile/reduced-motion cubiertos.
- **Bloque 3:** 9 mundos × 14 atributos; ningún par de mundos intercambiables (matriz de diferenciación); recetas existentes o FUTURA; clasificación 3D por mundo.
- **Bloque 4:** cobertura exacta según §0.2 (16 canónicas + alias + 404 + nota interna) con blueprint completo y sección COBERTURA DEL DOCUMENTO; consistencia Fase 4/5 o corrección justificada; regla de claridad en conversión respetada.
- **Bloque 5:** tabla única de decisión cubriendo todas las rutas, lista para convertirse en contratos en Fase 8.
- **Transversal 3D:** admisión/presupuesto/fallback/mobile/reduced-motion definidos; "el 3D no es un estilo" operacionalizado.
- **Globales:** D-01…D-07 verdes (D-07 con su parte humana registrada en el informe); gates re-ejecutados de verdad y sin regresión respecto a la baseline real del momento (no respecto a números históricos); diff total de Fase 6 sin código de producción; informe final A–R entregado; STOP para auditoría de ChatGPT antes de Fase 7.

---

## 7. FUERA DE ALCANCE (recordatorio vinculante)

- Rediseño de páginas públicas, componentes de producción, escenas 3D nuevas, GSAP, dependencias nuevas → **NO** (Fase 6 es documental; el código visual es Fase 8; las escenas son Fase 7).
- Catálogo, precios, WhatsApp, checkout, copy contractual, SEO global → **NO se tocan**.
- DP-5 → solo Sebastián.
- El plan de 175 tareas del informe forense queda como insumo HISTÓRICO (DF-006).

**ESTADO: PLAN AUDITADO Y APROBADO CON CORRECCIONES — FASE 6 AUTORIZADA (V2.0). CHECKPOINT DE VERIFICACIÓN EJECUTADO. STOP ANTES DEL BLOQUE 1: el auditor revisa este informe con Sebastián antes de empezar la implementación.**
