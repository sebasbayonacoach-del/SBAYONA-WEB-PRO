# PAGE-BLUEPRINTS — Planos de experiencia por ruta

> FASE 6 · **BLOQUE 4** (PAGE BLUEPRINTS DE ALTA PRECISIÓN + AUDITORÍA DE NO-INTERCAMBIABILIDAD).
> Autorización del auditor (ChatGPT, 2026-08-28): **BLOQUE 4 ÚNICAMENTE**, sobre el cierre del BLOQUE 3.
> Documentos rectores: `BAYONA-WORLD-BIBLE.md` (ADN + Mundos 00–08), `SPATIAL-LANGUAGE.md` (gramática espacial), `PLAN-FASE-6-WORLD-BUILDING.md` §0.2/§BLOQUE 4.
> Condiciones vinculantes vigentes: **DF-009** (disciplina de evidencia), **DF-010** (territorio no es folclore), **DF-011** (diferenciación real), **DF-012** (anti-burocracia). **DP-5** (ELITE "acceso de por vida") NO se toca ni se resuelve aquí.
> Estado: **PROPUESTA DOCUMENTAL VINCULANTE** para el BLOQUE 5 y Fases 7–8. **No implementa nada**: cero código, cero CSS, cero componentes, cero escenas.

**Etiquetas de evidencia (DF-009):**
- **CONFIRMADO** — verificable en código, documentos aprobados del repo, decisiones registradas o contenido comercial vivo.
- **DERIVADO** — inferencia directa trazable a evidencia concreta; responde "¿de dónde sale esto?".
- **PROPUESTO** — decisión nueva de este Bloque 4; no existe hoy en el producto.
- **HISTÓRICO** — registro del pasado; no describe el estado actual.

**Regla de relación con el engine (requisito del auditor):** las referencias a recetas, intensidades y zonas son **CONCEPTUALES, NO APIs**. Este documento no crea contratos, tokens ni firmas; declara experiencia. La traducción a `resolvePageMotionContract()` pertenece al BLOQUE 5 (matriz de decisión) y a Fase 8 (implementación), no a este bloque.

---

# COBERTURA DEL DOCUMENTO

Este documento usa **exclusivamente** las cuatro categorías normalizadas de `PLAN-FASE-6-WORLD-BUILDING.md` §0.2 (corrección obligatoria #4, vinculante). Inventario verificado contra `src/lib/seo/routeMeta.js` (`ROUTE_META` = 18 claves; `ROUTE_ALIASES` = 0 alias desde B-C4004; `NOT_FOUND_META` = fallback) y contra el contrato de baseline (`baselineContract.test.js`, ROUTES.md).

| Categoría | Definición | Rutas cubiertas | Total | Cobertura |
|---|---|---|---|---|
| **A. Rutas públicas canónicas** | Contenido propio y pathname propio en `ROUTE_META` | `/`, `/about`, `/programs`, `/parkour-academy`, `/shop`, `/app`, `/community`, `/resources`, `/faq`, `/onboarding`, `/entrar`*, `/checkout`*, `/order-confirmation`*, `/plan/raiz`, `/plan/fuerza`, `/plan/rendimiento`, `/plan/elite` | **17** | 17/17 → §blueprints 1–17 (`/entrar` canónica desde B-C4004; `*` = noindex puerta de acceso) |
| **B. Alias** | Renderiza el componente de otra ruta; solo la canónica se indexa | — (vacante desde B-C4004: el alias histórico `/entrar` → `/onboarding` quedó obsoleto) | **0** | — |
| **C. Fallback 404** | Metadatos de ruta inexistente (`NOT_FOUND_META`); nunca indexada | catch-all `*` | **1** | 1/1 → entrada 18 |
| **D. Ruta interna** | En `ROUTE_META`, fuera del sitio público (noindex + Disallow + fuera de sitemap) | `/design-system` | **1** | Nota explícita → sección D (sin blueprint completo) |

**Demostración de cobertura (D-01 no puede fallar por categorías):**
- A: 17 canónicas listadas = 14 estáticas de `ROUTE_META` (7 raíz de grupo: `/`, `/about`, `/programs`, `/parkour-academy`, `/shop`, `/app`, `/community` + 5 de APRENDER/embudo/puerta: `/resources`, `/faq`, `/onboarding`, `/entrar`* + 2 de embudo noindex: `/checkout`, `/order-confirmation`) − intersección 0 + 4 dinámicas `/plan/:id` generadas por `buildPlanRoutes()` desde `membershipPlans` (RAÍZ, FUERZA, RENDIMIENTO, ELITE) = **17**. ✓ (`*` = noindex puerta de acceso, B-C4004.)
- A + (B vacante) = las "17 rutas públicas" del contrato de baseline. ✓
- `ROUTE_META` (17 claves) = A (16) + D (1: `/design-system`). ✓
- Sitemap (`indexableRoutes()`): exactamente las **14 indexables** de A (16 − `/checkout` − `/order-confirmation`). ✓
- Total de entradas de blueprint: **16 + 1 alias + 1 fallback = 18**, + 1 nota de exclusión para la categoría D. Ni falta ni sobra ninguna ruta del inventario §0.2. ✓

**Convenciones de lectura:**
- Cada blueprint de categoría A tiene los 15 campos obligatorios (§5 del prompt rector).
- Vocabulario cerrado del engine, sin sinónimos: intensidades `quiet / balanced / immersive`; recetas `editorial-reveal`, `editorial-slide`, `compact-rail`, `cinematic-stage`, `data-cascade`, `image-drift`, `horizontal-passage`, `quiet-transition`; zonas `hero / body / supporting / cta / background`; rangos `traverse / enter / pin / exit`. Estados espaciales (capa conceptual, Bloque 2): `ENTRADA / APROXIMACIÓN / TENSIÓN / INMERSIÓN / DESCUBRIMIENTO / DECISIÓN / SALIDA`.
- "Contrato propuesto" resume intensidad/sticky/horizontal/parallax/text-motion/3D por ruta. Es la lectura experiencial compatible con `SCROLL-STORY-MATRIX.md` (Fase 5), NO la declaración técnica (eso es BLOQUE 5).
- Los estados marcados **(estructura)** son estructurales (la página no funciona sin ellos); **(admite)** son opcionales.

---

## 1. `/` — HOME · EL MÉTODO SE RECORRE

### 1.1 Identidad de la ruta
- **Ruta:** `/` · **Nombre funcional:** Raíz/orientación (CONFIRMADO — PAGE-EXPERIENCE-MATRIX fila 1).
- **Mundo dominante:** 00 ORIGEN · **Mundo secundario:** 02 MÉTODO (DERIVADO — ambos figuran como rutas nucleares del Bloque 3; la home es la única ruta que habita dos mundos a plena vista).
- **Función real:** orientar en segundos a tres tipos de llegada distintas sin pedirles nada todavía: el curioso (J1), el indeciso (J2) y el decidido (J3).

### 1.2 Pregunta del visitante
"¿Esto es para mí y por dónde empiezo?" — No es una pregunta publicitaria: es la duda de alguien que aterriza sin saber si BAYONA es gimnasio, app, academia o venta de humo. (DERIVADO — tres puertas validadas D11; HOME_DESCRIPTION: "Sin humo ni promesas de resultado".)

### 1.3 Trabajo que la página debe resolver
Entre la llegada y la salida, el visitante debe pasar de "no sé qué es esto" a "sé qué es BAYONA y sé cuál de las tres puertas es la mía". La home no convierte: **reparte**. Si el visitante sale sin elegir puerta pero entendiendo el método, la página cumplió. (DERIVADO — J1/J2/J3 parten todos de `/`.)

### 1.4 Estado de llegada
Sabe: que busca algo relacionado con entrenamiento (o nada: J1). No sabe: qué es el método, quién está detrás, cuánto cuesta, si hay trampa. Necesita: una primera frase que descarte el humo y una puerta que le parezca suya. (CONFIRMADO — hero editorial "DESPIERTAS CANSADO…", conversionContent.js.)

### 1.5 Estado de salida
Comprende: el método (dirección, no improvisación), que hay acompañamiento humano real y que los precios existen y están publicados. Puede: haber elegido puerta y avanzar a recepción, programas o recursos. Siente: calma editorial, no presión comercial. (DERIVADO — curva E.2 de la World Bible.)

### 1.6 Secuencia espacial
1. **ENTRADA (estructura):** umbral con tres puertas (EXPLORAR / ENCONTRAR MI CAMINO / VER PLANES). Recibe sin pedir; jerarquía inmediata. (CONFIRMADO — D11.)
2. **APROXIMACIÓN (admite):** el método TE LEEMOS → CONSTRUIMOS → TE ACOMPAÑAMOS da contexto antes de pedir. (CONFIRMADO — conversionContent.js.)
3. **TENSIÓN (un momento, admite):** el copy de apertura nombra el problema real ("despiertas cansado") y lo resuelve en aspiración serena. Breve y resuelto — nunca clima. (DERIVADO — BIBLE D.3 + hero vivo.)
4. **INMERSIÓN (un momento, admite):** el método como recorrido espacial: un escenario que evoluciona por estados mientras se baja. (CONFIRMADO como propuesta — SCROLL-STORY-MATRIX fila `/`: cinematic-stage sticky ●.)
5. **DESCUBRIMIENTO (admite):** prueba social sin arrastrar three.js: las voces publicadas como dato (testimonials.js) + recursos gratuitos como hallazgo. (CONFIRMADO — hallazgo F6-04 del Bloque 3.)
6. **DECISIÓN (estructura, suave):** el ancla de oferta (VER PLANES) y las cuatro tarjetas de plan con precio público. Sin retraso. (CONFIRMADO — J3: GoldButton VER PLANES → ancla de oferta.)
7. **SALIDA (estructura):** NextChapter hacia `/about` (itinerario canónico, chapters.js). (CONFIRMADO.)

### 1.7 Arquitectura narrativa
1. **Umbral** — la primera pantalla establece tono de adulto a adulto y ofrece reparto de caminos. Razón: la home atiende 3 journeys; el error sería forzar uno solo.
2. **El problema real** — nombrar la fatiga/improvisación con honestidad editorial. Razón: sin problema no hay método; es el único momento de tensión y está resuelto por la aspiración inmediata.
3. **El método como recorrido** — el momento immersive: el visitante *recorre* el método en vez de leerlo. Razón: es la respuesta de identidad al diagnóstico original ("páginas planas y similares"); solo la home carga la identidad completa.
4. **Prueba sin teatro** — voces publicadas + cuerpo que entrena. Razón: la prueba social de BAYONA es humana, no numérica (marco editorial de testimonials.js: nunca "evidencia verificada").
5. **La oferta visible** — cuatro niveles con precio publicado en COP. Razón: la transparencia de precios es parte del método (D-002; nada oculta precio ni condiciones).
6. **Continuidad** — salida al siguiente capítulo. Razón: la home nunca es un final, es el inicio del itinerario.

### 1.8 Geometría de información
**Exploratoria-orientadora.** Tres puertas como decisión de primer orden y después un hilo vertical narrativo que converge en la oferta. Justificación: la home debe repartir sin abandonar a quien solo baja; ninguna otra ruta del sitio tiene esta doble naturaleza (puertas + relato). (DERIVADO — D11 + curva E.3 clase narrativa.)

### 1.9 Densidad y ritmo
**`immersive`** (un solo momento: el escenario del método). Justificación: es la página que carga la identidad del sitio y la visión del propietario ("recorrer una experiencia, no leer una página estática"); el presupuesto `immersive` se gasta íntegro aquí y en ninguna otra sección. (CONFIRMADO — SCROLL-STORY-MATRIX: `/` immersive; MOTION-MAP: un único momento narrativo.)

### 1.10 Movimiento conceptual
- `cinematic-stage` — el escenario del método evoluciona por estados (zona `hero`/`body`, único momento immersive). CONFIRMADO como propuesta de Fase 5 (matriz).
- `image-drift` — deriva contenida de imagen para profundidad sin mareo en el relato. CONFIRMADO (matriz Fase 5).
- `editorial-reveal` — lectura de bloques editoriales al ritmo de lectura. (PROPUESTO — dentro del vocabulario, sin contradecir la matriz.)
- Text motion: `mask` en titulares (CONFIRMADO — matriz).
- Relación conceptual: zona `hero` peso 3 una sola vez; `cta` sin retraso. **Relaciones conceptuales, no APIs.**

### 1.11 Presupuesto de atención
Concentra: el umbral (puertas) y el escenario del método. Recupera: en la sección de voces (ritmo rail/reveal suave) y en el silencio alrededor del ancla de oferta — antes del precio, todo se aquietó. La oferta final llega en calma para que la decisión no herede agitación. (PROPUESTO, compatible con `checkBudget`.)

### 1.12 Momento irreductible
**El reparto de puertas.** Si se eliminara la elección EXPLORAR / ENCONTRAR MI CAMINO / VER PLANES y la home fuera un relato único con un CTA, dejaría de ser la página que atiende a los tres visitantes reales y se volvería un embudo disfrazado de portada. Es el único lugar del sitio donde BAYONA declara: "no todos llegáis igual". (CONFIRMADO como decisión D11; el resto es DERIVADO.)

### 1.13 Prohibiciones específicas
- Prohibido **duplicar el globo**: las voces viven como dato (testimonials.js); Globe3D es de `/about`. (CONFIRMADO — hallazgo F6-04.)
- Prohibido que el momento immersive retrase o desplace el ancla de oferta: la home es narrativa, no de decisión, pero contiene decisión. (DERIVADO — regla de claridad §7 del SPATIAL-LANGUAGE.)
- Prohibido inventar métricas de resultado: las voces son "experiencias publicadas", nunca "evidencia verificada". (CONFIRMADO — marco editorial de testimonials.js.)
- Prohibido copiar el patrón de `/programs` (comparador + calculadora): aquí no se compara, se reparte. (PROPUESTO.)

### 1.14 CTA y continuidad
CTA según puerta: recepción (J2), recursos (J1), ancla de planes (J3). Después: `/onboarding`, `/resources` o `/programs`. Continuidad canónica: NextChapter → `/about`. (CONFIRMADO — chapters.js.)

### 1.15 Evidencia
CONFIRMADO: tres puertas (D11), hero editorial y método (conversionContent.js), precios públicos (offerings.js), matriz Fase 5 (cinematic-stage/image-drift/mask), F6-04, itinerario chapters.js. DERIVADO: mundos 00+02, curva emocional, presupuesto de atención. PROPUESTO: geometría exploratoria-orientadora, prohibiciones 3–4, `editorial-reveal` como receta complementaria.

---
## 2. `/about` — NOSOTROS · LA HISTORIA DETRÁS DEL MÉTODO

### 2.1 Identidad de la ruta
- **Ruta:** `/about` · **Nombre funcional:** Marca (CONFIRMADO — matriz Fase 4 fila 2).
- **Mundo dominante:** 00 ORIGEN · **Mundo secundario:** 05 COMUNIDAD (DERIVADO — el mapa de voces del globo es la prueba de que el acompañamiento cruza fronteras; los mundos 00 y 05 comparten aquí terreno con roles distintos).
- **Función real:** responder quién está detrás de BAYONA y por qué el método pone el acompañamiento por delante de la promesa rápida. (CONFIRMADO — title/description en routeMeta.js.)

### 2.2 Pregunta del visitante
"¿Quién es esta persona y por qué debería confiarme a su método?" — La pregunta de la confianza, no del catálogo. (DERIVADO — CHAPTERS['/about'].teaser: "La historia de Sebastián y diez experiencias reales en el mapa".)

### 2.3 Trabajo que la página debe resolver
Convertir la familiaridad ("me suena BAYONA") en confianza razonada: cara, historia, criterio y prueba humanas. Entre llegada y salida, "alguien en internet" pasa a ser "una persona concreta con método y gente real detrás". (DERIVADO — CTA "conocer mi camino".)

### 2.4 Estado de llegada
Sabe: que existe un método y quizá una oferta. No sabe: quién es Sebastián, de dónde viene el criterio, si hay personas reales detrás. Necesita: una historia verificable y una cara. (DERIVADO — segunda parada del itinerario, chapters.js.)

### 2.5 Estado de salida
Comprende: la razón de ser del método y su escala honesta (una persona real acompañando). Puede: escribir por WhatsApp o seguir el itinerario. Siente: confianza, cercanía sin familiaridad falsa. (DERIVADO.)

### 2.6 Secuencia espacial
1. **ENTRADA (estructura):** recepción editorial quieta: quién está detrás, sin banner de venta. (CONFIRMADO — clase narrativa, `/about` balanced.)
2. **APROXIMACIÓN (estructura):** la historia de Sebastián como contexto antes de cualquier petición. (DERIVADO — principio D.1.)
3. **DESCUBRIMIENTO (estructura):** el mapa del globo: experiencias reales explorables por curiosidad. (CONFIRMADO — Globe3D + GlobeTestimonials montan en About.jsx; marco editorial de testimonios.)
4. **SALIDA (estructura):** WhatsApp "conocer mi camino" + NextChapter → `/programs`. (CONFIRMADO — matriz Fase 4, chapters.js.)

### 2.7 Arquitectura narrativa
1. **La historia** — de dónde sale el método, en voz de primera persona. Razón: la confianza nace del origen.
2. **El mapa** — la única escena 3D viva del sitio: personas reales sobre el mundo. Razón: el globo no decora, **demostr**a el principio D.8 (acompañamiento) y D.7 (humanidad).
3. **El criterio** — por qué "movimiento, ciencia y propósito humano" y no otra promesa. Razón: separar BAYONA del ruido fitness.
4. **La salida humana** — un mensaje directo, no un formulario. Razón: si el valor es el acompañamiento humano, la conversión es una conversación.

### 2.8 Geometría de información
**Editorial-narrativa.** Un relato con un único momento central (el mapa). Justificación: es la única ruta donde el contenido ES una biografía; la geometría de relato distingue a `/about` de toda página de servicio. (PROPUESTO sobre estructura CONFIRMADA de clase narrativa.)

### 2.9 Densidad y ritmo
**`balanced`.** Justificación: la historia se lee con calma; el globo ya aporta la profundidad. Un `immersive` adicional competiría con la escena existente — y el ADN dice: una excepción no es licencia. (CONFIRMADO — matriz Fase 5 `/about` balanced; ADN sección H: 3D como excepción.)

### 2.10 Movimiento conceptual
- `editorial-reveal` — el relato emerge al ritmo de lectura (CONFIRMADO — matriz Fase 5).
- `image-drift` — profundidad contenida en imágenes de apoyo (CONFIRMADO — matriz).
- Text motion: `mask` (CONFIRMADO — matriz). Parallax: candidato ○ (CONFIRMADO — matriz).
- 3D: **EXISTENTE / EXCEPCIONAL** — Globe3D es la única escena viva del sitio (CONFIRMADO — `src/components/Globe3D.jsx` montada en `src/pages/About.jsx`). Ningún blueprint le añade escenas ni le concede licencia multiplicadora. **Corrección explícita a SCROLL-STORY-MATRIX:** su fila `/about` marca "Futuro 3D —"; se mantiene para el futuro, pero este blueprint registra que el 3D **ya existe** aquí como excepción (la matriz describe el futuro, no el presente). (Corrección declarada según tarea 3 del Bloque 4.)

### 2.11 Presupuesto de atención
Concentra: la historia (apertura) y el mapa (centro). Recupera: el cierre editorial tranquilo antes de la salida por WhatsApp. El globo es el pico; nada más compite por asombro. (PROPUESTO.)

### 2.12 Momento irreductible
**El globo de voces reales.** La promesa "acompañamiento humano real" convertida en mapa: personas con nombre, edad, ciudad. Sin el globo, `/about` sería otra biografía de entrenador; con él, es la demostración espacial de que la promesa ya ocurre en el mundo. (CONFIRMADO — la escena existe; su significado narrativo, DERIVADO.)

### 2.13 Prohibiciones específicas
- Prohibido multiplicar escenas 3D "porque la página ya tiene una". (CONFIRMADO — ADN H: excepción, no licencia.)
- Prohibido convertir testimonios en métricas o promesas de resultado. (CONFIRMADO — marco editorial testimonials.js: son "experiencias publicadas", nunca "evidencia verificada".)
- Prohibido el hero de espectáculo: si `/about` abre con algo más llamativo que el propio relato, la página compite consigo misma. (PROPUESTO.)
- Prohibido folclore territorial: el globo es presencialidad real, no estética de "mundialidad". (CONFIRMADO — DF-010.)

### 2.14 CTA y continuidad
CTA primario: WhatsApp "conocer mi camino" (CONFIRMADO). Continuidad: NextChapter → `/programs`; JourneyRibbon si hay memoria. (CONFIRMADO.)

### 2.15 Evidencia
CONFIRMADO: Globe3D en About.jsx, testimonials.js y su marco, routeMeta, matriz Fase 4/5, chapters.js, tagline site.config.js. DERIVADO: mundos 00+05, curva, geometría. PROPUESTO: prohibición del hero de espectáculo, presupuesto de atención.

---

## 3. `/onboarding` — RECEPCIÓN · EL UMBRAL QUE ORIENTA

### 3.1 Identidad de la ruta
- **Ruta:** `/onboarding` · **Nombre funcional:** Recepción (CONFIRMADO — matriz Fase 4 fila 16). (B-C4004: `/entrar` es canónica propia desde entonces — ver entrada 17.)
- **Mundo dominante:** 00 ORIGEN · **Mundo secundario:** 07 DECISIÓN en su paso final suave (DERIVADO — el mundo 00 habita la recepción; la ruta recomendada D9 es un anticipo de decisión, no la decisión comercial).
- **Función real:** orientar mediante 3 preguntas y entregar una ruta recomendada, sin vender.

### 3.2 Pregunta del visitante
"¿Cuál es mi camino?" (CONFIRMADO — matriz Fase 4 col. 5). Es la pregunta más pura del sitio: no pregunta por precios ni por contenido, pregunta por dirección personal.

### 3.3 Trabajo que la página debe resolver
Transformar "quiero pero no sé por dónde" en "empieza aquí" con nombre propio: plan recomendado (`route.planHref`, D9) con salidas honestas (comparar, WhatsApp, recursos). Sin recepción, el indeciso (J2) se pierde o aterriza directamente en precio. (CONFIRMADO — J2; D9.)

### 3.4 Estado de llegada
Sabe: que quiere algo de BAYONA (llegó por "Entrar" o la puerta ENCONTRAR MI CAMINO). No sabe: qué nivel le corresponde ni qué significa cada plan. Necesita: que le pregunten bien y poco. (DERIVADO — origen de la memoria J10.)

### 3.5 Estado de salida
Comprende: cuál de los cuatro niveles encaja con su momento y por qué. Puede: ir a su ficha, comparar planes, preguntar por WhatsApp o probar gratis. Siente: haber sido leído ("TE LEEMOS" antes de CONSTRUIMOS). (CONFIRMADO — conversionContent.js; D9.)

### 3.6 Secuencia espacial
1. **ENTRADA (estructura, especial):** umbral **inmersivo sin chrome** — la única entrada del sitio que absorbe al visitante: sin breadcrumb, sin navegación que distraiga. (CONFIRMADO — J2 "inmersivo, sin breadcrumb"; nota 4.6 de SPATIAL-LANGUAGE.)
2. **APROXIMACIÓN (estructura):** 3 preguntas que construyen contexto antes de la respuesta. (CONFIRMADO — J2; `editorial-slide` "señala dirección y progreso".)
3. **DECISIÓN (estructura, suave):** la ruta recomendada: una elección presentada, no una venta cerrada; admite comparar y rechazar. (CONFIRMADO — salidas secundarias de la fila 16.)
4. **SALIDA (estructura):** hacia la ficha del plan recomendado u otras salidas; aquí nace la memoria (JourneyRibbon). (CONFIRMADO — J10.)

### 3.7 Arquitectura narrativa
1. **El umbral** — cierre del mundo, foco total. Razón: una recepción con chrome reparte la atención justo cuando debe concentrarla.
2. **Las tres preguntas** — cada paso señala progreso y dirección. Razón: es el método BAYONA aplicado al propio sitio (se gana por pasos, D.1).
3. **La ruta** — una recomendación nombrada con su razón. Razón: la confianza nace de saber el porqué, no de un sorteo.
4. **Las salidas honestas** — comparar / WhatsApp / gratis. Razón: orientar no es encerrar; la recepción que obliga es una trampa disfrazada.

### 3.8 Geometría de información
**Guiada-conversacional.** Una pregunta a la vez, progreso visible, cero ramificación lateral. Justificación: es la única ruta del sitio donde la información se revela por diálogo en lugar de por lectura o comparación. (PROPUESTO sobre base CONFIRMADA del flujo 3 preguntas.)

### 3.9 Densidad y ritmo
**`balanced`** (CONFIRMADO — matriz Fase 5: editorial-slide + quiet-transition). La "inmersión" de la recepción es **absorción sin distracción**, no espectáculo: se produce por composición (sin chrome) y no por movimiento. (DERIVADO — nota 4.6 de SPATIAL-LANGUAGE.)

### 3.10 Movimiento conceptual
- `editorial-slide` — cada pregunta entra señalando dirección y progreso (CONFIRMADO — matriz Fase 5).
- `quiet-transition` — apertura del umbral y cierre hacia la ruta (CONFIRMADO — matriz).
- Text motion: `mask` (CONFIRMADO — matriz). Sticky/Horizontal/Parallax: ninguno (CONFIRMADO — matriz).
- 3D: **PROHIBIDO.** (CONFIRMADO — clasificación del mundo 00 en el Bloque 3: opcional solo en su uso ORIGEN de entrada del sitio; en recepción el umbral sin chrome ya ES el momento fuerte.)

### 3.11 Presupuesto de atención
Concentra: todo en la pregunta en curso. Recupera: la transición quieta entre pasos. No existe el "resto de la página": el presupuesto entero vive en el diálogo. (PROPUESTO, compatible con zonas.)

### 3.12 Momento irreductible
**La recepción sin chrome que devuelve una ruta nombrada.** Es la única página del sitio que se atreve a quitar la navegación para devolver al visitante una dirección personal. Si se eliminara (o se convirtiera en un formulario con menú), el sitio perdería su gesto de acompañamiento más literal. (CONFIRMADO — J2/D9 como hechos; su papel narrativo, DERIVADO.)

### 3.13 Prohibiciones específicas
- Prohibido mostrar precios o catálogo durante las preguntas: orienta primero, vende después (en la ficha). (DERIVADO — regla de claridad: el contexto precede a la petición.)
- Prohibido convertir la recomendación en un candado: siempre debe poder rechazarse y comparar. (CONFIRMADO — salidas secundarias fila 16.)
- Prohibido mascarilla de venta (contadores, urgencia): la recepción no fabrica prisa. (PROPUESTO — coherente con D-002 y el anti-urgency de offerings.js.)
- Prohibido un estado INMERSIÓN por efectos: su inmersión es la ausencia de chrome, no una escena. (DERIVADO — nota 4.6.)

### 3.14 CTA y continuidad
CTA primario: paso final → ficha del plan recomendado (`route.planHref`, D9). Secundarios: comparar planes, WhatsApp, recursos. No pinta breadcrumb ni NextChapter (es el inicio del itinerario). (CONFIRMADO — matriz fila 16.)

### 3.15 Evidencia
CONFIRMADO: J2/D9/J10, matriz Fase 4 fila 16, matriz Fase 5, nota 4.6 SPATIAL-LANGUAGE, chapters.js. DERIVADO: mundos 00+07, geometría guiada, momento irreductible como papel narrativo. PROPUESTO: prohibiciones 1 y 3, presupuesto.

---

## 4. `/programs` — PROGRAMAS · COMPARAR SIN RUIDO

### 4.1 Identidad de la ruta
- **Ruta:** `/programs` · **Nombre funcional:** Catálogo/comparador (CONFIRMADO — matriz Fase 4 fila 3).
- **Mundo dominante:** 07 DECISIÓN · **Mundo secundario:** 02 MÉTODO (DERIVADO — comparar los niveles es comparar cómo el método escala el acompañamiento).
- **Función real:** dejar ver los cuatro niveles, las clases y la recuperación con precios publicados, y llevar al visitante a su ficha o al configurador.

### 4.2 Pregunta del visitante
"¿Qué puedo entrenar y cuánto cuesta?" (CONFIRMADO — matriz Fase 4 col. 5). Es la pregunta del precio y del alcance, hecha antes de la confianza total.

### 4.3 Trabajo que la página debe resolver
Que la comparación sea posible sin abrir cuatro pestañas: diferencias claras de sesiones, seguimiento y precio (149k/299k/499k/899k COP), y una salida directa a ficha, configurador o WhatsApp. Entre llegada y salida, "¿cuánto vale?" pasa a "este es el mío". (CONFIRMADO — offerings.js; D6 GoldButton bajo la calculadora.)

### 4.4 Estado de llegada
Sabe: que hay una oferta (o llega desde recepción con una recomendación). No sabe: qué distingue a un nivel de otro ni qué es exactamente lo que cuesta. Necesita: una vista comparativa y una calculadora honesta. (DERIVADO — entrada de embudo col. 12.)

### 4.5 Estado de salida
Comprende: la estructura completa de la oferta y qué cambia entre niveles. Puede: abrir ficha, abrir configurador (`/checkout`), pedir por WhatsApp. Siente: control — nadie eligió por él. (DERIVADO — clase decisión.)

### 4.6 Secuencia espacial
1. **ENTRADA (estructura):** apertura que presenta el mapa de la oferta sin marear. (CONFIRMADO — clase decisión: estados prohibidos TENSIÓN/INMERSIÓN.)
2. **APROXIMACIÓN (admite, breve):** contexto mínimo de cómo leer la comparación (qué significan las sesiones y el seguimiento). (CONFIRMADO — clase decisión admite aproximación breve.)
3. **DECISIÓN (estructura):** comparador + calculadora; el precio se construye delante del visitante. (CONFIRMADO — D6, commercialSync.)
4. **SALIDA (estructura):** ficha / configurador / WhatsApp; NextChapter → `/parkour-academy`. (CONFIRMADO — chapters.js.)

### 4.7 Arquitectura narrativa
1. **El mapa de niveles** — cuatro tarjetas comparables de un vistazo. Razón: el visitante de `/programs` ya está midiendo; el ruido retrasa su medición.
2. **La calculadora** — configurar cantidad de sesiones/extras con precios vivos. Razón: la transparencia es el argumento comercial; D6 la convierte en puerta del configurador.
3. **Las fichas llamadas** — cada nivel termina en su propia ruta. Razón: la decisión fina pertenece a `/plan/*`; aquí se elige la dirección, no el detalle.

### 4.8 Geometría de información
**Comparativa.** Filas/columnas equivalentes, jerarquía de datos, diferencias primero. Justificación: es la única ruta cuya función ES comparar; ninguna otra comparte esta geometría (los planes individuales son progresivas hacia decisión, no comparativas). (PROPUESTO sobre base CONFIRMADA de comparador + calculadora.)

### 4.9 Densidad y ritmo
**`balanced`** (CONFIRMADO — matriz Fase 5: data-cascade + editorial-slide; sin sticky ni horizontal). La intensidad de decisión exige quiet pero la comparación de catálogo sostiene `balanced` sin competir. (DERIVADO — clases de página: decisión; nota 4.3.)

### 4.10 Movimiento conceptual
- `data-cascade` — los datos (precios, sesiones, seguimiento) aparecen con jerarquía sin ruido (CONFIRMADO — matriz Fase 5).
- `editorial-slide` — etiquetas e índices de sección señalan progreso (CONFIRMADO — matriz).
- Text motion: `none` (CONFIRMADO — matriz; los datos no se maquillan).
- 3D: **PROHIBIDO** (CONFIRMADO — clasificación del mundo 07).

### 4.11 Presupuesto de atención
Concentra: el comparador y la calculadora. Recupera: el silencio entre tarjetas; nada parpadea junto al precio. El CTA de configurador aparece sin retraso bajo la calculadora (CONFIRMADO — D6). (PROPUESTO la lectura de recuperación.)

### 4.12 Momento irreductible
**El precio que se construye delante del visitante.** La calculadora que suma sesiones y extras con precios reales y desemboca en el configurador: en ningún otro punto del sitio la oferta se muestra tan honestamente operativa. Si `/programs` fuera solo cuatro tarjetas con precios fijos, sería un catálogo genérico. (CONFIRMADO — D6/commercialSync como hechos; su papel como momento, DERIVADO.)

### 4.13 Prohibiciones específicas
- Prohibido cualquier sticky/horizontal/inmersión: clase decisión (CONFIRMADO — §4.3 SPATIAL-LANGUAGE).
- Prohibido resolver aquí la decisión fina de cada plan: eso pertenece a las fichas; duplicarlas sería competir consigo mismo. (PROPUESTO.)
- Prohibido ocultar o aplazar el precio: los precios publicados en COP son contrato (CONFIRMADO — D-002; MOTION-MAP: nada retrasa datos críticos).
- Prohibido el patrón de `/shop` (carrito por producto): aquí se elige acompañamiento, no se compra por sesión. (PROPUESTO.)

### 4.14 CTA y continuidad
CTA primario: comparador → ficha de plan; WhatsApp general como salida humana. Secundario: GoldButton "ABRIR EL CONFIGURADOR BAYONA COMPLETO" bajo la calculadora (CONFIRMADO — D6). Continuidad: NextChapter → `/parkour-academy` (CONFIRMADO).

### 4.15 Evidencia
CONFIRMADO: matriz Fase 4 fila 3, D6, offerings.js (precios), matriz Fase 5, chapters.js, clases de página §4.3. DERIVADO: mundos 07+02, geometría comparativa, momento irreductible. PROPUESTO: prohibiciones 2 y 4.

---

## 5–8. LAS CUATRO FICHAS DE PLAN — UN SISTEMA, CUATRO EXPERIENCIAS

**Regla común (CONFIRMADO):** las cuatro fichas comparten clase **decisión** (§4.3), intensidad `quiet`, recetas `editorial-reveal` + `quiet-transition`, text motion `none`, sin sticky/horizontal/parallax, 3D **PROHIBIDO**, breadcrumb `Inicio / Programas / Plan X`, CTA primario "QUIERO EMPEZAR" (WhatsApp) y salidas configurador + PDF (D6/D8). **Lo que no comparten es el argumento**: cada ficha existe porque un visitante distinto está resolviendo una pregunta distinta. La diferenciación documentada abajo es la respuesta a la exigencia de que no sean "cuatro copias con precio diferente". (Estructura CONFIRMADA — matriz Fase 4 filas 5–8, SCROLL-STORY-MATRIX; diferenciación DERIVADO del contenido vivo de offerings.js + conversionContent.js.)

---

## 5. `/plan/raiz` — RAÍZ · RECONSTRUCCIÓN

### 5.1 Identidad
Mundo dominante: **07 DECISIÓN** · secundario: **01 CUERPO** (DERIVADO — RAÍZ habla del cuerpo que lleva tiempo sin entrenar). Función: ficha del nivel de entrada "PARA EMPEZAR BIEN". Precio vivo: $149.000 COP/mes. (CONFIRMADO — offerings.js.)

### 5.2 Pregunta del visitante
"¿Por dónde empiezo si llevo tiempo sin entrenar?" (DERIVADO — `audience`: "Llevas tiempo sin entrenar y quieres empezar bien".)

### 5.3 Trabajo que la página debe resolver
Quitarle el miedo al retorno: estructurar el primer paso ("Cada día sabes qué hacer y alguien te ayuda a sostenerlo") y hacerlo accesible ($149k, 1 sesión virtual, seguimiento quincenal, alimentación simple). (CONFIRMADO — offerings.js RAÍZ.)

### 5.4 Estado de llegada
Sabe: que quiere volver. No sabe: si su cuerpo está listo, si será demasiado, si merece un plan "de verdad". Necesita: permiso explícito de empezar pequeño. (DERIVADO — `problem`/`feeling` de RAÍZ.)

### 5.5 Estado de salida
Comprende: que RAÍZ está diseñado para exactamente su momento. Puede: WhatsApp con precio publicado, PDF, configurador. Siente: "el primer paso, el más importante" — dignidad, no vergüenza. (CONFIRMADO — `closing` RAÍZ.)

### 5.6 Secuencia espacial
ENTRADA (estructura) → APROXIMACIÓN breve (admite: qué incluye y cómo funciona el mes) → DECISIÓN (estructura) → SALIDA (estructura). **TENSIÓN e INMERSIÓN prohibidas** (CONFIRMADO — §4.3).

### 5.7 Arquitectura narrativa
1. **El retorno** — nombrar al que lleva tiempo sin entrenar sin condescendencia. 2. **El mes RAÍZ** — qué pasa cada semana (plan diario, sesión 1:1, seguimiento quincenal). 3. **El precio honesto** — publicado y completo. 4. **La salida** — QUIERO EMPEZAR o configurador.

### 5.8 Geometría de información
**Lineal-progresiva suave**: del reconocimiento ("sé que cuesta volver") al qué-incluye al precio. Justificación: RAÍZ no compara ni mide: acompaña la vuelta. (PROPUESTO sobre catálogo CONFIRMADO.)

### 5.9 Densidad y ritmo
**`quiet`** (CONFIRMADO — matriz Fase 5). Justificación: decisión pura; el movimiento nunca compite.

### 5.10 Movimiento conceptual
`editorial-reveal` (lectura limpia) + `quiet-transition` (cierre) (CONFIRMADO — matriz). Text motion `none` (CONFIRMADO). 3D: **PROHIBIDO** (CONFIRMADO — mundo 07).

### 5.11 Presupuesto de atención
Concentra: el qué-incluye (los 7 ítems reales). Recupera: el cierre antes del CTA. El precio es visible desde la comparación y la ficha sin retraso. (CONFIRMADO el catálogo; PROPUESTO el ritmo.)

### 5.12 Momento irreductible
**"Tu primer paso. El más importante."** La ficha que honra al que vuelve en vez de pedirle que ya debería estar entrenando. Ninguna otra ruta tiene este permiso explícito de empezar pequeño. (CONFIRMADO — `closing` de RAÍZ; su papel de momento, DERIVADO.)

### 5.13 Prohibiciones específicas
- Prohibido avergonzar o presionar ("¿a qué esperas?"): tono de adulto a adulto. (DERIVADO — D.7.)
- Prohibido inflar RAÍZ con promesas de RENDIMIENTO: su valor es la estructura, no el resultado visible. (PROPUESTO.)
- Prohibido esconder que no incluye videollamadas privadas: el `excluded` es parte del contrato. (CONFIRMADO — offerings.js `excluded`.)

### 5.14 CTA y continuidad
CTA: QUIERO EMPEZAR (WhatsApp con precio publicado) (CONFIRMADO — buildPlanWhatsAppUrl). Secundarios: configurador `/checkout?plan=RAIZ` (fail-closed), PDF presentación. Vecinos: puentes a FUERZA (escalado natural). (CONFIRMADO — matriz fila 5.)

### 5.15 Evidencia
CONFIRMADO: offerings.js RAÍZ completo, matriz Fase 4/5, D6/D8, §4.3. DERIVADO: mundos 07+01, geometría, momento. PROPUESTO: prohibiciones 1–2.

---

## 6. `/plan/fuerza` — FUERZA · PROGRESO REAL

### 6.1 Identidad
Mundo dominante: **07 DECISIÓN** · secundarios: **01 CUERPO + 02 MÉTODO** (DERIVADO — FUERZA es el nivel donde alguien revisa y corrige: cuerpo guiado por método). Función: ficha del nivel destacado "ENTRENA CON ALGUIEN". Precio vivo: $299.000 COP/mes. `featured: true` (CONFIRMADO — offerings.js).

### 6.2 Pregunta del visitante
"¿Quién revisa que lo esté haciendo bien?" (DERIVADO — `audience`: "Ya entrenas, pero quieres que alguien revise y corrija").

### 6.3 Trabajo que la página debe resolver
Terminar con la duda técnica: 2 sesiones virtuales 1:1 al mes, seguimiento semanal, alimentación personalizada, videollamada mensual con Sebastián, respuestas prioritarias. "Dejas de dudar si lo estás haciendo bien." (CONFIRMADO — offerings.js FUERZA.)

### 6.4 Estado de llegada
Sabe: entrenar ya sabe. No sabe: si su ejecución y su estructura son correctas. Necesita: ojos expertos encima, no un plan nuevo. (DERIVADO.)

### 6.5 Estado de salida
Comprende: FUERZA es guía en vivo, no más material. Puede: decidir por WhatsApp/PDF/configurador. Siente: seguridad técnica. (CONFIRMADO — `feeling`/`socialProof` FUERZA.)

### 6.6 Secuencia espacial
ENTRADA (estructura) → APROXIMACIÓN breve (admite: "todo RAÍZ más:" como puente de continuidad) → DECISIÓN (estructura) → SALIDA (estructura). TENSIÓN/INMERSIÓN prohibidas (CONFIRMADO — §4.3).

### 6.7 Arquitectura narrativa
1. **Ya entrenas; falta dirección** — el valor no es empezar, es corregir. 2. **Las dos sesiones en vivo** — el corazón del nivel (guiar y empujar). 3. **Todo RAÍZ más:** — continuidad honesta con el nivel anterior (precio y contenido transparentes). 4. **La salida** — QUIERO EMPEZAR / configurador / PDF.

### 6.8 Geometría de información
**Progresiva-escalada**: se lee como "base + adiciones" (`includedLead: 'Todo RAÍZ más:'`). Justificación: es la única ficha cuya estructura informativa ES una escalada desde otra; RAÍZ no presupone nada, RENDIMIENTO/ELITE acumulan sobre esta lógica. (CONFIRMADO el `includedLead`; geometría DERIVADO.)

### 6.9 Densidad y ritmo
**`quiet`** (CONFIRMADO — matriz Fase 5). Justificación: decisión pura; el `featured` destaca por orden y peso visual, nunca por animación que retrase el precio. (DERIVADO — regla de claridad.)

### 6.10 Movimiento conceptual
`editorial-reveal` + `quiet-transition` (CONFIRMADO — matriz). Text motion `none` (CONFIRMADO). 3D: **PROHIBIDO** (CONFIRMADO — mundo 07).

### 6.11 Presupuesto de atención
Concentra: las dos sesiones 1:1 y el seguimiento semanal. Recupera: el bloque "todo RAÍZ más" leído como continuidad, no como letra pequeña. (PROPUESTO.)

### 6.12 Momento irreductible
**"Dejas de dudar si lo estás haciendo bien."** Es la única ficha cuyo producto central es la corrección en vivo: otra gente. Si se eliminara el argumento de la revisión humana constante, FUERZA sería "RAÍZ con más sesiones" — una línea de precio, no una experiencia. (CONFIRMADO — `feeling`; papel DERIVADO.)

### 6.13 Prohibiciones específicas
- Prohibido vender FUERZA como "el intermedio de relleno": su argumento es la corrección, no el precio entre dos extremos. (PROPUESTO.)
- Prohibido duplicar aquí el comparador de `/programs`: la ficha profundiza, no compara. (PROPUESTO.)
- Prohibido ocultar la base RAÍZ que incluye: la escalada es parte del contrato visible. (CONFIRMADO — `includedLead`.)

### 6.14 CTA y continuidad
CTA: QUIERO EMPEZAR (CONFIRMADO). Secundarios: `/checkout?plan=FUERZA`, PDF. Vecinos: puentes a RAÍZ (descenso) y RENDIMIENTO (escalado). (CONFIRMADO — matriz fila 6.)

### 6.15 Evidencia
CONFIRMADO: offerings.js FUERZA completo (`featured`, `socialProof`, `includedLead`), matrices Fase 4/5, D6/D8. DERIVADO: mundos 07+01+02, geometría de escalada, momento. PROPUESTO: prohibiciones 1–2.

---

## 7. `/plan/rendimiento` — RENDIMIENTO · TRANSFORMACIÓN TOTAL

### 7.1 Identidad
Mundo dominante: **07 DECISIÓN** · secundario: **02 MÉTODO** (DERIVADO — RENDIMIENTO es el nivel de la medición y el ajuste continuo: evaluación, protocolos, biohacking). Función: ficha "RESULTADOS VISIBLES". Precio vivo: $499.000 COP/mes. (CONFIRMADO — offerings.js.)

### 7.2 Pregunta del visitante
"¿Cómo mido y acelero lo que estoy consiguiendo?" (DERIVADO — `audience`: "Vas en serio…"; overlay: "Quiero medir el proceso y ajustar con mayor frecuencia").

### 7.3 Trabajo que la página debe resolver
Convertir el esfuerzo en proceso medible: 4 sesiones 1:1, evaluación biomecánica inicial completa, protocolos de biohacking, alimentación avanzada con ajustes semanales, WhatsApp 24/7, acceso anticipado a BAYONA+. (CONFIRMADO — offerings.js RENDIMIENTO.)

### 7.4 Estado de llegada
Sabe: que va en serio y quiere resultados visibles. No sabe: qué está frenando su progreso ni cómo se mediría. Necesita: una evaluación real y ajustes frecuentes. (DERIVADO.)

### 7.5 Estado de salida
Comprende: aquí el método se vuelve instrumento (medir → ajustar → transformar). Puede: decidir por las salidas estándar. Siente: "te ves y te sientes diferente" como consecuencia de un proceso, no de un azar. (CONFIRMADO — `feeling` RENDIMIENTO.)

### 7.6 Secuencia espacial
ENTRADA (estructura) → APROXIMACIÓN breve (admite: "todo FUERZA más:" + el papel de la evaluación) → DECISIÓN (estructura) → SALIDA (estructura). TENSIÓN/INMERSIÓN prohibidas (CONFIRMADO — §4.3).

### 7.7 Arquitectura narrativa
1. **Vas en serio** — reconocer al que ya no necesita motivación sino método avanzado. 2. **La evaluación inicial** — medir antes de transformar; apertura técnica del nivel. 3. **El ajuste semanal** — la frecuencia como producto (4 sesiones + ajustes). 4. **La salida** — estándar de ficha.

### 7.8 Geometría de información
**Progresiva-técnica**: del objetivo a la instrumentación (evaluación → protocolos → ajustes → precio). Justificación: RENDIMIENTO es la única ficha cuyo contenido técnico (biomecánica, biohacking) exige secuencia de instrumentos; no es una escalada simple ni un relato: es un sistema. (DERIVADO del contenido incluido CONFIRMADO.)

### 7.9 Densidad y ritmo
**`quiet`** (CONFIRMADO — matriz Fase 5). La técnica no necesita espectáculo: la precisión del dato ES el estilo. (DERIVADO — D.2.)

### 7.10 Movimiento conceptual
`editorial-reveal` + `quiet-transition` (CONFIRMADO — matriz). Text motion `none` (CONFIRMADO). 3D: **PROHIBIDO** (CONFIRMADO — mundo 07; la dirección conceptual de Fase 7 para velocidad/trayectoria no autoriza aquí nada).

### 7.11 Presupuesto de atención
Concentra: la evaluación biomecánica como apertura técnica y el bloque de ajuste semanal. Recupera: la claridad del precio frente a la densidad técnica — nada compite con las cifras. (PROPUESTO.)

### 7.12 Momento irreductible
**La evaluación biomecánica inicial completa.** Es el único punto de todo el catálogo donde BAYONA mide antes de prometer: convierte "transformación total" en un proceso verificable. Sin ella, RENDIMIENTO sería FUERZA con más sesiones. (CONFIRMADO — ítem incluido; papel DERIVADO.)

### 7.13 Prohibiciones específicas
- Prohibido dramatizar el "RESULTADOS VISIBLES" con teatro visual: el resultado se vende por instrumentación, no por brillo. (PROPUESTO.)
- Prohibido prometer resultados concretos: sin lenguaje médico ni garantías (CONFIRMADO — reglas de routeMeta; D-002).
- Prohibido ocultar que BAYONA+ está en desarrollo: "acceso anticipado" es eso y no más. (CONFIRMADO — CONTENT_STATES `concept`/`unavailable` para la app.)

### 7.14 CTA y continuidad
CTA: QUIERO EMPEZAR (CONFIRMADO). Secundarios: `/checkout?plan=RENDIMIENTO`, PDF. Vecinos: FUERZA (descenso), ELITE (escalado). (CONFIRMADO — matriz fila 7.)

### 7.15 Evidencia
CONFIRMADO: offerings.js RENDIMIENTO completo, overlays de conversionContent.js, matrices Fase 4/5. DERIVADO: mundos 07+02, geometría técnica, momento. PROPUESTO: prohibición 1.

---

## 8. `/plan/elite` — ELITE · ACOMPAÑAMIENTO PRIVADO

### 8.1 Identidad
Mundo dominante: **07 DECISIÓN** · secundario: **08 CONTINUIDAD** (DERIVADO — ELITE es la única ficha que vende una relación continua y directa: WhatsApp directo con Sebastián, eventos privados, 8 sesiones). Función: ficha tope "ACOMPAÑAMIENTO PRIVADO · MÁXIMO 10 CUPOS". Precio vivo: $899.000 COP/mes. (CONFIRMADO — offerings.js.)

### 8.2 Pregunta del visitante
"¿Puedo tener a Sebastián para mí, y qué implica exactamente?" (DERIVADO — `audience` y `shortDescription` de ELITE.)

### 8.3 Trabajo que la página debe resolver
Presentar la oferta privada con todas sus consecuencias visibles: 8 sesiones privadas (virtuales o presenciales en España), WhatsApp directo, plan 100% personalizado, eventos VIP, "acceso de por vida", tope real de 10 cupos. **DP-5** (alcance legal/comercial de "acceso de por vida") NO se toca ni se resuelve aquí: se documenta tal como está publicado. (CONFIRMADO — offerings.js ELITE; DP-5 pendiente en PROJECT-STATE.)

### 8.4 Estado de llegada
Sabe: que existe un tope. No sabe: qué significa tener a Sebastián directamente (frecuencia, canal, presencialidad). Necesita: precisión de lo que compra y confianza en la exclusividad real. (DERIVADO.)

### 8.5 Estado de salida
Comprende: ELITE es una relación privada con condiciones explícitas y disponibilidad limitada de verdad. Puede: iniciar conversación (las solicitudes de ELITE son naturalmente conversación, no impulso). Siente: "transformación completa. Cuerpo, mente y método" sin agobio comercial. (CONFIRMADO — `feeling`; DERIVADO el tono.)

### 8.6 Secuencia espacial
ENTRADA (estructura) → APROXIMACIÓN breve (admite: "todo RENDIMIENTO más:" + condiciones) → DECISIÓN (estructura) → SALIDA (estructura). TENSIÓN/INMERSIÓN prohibidas (CONFIRMADO — §4.3).

### 8.7 Arquitectura narrativa
1. **La escala honesta** — máximo 10 personas: exclusividad por diseño, no por marketing. 2. **La relación** — WhatsApp directo con Sebastián: el canal es el producto. 3. **El detalle** — 8 sesiones privadas, personalización total, eventos. 4. **La salida conversacional** — QUIERO EMPEZAR abre el diálogo, no un carrito.

### 8.8 Geometría de información
**Progresiva-relacional**: de la persona (Sebastián) al contenido ("todo RENDIMIENTO más") a las condiciones (cupos, presencialidad en España). Justificación: es la única ficha donde la oferta ES una relación personal con disponibilidad limitada; RAÍZ/FUERZA/RENDIMIENTO venden método, ELITE vende acceso directo. (DERIVADO — `scarcity` real sin contador + contenido CONFIRMADO.)

### 8.9 Densidad y ritmo
**`quiet`** (CONFIRMADO — matriz Fase 5). La escasez real (10 cupos, dato estable) se expresa en tipografía y silencio, nunca en urgencia animada. (CONFIRMADO — offerings.js eliminó el contador hardcodeado de urgencia por riesgo de publicidad engañosa; DERIVADO el tratamiento.)

### 8.10 Movimiento conceptual
`editorial-reveal` + `quiet-transition` (CONFIRMADO — matriz). Text motion `none` (CONFIRMADO). 3D: **PROHIBIDO** (CONFIRMADO — mundo 07; la dirección conceptual "precisión/control" de Fase 7 no autoriza nada aquí).

### 8.11 Presupuesto de atención
Concentra: la persona y las condiciones. Recupera: nada compite con el número de cupos ni con el precio — silencio alrededor. (PROPUESTO.)

### 8.12 Momento irreductible
**"WhatsApp DIRECTO con Sebastián" + el tope real de 10 cupos.** La única ruta donde el producto es una línea directa a la persona del método, con una escasez verificable en lugar de un contador inventado. Sin esto, ELITE es RENDIMIENTO caro. (CONFIRMADO — `included`, `scarity`→`scarcity`, eliminación histórica de `urgency`; papel DERIVADO.)

### 8.13 Prohibiciones específicas
- Prohibido fabricar urgencia (contadores, "quedan 3"): la escasez publicada es el tope, no una cuenta manipulada. (CONFIRMADO — comentario histórico de offerings.js sobre `urgency` eliminado.)
- Prohibido ampliar o reinterpretar "acceso de por vida" (DP-5): se replica tal cual está publicado; su resolución es de Sebastián. (CONFIRMADO — PROJECT-STATE.)
- Prohibida la gala dorada o estética "premium genérica": lujo BAYONA = acceso y precisión, no brillo. (PROPUESTO — coherente con ADN: materialidad del sistema, no variante.)

### 8.14 CTA y continuidad
CTA: QUIERO EMPEZAR (WhatsApp) (CONFIRMADO). Secundarios: `/checkout?plan=ELITE`, PDF. Vecinos: RENDIMIENTO. Fuera de itinerario: la continuidad es la propia conversación. (CONFIRMADO — matriz fila 8; chapters.js: planes fuera de itinerario.)

### 8.15 Evidencia
CONFIRMADO: offerings.js ELITE completo (`scarcity`, `badge`, `included`), DP-5 pendiente (PROJECT-STATE), matrices Fase 4/5. DERIVADO: mundos 07+08, geometría relacional, momento. PROPUESTO: prohibiciones 1 y 3.

---

## 9. `/parkour-academy` — ACADEMIA · LA TRAYECTORIA COMO MÉTODO

### 9.1 Identidad
- **Ruta:** `/parkour-academy` · **Nombre funcional:** Academia (CONFIRMADO — matriz Fase 4 fila 4).
- **Mundo dominante:** 03 MOVIMIENTO · **Mundo secundario:** 05 COMUNIDAD (DERIVADO — los grupos por edades NIÑOS/JÓVENES/ADULTOS/DEPORTISTAS son también un sistema de comunidad; el mundo 03 habita aquí como territorio propio).
- **Función real:** explicar la formación en parkour por progresiones y registrar interés sin pago (pre-apertura).

### 9.2 Pregunta del visitante
"¿Cómo aprendo parkour desde donde estoy — y de verdad hay sitio para aprenderlo bien?" (DERIVADO — routeMeta description "desde iniciación hasta nivel avanzado"; programaAudiences por edad.)

### 9.3 Trabajo que la página debe resolver
Que un padre o un atleta entienda la progresión técnica y confíe en registrarse por WhatsApp. Es una página de **umbral de comunidad**: se registra interés, no se compra. (CONFIRMADO — J5: registro de interés sin pago.)

### 9.4 Estado de llegada
Sabe: que parkour existe en BAYONA. No sabe: niveles, edades, seguridad, logística. Necesita: ver la progresión y sentir rigor antes que espectáculo. (DERIVADO — CHAPTERS teaser: "del primer salto al control".)

### 9.5 Estado de salida
Comprende: cómo se aprende aquí (progresiones + fuerza aplicada) y para quién es cada grupo. Puede: registrar interés por WhatsApp. Siente: deseo de movimiento y confianza en el método formativo. (CONFIRMADO — J5; routeMeta.)

### 9.6 Secuencia espacial
1. **ENTRADA (estructura):** recepción que declara el tono: técnica y control. (CONFIRMADO — clase narrativa.)
2. **TENSIÓN (un momento, admite):** el instante antes del salto: la página detiene el tiempo una vez para mostrar de qué es capaz el cuerpo cuando hay método. Resuelta por la progresión siguiente. (CONFIRMADO como propuesta — matriz Fase 5: cinematic-stage que "detiene el tiempo".)
3. **DESCUBRIMIENTO (estructura):** niveles por edad/nivel, logística, qué significa cada progresión. (CONFIRMADO — contenido de grupos y niveles.)
4. **SALIDA (estructura):** registro de interés (WhatsApp) + NextChapter → `/app`. (CONFIRMADO — J5, chapters.js.)

### 9.7 Arquitectura narrativa
1. **El gesto** — un momento que muestra trayectoria y control (el único momento immersive). 2. **La progresión** — del primer salto al control: el método formativo desplegado. 3. **Los grupos** — edades y niveles con realismo (5–11, 12–17, 18–59, deportistas). 4. **El registro** — interés sin fricción ni pago.

### 9.8 Geometría de información
**Progresiva por niveles** (itinerario formativo): se recorre como una escala de habilidad. Justificación: es la única ruta cuyo contenido ES una progresión técnica temporal; la geometría de "escalera" la distingue de todo catálogo. (PROPUESTO sobre base CONFIRMADA de grupos/niveles.)

### 9.9 Densidad y ritmo
**`immersive`** — un solo momento (CONFIRMADO — matriz Fase 5: cinematic-stage). Es la segunda página que se lo permite (con `/`); el mundo 03 es JUSTIFICADO en 3D por el Bloque 3, pero ese consumo será de Fase 7 vía `useScrollHandoff()`, no de este blueprint.

### 9.10 Movimiento conceptual
- `cinematic-stage` — el escenario que detiene el tiempo (CONFIRMADO — matriz).
- Text motion: `mask` (CONFIRMADO — matriz). Sticky/Horizontal: candidatos ○ (CONFIRMADO — matriz).
- 3D: **POSIBLE CON JUSTIFICACIÓN** (el mundo 03 es "JUSTIFICADO" en el Bloque 3 — trayectoria/libertad como dirección conceptual). Este blueprint no diseña nada: la decisión concreta de escena pertenece a `WORLD-3D-STRATEGY` y su implementación a Fase 7 vía `useScrollHandoff()`. (CONFIRMADO la clasificación del Bloque 3; DERIVADO el límite de esta fase.)

### 9.11 Presupuesto de atención
Concentra: el momento de trayectoria y la escalera de niveles. Recupera: la sección de grupos con ritmo utilitario antes del registro. El CTA de registro nunca queda detrás del momento narrativo. (PROPUESTO, compatible con presupuesto.)

### 9.12 Momento irreductible
**La escalera de progresión del primer salto al control.** Es la única página donde el método se mide en habilidad acumulada, no en planes ni productos: si se quitara la progresión, quedaría un anuncio de clases genérico. (DERIVADO — teaser CHAPTERS + routeMeta + audiencias reales.)

### 9.13 Prohibiciones específicas
- Prohibido el parkour como adrenalina de marketing (saltos ilegales, azoteas, vandalismo): la academia es técnica, control y seguridad. (DERIVADO — routeMeta "control"; ADN "qué NO es BAYONA".)
- Prohibido prometer resultados acrobáticos concretos: progresión, no promesa. (DERIVADO — reglas copy routeMeta.)
- **Hallazgo F6-04 del Bloque 3 (deferido aquí):** en reduced-motion la trayectoria debe sostenerse por composición (diagonales, líneas de fuga, jerarquía), no por efecto. Este blueprint la recoge como obligación de diseño de Fase 8. (CONFIRMADO — hallazgo del Bloque 3.)
- Prohibido copiar el momento de `/`: aquí el escenario muestra TRAYECTORIA (movimiento), allí muestra MÉTODO (estructura). (PROPUESTO.)

### 9.14 CTA y continuidad
CTA primario: registro de interés por WhatsApp (sin pago) (CONFIRMADO — J5). Continuidad: NextChapter → `/app`; puente a `/shop` a cargo del itinerario canónico (CONFIRMADO — J5: "ya no del sistema retirado").

### 9.15 Evidencia
CONFIRMADO: matriz Fase 4 fila 4, J5, matriz Fase 5, programAudiences (offerings.js), chapters.js, F6-04, clasificación 3D del mundo 03. DERIVADO: mundos 03+05, geometría de escalera, momento. PROPUESTO: prohibiciones 1 y 4.

---

## 10. `/shop` — TIENDA · SESIONES SUELTAS, SIN MEMBRESÍA

### 10.1 Identidad
- **Ruta:** `/shop` · **Nombre funcional:** Tienda (CONFIRMADO — matriz Fase 4 fila 9).
- **Mundo dominante:** 04 EXPERIENCIA · **Mundo secundario:** 08 CONTINUIDAD leve (DERIVADO — el pedido se cierra por WhatsApp con confirmación humana; la conversación es continuidad, no checkout).
- **Función real:** dejar comprar (o consultar) sin membresía: servicios por sesión, productos consultables, carrito → pedido por WhatsApp.

### 10.2 Pregunta del visitante
"¿Qué puedo comprar sin contratar ningún plan?" (CONFIRMADO — matriz Fase 4 col. 5; CHAPTERS teaser.)

### 10.3 Trabajo que la página debe resolver
Ofrecer una vía de entrada sin compromiso: clases 1:1, masaje deportivo, movilidad, pilates, evaluaciones (sessionServices/extraServices) e indumentaria consultable (catalogItems OBJ-01…06). Carrito persistente (`bayona:cart:v1`) → WhatsApp con contexto de producto. Sin pago online (contrato del sitio). (CONFIRMADO — J4, shopCatalog.js.)

### 10.4 Estado de llegada
Sabe: que no quiere (o no puede) una membresía. No sabe: qué se puede comprar suelto ni cómo se cierra un pedido. Necesita: precios por sesión, categorías claras y un cierre sencillo. (DERIVADO — J4.)

### 10.5 Estado de salida
Comprende: qué hay disponible hoy por sesión y que la confirmación es humana (precio, disponibilidad y condiciones vigentes se confirman por WhatsApp). Puede: haber armado y enviado su pedido. Siente: utilidad y cero presión. (CONFIRMADO — buildCatalogItemWhatsAppUrl: pide confirmar "precio, disponibilidad, detalles y condiciones vigentes".)

### 10.6 Secuencia espacial
1. **ENTRADA (estructura):** catálogo visible de inmediato: sin relato previo. (DERIVADO — geometría utilitaria.)
2. **DESCUBRIMIENTO (estructura):** explorar categorías y servicios por curiosidad. (CONFIRMADO — clase de experiencia; matriz Fase 5.)
3. **DECISIÓN (admite, comercial paralela):** añadir al carrito / consultar. Rodeada de claridad: los servicios de salud llevan su scope (`healthScope`) y los presenciales su condición. (CONFIRMADO — flags en offerings.js.)
4. **SALIDA (estructura):** pedido por WhatsApp / NextChapter → `/faq`. (CONFIRMADO — chapters.js.)

### 10.7 Arquitectura narrativa
1. **El catálogo** — todo a la vista, filtrable. 2. **El carrito** — persistente y accesible desde barra y menú móvil. 3. **La confirmación humana** — el pedido no es un pago: es una conversación. Razón de cada momento: la tienda sirve a la entrada sin fricción; su "narrativa" es la utilidad.

### 10.8 Geometría de información
**Exploratoria-utilitaria** (catálogo filtrable + carrito). Justificación: es la única ruta donde el visitante arma algo en vez de leer; la geometría de herramienta la separa de los catálogos de planes (comparativa) y de recursos (biblioteca). (PROPUESTO sobre base CONFIRMADA.)

### 10.9 Densidad y ritmo
**`balanced`** (CONFIRMADO — matriz Fase 5: data-cascade + compact-rail). El rail es ambiente declarado, nunca información crítica en bucle (CONFIRMADO — MOTION-MAP "Evitar: información crítica o única").

### 10.10 Movimiento conceptual
- `data-cascade` — servicios con jerarquía sin ruido (CONFIRMADO — matriz).
- `compact-rail` — rails decorativos de ambiente (CONFIRMADO — matriz).
- Text motion `none`, sin sticky/horizontal/parallax (CONFIRMADO — matriz).
- 3D: **PROHIBIDO** (CONFIRMADO — clasificación del mundo 04 en su uso comercial; el 3D de la marca no vende zapatillas).

### 10.11 Presupuesto de atención
Concentra: el catálogo y el estado del carrito. Recupera: el movimiento de ambiente nunca entre el visitante y su carrito. El WhatsApp de pedido siempre visible. (PROPUESTO.)

### 10.12 Momento irreductible
**El carrito que termina en una conversación, no en un pago.** La única "caja" del sitio que deliberadamente NO es un checkout: pedido por WhatsApp con confirmación humana de precio y disponibilidad. Sin esto, la tienda es un ecommerce genérico con el botón roto. (CONFIRMADO — J4 + texto del mensaje; papel DERIVADO.)

### 10.13 Prohibiciones específicas
- Prohibido inventar checkout online o precios fijados en el carrito: la confirmación es humana por contrato. (CONFIRMADO — J4 "Sin pago online (contrato del sitio)"; catálogo pide confirmar condiciones vigentes.)
- Prohibido mezclar la conversión paralela de la tienda con el embudo de membresía: son conversión distinta (col. 12 "Conversión paralela"). (CONFIRMADO — matriz Fase 4.)
- Prohibido promesas de resultado en servicios de salud: scope declarado (`healthScope`), sin lenguaje médico. (CONFIRMADO — flags + reglas routeMeta.)
- Prohibido copiar el comparador de `/programs`: aquí no se comparan planes, se compra por sesión. (PROPUESTO.)

### 10.14 CTA y continuidad
CTA primario: carrito → pedido WhatsApp por producto (CONFIRMADO). Secundario: consulta directa por artículo. Continuidad: NextChapter → `/faq` (CONFIRMADO — chapters.js).

### 10.15 Evidencia
CONFIRMADO: J4, shopCatalog.js, sessionServices/extraServices, matriz Fase 4 fila 9, matriz Fase 5, chapters.js. DERIVADO: mundos 04+08, geometría, momento. PROPUESTO: prohibiciones 3–4.

---

## 11. `/app` — BAYONA+ · EL PRODUCTO DIGITAL EN DESARROLLO

### 11.1 Identidad
- **Ruta:** `/app` · **Nombre funcional:** Producto digital (CONFIRMADO — matriz Fase 4 fila 10).
- **Mundo dominante:** 02 MÉTODO · **Mundo secundario:** 06 CONOCIMIENTO (DERIVADO — BAYONA+ digitaliza el método y lo convierte en sistema de aprendizaje en desarrollo).
- **Función real:** explicar el concepto de BAYONA+ y captar early access por WhatsApp, **sin prometer fecha ni producto operativo**. (CONFIRMADO — routeMeta: "todavía no hay app operativa para descargar… sin fechas comprometidas".)

### 11.2 Pregunta del visitante
"¿Qué está construyendo BAYONA para el móvil y cuándo estará?" (CONFIRMADO — CHAPTERS teaser: "Qué se está construyendo y qué no está confirmado todavía".)

### 11.3 Trabajo que la página debe resolver
Equilibrar entusiasmo y honestidad: mostrar el concepto y sus funciones en exploración, dejar una lista de early access por WhatsApp, y **nunca** vender como app existente. (CONFIRMADO — J6; CONTENT_STATES `concept`/`unavailable`.)

### 11.4 Estado de llegada
Sabe: que BAYONA tiene web. No sabe: si hay app, cuándo, ni qué haría. Necesita: claridad de estado más que espectáculo. (DERIVADO — J6.)

### 11.5 Estado de salida
Comprende: qué es BAYONA+ (concepto en construcción), qué funciones se exploran y que la vía de entrada es early access por WhatsApp. Puede: registrarse. Siente: curiosidad honesta, no frustración por una promesa rota. (CONFIRMADO — J6.)

### 11.6 Secuencia espacial
1. **ENTRADA (estructura):** estado declarado sin ambigüedad (concepto en desarrollo). (CONFIRMADO — routeMeta.)
2. **DESCUBRIMIENTO (estructura):** el sistema/módulos en exploración como maqueta conceptual. (CONFIRMADO — clase narrativa balanced.)
3. **DECISIÓN (admite, suave):** early access por WhatsApp. (CONFIRMADO — J6.)
4. **SALIDA (estructura):** NextChapter → `/community`. (CONFIRMADO — chapters.js.)

### 11.7 Arquitectura narrativa
1. **Estado real** — abrir con lo que NO es (todavía): descarga, fechas, garantías. Razón: la confianza de BAYONA exige no fingir. 2. **El concepto** — qué haría BAYONA+ cuando exista (módulos, sistema). Razón: la maqueta despierta deseo sin engañar. 3. **Early access** — una lista, no una venta. Razón: captar interés sin prometer fecha (anti-promesa).

### 11.8 Geometría de información
**Exploratoria-conceptual** (maqueta de producto, no catálogo). Justificación: es la única ruta donde se muestra un producto que aún no existe; la geometría es la de un concept deck, no la de una ficha. (PROPUESTO sobre estado CONFIRMADO.)

### 11.9 Densidad y ritmo
**`balanced`** (CONFIRMADO — matriz Fase 5: editorial-slide + compact-rail). El sistema se muestra en movimiento contenido (`image-drift` como fondo, sin exigir atención). (CONFIRMADO — matriz.)

### 11.10 Movimiento conceptual
- `editorial-slide` — módulos/líneas que señalan dirección (CONFIRMADO — matriz).
- `compact-rail` — rails de funciones (CONFIRMADO — matriz).
- Text motion: `mask` (CONFIRMADO). Horizontal: candidato ○ (CONFIRMADO — matriz).
- 3D: **PROHIBIDO** (CONFIRMADO — clasificación del mundo 02; un producto en desarrollo no necesita escena, necesita claridad de estado).

### 11.11 Presupuesto de atención
Concentra: el estado real y el concepto. Recupera: las transiciones quietas entre módulos; el early access se presenta sin prisa. (PROPUESTO.)

### 11.12 Momento irreductible
**La declaración honesta de producto en desarrollo.** Es la única página de todo el sitio que dice explícitamente "todavía no existe, pero aquí está lo que construimos". Ese gesto de no-promesa ES la marca; sin él, sería un anuncio de app fantasma. (CONFIRMADO — routeMeta/description y J6; papel DERIVADO.)

### 11.13 Prohibiciones específicas
- Prohibido mostrar interfaces "finales", screenshots inventados o fechas. (CONFIRMADO — "sin fechas comprometidas", CONTENT_STATES.)
- Prohibido que el early access parezca una compra: es una lista. (CONFIRMADO — J6.)
- Prohibido copiar la estructura de una ficha de plan: aquí no hay precio ni membresía. (PROPUESTO.)

### 11.14 CTA y continuidad
CTA primario: early access por WhatsApp (CONFIRMADO). Continuidad: NextChapter → `/community` (CONFIRMADO).

### 11.15 Evidencia
CONFIRMADO: routeMeta `/app`, J6, matriz Fase 4/5, chapters.js, CONTENT_STATES. DERIVADO: mundos 02+06, geometría. PROPUESTO: prohibiciones 1 y 3.

---

## 12. `/community` — COMUNIDAD · EL ACOMPAÑAMIENTO ABIERTO

### 12.1 Identidad
- **Ruta:** `/community` · **Nombre funcional:** Comunidad (CONFIRMADO — matriz Fase 4 fila 11).
- **Mundo dominante:** 05 COMUNIDAD · **Mundo secundario:** 08 CONTINUIDAD (DERIVADO — la comunidad sostiene el hábito en el tiempo: entrar es continuar).
- **Función real:** explicar la comunidad abierta y gratuita (WhatsApp) y dejar solicitar acceso sin coste. (CONFIRMADO — J7: "Solicitar acceso por WhatsApp (gratis)".)

### 12.2 Pregunta del visitante
"¿Entrenar acompañado cuesta algo, y cómo entro?" (CONFIRMADO — routeMeta: "acceso abierto y gratuito… no necesitas contratar un plan".)

### 12.3 Trabajo que la página debe resolver
Quitar la barrera del "no soy cliente todavía": la comunidad existe SIN plan, y entrar es pedirlo por WhatsApp. Es una página de **pertenencia**, no de venta. (CONFIRMADO — J7, routeMeta.)

### 12.4 Estado de llegada
Sabe: que hay una comunidad (o llega por puentes de fichas/NextChapter). No sabe: si es gratis, si exige plan, qué cambia al entrar. Necesita: una puerta sin condiciones. (DERIVADO — J7.)

### 12.5 Estado de salida
Comprende: BAYONA comunidad es abierta, gratuita y por WhatsApp. Puede: solicitar acceso. Siente: "aquí entrenas acompañado, sin importar tu plan". (CONFIRMADO — J7.)

### 12.6 Secuencia espacial
1. **ENTRADA (estructura):** declaración de acceso abierto, sin rodeos. (DERIVADO — clase narrativa balanced.)
2. **DESCUBRIMIENTO (estructura):** voces en rail: el patrón marquee ya presente, calidez de la comunidad vivida. (CONFIRMADO — matriz Fase 5.)
3. **DECISIÓN (admite, suave):** solicitar acceso (gratis). (CONFIRMADO — J7.)
4. **SALIDA (estructura):** NextChapter → `/resources`. (CONFIRMADO — chapters.js.)

### 12.7 Arquitectura narrativa
1. **La puerta abierta** — acceso sin plan, dicho primero. Razón: la valla mental es exactamente esa. 2. **Las voces** — comunidad mostrada con sus personas. Razón: el sentido de pertenencia se contagia por testimonio vivo, no por eslóganes. 3. **La entrada** — WhatsApp, un gesto humano. Razón: la comunidad de BAYONA no se registra con formulario: se presenta.

### 12.8 Geometría de información
**Exploratoria-cálida** (rail de voces + acceso). Justificación: ninguna otra página muestra comunidad como experiencia; es la única ruta cuya geometría es social (voces, conversación) y no informativa. (PROPUESTO sobre rail CONFIRMADO.)

### 12.9 Densidad y ritmo
**`balanced`** (CONFIRMADO — matriz Fase 5: compact-rail + editorial-reveal). Ritmo cálido, nunca frenético; la comunidad se siente como una conversación. (DERIVADO — mundo 05.)

### 12.10 Movimiento conceptual
- `compact-rail` — el marquee de voces ya vivo (CONFIRMADO — matriz Fase 5).
- `editorial-reveal` — bloques que emergen con calma (CONFIRMADO — matriz).
- Text motion: `none` (CONFIRMADO — matriz). Sin sticky/horizontal/parallax (CONFIRMADO).
- 3D: **PROHIBIDO** — y además es el hallazgo F6-05 del Bloque 3 (deferido): la comunidad DEBE evitar el globo de `/about`; su voz visual es el rail, no otra escena. (CONFIRMADO — F6-05, Bloque 3.)

### 12.11 Presupuesto de atención
Concentra: la declaración de acceso y las voces. Recupera: cero agitación antes del acceso: el paso a WhatsApp llega en calma. (PROPUESTO.)

### 12.12 Momento irreductible
**El acceso gratuito y sin plan de verdad.** Es la única página que le dice al no-cliente "entra, no necesitas comprar nada". Esa puerta lateral del embudo define el carácter de BAYONA; sin ella, la comunidad sería marketing decorativo. (CONFIRMADO — routeMeta/J7; papel DERIVADO.)

### 12.13 Prohibiciones específicas
- Prohibido copiar el globo de `/about` (F6-05): la comunidad tiene su propia gramática visual (rail). (CONFIRMADO — F6-05.)
- Prohibido incentivar la comunidad como "paso previo táctico para vender": es abierta por diseño. (DERIVADO — routeMeta.)
- Prohibido densidad comercial: sin precios, sin cupos, sin catálogo aquí. (PROPUESTO.)
- Prohibido el patrón marquee para información crítica: el rail es ambiente (CONFIRMADO — MOTION-MAP "Evitar: información crítica o única").

### 12.14 CTA y continuidad
CTA primario: solicitar acceso por WhatsApp (gratis) (CONFIRMADO — J7). Continuidad: NextChapter → `/resources` (CONFIRMADO — chapters.js).

### 12.15 Evidencia
CONFIRMADO: J7, routeMeta `/community`, matriz Fase 4/5, F6-05, chapters.js. DERIVADO: mundos 05+08, geometría. PROPUESTO: prohibiciones 1–3.

---

## 13. `/resources` — RECURSOS · LA PUERTA GRATUITA AL MÉTODO

### 13.1 Identidad
- **Ruta:** `/resources` · **Nombre funcional:** Gratuito (CONFIRMADO — matriz Fase 4 fila 12).
- **Mundo dominante:** 06 CONOCIMIENTO · **Mundo secundario:** 00 ORIGEN (DERIVADO — los recursos gratuitos son la primera experiencia del método para el visitante J1).
- **Función real:** entregar valor sin pedir nada: Reto 30 días, Protocolo 7 días y guías; salida por WhatsApp con contexto de recurso. (CONFIRMADO — J1.)

### 13.2 Pregunta del visitante
"¿Qué puedo probar gratis, sin pagar ni darte mis datos?" (DERIVADO — J1: "sin fricción, sin cuenta, sin datos (promesa de privacidad)".)

### 13.3 Trabajo que la página debe resolver
Demostrar el método regalando una primera experiencia útil: el recurso gratuito ES la conversión. Debe leerse, guardarse y usarse; nunca sentirse como cebo. (CONFIRMADO — J1.)

### 13.4 Estado de llegada
Sabe: que BAYONA suena interesante. No sabe: si el método se sostiene o es humo. Necesita: probar algo real antes de cualquier decisión. (DERIVADO — J1.)

### 13.5 Estado de salida
Comprende: qué es el método por experiencia propia. Puede: salir por WhatsApp con contexto del recurso, o continuar al siguiente capítulo. Siente: "esto funciona, me ha servido algo hoy". (CONFIRMADO — J1.)

### 13.6 Secuencia espacial
1. **ENTRADA (estructura):** biblioteca de recursos presentada con calma, sin urgencia. (DERIVADO — clase lectura.)
2. **DESCUBRIMIENTO (admite):** explorar los recursos por categoría (Reto 30 días, Protocolo 7 días, guías). (CONFIRMADO — J1.)
3. **DECISIÓN (admite, suave):** usar un recurso / salir por WhatsApp con contexto. (CONFIRMADO — J1.)
4. **SALIDA (estructura):** NextChapter → `/shop`. (CONFIRMADO — chapters.js.)

### 13.7 Arquitectura narrativa
1. **La biblioteca** — los recursos a la vista, no enterrados. Razón: el valor se entrega, no se anuncia. 2. **El recurso singular** — cada guía presentada como herramienta usable. Razón: usarlo hoy crea la prueba que la página necesita. 3. **La salida con contexto** — WhatsApp que añade contexto de recurso. Razón: si alguien quiere contacto, que el recurso sea el puente (sin datos, sin cuenta).

### 13.8 Geometría de información
**Utilitaria-biblioteca** (index + fichas de recurso). Justificación: es la única ruta donde el contenido se *consume* fuera del sitio (guías), no se compara ni se decide; la geometría es de estantería. (PROPUESTO sobre base CONFIRMADA de lista de recursos.)

### 13.9 Densidad y ritmo
**`quiet`** (CONFIRMADO — matriz Fase 5: editorial-reveal + data-cascade). "Recursos para leer y guardar; movimiento mínimo". (CONFIRMADO — SCROLL-STORY-MATRIX.)

### 13.10 Movimiento conceptual
- `editorial-reveal` — las fichas emergen al ritmo de lectura (CONFIRMADO — matriz).
- `data-cascade` — índice de recursos con jerarquía (CONFIRMADO — matriz).
- Text motion: `none` (CONFIRMADO — matriz). Sin sticky/horizontal/parallax (CONFIRMADO).
- 3D: **PROHIBIDO** (CONFIRMADO — mundo 06; el conocimiento se lee, no se contempla).

### 13.11 Presupuesto de atención
Concentra: la utilidad del recurso. Recupera: el silencio que permite imprimir/guardar. Nada parpadea: la página es un anaquel, no un escenario. (PROPUESTO.)

### 13.12 Momento irreductible
**El recurso gratis real y usable (Reto 30 días / Protocolo 7 días).** Es la única promesa del sitio que se cumple sin pedir datos ni tarjeta: la conversión gratuita. Si se eliminara, J1 no tendría puerta de entrada y el "método con acompañamiento" sería solo un discurso. (CONFIRMADO — J1; papel DERIVADO.)

### 13.13 Prohibiciones específicas
- Prohibido pedir datos, cuenta o "probar el plan": la promesa de privacidad manda. (CONFIRMADO — J1.)
- Prohibido el patrón de venta (contadores, urgencia, "últimos días"): un recurso que no es libre no es recurso. (DERIVADO — J1.)
- Prohibido esconder el recurso detrás de un relato largo: biblioteca visible. (PROPUESTO.)
- Prohibido copiar la geometría de `/programs` (comparativa): aquí no se comparan planes, se ofrecen herramientas. (PROPUESTO.)

### 13.14 CTA y continuidad
CTA primario: recurso → WhatsApp con contexto (no forzada; el recurso es la conversión) (CONFIRMADO — J1). Continuidad: NextChapter → `/shop` (CONFIRMADO — chapters.js).

### 13.15 Evidencia
CONFIRMADO: J1, routeMeta `/resources`, matriz Fase 4/5, chapters.js. DERIVADO: mundos 06+00, geometría. PROPUESTO: prohibiciones 2–4.

---

## 14. `/faq` — FAQ · LA CLARIDAD ANTES DE DECIDIR

### 14.1 Identidad
- **Ruta:** `/faq` · **Nombre funcional:** Objeciones (CONFIRMADO — matriz Fase 4 fila 13).
- **Mundo dominante:** 07 DECISIÓN · **Mundo secundario:** 06 CONOCIMIENTO (DERIVADO — responder objeciones es conocimiento aplicado a la decisión).
- **Función real:** disolver dudas concretas (precios, lesiones, presencialidad, garantía, BAYONA+) para que quien duda pueda decidir; cierre por videollamada/pregunta por WhatsApp. (CONFIRMADO — J8, routeMeta.)

### 14.2 Pregunta del visitante
"¿Qué dudas me quedan antes de decidir?" (CONFIRMADO — matriz Fase 4 col. 5.)

### 14.3 Trabajo que la página debe resolver
Respuesta directa sin rodeos a cada objeción, por categorías, y una salida humana si la duda persiste (videollamada, pregunta rápida por WhatsApp). (CONFIRMADO — J8.)

### 14.4 Estado de llegada
Sabe: que le interesa o ya eligió dirección. No sabe: la respuesta a la duda concreta que lo frena. Necesita: precisión, no persuasión. (DERIVADO — J8.)

### 14.5 Estado de salida
Comprende: la respuesta a su duda. Puede: decidir, reservar videollamada, preguntar, o volver a recepción (NextChapter). Siente: "me han respondido, no me han vendido". (CONFIRMADO — J8.)

### 14.6 Secuencia espacial
1. **ENTRADA (estructura):** índice por categorías visible. (DERIVADO — clase lectura.)
2. **DESCUBRIMIENTO (admite):** navegar las respuestas con calma y jerarquía. (CONFIRMADO — clase lectura sin tensión/inmersión según §4.5 de SPATIAL-LANGUAGE.)
3. **DECISIÓN (admite, suave):** videollamada / pregunta por WhatsApp. (CONFIRMADO — J8.)
4. **SALIDA (estructura):** NextChapter → `/` (devolver al inicio del itinerario). (CONFIRMADO — J8: "NextChapter devuelve al inicio del itinerario (recepción)".)

### 14.7 Arquitectura narrativa
1. **El índice** — categorías para encontrar la duda. Razón: FAQ sirve al que busca UNA respuesta. 2. **Las respuestas** — directas, sin rodeos ni relleno. Razón: la transparencia es el argumento. 3. **La salida humana** — videollamada o WhatsApp si la duda no cabe en texto. Razón: una duda que queda abierta es una venta perdida honesta; BAYONA prefiere la conversación.

### 14.8 Geometría de información
**Utilitaria-pregunta-respuesta** (índice + acordeones por categoría). Justificación: ninguna otra página organiza información por pregunta; la geometría es de soporte, no de narración. (PROPUESTO sobre base CONFIRMADA de categorías.)

### 14.9 Densidad y ritmo
**`quiet`** (CONFIRMADO — matriz Fase 5: editorial-reveal únicamente). "Respuestas rápidas; nada compite con la lectura". (CONFIRMADO — SCROLL-STORY-MATRIX.)

### 14.10 Movimiento conceptual
- `editorial-reveal` — despliegue contenido de respuestas (CONFIRMADO — matriz).
- Text motion: `none` (CONFIRMADO). Sin sticky/horizontal/parallax (CONFIRMADO).
- 3D: **PROHIBIDO** — y la exigencia del auditor es explícita: "no intentes convertir una página de claridad en una experiencia cinematográfica". Esta prohibición ES el blueprint. (CONFIRMADO — prompt del auditor, §7.)

### 14.11 Presupuesto de atención
Concentra: la respuesta en pantalla. Recupera: el silencio entre acordeones para poder leer con calma. Cero movimiento compitiendo. (PROPUESTO.)

### 14.12 Momento irreductible
**Las respuestas directas que no venden.** Es la única página donde BAYONA se abstiene de persuadir: se limita a responder (incluyendo limitaciones y letra pequeña honesta). Ese silencio comercial es, paradójicamente, su pico de confianza. (CONFIRMADO — J8/categorías; papel DERIVADO.)

### 14.13 Prohibiciones específicas
- Prohibido convertir la FAQ en experiencia cinematográfica o narrativa. (CONFIRMADO — auditor §7.)
- Prohibido retrasar la respuesta: el acordeón nunca esconde contenido crítico (precios, condiciones, lesiones). (DERIVADO — clase lectura/regla de claridad.)
- Prohibido respuestas evasivas ("depende" sin aclarar): transparencia por contrato. (DERIVADO — D-002.)
- Prohibido copiar el patrón rail/immersive de `/community` o `/`: quiet puro. (CONFIRMADO — matriz Fase 5.)

### 14.14 CTA y continuidad
CTA primario: videollamada / pregunta rápida por WhatsApp (CONFIRMADO — J8). Continuidad: NextChapter devuelve al inicio de itinerario (recepción) (CONFIRMADO — J8/chapters.js).

### 14.15 Evidencia
CONFIRMADO: J8, routeMeta `/faq`, matriz Fase 4 fila 13, matriz Fase 5, auditor §7, chapters.js. DERIVADO: mundos 07+06, momento. PROPUESTO: prohibiciones 2–4.

---

## 15. `/checkout` — CONFIGURADOR · EL EMBUDO SIN TEATRO

### 15.1 Identidad
- **Ruta:** `/checkout` · **Nombre funcional:** CONFIGURADOR BAYONA / embudo (CONFIRMADO — matriz Fase 4 fila 14).
- **Mundo dominante:** 07 DECISIÓN (en su forma más pura) · **Sin mundo secundario** (DERIVADO — el embudo no hospeda otra realidad: cualquier adorno narrativo es ruido).
- **Función real:** configurar plan → clases → extras → datos y enviar la solicitud por WhatsApp con detalle completo. `noindex`. (CONFIRMADO — J2/J3, D6/D7.)

### 15.2 Pregunta del visitante
"¿Cómo queda mi solicitud y cuánto sería?" (CONFIRMADO — matriz Fase 4 col. 5.)

### 15.3 Trabajo que la página debe resolver
Cero fricción hacia el envío: precarga del plan (`?plan=` fail-closed), pasos PLAN→CLASES→EXTRAS→DATOS, total con COP/€/USD, y handoff a `/order-confirmation`. La confianza ES el producto: precio claro, condiciones explícitas (sin confirmación automática). (CONFIRMADO — D6/D7, commercialSync.)

### 15.4 Estado de llegada
Sabe: qué plan (llega desde ficha o desde `?plan=`). No sabe: la configuración final ni el total exacto. Necesita: ver cómo se construye su solicitud y confirmar antes de enviar. (DERIVADO — J2/J3.)

### 15.5 Estado de salida
Comprende: qué solicitó exactamente y el total desglosado. Puede: enviar la solicitud por WhatsApp (mensaje con detalle) o volver atrás sin castigo. Siente: control absoluto, cero presión, cero ambigüedad. (CONFIRMADO — buildExperienceWhatsAppUrl: mensaje con desglose + "no constituye pago/inscripción".)

### 15.6 Secuencia espacial
1. **DECISIÓN (estructura, única):** la página ES el momento de decisión de principio a fin. (CONFIRMADO — clase conversión: "Cero distracción", §4.6 SPATIAL-LANGUAGE.)
2. **SALIDA (estructura):** handoff en calma a `/order-confirmation`. (CONFIRMADO — D7.)

Estado prohibido: DESCUBRIMIENTO (el visitante no explora aquí; confirma), TENSIÓN, INMERSIÓN. No hay APROXIMACIÓN: se llega sabiendo. (CONFIRMADO — §4.6.)

### 15.7 Arquitectura narrativa
1. **El plan precargado** — reconocimiento ("esto era lo que viste"). 2. **CLASES → EXTRAS → DATOS** — construcción progresiva y revisable. 3. **El total vivo** — la cifra se construye delante, siempre visible. 4. **El envío** — WhatsApp con desglose; "Esta solicitud no constituye pago…". Razón de cada paso: el visitante debe *verificar*, no adivinar.

### 15.8 Geometría de información
**Guiada-lineal estricta** (pasos en orden, revisables, sin ramas). Justificación: es la única ruta donde la geometría es un formulario de confirmación; nada de narrativa, nada de exploración: pasos → total → envío. (DERIVADO — D6 orden PLAN→CLASES→EXTRAS→DATOS.)

### 15.9 Densidad y ritmo
**`quiet`** (CONFIRMADO — matriz Fase 5: quiet-transition únicamente). "Decisión final: máxima claridad, cero distracción". (CONFIRMADO — SCROLL-STORY-MATRIX.)

### 15.10 Movimiento conceptual
- `quiet-transition` — entradas/salidas serenas, nunca cortina que retrase (CONFIRMADO — matriz).
- Text motion: `none` (CONFIRMADO). Sin sticky/horizontal/parallax (CONFIRMADO).
- 3D: **PROHIBIDO ABSOLUTO** — el auditor lo prohíbe explícitamente para `/checkout`. (CONFIRMADO — auditor §7.)

### 15.11 Presupuesto de atención
Concentra: el paso en curso y el total. Recupera: cero; aquí no se recupera atención, se mantiene. Toda el área es zona de claridad; el CTA "SOLICITAR DETALLES POR WHATSAPP" nunca se retrasa por movimiento. (CONFIRMADO — auditor §7 + MOTION-MAP.)

### 15.12 Momento irreductible
**El paso de DATOS → envío con desglose explícito y disclaimer honesto.** Es el único lugar donde BAYONA le entrega al visitante una solicitud completa y verificable antes de un solo clic de envío. Sin este momento, el embudo presumiría una compra que no es (no hay pago online). (CONFIRMADO — buildExperienceWhatsAppUrl + D6/D7; papel DERIVADO.)

### 15.13 Prohibiciones específicas
- Prohibido espectáculo, narrativa, inmersión o 3D en cualquier forma. (CONFIRMADO — auditor §7.)
- Prohibido presentar el envío como pago/inscripción confirmada: el mensaje explícito lo impide. (CONFIRMADO — texto del mensaje.)
- Prohibido ocultar precio, cantidades o condiciones: todo desglosado en el paso de envío. (CONFIRMADO — commercialSync.)
- Prohibido urgencia fabricada ("completa antes de…"): contrato anti-urgency de offerings.js. (CONFIRMADO.)

### 15.14 CTA y continuidad
CTA primario: SOLICITAR DETALLES POR WHATSAPP (CONFIRMADO — matriz fila 14). Continuidad: handoff → `/order-confirmation`. Breadcrumb no pinta en el itinerario; permanece visible (CONFIRMADO — J2: "Breadcrumb visible incluso en el embudo"). Sin NextChapter (la continuidad es el propio embudo). (CONFIRMADO — matriz.)

### 15.15 Evidencia
CONFIRMADO: D6/D7, J2/J3, matriz Fase 4 fila 14, matriz Fase 5, auditor §7, buildExperienceWhatsAppUrl, commercialSync/Checkout.test.jsx. DERIVADO: mundo 07 puro, momento. PROPUESTO: ninguno nuevo (todo aquí es confirmado).

---

## 16. `/order-confirmation` — CONFIRMACIÓN · LA CONTINUIDAD SERENA

### 16.1 Identidad
- **Ruta:** `/order-confirmation` · **Nombre funcional:** Post-solicitud (CONFIRMADO — matriz Fase 4 fila 15).
- **Mundo dominante:** 08 CONTINUIDAD (obligación explícita del auditor: "Debe pertenecer al mundo de CONTINUIDAD") · **Sin mundo secundario.**
- **Función real:** decir qué ocurre ahora (siguientes pasos) tras el handoff del checkout; revisar la solicitud en WhatsApp. `noindex`. (CONFIRMADO — D7.)

### 16.2 Pregunta del visitante
"Ya envié mi solicitud… ¿y ahora qué?" (CONFIRMADO — matriz Fase 4 col. 5: "¿Qué ocurre ahora?"; J2.)

### 16.3 Trabajo que la página debe resolver
Cerrar el ciclo con serenidad y sin teatro: confirmar la recepción, explicar los siguientes pasos (revisión humana, contacto por WhatsApp) y ofrecer salidas útiles (recursos, programas). **No es otra página de venta.** (CONFIRMADO — auditor §7; J2/J3.)

### 16.4 Estado de llegada
Sabe: que acaba de enviar una solicitud con desglose. No sabe: qué pasa ahora ni cuándo le hablarán. Necesita: calma y pasos claros. (DERIVADO — D7.)

### 16.5 Estado de salida
Comprende: su solicitud está recibida, será revisada por una persona y le contactarán por WhatsApp. Puede: revisarla, ver recursos/programas. Siente: serenidad ("esto sigue en buenas manos"). (DERIVADO — mundo 08.)

### 16.6 Secuencia espacial
1. **ENTRADA (estructura):** confirmación de recepción en calma, sin fuegos artificiales. (CONFIRMADO — clase conversión.)
2. **DESCUBRIMIENTO (admite, muy suave):** siguientes pasos y qué puede hacer mientras. (DERIVADO — D7.)
3. **SALIDA (estructura):** revisar en WhatsApp / recursos / programas. (CONFIRMADO — matriz fila 15.)

Estado prohibido: inmersión, espectáculo, urgencia, venta. Cierre sereno. (CONFIRMADO — clase conversión, auditor §7.)

### 16.7 Arquitectura narrativa
1. **La confirmación** — "recibido, y esto es lo que sigue": certeza. 2. **Los pasos** — qué pasará y cuándo (revisión humana, contacto). Razón: la ansiedad se cura con expectativa clara, no con confeti. 3. **La salida útil** — recursos/programas para no dejar al visitante en un callejón de espera. Razón: continuidad real, no cierre comercial.

### 16.8 Geometría de información
**Lineal-cerrada** (recepción → pasos → salidas). Justificación: es la única ruta que cierra un ciclo; su geometría es de despedida acompañada, ni catálogo ni relato. (DERIVADO — mundo 08 + D7.)

### 16.9 Densidad y ritmo
**`quiet`** (CONFIRMADO — matriz Fase 5: quiet-transition). "Cierre sereno; confirmación sin teatro". (CONFIRMADO — SCROLL-STORY-MATRIX.)

### 16.10 Movimiento conceptual
- `quiet-transition` — aparición serena de la confirmación (CONFIRMADO — matriz).
- Text motion: `none` (CONFIRMADO). Sin sticky/horizontal/parallax (CONFIRMADO).
- 3D: **PROHIBIDO** (CONFIRMADO — mundo 08 no admite escenas; el momento ya es suficientemente fuerte).

### 16.11 Presupuesto de atención
Concentra: la confirmación y los pasos. Recupera: silencio visual total; las salidas son enlaces serenos. Nada compite con la tranquilidad. (PROPUESTO.)

### 16.12 Momento irreductible
**El "qué ocurre ahora" con expectativa de contacto humano.** Es la única página de todo el sitio donde ya no hay conversión que ganar: solo acompañamiento post-entrega. Si se eliminara (o se convirtiera en otra oferta), el ciclo J2 perdería su cierre y el visitante quedaría a la deriva tras enviar su solicitud. (CONFIRMADO — D7/matriz; papel DERIVADO.)

### 16.13 Prohibiciones específicas
- Prohibido vender aquí: no es otra página de conversión. (CONFIRMADO — auditor §7; mundo 08.)
- Prohibido espectáculo/confeti de "compra completada": no hay pago online; hay solicitud recibida. (CONFIRMADO.)
- Prohibido dejar al visitante sin salida ("solo espera"): recursos/programas a mano. (DERIVADO — matriz fila 15.)
- Prohibido fabricar urgencia o plazos inventados de contacto. (DERIVADO.)

### 16.14 CTA y continuidad
CTA primario: revisar en WhatsApp (CONFIRMADO — matriz fila 15). Secundarios: recursos / programas. Fuera de itinerario (NextChapter no aplica; la continuidad es la vida real). (CONFIRMADO — chapters.js.)

### 16.15 Evidencia
CONFIRMADO: D7, J2/J3, matriz Fase 4 fila 15, matriz Fase 5, auditor §7, chapters.js. DERIVADO: mundo 08, geometría. PROPUESTO: presupuesto, prohibición 4.

---

# BLUEPRINTS ENTRE 17–18 Y NOTA D (CATEGORÍAS A, C Y D; B VACANTE DESDE B-C4004)

## 17. `/entrar` — PUERTA DE ACCESO (CANÓNICA PROPIA DESDE B-C4004)

### 17.1 Identidad (categoría A, noindex puerta de acceso)
**Es una experiencia independiente.** `/entrar` renderiza el componente `Entrar` (correo+contraseña, pestañas Entrar/Crear, Google OAuth, recuperación por WhatsApp); tiene metadatos propios en `ROUTE_META` con `noindex:true` y canonical propio. El alias histórico a `/onboarding` quedó obsoleto: producía title/description/canonical de la recepción en la puerta de acceso. (CORREGIDO B-C4004 — routeMeta.js + test fase6.)

### 17.2 Qué define la puerta
- **Mundo dominante:** 00 ORIGEN (umbral de acceso). (DERIVADO.)
- **Función real:** autenticar o crear cuenta y devolver al destino (`?next=`, por defecto `/app`). (CONFIRMADO — Entrar.jsx.)
- **Pregunta del visitante:** "¿Cómo entro a mi cuenta?" — distinta de la de `/onboarding` ("¿Cuál es mi camino?").

### 17.3 Secuencia espacial y movimiento
- Acceso mínimo y directo: `quiet`/`quiet-transition` (se mantiene la lectura de acceso mínimo de la matriz). Sin espectáculo: es una puerta, no un destino. (CONFIRMADO — matriz + B-C4004.)

### 17.4 Prohibiciones específicas
- Prohibido indexarla: canonical propio con `noindex` (puerta de acceso). (CONFIRMADO — routeMeta.)
- Prohibido espectáculo/movimiento/3D: `quiet-transition` únicamente, como el embudo.

### 17.5 Evidencia
CORREGIDO B-C4004: routeMeta.js (`/entrar` canónica noindex), fase6Contracts (nuevo contrato), App.jsx (`<Entrar/>` distinto de onboarding).

---

## 18. `*` (404) — RECUPERACIÓN · NUNCA UN CALLEJÓN

### 18.1 Identidad (categoría C)
- **Ruta:** catch-all `*` → NotFound · **Nombre funcional:** Recuperación (CONFIRMADO — matriz Fase 4 fila 17).
- **Mundo:** sin mundo asignado — la 404 **recoloca**, no habita: su función es devolver al mapa real. (DERIVADO — clase recuperación; J9.)

### 18.2 Pregunta del visitante
"Me he perdido, ¿dónde iba?" (CONFIRMADO — matriz Fase 4 col. 5.)

### 18.3 Trabajo que la página debe resolver
Recolocar en accesos principales con las 4 tarjetas de recuperación, sin culpa y sin callejón sin salida. Ton = sereno, NO de venta. (CONFIRMADO — J9; matriz fila 17.)

### 18.4 Estado de llegada
Sabe: que la URL no existe. No sabe: a dónde ir. Necesita: salidas claras e inmediatas. (DERIVADO — J9.)

### 18.5 Estado de salida
Comprende: que hay un camino de vuelta. Puede: volver a home/programas/recursos/comunidad. Siente: "no pasa nada, aquí está el sitio". (CONFIRMADO — J9.)

### 18.6 Secuencia espacial
1. **ENTRADA (estructura):** reconocimiento sereno del error, sin dramatismo. 2. **SALIDA (estructura):** la recolocación inmediata. **Solo estos dos estados** (§3 SPATIAL-LANGUAGE: "404 solo entrada+salida"; clase recuperación). (CONFIRMADO — J9; §4.7.)

### 18.7 Arquitectura narrativa
1. **El gesto** — "esta página no existe" en tono adulto. 2. **Las 4 rutas** — accesos principales (home, programas, recursos, comunidad). Razón: devolver con un mapa mínimo, no con un inventario.

### 18.8 Geometría de información
**Utilitaria-mínima** (mensaje + 4 enlaces). Justificación: es la única ruta sin contenido propio; su geometría es puramente funcional. (PROPUESTO.)

### 18.9 Densidad y ritmo
**`quiet` absoluto** — sin movimiento retórico. La recuperación se logra con claridad, no con efectos. (PROPUESTO, coherente con clase recuperación.)

### 18.10 Movimiento conceptual
`quiet-transition` — aparición serena; nada más. Text motion `none`. Sin sticky/horizontal/parallax. 3D: **PROHIBIDO** (CONFIRMADO — clase recuperación.)

### 18.11 Presupuesto de atención
Concentra: las 4 tarjetas. Recupera: cero — la 404 no tiene tiempo de recuperación, solo salida. (PROPUESTO.)

### 18.12 Momento irreductible
**Las cuatro tarjetas de recolocación.** Sin ellas, la 404 sería una URL muerta con un mensaje; con ellas, es el final sereno de todo camino roto. (CONFIRMADO — J9; papel DERIVADO.)

### 18.13 Prohibiciones específicas
- Prohibido vender en la 404 (ofertas, cupones, "mientras estás aquí…"). (CONFIRMADO — auditor §7: "Recoloca. No venda".)
- Prohibido el humor oscuro o la culpa hacia el visitante. (DERIVADO — mundo/tono sereno.)
- Prohibido el listado exhaustivo de rutas: 4 accesos principales bastan (CONFIRMADO — J9).

### 18.14 CTA y continuidad
CTA: las 4 tarjetas de recuperación (CONFIRMADO — J9). Sin NextChapter, sin breadcrumb (recuperación propia). `noindex` + HTTP 404 real (OBS-2 del PROJECT-STATE: hoy soft-404; endurecimiento en ROADMAP). (CONFIRMADO — matriz fila 17; PROJECT-STATE.)

### 18.15 Evidencia
CONFIRMADO: J9, matriz Fase 4 fila 17, auditor §7, OBS-2/PROJECT-STATE. DERIVADO: mundo sin asignar, geometría. PROPUESTO: secuencia/ritmo.

---

## NOTA D — RUTA INTERNA `/design-system`

**Categoría D:** en `ROUTE_META` pero fuera del sitio público: `noindex` + `Disallow` en robots + fuera de sitemap (`INTERNAL_ROUTES`, contrato de rutas). (CONFIRMADO — DESIGN-SYSTEM.md §12; PROJECT-STATE.)

- **Sin blueprint público completo.** Es un playground interno que **demuestra las piezas** del Design System (bloques 10–16 del playground), no parte del itinerario ni del sitemap. (CONFIRMADO — SCROLL-STORY-MATRIX línea interna; FASE3-VEREDICTO.)
- **No pertenece a ningún mundo**: no es una experiencia de visitante, es una herramienta de construcción. (DERIVADO.)
- **Lo que debe conservar:** acceso directo sin navegación pública, `noindex`, Disallow y exclusión del sitemap y del HTML estático. (CONFIRMADO — FASE3 gate: build sin HTML estático de la ruta interna.)
- **Prohibido:** convertirlo en showcase público, darle CTA de venta o asignarle curva de visitante. (CONFIRMADO — naturaleza interna.)

Evidencia: DESIGN-SYSTEM.md §12, SCROLL-STORY-MATRIX (interna), FASE3-VEREDICTO.md (gate), PROJECT-STATE OBS-1.

---

# AUDITORÍA DE NO-INTERCAMBIABILIDAD (REQUISITO CRÍTICO DEL CONTRATO §6)

## TEST 1 — Intercambio de blueprint
Para cada ruta se preguntó: *"Si cambio el nombre de esta ruta por otra, ¿seguiría teniendo sentido?"*

**Resultado: NINGÚN blueprint supera la prueba con otro nombre.** La prueba explícita por las 5 parejas de mayor riesgo está en la sección siguiente (TEST 2). El complejo de fichas de plan (5–8) es el caso límite controlado: comparten sistema (decisión `quiet`), pero la prueba de intercambio de **nombre+función** falla en los cuatro (RAÍZ "primer paso" ≠ FUERZA "corrección" ≠ RENDIMIENTO "medición" ≠ ELITE "relación"), por lo que el requisito se cumple incluso en el peor caso. (Fallo intencionado del intercambio = requisito cumplido.)

## TEST 2 — Intercambio de hero (parejas explícitas)

| Pareja en riesgo | ¿El hero de una podría pertenecer a la otra? | Fallo del intercambio |
|---|---|---|
| `/programs` ↔ `/resources` | **NO.** `/programs` abre con el mapa de niveles y precio (comparación); `/resources` abre con biblioteca y el recurso gratis (prueba sin datos). La pregunta y la geometría difieren: comparar ≠ probar. | El hero de `/programs` (precio/estructura) sería ruido en una página que promete "sin datos"; el de `/resources` (invitación a usar) sería insuficiente para alguien que viene a medir. |
| `/about` ↔ `/community` | **NO.** `/about` abre con historia individual y cierra en el mapa (confianza en la persona); `/community` abre con acceso gratuito y voces en rail (pertenencia). | El hero de `/about` (biografía) no pertenece a una página que debe decir "entra gratis"; el de `/community` (acceso) enterraría el relato personal de la marca. |
| `/plan/raiz` ↔ `/plan/elite` | **NO.** RAÍZ abre con "tu primer paso" (permiso de volver); ELITE abre con persona/cupos (acceso directo). | Intercambiarlos invierte el argumento: el que vuelve no busca exclusividad y el que busca a Sebastián no necesita permiso de empezar. |
| `/checkout` ↔ `/faq` | **NO.** `/checkout` abre en mitad de la decisión (plan precargado, pasos); `/faq` abre con un índice de dudas (claridad de lectura). | El hero de `/checkout` (paso de configuración) no tiene sentido sin selección previa; el de `/faq` (índice) sería una barrera en un embudo que debe ser todo-acción. |
| `/parkour-academy` ↔ `/app` | **NO.** Academia abre con el gesto (control) y la escalera; la app abre con el estado real (concepto en desarrollo). | El momento «detiene el tiempo» de la academia sería engañoso para un producto que aún no existe; la honestidad de estado de la app carecería de potencia narrativa para una escuela que sí existe. |

## TEST 3 — Intercambio de ritmo (intensidades compartidas)
Páginas que comparten intensidad pero NO experiencia — la prueba de lectura completa por blueprint confirma diferencias de pregunta, geometría, secuencia, momento y continuidad:

- **`quiet`** comparten: fichas 5–8, `/resources`, `/faq`, `/checkout`, `/order-confirmation`, `/entrar`, 404. Aun así, geometrías distintas: RAÍZ (lineal-progresiva), RENDIMIENTO (técnica), FAQ (P-R), checkout (guiada-lineal estricta), 404 (mínima). Ni una sola comparte momento irreductible.
- **`balanced`** comparten: `/about`, `/onboarding`, `/programs`, `/shop`, `/app`, `/community`. Su diferenciación se prueba en Test 2 (heroes) y en los momentos irreductibles: mapa-persona vs. acceso-gratis vs. precio-vivo vs. carrito-conversación vs. no-promesa vs. umbral.
- **`immersive`** comparten: `/` y `/parkour-academy` (máximo permitido: un momento narrativo por página, MOTION-MAP). `/` inmerge en el MÉTODO (estructura); la academia inmerge en la TRAYECTORIA (movimiento). Mismo género, distinto objeto: la prueba de *contenido* del momento no se intercambia.

## TEST 4 — Nueve mundos no son nueve estilos
Regla: prohibido resolver la diferenciación como "mundo diferente = color/gradiente/tema diferente".
- Ningún blueprint introduce paleta, material o estilo propios de mundo; la diferenciación se expresa en **función, geometría, pregunta, momento y secuencia**. (DERIVADO — BIBLE §W matrices; DF-011.)
- La única variación cromática real del sistema es la que ya existe en tokens (acento/fire/deep), compartida por todas las rutas. (CONFIRMADO — ds-tokens.css.)
- ✓ Requisito cumplido: los 9 mundos conviven con UN material, porque la diferenciación de BAYONA es experiencial, no decorativa.

---

# MAPA DE RELACIONES ENTRE BLUEPRINTS (CONTRATO §8)

## 8.1 Respuestas al mapa

1. **Rutas que se parecen superficialmente pero deben comportarse distinto:** `/programs` vs `/resources` (comparar vs probar), `/about` vs `/community` (confianza en la persona vs pertenencia), las 4 fichas de plan entre sí (prueba fallada por función, TEST 2), `/shop` vs `/programs` (comprar por sesión vs elegir acompañamiento), `/faq` vs `/checkout` (leer vs actuar).
2. **Rutas que comparten infraestructura pero no experiencia:** las 4 fichas (misma estructura de ficha, distinta argumentación), `/onboarding` y `/entrar` (recepción vs puerta de acceso: componentes y preguntas distintas), las rutas `quiet` (mismo presupuesto, distinta geometría).
3. **Mayor continuidad del sitio:** el itinerario canónico (chapters.js): `/` → `/about` → `/programs` → `/parkour-academy` → `/app` → `/community` → `/resources` → `/shop` → `/faq` → (vuelta a `/`). Es la espina dorsal de la que dependen J1–J10 y NextChapter.
4. **Ruptura deliberada (dónde y por qué):** en el embudo (`/checkout`, `/order-confirmation`) y en `/onboarding` (recepción sin chrome), donde la gramática cambia a decisión/umbral absoluta. La ruptura es deliberada porque ahí la identidad sirve a la claridad, no a la narrativa (regla de oro del plan §14).
5. **Rutas que funcionan como puertas:** `/` (reparte a los 3 journeys), `/onboarding` (umbral de orientación), `/resources` (puerta gratuita, J1), `/community` (puerta lateral gratuita, J7).
6. **Rutas estación:** `/programs` (comparación), `/shop` (compra paralela), `/app` (concepto), `/parkour-academy` (academia), `/about` (marca) — reciben, muestran y dejan seguir.
7. **Rutas de decisión:** las 4 fichas `/plan/*`, `/checkout` (decisión pura), `/faq` (pre-decisión: disuelve dudas).
8. **Ruta con mayor obligación de silencio visual:** `/checkout`. Su prohibición es la más severa del documento: sin narrativa, sin inmersión, sin 3D, sin urgencia — solo claridad. Le siguen `/faq` (quiet) y `/order-confirmation` (serenidad).

## 8.2 Tabla final (matriz de decisión del BLOQUE 5)

| Ruta | Mundo | Pregunta | Geometría | Intensidad | Momento irreductible | Mayor riesgo |
|---|---|---|---|---|---|---|
| `/` | 00+02 | ¿Es esto para mí y por dónde empiezo? | Exploratoria-orientadora | immersive | El reparto de puertas | Que el momento narrativo retrase el ancla de oferta |
| `/about` | 00+05 | ¿Quién está detrás y por qué confiar? | Editorial-narrativa | balanced | El globo de voces reales | Multiplicar escenas 3D (excepción→licencia) |
| `/onboarding` | 00+07 | ¿Cuál es mi camino? | Guiada-conversacional | balanced | Recepción sin chrome que devuelve ruta | Convertirse en formulario de venta |
| `/programs` | 07+02 | ¿Qué puedo entrenar y cuánto cuesta? | Comparativa | balanced | El precio que se construye delante | Ruido que emborrona la comparación |
| `/plan/raiz` | 07+01 | ¿Por dónde empiezo si llevo tiempo? | Lineal-progresiva | quiet | "Tu primer paso" | Avergonzar al que vuelve |
| `/plan/fuerza` | 07+01+02 | ¿Quién revisa que lo hago bien? | Progresiva-escalada | quiet | "Dejas de dudar si lo haces bien" | Venderlo como relleno intermedio |
| `/plan/rendimiento` | 07+02 | ¿Cómo mido y acelero mi progreso? | Progresiva-técnica | quiet | La evaluación biomecánica | Teatro visual en "resultados" |
| `/plan/elite` | 07+08 | ¿Puedo tener a Sebastián para mí? | Progresiva-relacional | quiet | WhatsApp directo + 10 cupos | Tocar/ampliar DP-5; urgencia fabricada |
| `/parkour-academy` | 03+05 | ¿Cómo aprendo parkour bien? | Progresiva por niveles | immersive | La escalera primer salto→control | Parkour como adrenalina de marketing |
| `/shop` | 04+08 | ¿Qué compro sin membresía? | Exploratoria-utilitaria | balanced | El carrito que termina en conversación | Inventar checkout online |
| `/app` | 02+06 | ¿Qué está construyendo BAYONA? | Exploratoria-conceptual | balanced | La no-promesa de producto en desarrollo | Vender app que no existe |
| `/community` | 05+08 | ¿Cuesta algo entrenar acompañado? | Exploratoria-cálida | balanced | El acceso gratuito y sin plan | Copiar el globo de `/about` |
| `/resources` | 06+00 | ¿Qué puedo probar gratis sin datos? | Utilitaria-biblioteca | quiet | El recurso gratis real y usable | Pedir datos o convertirla en cebo |
| `/faq` | 07+06 | ¿Qué dudas me quedan? | Utilitaria P-R | quiet | Las respuestas que no venden | Convertirla en cinematográfica |
| `/checkout` | 07 | ¿Cómo queda mi solicitud y cuánto? | Guiada-lineal estricta | quiet | Envío desglosado + disclaimer | Cualquier atisbo de espectáculo |
| `/order-confirmation` | 08 | ¿Y ahora qué? | Lineal-cerrada | quiet | El "qué ocurre ahora" humano | Vender después de la solicitud |
| `/entrar` (puerta) | 00 | ¿Cómo entro a mi cuenta? | Utilitaria-mínima | quiet | El acceso sin fricción ni espectáculo | Protagonismo narrativo |
| `*` (404) | — | Me he perdido, ¿dónde iba? | Utilitaria-mínima | quiet | Las 4 tarjetas de recolocación | Vender en el error |
| `/design-system` | — (interna) | — | — | — | — (playground de piezas) | Nota D: exclusión obligatoria |

> ⚠️ **Nota de alcance:** esta tabla ES la semilla del **BLOQUE 5** (matriz de decisión final). Según el contrato §17, el BLOQUE 5 queda **PENDIENTE DE AUTORIZACIÓN**: no se transformará aquí en `resolvePageMotionContract()` ni en declaraciones técnicas. (Stop absoluto.)

---

# AUTOAUDITORÍA DEL BLOQUE 4 (CONTRATO §13)

## A. Cobertura
- **A (canónicas):** 16/16 blueprints completos (§1–16). **B (alias):** 1/1 (§17). **C (fallback):** 1/1 (§18). **D (interna):** nota de exclusión obligatoria (NOTA D). Verificado contra `routeMeta.js` y §0.2 del plan (16+1+1+nota = 18 entradas). ✓
- Total de entradas de blueprint: 18 + 1 nota. Ni falta ni sobra.

## B. Intercambiabilidad
Identificadas explícitamente (TEST 2): `/programs`↔`/resources`, `/about`↔`/community`, `/plan/raiz`↔`/plan/elite`, `/checkout`↔`/faq`, `/parkour-academy`↔`/app`. La prueba de intercambio falla en las 5. Además, el complejo de fichas 5–8 pasa su propia prueba de función (TEST 1/3). ✓

## C. Vocabulario
Solo las 8 recetas reales: `editorial-reveal`, `editorial-slide`, `compact-rail`, `cinematic-stage`, `data-cascade`, `image-drift`, `horizontal-passage`, `quiet-transition`. Solo 3 intensidades reales. Solo los 7 estados de SPATIAL-LANGUAGE. Zonas y rangos citados sin renombrar. Sin sinónimos. (Verificado contra `src/engine/recipes/index.js`, `intensity.js`, `motionBudget.js`.) ✓

## D. Engine
Cero APIs inventadas. `resolvePageMotionContract()` / `validatePageMotionContract()` / `checkBudget()` / `useScrollHandoff()` se citan solo como infraestructura existente para fases posteriores (Bloque 5/7/8), nunca se les añaden firmas ni contratos. Las relaciones son conceptuales ("puede expresarse mediante"). ✓

## E. 3D
Nada diseñado: sin geometrías, modelos, cámaras, shaders ni objetos. Solo clasificaciones: PROHIBIDO (mayoría), EXISTENTE/EXCEPCIONAL (`/about` Globe3D), POSIBLE CON JUSTIFICACIÓN (`/parkour-academy`, delegado a WORLD-3D-STRATEGY/Fase 7 vía `useScrollHandoff()`). ✓

## F. Producción
Diff previsto: **solo este fichero `.md` nuevo en la raíz**. Cero archivos de producción modificados. (Se verificará con `git status`/`git diff` antes del commit.) ✓

## G. Idioma
Todo el contenido nuevo humano está en español. Identificadores y vocabulario técnico conservados tal cual. ✓

## H. Calidad (test del diseñador senior)
Un diseñador senior que reciba este documento puede responder, por cada ruta de Fase 8: mundo, pregunta, geometría, secuencia espacial, intensidad, recetas conceptuales, 3D permitido/prohibido, momento irreductible, prohibiciones y continuidad — sin reinterpretar la filosofía. La tabla §8.2 es la semilla directa del Bloque 5. ✓

## Correcciones declaradas a SCROLL-STORY-MATRIX (Fase 5)
1. `/about`: el 3D ya existe (Globe3D) — la matriz lo lista como futuro; se registra la realidad presente sin cambiar la matriz (aplicable a la implementación de Fase 8). (Justificada en §2.10.)
2. `/entrar`: acceso mínimo `quiet` con metadatos propios noindex (puerta independiente desde B-C4004; antes alias documentado — ver §17).

---

# DEFINICIÓN DE ÉXITO (VERIFICACIÓN FINAL)

Al leer dos blueprints diferentes se siente que: las personas llegan con preguntas diferentes (16 preguntas propias), las geometrías difieren (exploratoria, editorial, guiada, comparativa, progresiva, técnica, relacional, biblioteca, P-R, lineal-estricta, cerrada, mínima…), los ritmos varían cuando deben (immersive solo en `/` y academia; balanced en las de experiencia; quiet en todo lo de decisión/lectura/embudo), los momentos irreductibles no compiten (ninguno se repite), las páginas no son copias con otro contenido, y todo sigue siendo inequívocamente BAYONA (un solo mundo material, una gramática de 7 estados, un vocabulario de 8 recetas).

**BLOQUE 4 ÚNICAMENTE. PRECISIÓN ANTES QUE VOLUMEN. EVIDENCIA ANTES QUE DECORACIÓN. DIFERENCIACIÓN ANTES QUE ESPECTÁCULO. CLARIDAD POR ENCIMA DE TODO.**

---

# STOP ABSOLUTO (CONTRATO §17)

- ✋ NO se inicia el **BLOQUE 5** (la tabla §8.2 queda como semilla; la conversión a `resolvePageMotionContract()` requiere autorización).
- ✋ NO se crea `WORLD-3D-STRATEGY.md` ni se diseñan escenas.
- ✋ NO se crean los tests documentales D-01…D-07 (pertenecen a la verificación del entregable, autorización posterior).
- ✋ NO se toca producción, código, CSS, componentes, catálogo, precios, SEO, sitemap, robots ni embudo.
- ✋ NO se resuelve **DP-5** (ELITE "acceso de por vida": solo Sebastián).
- ✋ Fases 7 y 8 NO comienzan.

El resultado queda **a la espera de la auditoría de ChatGPT** (revisión del informe + coherencia con el repo), tal como ordena el auditor: tú eres el puente; no me das el siguiente bloque sin auditoría.

---

# MATRIZ FINAL DE DECISIÓN — BLOQUE 5 (FASE 6 · GOBIERNO DE IMPLEMENTACIÓN)

> **FASE 6 · BLOQUE 5.** Partida: `aaf1543` (cierre del Bloque 4, verificado local + remoto). Autorización del auditor: **BLOQUE 5 ÚNICAMENTE**.
> **Decisión de formato (verificada, no asumida):** `PLAN-FASE-6-WORLD-BUILDING.md` líneas 138–141 manda que la matriz sea **sección final de `PAGE-BLUEPRINTS.md`**, "no `WORLD-DECISION-MATRIX.md` separado". Los dos prompts del auditor difieren en este punto (el segundo sugería `FINAL-DECISION-MATRIX.md`); por la jerarquía de fuentes (M.0, nivel 3: restricciones aprobadas de arquitectura), **gana el plan**: la matriz vive aquí. No se crea documento paralelo (además, DF-012).
> **PROHIBICIÓN CRÍTICA:** esta matriz decide, documenta, restringe, prioriza y detecta contradicciones, pero **NO implementa** `resolvePageMotionContract()`: no modifica APIs, firmas, tokens, recetas, componentes ni runtime. La conversión a contratos pertenece a Fase 8. Las referencias al engine son de GOBIERNO, no de código.
> **Idioma:** todo el contenido nuevo está en español; los identificadores técnicos reales se conservan tal cual.
> Esta sección **actualiza los stops previos del Bloque 4** (líneas 1146 y 1191–1200), que quedaban subordinados a la autorización del Bloque 5: autorizada y ejecutada, su STOP vigente es el de M.16.

## M.0 JERARQUÍA DE AUTORIDAD Y PROTOCOLO DE CONFLICTOS

Fase 7/8 nunca debe adivinar qué fuente gana. Precedencia derivada del repo real (no del ejemplo del auditor):

| Nivel | Fuente | Gobierna | No puede overridear |
|---|---|---|---|
| 1 | **Código vivo confirmado** (engine, `routeMeta.js`, `Globe3D.jsx`, gates) | qué existe realmente; límites físicos del engine y del presupuesto | nada lo supera en cuestiones de hecho |
| 2 | **`docs/DECISIONS.md`** (D-001…D-008, DP-5) | decisiones explícitas registradas | el código vivo solo si hay decisión formal de cambio (nuevo D-xx) |
| 3 | **Restricciones aprobadas de arquitectura** (plan Fase 6, contratos de baseline, DF-009…DF-012) | formato, alcance, vocabulario y disciplina de los documentos | niveles 1–2 |
| 4 | **Inventario normalizado de rutas** (plan §0.2) | qué rutas existen y cómo se categorizan | nada dentro de Fase 6 |
| 5 | **Los blueprints de este documento** (§1–18) | la experiencia objetivo por ruta | niveles 1–4 |
| 6 | **`BAYONA-WORLD-BIBLE.md`** | identidad, mundos, ADN visual | la función real de la ruta (nivel 5) cuando choquen |
| 7 | **`SPATIAL-LANGUAGE.md`** | gramática espacial de los 7 estados | los niveles anteriores |
| 8 | **`SCROLL-STORY-MATRIX.md` / matrices Fase 4–5** | PROPUESTA HEREDADA: punto de partida, no ley | cualquier nivel superior; se corrige solo con nota explícita |
| 9 | **Inferencia nueva del Bloque 5** (esta matriz) | consolida y restringe | nada: se etiqueta siempre como PROPUESTO/DERIVADO y nunca se presenta como CONFIRMADO |

**Protocolo de resolución de conflictos (sin armonización silenciosa):**
1. Identificar las dos fuentes y sus niveles. Gana el nivel más bajo (más autoritario).
2. Si el conflicto es entre función de ruta (nivel 5) e identidad de mundo (nivel 6): **gana la función** — el mundo expresa, no decide el propósito (regla de oro del plan §14; TEST 4 del Bloque 4).
3. Si una herencia de Fase 4/5 (nivel 8) choca con un blueprint: se aplica el blueprint y **la corrección queda registrada en M.7** con nota explícita (exigencia D-07a).
4. Si el código vivo contradice una decisión de Fase 6: **NO es automáticamente un mandato de cambiar producción**. Se registra en M.7; el cambio de producción se planifica en Fase 7/8.
5. Si la evidencia es insuficiente: Fase 7 **no inventa**. La celda queda `ABIERTA CON CONDICIÓN` y se resuelve con evidencia o se escala.
6. Se escala a `docs/DECISIONS.md` solo cuando la resolución afecte a varias rutas/mundos, toque un HARD CONSTRAINT o cree una restricción nueva permanente. Conflictos locales se resuelven aquí, documentados.

## M.1 TAXONOMÍA DE DECISIONES (obligatoria en toda la matriz)

- **HARD CONSTRAINT** — no se viola sin aprobación explícita del auditor + nuevo D-xx. Ej.: 3D en `/checkout` PROHIBIDO; DP-5 intacto; CTA nunca retrasado por movimiento; solo las 8 recetas reales.
- **STRONG DEFAULT** — se implementa salvo evidencia real que exija desviación (y entonces se registra). Ej.: intensidades por ruta; recetas primarias CONFIRMADAS.
- **CONDITIONAL DECISION** — permitida solo si se cumple su condición declarada. Ej.: 3D en `/parkour-academy` (condición: WORLD-3D-STRATEGY + presupuesto vendor-three + fallback previo); `editorial-reveal` en `/` (condición: no competir con el escenario).
- **OPEN QUESTION** — no decidido; prohibido fingir que lo está. Ej.: existencia futura de escenas 3D (→ WORLD-3D-STRATEGY), cualquier copy nuevo.

## M.2 MATRIZ CENTRAL POR RUTA (tabla única de decisión → contratos en Fase 8)

Cubre el inventario normalizado completo: 16 canónicas + 1 alias + 1 fallback + nota interna (19 filas). Valores de zona = receta dominante conceptual en esa zona. Convención de celdas: **`NO`** = decisión negativa explícita documentada en el blueprint; **`NO APLICA`** = sin necesidad documentada (la ausencia también es decisión → M.3); **`—`** = celda sin sentido para esa fila.

| Ruta | Categoría | Mundo | Clase espacial | Intensidad | Receta primaria | Receta secundaria | Hero | Body | Supporting | CTA | Background | Sticky | Horizontal | Parallax | Text motion | 3D | Momento irreductible | Riesgo principal | Evidencia |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` | A · narrativa | 00+02 | narrativa | `immersive` | `cinematic-stage` | `image-drift` | cinematic-stage | cinematic-stage | image-drift | CTA seco, sin retraso | image-drift | NO APLICA | NO APLICA | NO APLICA | `mask` (titulares) | PROHIBIDO | El reparto de puertas | Que el momento narrativo retrase el ancla de oferta | CONFIRMADO · DECIDIDO |
| `/about` | A · marca | 00+05 | narrativa-editorial | `balanced` | `editorial-reveal` | `image-drift` | editorial-reveal | editorial-reveal | image-drift · Globe3D | sin retraso | Globe3D (existente) | NO APLICA | NO APLICA | NO APLICA | NO APLICA | EXISTENTE/EXCEPCIONAL | El globo de voces reales | Multiplicar escenas (excepción→licencia) | CONFIRMADO · DECIDIDO |
| `/onboarding` | A · recepción | 00+07 | recepción guiada | `balanced` | `editorial-slide` | `quiet-transition` | editorial-slide | editorial-slide | NO APLICA | quiet-transition | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | PROHIBIDO | Recepción sin chrome que devuelve ruta | Convertirse en formulario de venta | CONFIRMADO · DECIDIDO |
| `/programs` | A · comparación | 07+02 | comparativa | `balanced` | `data-cascade` | `editorial-slide` | editorial-slide | data-cascade | editorial-slide | sin retraso | NO APLICA | **NO** | **NO** | NO APLICA | NO APLICA | PROHIBIDO | El precio que se construye delante | Ruido que emborrona la comparación | CONFIRMADO · DECIDIDO |
| `/plan/raiz` | A · decisión | 07+01 | lineal-progresiva | `quiet` | `editorial-reveal` | `quiet-transition` | editorial-reveal | editorial-reveal | NO APLICA | quiet-transition | NO APLICA | NO | NO | NO | `none` | PROHIBIDO | "Tu primer paso" | Avergonzar al que vuelve | CONFIRMADO · DECIDIDO |
| `/plan/fuerza` | A · decisión | 07+01+02 | progresiva-escalada | `quiet` | `editorial-reveal` | `quiet-transition` | editorial-reveal | editorial-reveal | NO APLICA | quiet-transition | NO APLICA | NO | NO | NO | `none` | PROHIBIDO | "Dejas de dudar si lo haces bien" | Venderlo como relleno intermedio | CONFIRMADO · DECIDIDO |
| `/plan/rendimiento` | A · decisión | 07+02 | progresiva-técnica | `quiet` | `editorial-reveal` | `quiet-transition` | editorial-reveal | editorial-reveal | NO APLICA | quiet-transition | NO APLICA | NO | NO | NO | `none` | PROHIBIDO | La evaluación biomecánica | Teatro visual en "resultados" | CONFIRMADO · DECIDIDO |
| `/plan/elite` | A · decisión | 07+08 | progresiva-relacional | `quiet` | `editorial-reveal` | `quiet-transition` | editorial-reveal | editorial-reveal | NO APLICA | quiet-transition | NO APLICA | NO | NO | NO | `none` | PROHIBIDO | WhatsApp directo + 10 cupos | Tocar/ampliar DP-5; urgencia fabricada | CONFIRMADO · DECIDIDO (DP-5 HARD) |
| `/parkour-academy` | A · academia | 03+05 | progresiva por niveles | `immersive` | `cinematic-stage` | NO APLICA | cinematic-stage | cinematic-stage | NO APLICA | sin retraso | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | POSIBLE CON JUSTIFICACIÓN | La escalera primer salto→control | Parkour como adrenalina de marketing | CONFIRMADO · 3D CONDICIONAL |

| `/shop` | A · compra paralela | 04+08 | exploratoria-utilitaria | `balanced` | `data-cascade` | `compact-rail` | editorial-slide* | data-cascade | compact-rail | sin retraso | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | PROHIBIDO | El carrito que termina en conversación | Inventar checkout online | CONFIRMADO · DECIDIDO |
| `/app` | A · concepto | 02+06 | exploratoria-conceptual | `balanced` | `editorial-slide` | `compact-rail` | editorial-slide | editorial-slide | compact-rail | sin retraso | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | PROHIBIDO | La no-promesa de producto en desarrollo | Vender app que no existe | CONFIRMADO · DECIDIDO |
| `/community` | A · puerta lateral | 05+08 | exploratoria-cálida | `balanced` | `compact-rail` | `editorial-reveal` | compact-rail | editorial-reveal | compact-rail | sin retraso | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | PROHIBIDO | El acceso gratuito y sin plan | Copiar el globo de `/about` | CONFIRMADO · DECIDIDO |
| `/resources` | A · puerta gratuita | 06+00 | utilitaria-biblioteca | `quiet` | `editorial-reveal` | `data-cascade` | editorial-reveal | editorial-reveal | data-cascade | sin retraso | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | PROHIBIDO | El recurso gratis real y usable | Pedir datos o convertirla en cebo | CONFIRMADO · DECIDIDO |
| `/faq` | A · pre-decisión | 07+06 | utilitaria P-R | `quiet` | `editorial-reveal` | NO APLICA | editorial-reveal | editorial-reveal | NO APLICA | sin retraso | NO APLICA | NO APLICA | NO APLICA | NO APLICA | NO APLICA | PROHIBIDO | Las respuestas que no venden | Convertirla en cinematográfica | CONFIRMADO · DECIDIDO |
| `/checkout` | A · embudo (noindex) | 07 | guiada-lineal estricta | `quiet` | `quiet-transition` | NO APLICA | quiet-transition | — | — | CTA único, sin movimiento | NO APLICA | **NO** | **NO** | **NO** | `none` | PROHIBIDO ABSOLUTO | Envío desglosado + disclaimer | Cualquier atisbo de espectáculo | CONFIRMADO · HARD CONSTRAINT |
| `/order-confirmation` | A · embudo (noindex) | 08 | lineal-cerrada | `quiet` | `quiet-transition` | NO APLICA | quiet-transition | — | — | continuidad (no venta) | NO APLICA | NO | NO | NO | `none` | PROHIBIDO | El "qué ocurre ahora" humano | Vender después de la solicitud | CONFIRMADO · DECIDIDO |
| `/entrar` | A · puerta (noindex) | 00 | utilitaria-mínima | `quiet` | `quiet-transition` | NO APLICA | quiet-transition | — | — | acceso, sin espectáculo | NO APLICA | NO | NO | NO | `none` | PROHIBIDO | El acceso sin fricción | Protagonismo narrativo | CORREGIDO B-C4004 |
| `*` (404) | C · fallback | — | recuperación | `quiet` | `quiet-transition` | NO APLICA | quiet-transition | — | — | recolocación | NO APLICA | NO | NO | NO | `none` | PROHIBIDO | Las 4 tarjetas de recolocación | Vender en el error | CONFIRMADO · DECIDIDO |
| `/design-system` | D · interna | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | Nota D: exclusión obligatoria (sin blueprint público) | CONFIRMADO · EXCLUIDA |

*\*Nota `/shop`: el blueprint declara `data-cascade` + `compact-rail` como par CONFIRMADO de la matriz Fase 5; la zona hero se sirve con la entrada serena del catálogo (mismo vocabulario, sin receta nueva).*

**Reglas de la tabla (gobierno, no API):**
1. **Intensidad = STRONG DEFAULT**: solo se desvía con evidencia real, registrada en M.7.
2. **Recetas**: solo los 8 ids del engine (`src/engine/recipes/index.js:33–124`). `horizontal-passage` existe pero **ninguna ruta lo necesita hoy** — su ausencia es decisión, no olvido (M.3).
3. **Estado de implementación por fila**: CONFIRMADO → **DECIDIDO** (HARD CONSTRAINT o STRONG DEFAULT); PROPUESTO → **GUIADO**; con condición → **CONDICIONAL**; clasificado PROHIBIDO → **PROHIBIDO**. No hay filas ABIERTAS: toda ambigüedad se cerró en el blueprint o queda registrada en M.7/M.9.
4. Las zonas (`hero/body/supporting/cta/background`), rangos (`traverse/enter/pin/exit`), duraciones (`fast/base/slow/curtain`) y distancias (`near/medium/far`) se citan con su vocabulario exacto; **el reparto fino de rangos/duraciones/distancias NO se decide aquí** (es contrato de Fase 8 sobre `resolvePageMotionContract()`), solo se prohíbe lo que M.3 prohíbe.

## M.3 DECISIONES NEGATIVAS (qué NO hacer — la ausencia también es decisión)

Una matriz de élite no solo fija qué hacer. Capa "DO NOT ADD" consolidada de los 18 blueprints:

| Ámbito | Decisión negativa | Tipo |
|---|---|---|
| 3D | PROHIBIDO en 15 de 18 entradas. **`/checkout`: PROHIBIDO ABSOLUTO** (HARD). `/design-system`: excluida. | HARD |
| 3D | Prohibido multiplicar escenas en `/about` porque "ya tiene una" (Globe3D es excepción, no licencia — ADN H, F6-04). | HARD |
| 3D | Prohibido usar el globo en `/community` (F6-05: su voz visual es el rail, no el globo). | HARD |
| Movimiento | **CTA nunca retrasado por movimiento** en ninguna ruta; en decisión/embudo: CTA sin animación propia. | HARD |
| Movimiento | `/programs`: sin sticky ni horizontal (documentado) — la comparación no compite con scroll trick. | STRONG |
| Embudo | `/checkout`: sin narrativa, sin inmersión, sin parallax, sin sticky, sin urgencia fabricada. | HARD |
| Confirmación | `/order-confirmation`: prohibido vender después de la solicitud (CONTINUIDAD, no segunda venta). | HARD |
| Elite | Prohibida urgencia fabricada en `/plan/elite`; prohibido tocar/ampliar DP-5. | HARD |
| Claridad | `/faq`: prohibido tratamiento cinematográfico; nada compite con la lectura de la respuesta. | HARD |
| 404 | Prohibido vender en el error; horizontal NO APLICA. | HARD |
| Acceso | `/entrar`: puerta mínima con metadatos propios noindex. | HARD |
| Recetas | `horizontal-passage`: disponible en el engine pero **sin uso en ninguna ruta hoy** — no se introduce "porque exista". | STRONG |
| Text motion | `none` en las 4 fichas de plan, `/checkout`, `/order-confirmation`, 404 — la tipografía no actúa donde se decide. | STRONG |
| Vocabulario | Prohibido resolver "mundo distinto = color distinto" o crear recetas/tokens nuevos (solo 8 ids, solo 3 intensidades). | HARD |
| Contenido | Prohibido inventar métricas de resultado (las voces son "experiencias publicadas"); prohibido pedir datos en `/resources`. | HARD |
| Idioma | Prohibido que Fase 7 sustituya headings/CTAs/copy público por placeholders en inglés. LA WEB ES ESPAÑOLA. | HARD |

**Triggers anti-sobre-diseño para Fase 7 (disparador → corrección preferida):** sección vacía → NO animar, mejorar geometría de información · ruta "importante" → NO añadir 3D · jerarquía débil → NO glow/gradientes, usar densidad y calma · página informativa → NO tratamiento cinematográfico · naranja como diferenciación → NO (la diferenciación es funcional, TEST 4) · patrón nuevo → NO, usar los 8 ids · mobile → NO comprimir desktop, simplificar la gramática (SPATIAL-LANGUAGE §mobile) · narrativa donde el usuario necesita decidir → NO.

## M.4 PRESUPUESTO DE ATENCIÓN (funcional, no decorativo)

Lo más valioso que el visitante gasta en cada categoría, y aquello con lo que la implementación **no puede competir**:

| Categoría (rutas) | Atención dominante | No competir con |
|---|---|---|
| Narrativa (`/`, `/about`) | comprensión + emoción (quién es BAYONA) | el momento immersive no compite con el ancla de oferta; el globo no compite con la lectura |
| Recepción (`/onboarding`, alias) | orientación (¿cuál es mi camino?) | la recepción no compite con venta ni con el chrome |
| Comparación (`/programs`, `/shop`, `/app`) | comparación/evaluación | data-cascade no emborrona precio ni jerarquía; el rail es ambiente, nunca información crítica |
| Decisión (`/plan/*`) | decisión (elegir acompañamiento) | nada retraza el CTA; el movimiento no teatraliza resultados ni avergüenza |
| Academia (`/parkour-academy`) | emoción controlada + progresión | el momento immersive no degenera en espectáculo de adrenalina |
| Comunidad (`/community`) | pertenencia | el acceso gratuito no se esconde tras marketing |
| Lectura (`/resources`, `/faq`) | comprensión / recuperación de respuesta | nada compite con leer y guardar; cero captura agresiva |
| Embudo (`/checkout`) | **confianza en la compra** | absolutamente nada: claridad primero |
| Embudo (`/order-confirmation`) | confirmación + recuperación | la venta posterior |
| Error (404) | recuperación | la venta |

## M.5 AUDITORÍA DE SOBRECOREOGRAFÍA (riesgo documental BAJO/CONTROLADO/ALTO)

> Pregunta: si TODAS las decisiones se implementaran literalmente, ¿qué rutas se volverían "demasiado"? (Clasificación documental de riesgo, no vocabulario del engine.)

| Ruta | Riesgo | Qué sobraría / qué degradar / qué mantener |
|---|---|---|
| `/` | **ALTO** | Demasiado: cinematic-stage + image-drift + editorial-reveal + `mask` a la vez en todo el recorrido. Degradar: `editorial-reveal` es CONDICIONAL — solo si no compite con el escenario; image-drift solo en supporting/background. Mantener: UN único momento immersive (el escenario) y el CTA seco. Si hay que recortar, se recorta la receta propuesta, nunca el momento irreductible. |
| `/parkour-academy` | **ALTO** | Demasiado: cinematic-stage immersive + una escena 3D nueva encima. Degradar: el 3D es CONDICIONAL — solo entra si WORLD-3D-STRATEGY lo admite, cabe en el presupuesto (vendor-three 826.94 kB, gzip 222.32 kB) y define el fallback ANTES de la escena; si no cabe, el momento immersive vive sin 3D. Mantener: la escalera primer salto→control. |
| `/about` | CONTROLADO | El globo ya gasta la profundidad de la página. Degradar: image-drift al mínimo en supporting. Mantener: editorial-reveal como ritmo de lectura y el globo como única escena. |
| `/programs`, `/shop`, `/app`, `/community` | CONTROLADO | Riesgo de sumar rail+cascade+slide en exceso: cada una usa su par documentado, no los tres. Degradar: el rail nunca lleva información crítica. Mantener: el precio que se construye delante (`/programs`). |
| `/plan/*` (×4) | BAJO | quiet + dos recetas contenidas; el riesgo real es argumentativo (copias), no coreográfico → cubierto por M.13. |
| `/resources`, `/faq`, `/onboarding` | BAJO | Movimiento mínimo por diseño. |
| `/checkout`, `/order-confirmation`, 404, `/entrar` | BAJO | quiet-transition únicamente; cualquier adición violaría un HARD CONSTRAINT (puertas y embudo). |

**Distribución:** 2 ALTO (las dos `immersive`), 5 CONTROLADO, 12 BAJO. La concentración de espectáculo potencial está en `/` y `/parkour-academy` y en ningún otro sitio — coherente con la regla de oro del plan §14 (no todas las páginas deben ser espectaculares).

## M.6 REVERSIBILIDAD Y COSTE DE DECISIÓN

> Regla: a mayor coste de reversión, más evidencia exigida antes de implementar.

| Decisión (tipo) | Clasificación | Coste | Justificación |
|---|---|---|---|
| Receta secundaria / terciaria por ruta | REVERSIBLE | LOW | Cambiar una receta en una zona no altera la arquitectura de ruta ni los contratos. |
| Sticky/Horizontal/Parallax por ruta | REVERSIBLE | LOW–MEDIUM | Son decisiones de sección; los `NO` explícitos son baratos de mantener y de revertir con evidencia. |
| Text motion por ruta | REVERSIBLE | LOW | Token de zona; `none` en decisión/embudo es STRONG pero local. |
| Intensidad por ruta | CONDICIONANTE | MEDIUM | Condiciona el presupuesto de movimiento de todas las secciones de la ruta (`motionBudget.js`); cambiarla tras Fase 7 exige re-auditoría de presupuesto. |
| Momento irreductible por ruta | ESTRUCTURAL | HIGH | Define qué hace irrepetible a la página; reemplazarlo = rediseñar la página. Cambiarlo exige re-abrir el blueprint y su TEST de intercambiabilidad. |
| Clasificación de mundo por ruta | ESTRUCTURAL | HIGH | Vincula la ruta al sistema de mundos (Bloque 3, matriz de diferenciación); mover una ruta de mundo afecta continuidad y diferenciación. |
| Geometría de información | ESTRUCTURAL | HIGH | Es el esqueleto de la página; Fase 8 la implementa, no la elige. |
| 3D `/checkout` PROHIBIDO / `404` / planes | ESTRUCTURAL | HIGH | Mientras siga vigente la regla de claridad en conversión; solo el auditor + nuevo D-xx pueden revertirla. |
| 3D `/about` EXISTENTE | ESTRUCTURAL | — (hecho de código) | Es realidad viva (nivel 1 de jerarquía), no una decisión revertible documental. |
| 3D `/parkour-academy` POSIBLE | CONDITIONAL | MEDIUM–HIGH | Depende de WORLD-3D-STRATEGY + presupuesto + fallback; decidirlo mal cuesta un chunk de 826 kB. |
| `/entrar` canónica propia | ESTRUCTURAL | LOW | B-C4004: meta/canonical/Breadcrumb propios noindex; elimina title ajeno. |
| DP-5 intacto | HARD CONSTRAINT | — | Fuera de Fase 6; solo Sebastián. |

## M.7 REGISTRO DE CONTRADICCIONES Y REFINAMIENTOS (contradiction ledger)

Comparación explícita WORLD-BIBLE vs SPATIAL-LANGUAGE vs PAGE-BLUEPRINTS vs SCROLL-STORY-MATRIX vs código vivo. **Sin armonización silenciosa** — cada entrada declara fuente, jerarquía, decisión y efecto:

| # | Discrepancia | Fuentes | Jerarquía aplicada | Decisión | Efecto futuro |
|---|---|---|---|---|---|
| C-1 | `SCROLL-STORY-MATRIX` lista el 3D de `/about` como futuro; **Globe3D ya está vivo** (`src/components/Globe3D.jsx` montada en `About.jsx`) | Matriz F5 (niv. 8) vs código (niv. 1) | Gana el código | Mantener la realidad presente: `/about` = EXISTENTE/EXCEPCIONAL. Refinada ya en Bloque 4 (§2.10, corrección declarada) | Fase 7 conserva el globo como escena única; no re-planifica su creación |
| C-2 | `/entrar`: matriz F5 lo lee `quiet` (acceso mínimo); blueprint §17 lo confirma como puerta canónica noindex | Matriz F5 (niv. 8) vs blueprint §17 (niv. 5) + código (niv. 1) | Gana el código + blueprint corregido | REFINADA B-C4004: puerta propia `quiet`, sin alias; la lectura `balanced` era de `/onboarding`, ruta distinta | Fase 8: dos implementaciones reales, cero duplicación |
| C-3 | `/`: la matriz F5 confirma cinematic-stage + image-drift; el blueprint añade `editorial-reveal` como complementario (PROPUESTO, no histórico) | Matriz F5 (niv. 8) + blueprint (niv. 5) | El blueprint refina con etiqueta correcta | Mantener + etiquetar: `editorial-reveal` = CONDITIONAL en `/` (solo si no compite con el escenario, M.5) | Fase 8 puede omitirlo sin violar nada; no se convierte en CONFIRMADO por repetición |
| C-4 | `/programs`: la clase de decisión sugeriría `quiet`, pero la matriz F5 y el blueprint confirman `balanced` (comparación exige procesamiento sostenido) con "sin sticky ni horizontal" | SPATIAL-LANGUAGE §clases (niv. 7) vs matriz F5 + blueprint (niv. 5 con soporte del 8) | Función de ruta gana (protocolo M.0.2) | Mantener `balanced` con las dos prohibiciones explícitas | Fase 8: presupuesto balanced sin sticky/horizontal; cualquier sticky sería desviación registrable |
| C-5 | `horizontal-passage`: existe en el engine pero ninguna ruta de Fase 6 lo reclama | Código (niv. 1) vs blueprints (niv. 5) | Hecho, no conflicto de autoridad | Decisión negativa (M.3): no se introduce por disponibilidad | Si Fase 7 quiere usarlo, necesita evidencia + registro; no es gap |
| C-6 | Warnings lint pre-existentes (16) y deuda OBS-1/OBS-2 (shell embudo `index,follow`, soft-404 200) | Código (niv. 1) | Fuera de alcance de Fase 6 | Mantener: no se "armonizan" tocando producción | Espec'd en ROADMAP; Fase 7 no los usa como excusa para tocar SEO |
| C-7 | Los dos prompts del auditor difieren en el formato del entregable (sección vs documento paralelo) | Instrucciones vs plan líneas 138–141 (niv. 3) | Gana el plan | Matriz como sección final de este documento; registrado aquí (y en el informe) | Cero documentos paralelos; DF-012 respetado |
| C-8 | World 03 (MOVIMIENTO) clasificado "JUSTIFICADO" para 3D en Bloque 3 vs regla de claridad del plan | Bloque 3 (niv. 6) vs plan §14 (niv. 3) | Gana el nivel 3 solo como condición, no como veto | REFINADA: 3D en `/parkour-academy` = POSIBLE CON JUSTIFICACIÓN + CONDICIONAL (WORLD-3D-STRATEGY + presupuesto + fallback) | La decisión final de escena NO se inventa aquí: queda ABIERTA PARA FASE POSTERIOR en WORLD-3D-STRATEGY |

## M.8 PRUEBA DE IMPLEMENTABILIDAD FUTURA (sin escribir código)

> ¿Puede un ingeniero de Fase 8 convertir esta matriz en contratos sin reinterpretar cada ruta? Simulación documental del camino **Blueprint → decisión → contrato futuro** en 5 categorías:

**Narrativa — `/`:** blueprint §2 (momento irreductible: el reparto de puertas; 1 momento immersive; CTA seco) → decisión M.2 (fila `/`: cinematic-stage hero+body, image-drift supporting/background, editorial-reveal CONDITIONAL, 3D PROHIBIDO) → contrato Fase 8: `resolvePageMotionContract()` con intensidad `immersive`, receta dominante cinematic-stage, editorial-reveal opt-in, **ninguna** zona cta animada. *Sin ambigüedad: el ingeniero no elige el momento, solo lo construye.*

**Lectura — `/resources`:** blueprint §8 (geometría utilitaria-biblioteca; momento irreductible: el recurso gratis real y usable) → decisión M.2 (quiet, editorial-reveal, 3D PROHIBIDO, sin receta secundaria obligatoria) → contrato: `quiet`, un solo patrón de entrada, CTA sin movimiento. *Sin ambigüedad: la variación permitida es de ejecución, no de concepto.*

**Decisión — `/plan/fuerza`:** blueprint §12 (momento irreductible: "dejas de dudar si lo haces bien") → decisión M.2 (quiet, editorial-reveal + quiet-transition, text motion `none`, sin sticky/horizontal/parallax, 3D PROHIBIDO) → contrato: las 4 fichas comparten sistema comercial (mismo esqueleto, `offerings.js`) y se diferencian **solo en argumento y contenido**, no en coreografía. *Sin ambigüedad: el argumento es el diferenciador; el sistema es común (protege M.13).*

**Embudo — `/checkout`:** blueprint §11 (claridad primero; HARD CONSTRAINTS M.3) → decisión M.2 (quiet-transition única, todas las técnicas `NO`, 3D PROHIBIDO ABSOLUTO) → contrato: quiet-transition en hero, **cero movimiento en cta**, presupuesto mínimo. *Sin ambigüedad: cualquier técnica extra = violación HARD → escalar (M.10).*

**Error — `404`:** blueprint §18 (recolocar, no vender) → decisión M.2 (quiet-transition, 4 tarjetas de recolocación, 3D PROHIBIDO) → contrato: `quiet`, sin técnicas. *Sin ambigüedad.*

**Resultado:** las 5 simulaciones cierran sin reinterpretación. La ambigüedad restante es de ejecución (health freedom, M.9), no de concepto.

## M.9 AMBIGÜEDAD SANA vs PELIGROSA (clasificación por categoría)

| Categoría | Ambigüedad restante | Clasificación | Acción en Bloque 5 |
|---|---|---|---|
| Narrativa (`/`, `/about`) | Cómo se materializa visualmente el escenario / el globo | SANA (ejecución) | Ninguna — no se elimina libertad creativa |
| Academia | La escena 3D y su fallback | SANA CON CONDICIÓN | Encapsulada: CONDICIONAL → WORLD-3D-STRATEGY decide |
| Comparación | Micro-geometría de las tablas/rails | SANA | Ninguna |
| Decisión (`/plan/*`) | Voz editorial de cada argumento (ya spec'd en blueprints §12) | SANA | Ninguna |
| Embudo (`/checkout`) | — | **NINGUNA** (HARD) | Cerrada: toda adición = violación |
| Lectura | Cómo se renderiza el acordeón/biblioteca | SANA | Ninguna |
| **Transversal** | DP-5 (pricing) | **ABIERTA — DECISIÓN DE SEBASTIÁN** | No se finge decisión; HARD fuera de Fase 6 |
| **Transversal** | Wording final de copy público | SANA (Fase 8/9 con Sebastián) | Regla: LA WEB ES ESPAÑOLA (M.3) |
| **Transversal** | OBS-1/OBS-2 (SEO embudo) | FUERA DE FASE 6 | Documentada en M.7-C6; no se disimula |

**Ninguna ambigüedad peligrosa sin dueño.** Las abiertas tienen dueño, fase y condición — eso es gobierno, no relleno.

## M.10 MATRIZ GLOBAL TRANSVERSAL (hallazgos sistémicos)

| Dimensión | Hallazgo | ¿Clustering problemático? |
|---|---|---|
| Intensidad | 2 immersive, 7 balanced (incl. alias heredado), 9 quiet (de 18 efectivas) | NO — pirámide, no uniformidad |
| Momentos immersive | Solo `/` y `/parkour-academy` | NO — concentración deliberada y protegida |
| 3D | 1 EXISTENTE (`/about`), 1 CONDICIONAL (`/parkour-academy`), 16 PROHIBIDO/NO APLICA | NO — la escasez ES la decisión (ADN H) |
| Receta concentrada | `editorial-reveal` aparece en 10 filas, `quiet-transition` en 9 | CONTROLADO — `editorial-reveal` es el "andar" del sitio (ritmo de lectura), no un clon: se combina con 4 recetas primarias distintas y su rol varía (primaria en lectura, condicional en `/`, secundaria en comparación) |
| Momentos irreductibles | 18/18 únicos (verificados contra la tabla de Bloque 4) | NO — cero repetidos |
| Rutas conversion-sensitives | `/plan/*` (4) + `/checkout` + `/order-confirmation` = 6, todas quiet y sin coreografía | NO — protegidas en bloque |
| Quiet/recovery | 404, `/order-confirmation`, `/resources`, `/faq` | NO |
| Riesgo móvil | Concentrado en las 2 immersive (fallbacks de gramática, no de receta) | CONTROLADO |
| `prefers-reduced-motion` | Transversal: el engine ya lo degrade (Bloque 1); la matriz no añade dependencia nueva | NO |
| Cobertura de mundos | 00–08 todos presentes; 01 y 08 siempre secundarios (rol de apoyo) | NO — coherente con la matriz de diferenciación del Bloque 3 |
| Ambigüedad más alta restante | DP-5 + wording público | Con dueño (M.9) |

## M.11 TESTS DE MEMORIA Y HUMANIDAD

**TEST DE MEMORIA (§15 del prompt):** ¿qué recordaría un visitante a la semana, sin logo ni naranja?

| Mundo/Categoría | Memoria estructural (no decorativa) | ¿Sin respuesta? |
|---|---|---|
| `/` | "Una web que no me empujó: me dejó elegir la puerta" (el reparto de puertas) | NO |
| `/about` | "El mundo visto desde arriba con las voces de los que entrenaron" (globo de voces) | NO |
| `/parkour-academy` | "La escalera: del primer salto al control" (progresión por niveles) | NO |
| `/programs` | "El precio se construyó delante de mí" (comparación por piezas) | NO |
| `/plan/*` | "Me hablaron según mi punto de partida, no según su catálogo" (4 argumentos, no 4 precios) | NO |
| `/checkout` | "Todo desglosado y sin sorpresas" (transparencia) | NO |
| `/order-confirmation` | "Me dijeron qué pasa ahora, como una persona" (continuidad humana) | NO |
| `/community` | "El acceso fue gratis y sin pedir plan" (pertenencia sin captura) | NO |
| `/resources` | "Me llevé el recurso sin dar mis datos" (generosidad real) | NO |
| `/faq` | "Las respuestas no intentaban venderme" (claridad honesta) | NO |
| `/onboarding` | "Sentí que entraba en un sitio real, no en un embudo" (umbral) | NO |
| `/shop` | "El carrito acabó en una conversación, no en un pasarela" (compra paralela) | NO |
| `/app` | "Me dijeron la verdad: está en desarrollo" (no-promesa) | NO |
| 404 | "El error me recolocó en vez de venderme" | NO |
| `/entrar` (puerta propia) | acceso mínimo, metadatos noindex | — |
| `/design-system` | (excluida) | — |

**TEST DE HUMANIDAD (§16):** verificado contra el gobierno resultante — cuerpos reales ✓ (ADN I: "experiencias publicadas", sin métricas inventadas) · incertidumbre real ✓ (la academia se cuenta como progresión, no como resultado garantizado) · acompañamiento ✓ (momento irreductible de `/plan/*` es verbal, no visual) · recuperación ✓ (404 y `/order-confirmation` como reposo) · progresión ✓ (niveles, no saltos) · decisión humana ✓ (CTA nunca retrasado) · dignidad ✓ (no "avergonzar al que vuelve", plan RAÍZ) · conversión no manipuladora ✓ (checkout sin espectáculo, sin urgencia fabricada). **El lujo queda definido como precisión + contención + oficio, no como frialdad ni teatro de exclusividad.** BAYONA sigue siendo un entrenador que te acompaña, no un SaaS premium.

## M.12 CONTRATO DE HANDOFF CON FASE 7 (MAY / MUST NOT / ESCALATE)

**FASE 7 PUEDE (MAY):** implementar todo lo DECIDIDO en M.2 según el blueprint de su ruta · explorar dentro de lo CONDICIONAL/GUIADO documentado · mejorar ejecución técnica (a11y, rendimiento, móvil) sin cambiar autoridad conceptual.

**FASE 7 NO PUEDE (MUST NOT):** inventar mundos, recetas, tokens, firmas o APIs nuevas (solo 8 ids, 3 intensidades, 5 zonas, 4 rangos) · cambiar el propósito o el momento irreductible de una ruta (ESTRUCTURAL, M.6) · introducir 3D fuera de la clasificación de M.2/M.3; ninguna escena sin pasar por WORLD-3D-STRATEGY · sacrificar claridad de conversión por espectáculo (protección embudo M.4/M.5) · convertir territorio español en folclore visual (DF-010) · convertir PROPUESTO en CONFIRMADO por repetición o entusiasmo (DF-009) · sustituir copy público español por placeholders en inglés.

**FASE 7 DEBE ESCALAR (a `docs/DECISIONS.md` vía auditoría → Sebastián):** cualquier conflicto entre fuentes no resuelto por la jerarquía M.0 · cualquier decisión de coste HIGH (M.6) que necesite cambiar · contradicciones de evidencia o hechos nuevos de negocio · cambios que afecten a múltiples mundos/rutas · cualquier desviación de un HARD CONSTRAINT (incl. DP-5 — que solo Sebastián toca).

**Protocolo:** Fase 7 no reinterpreta: consulta M.2 → si DECIDIDO, construye; si CONDICIONAL/GUIADO, decide con las condiciones escritas; si la respuesta no está, escala. La matriz es la **capa de gobierno** entre la filosofía (Bloques 1–3) y los contratos de Fase 8.

## M.13 PRUEBA FINAL DE DIFERENCIACIÓN (18 entradas)

> Si elimino el nombre de la ruta y el mundo, ¿la fila sigue siendo reconociblemente distinta?

| Pareja riesgo | Distinción funcional que sobrevive a la eliminación del nombre | Veredicto |
|---|---|---|
| `/programs` vs `/resources` | comparar con evidencia y precio construido delante (balanced, data-cascade) vs llevarse un recurso gratis sin datos (quiet, biblioteca) | DISTINTAS |
| `/about` vs `/resources` | auto-revelación cronológica con globo (balanced, marca) vs utilidad inmediata (quiet, biblioteca) | DISTINTAS |
| `/onboarding` vs `/` | recibir y orientar sin chrome (umbral) vs elegir puerta con escenario (narrativa immersive) | DISTINTAS |
| `/checkout` vs `/order-confirmation` | confianza antes del envío (desglose + disclaimer, CTA único) vs continuidad después (qué ocurre ahora; sin venta) | DISTINTAS |
| `/plan/raiz` vs `/plan/fuerza` | volver sin vergüenza ("tu primer paso") vs empezar bien con dudas ("dejas de dudar") | DISTINTAS |
| `/plan/fuerza` vs `/plan/rendimiento` | base sólida para dudadores vs evaluación técnica para medir | DISTINTAS |
| `/plan/rendimiento` vs `/plan/elite` | medir progresión vs relación exclusiva (WhatsApp + 10 cupos, DP-5) | DISTINTAS |
| `/shop` vs `/programs` | objetos físicos con conversación posterior vs acompañamientos comparables | DISTINTAS |
| `/community` vs `/resources` | pertenencia con acceso libre vs descarga utilitaria | DISTINTAS |
| `/` vs `/parkour-academy` | elegir puerta (reparto de puertas) vs progresión física (escalera) | DISTINTAS |

**5 parejas de mayor riesgo** (marcadas en M.5 y aquí): `/programs`↔`/resources`, `/about`↔`/resources`, `/onboarding`↔`/`, `/checkout`↔`/order-confirmation`, y las 4 `/plan/*` entre sí. **Verificado: 18/18 filas funcionalmente distintas; ninguna diferenciación cosmética.** El TEST de intercambiabilidad de Bloque 4 se mantiene: la matriz añade recetas y técnicas sin homogeneizar.

## M.14 AUTOAUDITORÍA MECÁNICA DEL BLOQUE 5 (verificaciones reales, no declaraciones)

| Test | Verificación | Resultado |
|---|---|---|
| A · Cobertura | 19 filas en M.2 = 16 canónicas + 1 alias + 1 fallback + 1 nota interna | ✅ PASS |
| B · Vocabulario | grep de recetas en M.2/M.3: solo los 8 ids reales; `horizontal-passage` aparece solo como decisión negativa; cero recetas/tokens inventados | ✅ PASS |
| C · Anti-API | La matriz usa vocabulario del engine como gobierno conceptual; no define firmas, parámetros ni contratos de código; `resolvePageMotionContract()` citado solo como destino futuro | ✅ PASS |
| D · Anti-relleno | `NO APLICA` usado donde no hay necesidad documentada; `NO` solo donde hay decisión negativa explícita del blueprint; sin valores decorativos | ✅ PASS |
| E · Anti-espectáculo | M.5: 2 ALTO documentados y degradados con condiciones; 12 BAJO; CTA sin retraso transversal | ✅ PASS |
| F · Anti-intercambiabilidad | M.13: 18/18 filas distintas por función; 10 parejas probadas | ✅ PASS |
| G · Contradicciones | M.7: 8 entradas C-1…C-8, cada una con fuente + jerarquía + decisión + efecto; ninguna armonización silenciosa | ✅ PASS |
| H · Reversibilidad | M.6: cada tipo de decisión clasificado con coste justificado | ✅ PASS |
| I · Producción | `git diff` = solo este `.md` + docs centrales; 0 archivos de `src/` | ✅ PASS |
| J · Idioma | Todo el contenido nuevo en español; identificadores técnicos conservados | ✅ PASS |
| K · D-01…D-07 | Verificado contra `PLAN-FASE-6-WORLD-BUILDING.md` §bloques: el plan NO asigna tests D-01…D-07 al cierre del Bloque 5 (pertenecen a Fase 7/8); **no se fabrica cumplimiento** → no se ejecutan (justificado) | ✅ PASS (no aplicables) |

## M.15 ESTADO Y BLOQUEO FINAL DEL BLOQUE 5

- **Bloque 5 COMPLETADO** (matriz de decisión + gobierno de implementación) — todas las secciones M.0–M.15 de este documento.
- **Sin producción tocada** — diff documental exclusivamente.
- **STOP ABSOLUTO:** no iniciar WORLD-3D-STRATEGY, ni tests D-01…D-07, ni Fase 7, ni Fase 8, ni ninguna implementación visual, hasta la auditoría externa de este commit.
- El resultado queda esperando auditoría con la tabla M.2 como **semilla exacta del contrato de Fase 8** (`resolvePageMotionContract()`), y M.12 como contrato de handoff.
- DP-5 intacto. La web sigue siendo española. DF-009/DF-010/DF-012 vigentes.

**FIN DEL BLOQUE 5 — MENOS DECISIONES, PERO CADA UNA NECESARIA, TRAZABLE, DIFERENCIADA, IMPLEMENTABLE Y RESISTENTE A REINTERPRETACIÓN.**



















