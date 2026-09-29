# BAYONA-WORLD-BIBLE

> Documento maestro de World Building — FASE 6.
> **PARTE I — ADN VISUAL DE BAYONA** (Bloque 1) + **PARTE II — MUNDOS 00–08** (Bloque 3).
> Prompt rector: PROMPT MAESTRO V2.0 · Autorización del auditor: BLOQUE 1 únicamente (2026-08-28).
> Estado: **PROPUESTA DOCUMENTAL VINCULANTE PARA FASES 6–8** — este documento no implementa nada; gobierna decisiones futuras.
> Convención de referencias: el estado vivo del código se comprueba con Git; aquí se citan archivos y decisiones, no SHAs vivos.

**Etiquetas de evidencia** (disciplina V2.0 §7):
- **CONFIRMADO** — verificado en el código o en documentos aprobados del repo.
- **DERIVADO** — inferencia directa de evidencia confirmada; no es un hecho independiente.
- **PROPUESTO** — decisión documental nueva de este documento; aún no existe en el producto.
- **HISTÓRICO** — registro del pasado; no describe el estado actual.

Regla de lectura: cuando este documento dice "BAYONA usa X", X existe hoy (CONFIRMADO). Cuando dice "BAYONA hará/deberá X", es lenguaje que gobernarán Fase 7/8 (PROPUESTO) y se marca como tal.

---

## A. PROPÓSITO DEL DOCUMENTO

### Qué problema resuelve

El propietario diagnosticó el problema con precisión: las páginas internas "se sienten demasiado negras, planas y similares entre sí" y quiere que el visitante sienta que "está recorriendo una experiencia, no leyendo una página estática" (CONFIRMADO — CONTEXTO-MAESTRO-CONTINUIDAD.md §0/§34). La respuesta del proyecto no es "más animación": es **profundidad + movimiento + narrativa + precisión + coherencia** (CONFIRMADO — visión del propietario, ídem).

Sin un ADN escrito, cada página se resolvería con criterio estético del momento y el sitio derivaría en una de dos fallas: 17 diseños incompatibles (espectáculo) o 17 copias del mismo layout (monotonía). Este documento existe para que la diferenciación sea **con identidad**: "Página A editorial. Página B 3D. Página C datos. Página D fotografía. Página E storytelling. Pero todas: BAYONA" (CONFIRMADO — §36).

### Qué fases alimentará

- **Fase 6 (esta):** el Bloque 3 (mundos 00–08) se construye sobre estos principios; los Bloques 4–5 (blueprints y matriz) los aplican ruta por ruta.
- **Fase 7 (escenas 3D):** WORLD-3D-STRATEGY usará la sección H (profundidad) y el criterio de admisión de este ADN.
- **Fase 8 (migración):** cada contrato `resolvePageMotionContract()` deberá poder trazar su origen hasta un principio de esta Parte I.

### Qué NO implementa

Cero código, cero CSS, cero escenas, cero tokens nuevos (CONFIRMADO — alcance de Fase 6, D-008). Nada de lo escrito aquí es una instrucción de implementación; es criterio. La frase "luz de acento" no es un token nuevo: es un nombre para un comportamiento que ya existe en los tokens actuales.

### Qué decisiones futuras podrá gobernar

1. Qué movimiento corresponde a cada página (junto a MOTION-MAP y SCROLL-STORY-MATRIX).
2. Qué escenas 3D se admiten y cuáles se rechazan (junto a WORLD-3D-STRATEGY).
3. Qué composición, material y luz puede tener una sección sin romper la marca.
4. Cuándo una idea "espectacular" debe descartarse por claridad (sección J).
5. Cómo distinguir una mejora BAYONA de una imitación de otra marca (sección K).

---

## B. QUÉ ES BAYONA (como sistema de identidad)

No como eslogan, como sistema. Cada elemento está verificado en fuentes vivas del repo.

### B.1 Definición nuclear

BAYONA es un ecosistema de entrenamiento con método y acompañamiento humano real. Su tagline declarado es **"Movimiento, ciencia y propósito humano"** (CONFIRMADO — `src/config/site.config.js`, `BRAND.tagline`). Su home se describe como "Método de movimiento con dirección: plan mensual personalizado, seguimiento humano y cuatro niveles de acompañamiento. Sin humo ni promesas de resultado" (CONFIRMADO — `src/lib/seo/routeMeta.js`).

Tres sustantivos gobiernan todo: **movimiento** (el producto), **ciencia** (el rigor), **propósito humano** (el modo). Ninguno es decorativo: los tres aparecen operacionalizados abajo.

### B.2 El acompañamiento es el producto

La evidencia comercial es unánime: lo que BAYONA vende no es acceso a contenido, es **presencia humana estructurada** (CONFIRMADO — `src/config/offerings.js`):

| Plan | Journey declarado | Promesa nuclear |
|---|---|---|
| RAÍZ | RECONSTRUCCIÓN | "Cada día sabes qué hacer y alguien te ayuda a sostenerlo" |
| FUERZA | PROGRESO REAL | "Entrenas en vivo con alguien que te guía y te empuja a avanzar" |
| RENDIMIENTO | TRANSFORMACIÓN TOTAL | "Guía directa, cuatro sesiones en vivo y ajustes para transformar tu esfuerzo en resultados" |
| ELITE | DOMINIO TOTAL | "Sebastián, ocho sesiones privadas y cada detalle diseñado alrededor de ti" |

El método se declara en tres pasos: **TE LEEMOS → CONSTRUIMOS → TE ACOMPAÑAMOS** (CONFIRMADO — `src/config/conversionContent.js`). Y el sitio ataca explícitamente la dependencia de la motivación: "DEJAS DE IMPROVISAR / CADA SESIÓN TIENE UN OBJETIVO / NO DEPENDES DE TU MOTIVACIÓN" (CONFIRMADO — ídem). Conclusión derivada: **la identidad de BAYONA es estructura que sostiene, no estímulo que excita** (DERIVADO).

### B.3 La honestidad como sistema operativo

BAYONA declara sus claims por tipo, "no se infiere desde el copy": `editorial / aspiration / commercial / evidence / concept` (CONFIRMADO — `CLAIM_TYPES` en `conversionContent.js`). Sus reglas de copy prohíben "promesas de resultado" y "lenguaje médico" (CONFIRMADO — `routeMeta.js`). Sus aspiraciones están deliberadamente contenidas: "Despiertas con más energía / Tu cuerpo responde mejor / Te mueves sin dudar / Sabes exactamente qué hacer cada día / Dejas de empezar de cero cada lunes" (CONFIRMADO — bloque `aspiration`). Nada de transformaciones milagro.

Esto se extiende al producto: BAYONA+ "está en desarrollo… sin fechas comprometidas" (CONFIRMADO — routeMeta); Parkour es pre-apertura honesta "Interés abierto · Sin pago · Sede y horarios por confirmar" (CONFIRMADO — FASE4-ARQUITECTURA-EXPERIENCIA.md); la comunidad es gratis de verdad (CONFIRMADO — routeMeta); no hay pago online, la conversión es una conversación por WhatsApp (CONFIRMADO — J2–J4 en ROUTE-JOURNEYS.md). Conclusión derivada: **BAYONA prefiere perder espectacularidad antes que perder credibilidad** (DERIVADO).

### B.4 Personas reales, no arquetipos

Los testimonios son situaciones vitales concretas, no cuerpos ideales: hábitos y energía (Andrea), dolor de espalda y trabajo (Carlos), postparto (Mai), disciplina de parkour (Sebastián), falta de tiempo real (Paola), una familia entera (Familia Rusa) (CONFIRMADO — `src/config/testimonials.js`). El plan ELITE nombra a la persona real que lo imparte (CONFIRMADO — offerings.js). Conclusión derivada: **la prueba social de BAYONA es biográfica, no aspiracional-estética** (DERIVADO).

### B.5 Un lugar real

BAYONA no es un producto digital sin territorio: hay sesiones presenciales en España "sujeto a ubicación y disponibilidad" (CONFIRMADO — nota de cumplimiento en PlanCalculator, registrada en memoria de Fase 2; servicio `presencial-espana-1to1` en `shopCatalog.js`), una academia física de parkour con sede por confirmar (CONFIRMADO), y un número de WhatsApp español como canal de conversión (CONFIRMADO — 34 614 988 006). Conclusión derivada: **la web debe sentirse situada, no globalizada** (DERIVADO).

### B.6 El sistema visual ya construido (lo que el ADN hereda)

- **Dirección acordada:** "Balance premium + decisión estructural"; la web debe sentirse "oscura, moderna, editorial, cinematográfica sin exceso, adulta, directa, estructural, premium, útil y clara" (CONFIRMADO — BAYONA_05_DOCUMENTO_MAESTRO.md §7).
- **Superficies:** escalera de elevación por luminosidad sobre negro — `--ds-surface-background #050505 / deep #0B0B0C / raised #0c0c0d / content #111111 / overlay #141416` + glass con presupuesto (CONFIRMADO — `src/styles/ds-tokens.css`; "el problema era la luz, no el color", DESIGN-SYSTEM.md §6).
- **Color:** acento único familia naranja `#F4A261 / fire #E76F51 / deep #D45D38`; tinta white / muted #A3A3A3 / dim #6b6b6b (CONFIRMADO — ds-tokens.css).
- **Tipografía:** Montserrat (titulares) / Inter (cuerpo) / DM Mono (etiquetas); escala display→h1→h2→h3→h4→lead→body→body-small→eyebrow (CONFIRMADO).
- **Radios:** sharp 0 (defecto de marca) / control 10 / float 16 / round (CONFIRMADO).
- **Movimiento:** Motion Engine 2.0 — 3 intensidades (`quiet/balanced/immersive`), 8 recetas, presupuesto por zonas (`hero 3 / body 2 / supporting 1 / cta 2 / background 0`), tokens cerrados (4 duraciones, easings `exit/travel/transform`, distancias `near/medium/far`) (CONFIRMADO — `src/engine/`, MOTION-MAP.md).
- **Navegación:** cuatro sistemas, cada uno responde una pregunta — Navbar (dónde puedo ir) / Breadcrumb (dónde estoy) / JourneyRibbon (cómo va mi recorrido) / NextChapter (qué viene después) (CONFIRMADO — doctrina D12, FASE4).
- **Privacidad:** sin cookies, sin cuentas; la memoria del visitante vive solo en memoria de sesión (CONFIRMADO — J10, ROUTE-JOURNEYS.md).

### B.7 Qué la diferencia de una web fitness genérica

| Web fitness genérica | BAYONA (evidencia) |
|---|---|
| Vende motivación ("¡empieza hoy!", cuerpos ideales) | Vende estructura ("no dependes de tu motivación", situaciones reales) — CONFIRMADO |
| Promete resultados garantizados | Tipa sus claims y veta promesas de resultado — CONFIRMADO |
| Conversión = pago online inmediato | Conversión = conversación humana por WhatsApp, sin pago online — CONFIRMADO |
| Estímulo constante (banners, urgencia, countdowns) | Calma presupuestada (reglas de calma del Motion Engine) — CONFIRMADO |
| Producto sin lugar (SaaS global) | Servicio situado (presencial España, academia física) — CONFIRMADO |
| Estética energética/clara/deportiva | Estética oscura/editorial/adulta/estructural — CONFIRMADO |

---

## C. QUÉ NO ES BAYONA (prohibiciones explícitas)

Cada prohibición tiene fuente. No son gustos: son decisiones registradas.

1. **NO es fitness motivacional genérico.** "No convertirla en una web fitness motivacional" (CONFIRMADO — DOCUMENTO_MAESTRO §7). Anti-ejemplo: hero con grito épico, countdown de oferta, "transforma tu cuerpo en 30 días".
2. **NO es hype vacío.** "No usar hype, milagros o promesas garantizadas" (CONFIRMADO — ídem); copy "sin humo ni promesas de resultado" (CONFIRMADO — routeMeta). Prohibido inventar resultados, plazos o aval médico.
3. **NO es lujo superficial.** El lujo de BAYONA es estructural (decisión D-001 Awwwards-luxury + "balance premium + decisión estructural"): proviene de proporción, jerarquía, material y precisión — no de dorados, brillos ni ornamento. Lujo vacío = decoración cara sin decisión detrás (DERIVADO de §7 y D-001).
4. **NO es tecnología decorativa.** "No añadir efectos tecnológicos sin propósito" (CONFIRMADO — §7); "¿Qué idea de la página representa este objeto? No debe existir una esfera solo porque es fácil hacer una esfera" (CONFIRMADO — §39).
5. **NO es espectáculo sin función.** Evitar: "3D decorativo aleatorio; exceso de partículas; animaciones infantiles; efectos 'wow' sin propósito; scroll hijacking" (CONFIRMADO — §38). La intención NO es "llenar todo de animaciones" (CONFIRMADO — §0).
6. **NO es copia de referentes externos.** Nike, Apple, Arc'teryx, Porsche, Aesop, Gymshark y las plantillas Awwwards son contexto cultural, no plantilla conceptual (CONFIRMADO — regla del auditor, Bloque 1 §9; ver test K.2).
7. **NO es una web sin restricciones honestas.** "No eliminar avisos médicos, legales o de disponibilidad que tengan función contextual"; "no dejar que los disclaimers dominen la experiencia" (CONFIRMADO — §7). La honestidad se dosifica, no se esconde ni se impone.
8. **NO es 17 webs distintas.** La diferenciación por página tiene límite: "las páginas podrán variar la composición; no podrán romper el sistema" (CONFIRMADO — §40, referido a tipografía y extensible al sistema completo).
9. **NO es un embudo agresivo.** Sin dark patterns, sin urgencia artificial, sin pago por sorpresa: el checkout "prepara una solicitud: aquí no se procesa ningún pago" (CONFIRMADO — routeMeta) y la salida es una conversación.
10. **NO es un producto terminado donde no lo hay.** BAYONA+ no promete fechas; Parkour no vende plazas que no existen (CONFIRMADO — routeMeta, FASE4). Prohibido fabricar escasez o disponibilidad falsa.

---

## D. LOS 10 PRINCIPIOS OPERATIVOS

Hipótesis aprobada por el auditor (2026-08-28): estos 10. Verificación crítica ejecutada durante el Bloque 1 (duplicados, relleno, faltantes) — resultado en D.11; sin problema material, se mantienen los 10.

Formato por principio: **Definición · Función · Evidencia · Traducción visual · Traducción espacial · Traducción de movimiento · Riesgo · Anti-patrón · Corrección · Decisión futura que condiciona.**

---

### D.1 PROGRESIÓN

**Definición.** En BAYONA nada empieza por el final: todo recorrido tiene pasos ordenados que se ganan. La progresión es el eje temporal de la identidad: RECONSTRUCCIÓN → PROGRESO REAL → TRANSFORMACIÓN TOTAL → DOMINIO TOTAL.

**Función.** Resuelve el problema del visitante abrumado ("no sé por dónde empezar") sin recurrir a la venta directa: orienta por etapas. Convierte la oferta en itinerario.

**Evidencia (CONFIRMADO).** Cuatro planes con journeys escalados (`offerings.js`); onboarding como recepción de pasos que termina en ruta recomendada (J2, D9); "Dejas de empezar de cero cada lunes" (aspiration); parkour con "progresiones técnicas" (routeMeta); itinerario canónico de capítulos (chapters.js); JourneyRibbon como memoria de progreso (J10).

**Traducción visual.** Números ordinales y marcadores de etapa visibles (patrón `01/02/03` ya existente en los bloques editoriales de conversionContent); escaleras de planes presentadas como niveles, no como tarjetas sueltas; la etiqueta DM Mono como voz del progreso.

**Traducción espacial.** Las páginas de entrada presentan puertas y pasos, no muros de contenido: home con tres puertas (EXPLORAR / ENCONTRAR MI CAMINO / VER PLANES, CONFIRMADO), recepción como umbral secuencial. El scroll puede revelar por etapas cuando la etapa es el mensaje.

**Traducción de movimiento.** `editorial-slide` es la receta de la dirección y el progreso ("señala dirección y progreso", MOTION-MAP); secuencias de pasos con `data-cascade` contenida; el paso nunca entra con teatro que retrase la comprensión.

**Riesgo.** Convertir toda la web en un tutorial: fragmentar tanto que el visitante experto (J3, "ya sabe qué quiere") no encuentre atajo.

**Anti-patrón.** Obligar a pasar por 5 pantallas de onboarding para ver un precio; animar cada viñeta como si fuera un logro de videojuego.

**Corrección.** Toda progresión ofrece su atajo: J3 existe y llega al comparador directo (CONFIRMADO); el precio es público sin pasos previos (D-002).

**Decisión futura que condiciona.** Cuántos pasos puede tener una secuencia por página (Bloque 4), y qué páginas pueden usar narrativa secuencial vs. acceso directo (Bloque 5).

---

### D.2 PRECISIÓN

**Definición.** Cada elemento está donde está por una razón, y cada palabra dice exactamente lo que es — ni más (hype) ni menos (opacidad). La precisión es doble: **geométrica** (alineación, proporción, sistema) y **expresiva** (claims exactos, tipados, sin promesas).

**Función.** Es el antídoto estructural contra el hype y contra el caos visual. Produce la sensación "adulta" y "estructural" de la dirección acordada.

**Evidencia (CONFIRMADO).** §41: "Todo debe tener una razón de alineación… La web debe transmitir: precisión"; CLAIM_TYPES con declaración explícita "no se infiere desde el copy"; routeMeta sin promesas de resultado ni lenguaje médico; tokens de movimiento en conjuntos cerrados (4 duraciones, 3 distancias, easings con nombre de intención); helpers fail-safe (`resolveIntensity`, `resolveBudget`, `resolveRouteMeta`); precios publicados en COP exactos (D-002).

**Traducción visual.** Grid con razón de alineación para títulos, imágenes, tarjetas, datos, botones, líneas (§41); jerarquía tipográfica única (§40); el acento `#F4A261` se usa para señalar, no para decorar: si todo es acento, nada lo es (DERIVADO de la economía de tokens).

**Traducción espacial.** Los márgenes y la retícula son parte del mensaje: el espacio vacío es decisión, no sobra. Ningún elemento flotante sin razón de plano.

**Traducción de movimiento.** Reglas de calma: "micro > macro: preferir movimientos pequeños y precisos"; distancias `near/medium/far` como vocabulario cerrado; sin rebotes, overshoot ni elasticidad (CONFIRMADO — MOTION-MAP). El movimiento preciso llega y se detiene; no "flota" indefinidamente.

**Riesgo.** Precisión convertida en rigidez: páginas tan cuadriculadas que se sienten frías o muertas. La precisión sin humanidad es maqueta.

**Anti-patrón.** Alinear todo al milímetro y luego llenar el copy de "experiencia premium única" sin contenido: precisión visual con vaguedad verbal. También: usar el acento en 12 elementos de una misma vista.

**Corrección.** La precisión se combina con humanidad (D.7): el sistema es estricto, las personas son reales. Y el copy sigue la misma regla que el grid: cada frase debe poder defenderse (CLAIM_TYPES).

**Decisión futura que condiciona.** Qué claims se admiten en cada blueprint (Bloque 4); cuándo una composición puede romper la retícula a propósito (solo con justificación, nunca por decoración); el presupuesto de acento por vista.

---

### D.3 TENSIÓN

**Definición.** La tensión es el momento en que algo está a punto de cambiar: el visitante contiene la respiración. En BAYONA la tensión siempre es **breve, justificada y se resuelve** — nunca es estado permanente.

**Función.** Sin tensión no hay narrativa: es el contraste que hace sentir el reposo. Resuelve el problema de las páginas "planas" diagnosticado por el propietario, sin caer en el espectáculo.

**Evidencia (CONFIRMADO).** El copy editorial abre con tensión real del visitante: "DESPIERTAS CANSADO / ENTRENAS SIN RESULTADOS / TU CUERPO TE HABLA / NO TIENES TIEMPO" (conversionContent); §35: la secuencia de scroll como narrativa (elemento aparece → cámara cambia → texto se reconfigura); `cinematic-stage`: "un único momento narrativo por página que justifica detener el tiempo"; dirección conceptual Fuerza = "tensión / masa / compresión" (§39); regla de calma "alternar movimiento → reposo" (MOTION-MAP).

**Traducción visual.** Contraste controlado: un elemento que domina momentáneamente la composición (escala, posición, silencio alrededor). La tensión visual se crea con jerarquía y vacío, no con efectos.

**Traducción espacial.** La tensión ocupa un lugar acotado en la secuencia de la página (una sección, un momento), nunca la página entera. Después de la tensión viene la recuperación (D.4) — el orden importa.

**Traducción de movimiento.** `cinematic-stage` (immersive, un momento por página) y `horizontal-passage` son las gramáticas de la tensión narrativa; el `pin` detiene el tiempo un instante; distancias `far` solo cuando la amplitud comunica. Máximo un momento `immersive` por página (CONFIRMADO — SCROLL-STORY-MATRIX).

**Riesgo.** Tensión permanente = ruido. Si todo es clímax, nada lo es; el visitante se agota y desconecta.

**Anti-patrón.** Tres secciones sticky consecutivas con música visual de partículas; abrir una página de precios con un clímax narrativo.

**Corrección.** Presupuesto: una página, un momento de tensión (regla immersive única). Las páginas de decisión y lectura van sin tensión narrativa (SCROLL-STORY-MATRIX: `quiet`, nunca sticky ni horizontal).

**Decisión futura que condiciona.** Qué páginas tienen derecho a un momento immersive (Bloque 5); dónde se coloca la tensión en la secuencia (Bloque 2: nunca sin aproximación previa).

---

### D.4 RECUPERACIÓN

**Definición.** La recuperación es el retorno al equilibrio: del cuerpo (descanso, cuidado) y de la experiencia (reposo visual, salida serena, recolocación). Es la otra mitad del ritmo: sin ella, la tensión es agresión.

**Función.** Doble. Identitaria: BAYONA vende recuperación literal como servicio (el cuerpo se cuida). Experiencial: garantiza que toda intensidad tenga salida y que nadie se quede perdido.

**Evidencia (CONFIRMADO).** Categoría comercial RECUPERACIÓN con servicios reales: masaje deportivo, protocolo de recuperación, movilidad asistida, pilates, yoga terapéutico (`shopCatalog.js`); reglas de calma "alternar movimiento → reposo" (MOTION-MAP); `quiet-transition`: "continuidad sin teatro"; `/order-confirmation` como "cierre sereno; confirmación sin teatro" (SCROLL-STORY-MATRIX); J9: el 404 recupera con cuatro tarjetas, "nunca callejón sin salida"; reduced-motion como experiencia completa, no degradada (§44).

**Traducción visual.** Secciones de reposo: densidad baja, superficies content/raised sin competencia, tipografía de lectura. El silencio visual es un material de la marca.

**Traducción espacial.** Después de cada zona intensa de una página existe una zona de descompresión antes del siguiente bloque o del CTA. El 404 y los cierres son espacios de recolocación, no culpas.

**Traducción de movimiento.** Intensidad `quiet` (amplitud ×0.5, una cosa a la vez); `quiet-transition` para entradas/salidas; `editorial-reveal` para la lectura; reduced-motion: todo visible, corte limpio (MOTION-MAP).

**Riesgo.** Confundir recuperación con aburrimiento: páginas tan en calma que parecen vacías o inacabadas.

**Anti-patrón.** Eliminar el reposo: enlazar tres momentos intensos "para mantener la atención"; o el extremo opuesto: una página entera en quiet sin ninguna jerarquía que invite a seguir.

**Corrección.** La recuperación es activa: prepara lo siguiente. El cierre sereno orienta (NextChapter existe precisamente para continuar, D12). Calma ≠ vacío: la composición sigue trabajando con jerarquía y material.

**Decisión futura que condiciona.** Dónde van las zonas de descompresión en cada blueprint; qué páginas son íntegramente de recuperación (FAQ, resources, order-confirmation, 404); el tratamiento de reduced-motion como ciudadanía completa.

---

### D.5 MATERIA

**Definición.** La materia es de qué están hechas las cosas en BAYONA: superficies reales, tipografía con cuerpo, fotografía con grano, luz que revela textura. La marca se siente al tacto aunque sea una pantalla.

**Función.** Resuelve el diagnóstico "demasiado negro y plano" por la vía del material, no del color: la profundidad viene de la calidad de la superficie (§42). Evita el negro infinito y el plástico digital.

**Evidencia (CONFIRMADO).** §42 REGLA PARA EL NEGRO: "La profundidad se creará usando: diferentes superficies; iluminación; fotografía; textura; 3D; contraste; composición; espacios"; escalera de 5 superficies + glass (ds-tokens.css); grano de película existente en la capa luxury de Fase 1 (`v3-finish.css`, feTurbulence — CONFIRMADO como existente, HISTÓRICO como decisión de Fase 1); sombras `--ds-shadow-lift` y `lift-warm` ("elevación con brasa cálida"); Montserrat/Inter/DM Mono como materiales tipográficos con roles fijos.

**Traducción visual.** Cada bloque declara su material: superficie (cuál de las 5), textura (grano contenido o ausente), borde (radio sharp/control/float según naturaleza), sombra (lift cuando hay elevación real). El acento es brasa, no neón: `#F4A261 → #D45D38` es una familia cálida de fuego contenido.

**Traducción espacial.** Los materiales organizan: lo que es fondo (background/deep), lo que es contenido (content), lo que flota (raised/overlay). Un cambio de material puede marcar cambio de capítulo sin necesidad de línea ni título.

**Traducción de movimiento.** La materia se mueve como materia: `image-drift` da profundidad "sin mareo"; nada de elasticidad de goma ni rebotes (reglas de calma); solo `transform` y `opacity` — el material no se deforma, se desplaza y se revela.

**Riesgo.** Materialidad fetichista: acumular texturas, granos y sombras hasta el ruido; o el opuesto: ignorar la materia y volver al negro plano.

**Anti-patrón.** Glassmorphism en todas las tarjetas "porque es premium"; grano visible al punto de distraer de la lectura; sombras dobles en cada elemento.

**Corrección.** Presupuesto material: una vista elige su material dominante; el glass tiene presupuesto explícito (solo ≥900px y con soporte, CONFIRMADO — DESIGN-SYSTEM.md §6); el grano es ambiente, nunca protagonista.

**Decisión futura que condiciona.** Qué superficie/textura corresponde a cada mundo (Bloque 3) y a cada sección de blueprint (Bloque 4); cuándo se admite glass; el uso del acento como brasa contenida.

---

### D.6 PROFUNDIDAD

**Definición.** La profundidad es la percepción de que hay planos: algo detrás, algo delante, algo que se mueve entre ellos. Es el eje Z de la identidad — distinto de la materia (D.5), que es la calidad de cada plano.

**Función.** Es la respuesta directa al deseo del propietario: que el scroll sea "recorrer una experiencia" (§0/§34). Convierte la página en espacio sin convertir la web en videojuego.

**Evidencia (CONFIRMADO).** Visión: "profundidad + movimiento + narrativa + precisión + coherencia" (§0); §42 lista la profundidad como sistema (superficies, iluminación, fotografía, textura, 3D, contraste, composición, espacios); escalera de superficies como planos reales; `image-drift` ("profundidad sin mareo"); Globe3D viva en `/about` (única escena 3D actual — verificado en el checkpoint V2.0); `useScrollHandoff()` preparado para entregar estado de scroll a escenas futuras (PHASE5 §14).

**Traducción visual.** Planos documentales mapeados conceptualmente a la escalera existente: fondo (background/deep) → contenido (content) → elevado (raised) → overlay. **Nota de disciplina:** esta correspondencia es guía conceptual, no equivalencia técnica — una superficie CSS no es automáticamente un plano narrativo (regla del auditor). No se inventan superficies nuevas.

**Traducción espacial.** Cada sección declara cuántos planos usa y para qué. La profundidad espacial se gana por composición (elementos que entran y salen de plano) antes que por efectos.

**Traducción de movimiento.** Parallax contenido (`image-drift`, factor 0.4 en móvil, 0 en reduced-motion); `cinematic-stage` como evolución de planos por estados; el 3D es el plano excepcional y requiere justificación (sección H y WORLD-3D-STRATEGY).

**Riesgo.** Profundidad = mareo: capas que se mueven sin jerarquía, parallax en todo, el visitante pierde el suelo.

**Anti-patrón.** Cinco capas de parallax simultáneas; un fondo 3D permanente detrás del texto de lectura; usar z-index como decoración.

**Corrección.** Una página elige su estrategia de profundidad dominante (composición, parallax contenido, o escena) y las demás quedan supeditadas. Máximo una capa de parallax simultánea en móvil (MOTION-MAP). El plano de lectura nunca compite.

**Decisión futura que condiciona.** Qué blueprints llevan parallax/sticky/3D (Bloque 5); el criterio de admisión de escenas (Fase 7); la jerarquía de planos por mundo (Bloque 3).

---

### D.7 HUMANIDAD

**Definición.** La humanidad es la presencia de personas reales en la identidad: rostros, nombres, situaciones vitales, voz directa de adulto a adulto. BAYONA no habla como marca-corporación; habla como alguien que entrena contigo.

**Función.** Diferencia radical frente al fitness genérico (arquetipos aspiracionales) y frente al SaaS frío (interfaz sin personas). Ancla el "propósito humano" del tagline.

**Evidencia (CONFIRMADO).** Tagline "Movimiento, ciencia y propósito humano" (site.config.js); testimonios biográficos con nombres reales (testimonials.js); "seguimiento humano" y "acompañamiento humano por delante de la promesa rápida" (routeMeta home/about); ELITE nombra a Sebastián personalmente (offerings.js); copy en segunda persona directa y adulta: "TU CUERPO TE HABLA", "NO TIENES TIEMPO" (conversionContent); avatar y bandera circulares como elementos de persona (DOCUMENTO_MAESTRO §7).

**Traducción visual.** Fotografía de personas reales en situaciones reales (no stock de gimnasio genérico); el retrato tiene lugar propio (avatar circular, CONFIRMADO como patrón vivo); la voz del copy es directa sin ser agresiva.

**Traducción espacial.** Los momentos humanos (historia, testimonios, comunidad) tienen espacio de lectura: no se comprimen en carruseles veloces. La sección de personas se trata como lectura, no como decoración.

**Traducción de movimiento.** `editorial-reveal` para testimonios e historia (la lectura manda); nada de efectos que distorsionen rostros o conviertan personas en material de espectáculo; el texto humano entra con calma (`quiet`/`balanced`).

**Riesgo.** Falsa humanidad: stock emocional, frases de poster, "somos una familia" sin evidencia. O el opuesto: convertir lo humano en blandura que diluye la exigencia del método.

**Anti-patrón.** Carrusel de testimonios con música épica y zoom dramático a rostros; copy "únete a nuestra tribu" inventando comunidad donde hay un servicio.

**Corrección.** La humanidad de BAYONA es sobria y exigente: personas reales que hicieron el trabajo (los testimonios describen esfuerzo y resultado honesto, no magia). La voz es cálida pero adulta.

**Decisión futura que condiciona.** Qué fotografía se admite en cada mundo (Bloque 3); cómo se tratan las secciones de testimonios/historia en blueprints (Bloque 4); el tono de copy por tipo de página.

---

### D.8 ACOMPAÑAMIENTO

**Definición.** El acompañamiento es el servicio nuclear hecho estructura: alguien va contigo antes, durante y después de la decisión. Si la humanidad (D.7) es la presencia de personas, el acompañamiento es **lo que esas personas hacen por ti**: leen, construyen, acompañan.

**Función.** Es el diferenciador comercial central y el principio que gobierna la conversión: en BAYONA convertir no es cerrar una venta, es empezar a acompañar. Resuelve el miedo del visitante a decidir solo.

**Evidencia (CONFIRMADO).** Los cuatro planes son grados de acompañamiento ("alguien te ayuda a sostenerlo" → "alguien te guía" → "acompañamiento real" → "cada detalle diseñado alrededor de ti"); método TE LEEMOS → CONSTRUIMOS → TE ACOMPAÑAMOS; comunidad gratuita por WhatsApp (routeMeta); conversión por conversación (WhatsApp en todos los journeys, J1–J8); onboarding como recepción que orienta sin pedir cuenta ni datos (J2); checkout como "configura tu experiencia" que prepara una solicitud, no un pago; NextChapter como continuidad tras cada página (D12).

**Traducción visual.** Los CTAs son invitaciones conversacionales, no órdenes de compra ("conocer mi camino", "solicitar detalles", "empezar gratis"); el plan recomendado se señala con sobriedad (FUERZA destacado "con sobriedad", DOCUMENTO_MAESTRO §7).

**Traducción espacial.** Toda página de decisión tiene una salida humana visible (WhatsApp o videollamada); el embudo es un pasillo acompañado (breadcrumb visible incluso en checkout, CONFIRMADO — J2), nunca un túnel; después de cada conversión hay continuidad (order-confirmation responde "qué ocurre ahora").

**Traducción de movimiento.** El movimiento acompaña sin empujar: `quiet-transition` entre capítulos; el CTA primario nunca se retrasa por movimiento (regla confirmada en MOTION-MAP y SCROLL-STORY-MATRIX); la recepción (onboarding) señala dirección y progreso paso a paso (`editorial-slide`).

**Riesgo.** Acompañamiento = fricción: tantas preguntas y pasos que el visitante que ya decidió no puede comprar. O el opuesto: "acompañar" solo en el copy, con una experiencia que deja solo al usuario.

**Anti-patrón.** Chatbot flotante que interrumpe la lectura; obligar a registrarse para ver precios; CTA que dice "EMPIEZA TU TRANSFORMACIÓN" cuando el producto ofrece una conversación.

**Corrección.** El acompañamiento ofrece, no retiene: cada paso tiene salida directa (J3 compra directa existe; los precios son públicos). La prueba del principio: ¿el visitante siente que alguien le ayuda o que alguien le persigue?

**Decisión futura que condiciona.** La lógica de CTAs y salidas de cada blueprint (Bloque 4); qué páginas llevan continuidad NextChapter vs. salida directa; el tratamiento del embudo como espacio acompañado (Bloques 4–5).

---

### D.9 TERRITORIO

**Definición.** BAYONA existe en un lugar real, con restricciones reales: sesiones presenciales en España, una academia con sede física, una comunidad local, un número de teléfono real. El territorio ancla la marca a lo concreto y le prohíbe fingir ser un producto digital sin suelo.

**Función.** Protege la honestidad (B.3/B.5): la disponibilidad, la presencialidad y los límites geográficos son parte de la identidad, no letra pequeña. Diferencia frente a SaaS desterritorializados y frente a fitness online genérico.

**Evidencia (CONFIRMADO).** Servicio `presencial-espana-1to1` y nota "Presencial en España · sujeto a ubicación y disponibilidad" (shopCatalog.js + PlanCalculator, registro de Fase 2); Parkour Academy con "sede y horarios por confirmar" dicho de frente (routeMeta/FASE4); WhatsApp español como canal (34 614 988 006); testimonios con contexto vital real; la propia marca nace del contexto del propietario (DOCUMENTO_MAESTRO).

**Traducción visual.** Lo presencial se representa como presencia (fotografía de lugar, personas, sesión real), no como iconografía de mapa genérico; los avisos de disponibilidad son tipografía honesta, no disclaimers escondidos ni dominantes (§7: ni eliminar ni dejar dominar).

**Traducción espacial.** Las páginas con componente físico (parkour, shop presencial) reservan lugar para la logística real (sede, disponibilidad, formato) como contenido de primera clase, no como nota al pie.

**Traducción de movimiento.** Ninguna especial: el territorio se expresa por contenido y composición. Cuando aparezca (Fase 7) una representación del lugar, aplicará el criterio 3D de la sección H: ¿qué idea de la página representa? (Parkour: "trayectoria / libertad", §39, dirección conceptual).

**Riesgo.** Territorio = localismo limitante: presentar BAYONA como algo pequeño cuando su método sirve también en remoto (los planes son online con sesiones en vivo). O el opuesto: esconder lo local para parecer global.

**Anti-patrón.** Mapa del mundo animado con puntos "en 40 países" (falso); esconder "sujeto a ubicación" hasta después del pago; tratar la academia como producto digital.

**Corrección.** Dualidad honesta y visible: lo virtual (planes con sesiones en vivo) y lo presencial (España, sede) son dos ofertas distintas con sus condiciones dichas antes de decidir. La escala real de BAYONA es parte de su credibilidad.

**Decisión futura que condiciona.** Cómo se comunica presencial/virtual en fichas y shop (Bloque 4); si el mundo de la academia (Bloque 3) justifica representación espacial del lugar; qué avisos de disponibilidad son estructurales en cada blueprint.

---

### D.10 DECISIÓN

**Definición.** La decisión es el momento en que el visitante elige, y BAYONA lo respeta: en ese instante, todo se aparta. Nada de movimiento, nada de narrativa, nada de estética que compite con la elección. La claridad gana.

**Función.** Protege el negocio sin traicionar la identidad: el sitio puede ser narrativo y profundo porque garantiza que el momento de decidir es limpio. Resuelve la tensión entre espectáculo y conversión de una vez: por turnos.

**Evidencia (CONFIRMADO).** Dirección acordada: "balance premium + **decisión estructural**" (DOCUMENTO_MAESTRO §7); SCROLL-STORY-MATRIX: páginas de decisión en `quiet`, sin sticky ni horizontal, "CTA sin retraso"; checkout "máxima claridad, cero distracción"; FAQ como capítulo "ANTES DE DECIDIR" (chapters.js); comparador y calculadora en Programs (J3); fichas de plan con precio público, PDF y dos salidas claras (WhatsApp / configurador); "el CTA primario nunca se retrasa por movimiento" (MOTION-MAP).

**Traducción visual.** En zona de decisión: jerarquía máxima del precio y del CTA, contraste alto, cero elementos compitiendo; el acento marca la acción, no adorna alrededor.

**Traducción espacial.** La decisión tiene lugar propio y reconocible (fichas, comparador, configurador, cierre de página); no se diluye en mitad de una secuencia narrativa. El embudo es un espacio aparte (grupo EMBUDO, fuera del itinerario a propósito, CONFIRMADO — PAGE-EXPERIENCE-MATRIX).

**Traducción de movimiento.** `quiet` obligatorio; `quiet-transition` como máximo gesto; presupuesto de zona `cta` usado para énfasis puntual que nunca retrasa (MOTION-MAP). Nada de `immersive` en páginas de decisión.

**Riesgo.** Convertir la decisión en frialdad total: que el sitio pierda su identidad justo donde más importa comercialmente. O el opuesto: no poder evitar el teatro ni en el checkout.

**Anti-patrón.** Configurator con transiciones de página cinematográficas entre pasos; precio que aparece con cuenta atrás; CTA que entra volando después de 2 segundos de animación.

**Corrección.** La decisión puede ser elegante (material, tipografía, proporción siguen siendo BAYONA) pero no puede ser lenta ni ruidosa. Regla de oro: si el movimiento añade un solo segundo entre el visitante y su elección, sobra.

**Decisión futura que condiciona.** Qué páginas quedan clasificadas como decisión/conversión en la matriz (Bloque 5); el tratamiento quiet del embudo completo; dónde puede y no puede haber acento narrativo cerca de un CTA.

---

### D.11 VERIFICACIÓN CRÍTICA DE LA ESTRUCTURA (mandato del auditor)

Comprobación ejecutada durante el Bloque 1: duplicados, principios de relleno, dimensiones faltantes.

**Solapamientos evaluados:**

1. **Humanidad (D.7) vs. Acompañamiento (D.8):** no son lo mismo. La humanidad gobierna la **representación** (personas reales, voz adulta, fotografía biográfica); el acompañamiento gobierna la **función** (qué hace BAYONA por ti: lee, construye, acompaña; cómo convierte). Prueba: una página puede tener humanidad sin acompañamiento (una historia) y acompañamiento sin humanidad visible (un checkout acompañado por breadcrumb y continuidad). Se mantienen separados.
2. **Tensión (D.3) vs. Recuperación (D.4):** son fases complementarias del mismo ritmo, no duplicados. La evidencia los trata como pareja (copy de tensión → aspiración serena; movimiento → reposo en las reglas de calma). Ninguno existe sin el otro. Se mantienen.
3. **Materia (D.5) vs. Profundidad (D.6):** la materia es la calidad de cada plano; la profundidad es la relación entre planos. Decisiones distintas: la materia elige superficie/textura/sombra; la profundidad elige cuántos planos y cómo se mueven entre sí. Se mantienen.
4. **Progresión (D.1) vs. Decisión (D.10):** la progresión ordena el tiempo largo (recorridos, planes, capítulos); la decisión protege el instante puntual de elegir. No hay duplicación.

**Dimensiones candidatas evaluadas y resueltas (sin crear principios nuevos):**

5. **Honestidad / anti-hype:** evaluada como posible principio 11. Resolución: no es un principio paralelo sino la **precisión expresiva** de D.2 (claims tipados, sin promesas) más las prohibiciones de C.2/C.3. Convertirla en principio duplicaría D.2. Registrado como decisión documental (PROPUESTO esta absorción; la evidencia base es CONFIRMADA).
6. **Ciencia:** está en el tagline y en servicios (evaluación biomecánica, composición corporal). Evaluada: no tiene traducción visual/espacial propia — se manifiesta como precisión (D.2) y como contenido de catálogo. No se crea principio; se registra su presencia (DERIVADO).
7. **Método:** evaluado: es la combinación de progresión (D.1) + acompañamiento (D.8) — TE LEEMOS/CONSTRUIMOS/TE ACOMPAÑAMOS es un recorrido acompañado. No se crea principio.
8. **Claridad:** evaluada como principio. Resolución: es una **regla transversal por encima de los principios** (sección J), porque no gobierna una dimensión de la identidad sino el desempate entre todas. Elevarla a principio debilitaría su autoridad de veto.

**Principio con menor densidad de evidencia:** Territorio (D.9). Se mantiene: sin él, la web podría presentarse como SaaS desterritorializado, contradiciendo el catálogo (presencial España, academia física). Su evidencia es real aunque menos abundante; queda señalado para que el Bloque 3 lo trate con cuidado (el mundo que lo herede no debe inventar localía).

**Conclusión:** sin problema material. Se mantienen los 10 principios de la hipótesis aprobada. Ninguno existe solo para llegar a diez; ninguna dimensión estructural confirmada queda fuera.

---

## E. CURVA EMOCIONAL MAESTRA

Derivada de los journeys reales J1–J10 (ROUTE-JOURNEYS.md), no inventada. Método: leer los 10 journeys, identificar los estados emocionales comunes, ordenarlos.

### E.1 Los siete estados del recorrido BAYONA

| Estado | Qué siente el visitante | Dónde ocurre (evidencia J1–J10) |
|---|---|---|
| 1. Descubrimiento | "¿Qué es esto?" — curiosidad sin compromiso | J1 (llega por enlace, no quiere pagar), J6 (curioso de BAYONA+), home tres puertas |
| 2. Orientación | "¿Por dónde empiezo?" — necesidad de dirección | J2 (recepción: umbral → 3 preguntas → ruta), J10 (reentrada con memoria), NextChapter |
| 3. Comparación | "¿Qué me conviene?" — evaluación racional | J2/J3 (comparador, fichas, PDF, calculadora), J8 (dudas antes de pagar) |
| 4. Decisión | "Elijo" — instante de compromiso | J2/J3 (WhatsApp o configurador), fichas de plan, checkout |
| 5. Configuración | "Lo hago mío" — personalización de la elección | J2/J3 (CONFIGURADOR: plan → clases → extras → datos) |
| 6. Contacto | "Hablo con alguien" — conversión como conversación | Todos los journeys convergen en WhatsApp (J1–J8); J8 videollamada |
| 7. Continuidad | "¿Qué ocurre ahora?" — post-decisión acompañada | J2/J3 (order-confirmation), J10 (ribbon de memoria), NextChapter |

### E.2 La curva tipo (recorrido completo J2)

```
Descubrimiento (calma) → Orientación (confianza) → [Tensión breve: el problema real]
→ Comparación (claridad) → Decisión (silencio) → Configuración (control)
→ Contacto (humanidad) → Continuidad (serenidad)
```

La tensión aparece como **momento acotado** (D.3), nunca como clima general: el copy editorial la usa al principio ("DESPIERTAS CANSADO") y la resuelve en aspiración serena ("Despiertas con más energía"). La curva termina siempre en recuperación/continuidad, nunca en clímax: la conversión de BAYONA es el inicio de una relación, no un final épico (DERIVADO de J2/order-confirmation).

### E.3 La curva no es igual para todas las páginas (clases de curva)

| Clase de página | Curva emocional | Regla |
|---|---|---|
| **Narrativa** (home, about, parkour) | Descubrimiento → tensión breve → inmersión → recuperación | Admite un momento immersive; la narrativa sirve a la identidad |
| **Lectura** (resources, faq, about-parcial) | Calma sostenida con jerarquía | Sin tensión narrativa; el movimiento no interrumpe la lectura |
| **Decisión** (fichas de plan, programs) | Claridad → silencio de decisión | `quiet`; el CTA sin retraso; la emoción no estorba |
| **Conversión** (checkout, order-confirmation) | Control → serenidad | Cero distracción; continuidad acompañada |
| **Recuperación** (404) | Desorientación → recolocación | Nunca callejón sin salida; tono sereno, sin culpa |

### E.4 Los cuatro estados emocionales que el sistema debe saber producir

- **TENSIÓN:** contenida, breve, resuelta (D.3). Herramientas: copy editorial, un momento immersive, contraste de composición.
- **RECUPERACIÓN:** reposo activo que prepara lo siguiente (D.4). Herramientas: zonas quiet, cierres serenos, 404 que recoloca.
- **CLARIDAD:** eliminación de ruido cuando hay datos o decisiones (D.2/D.10). Herramientas: jerarquía, `data-cascade` contenida, silencio alrededor del dato.
- **DECISIÓN:** el instante protegido (D.10). Herramientas: CTA visible sin retraso, precio público, salida humana.

**Regla vinculante:** la emoción nunca puede reducir la claridad (ver sección J).

---

## F. MATERIALIDAD

### F.1 Materialidad literal (lo que existe hoy — CONFIRMADO)

| Material | Existencia real | Fuente |
|---|---|---|
| Superficies | 5 superficies `--ds-surface-*` (#050505 / #0B0B0C / #0c0c0d / #111111 / #141416) + glass con presupuesto | ds-tokens.css |
| Sombras | `--ds-shadow-lift` (contacto + caída larga), `--ds-shadow-lift-warm` (brasa cálida) | ds-tokens.css |
| Color | Acento #F4A261 / fire #E76F51 / deep #D45D38; tinta white / muted #A3A3A3 / dim #6b6b6b | ds-tokens.css |
| Tipografía | Montserrat (titulares), Inter (cuerpo), DM Mono (etiquetas); escala display→eyebrow | ds-tokens.css |
| Radios | sharp 0 (defecto de marca), control 10, float 16, round | ds-tokens.css |
| Grano | Grano de película (SVG feTurbulence) en la capa luxury de Fase 1; estático bajo reduced-motion | v3-finish.css (HISTÓRICO de Fase 1, existente) |
| Fotografía | Personas reales en testimonios; fotografía de apoyo con parallax contenido | testimonials.js, image-drift |
| Movimiento | 8 recetas + intensidades + presupuesto (material cinético) | engine/recipes |

### F.2 Materialidad sugerida (cualidades que orientan fases futuras — PROPUESTO)

No son componentes ni tokens: son cualidades perceptivas que las futuras implementaciones deben respetar.

- **Textura:** el grano como ambiente de película, nunca como ruido visible; la textura sirve a la materia (D.5), no la sustituye.
- **Contraste:** la luz se gana por diferencia entre superficies, no por brillo añadido ("el problema era la luz, no el color" — DESIGN-SYSTEM §6).
- **Densidad:** alterna deliberadamente (lleno editorial ↔ vacío estructural); el vacío es material de composición.
- **Temperatura:** la familia del acento es brasa contenida (naranja → fuego → profundo); el conjunto es oscuro y cálido en los puntos de acción, frío-neutro en la lectura.
- **Peso:** los elementos importantes se sienten pesados (tipografía grande, sombras lift, reposo); nada flota sin razón.

### F.3 Materialidad prohibida (CONFIRMADO — §38 + §7 + regla del auditor)

- **Neón gratuito** y paletas de energía fluorescente (ajenas a la dirección oscura/editorial/adulta).
- **Glow excesivo:** el brillo es brasa puntual, no atmósfera permanente.
- **Glassmorphism indiscriminado:** el glass existe con presupuesto (≥900px, con soporte) — no es lenguaje general.
- **Estética sci-fi genérica:** partículas azules, hologramas, HUDs — BAYONA es cuerpo y lugar, no nave espacial.
- **Fitness motivacional genérico:** tipografías de impacto, rojo agresivo, cuerpos de stock en pleno grito.
- **Lujo vacío:** dorados ornamentales, mármol digital, "premium" sin estructura.
- **Efectos decorativos sin función:** todo material debe poder responder para qué está.

---

## G. LUZ

Seis tipos de luz, definidos sobre el sistema existente. **Prohibido inventar tokens nuevos** (alcance de Fase 6). Esto es lenguaje y criterio, no CSS.

### G.1 Luz de fondo
La que emana de las superficies mismas: la escalera #050505 → #141416 ES el sistema de luz base (CONFIRMADO). El fondo no es negro muerto: es una gradación fina que ya distingue planos. Regla: el fondo se ilumina cambiando de superficie, no añadiendo brillo (DERIVADO de §42).

### G.2 Luz de acento
El fuego contenido: #F4A261 / #E76F51 / #D45D38 (CONFIRMADO). Es luz direccional de atención — marca acción, jerarquía y brasa. Regla de economía: el acento señala; si todo es acento, nada lo es (PROPUESTO como regla de uso; los tokens son CONFIRMADO).

### G.3 Luz de plano
La que separa elevación: sombras `--ds-shadow-lift` y `--ds-shadow-lift-warm` (CONFIRMADO). Un plano se percibe elevado porque proyecta, no porque brilla. Regla: la sombra es el lenguaje de la elevación; el glass aporta separación por translucidez con presupuesto (CONFIRMADO).

### G.4 Luz tipográfica
La jerarquía como iluminación: white (protagonista) → #A3A3A3 (secundario) → #6b6b6b (apoyo) (CONFIRMADO). El texto se "ilumina" por contraste de tinta, no por efectos. Regla: la lectura nunca depende de animación ni de brillo para ser legible (DERIVADO de §44).

### G.5 Luz fotográfica
La que trae la imagen real: fotografía con luz propia (natural, de sesión, de lugar). Regla: la fotografía es material de primera clase para la profundidad (image-drift) y la humanidad (D.7); su luz no se contamina con overlays gratuitos (PROPUESTO como criterio).

### G.6 Luz de escena
La luz del plano excepcional 3D (hoy: Globe3D en /about; mañana: lo que Fase 7 justifique). **Definir la luz de escena NO es implementar 3D** — es establecer que, cuando exista escena, su luz debe responder a la idea de la página (§39) y degradar a un estado estático coherente con las cinco luces anteriores (fallback antes que escena, CONFIRMADO como arquitectura en BASELINE/PHASE5).

---

## H. PROFUNDIDAD

### H.1 Los cuatro tipos de profundidad

1. **Profundidad documental** (CONFIRMADO/PROPUESTO): la que da el sistema de información — capítulos, itinerario, breadcrumb, NextChapter, ribbon. El visitante percibe que hay más detrás porque el sitio lo revela por pasos (D.1). No requiere ningún efecto visual.
2. **Profundidad visual** (CONFIRMADO): la escalera de superficies + sombras + glass. Planos conceptuales: fondo (background/deep) → contenido (content) → elevado (raised) → overlay. **Disciplina:** correspondencia conceptual, no equivalencia técnica automática — una superficie CSS no es automáticamente un plano narrativo (regla del auditor). No se inventan superficies nuevas.
3. **Profundidad espacial** (CONFIRMADO como gramática disponible): la que crea el movimiento entre planos — `image-drift` (parallax contenido), `cinematic-stage` (evolución por estados), composición que mueve elementos entre planos durante el scroll (§35).
4. **Profundidad 3D excepcional** (CONFIRMADO como excepción viva): Globe3D en /about es hoy la única escena. Regla: **el plano 3D es una excepción que requiere justificación, no una capa obligatoria** (§39: "¿Qué idea de la página representa este objeto?"). Su admisión completa se define en WORLD-3D-STRATEGY (Bloque transversal, aún no escrito).

### H.2 Reglas de profundidad

- Una página elige su estrategia dominante (documental, visual, espacial o 3D) y subordina las demás (PROPUESTO, derivado de la regla "un momento immersive por página").
- El plano de lectura nunca compite con el plano de espectáculo (DERIVADO de SCROLL-STORY-MATRIX: decisión/lectura sin sticky ni horizontal).
- Mobile: menos capas, menos partículas, menor DPR, menos animación simultánea — la profundidad se conserva por composición, no por efectos (§43, CONFIRMADO).
- Reduced-motion: la profundidad queda en la composición y la jerarquía; el movimiento no es requisito para percibir planos (§44, CONFIRMADO).

---

## I. DENSIDAD Y RITMO

Compatibilidad explícita con el sistema existente — sin sinónimos paralelos (prohibido introducir calm/medium/intense).

### I.1 Las tres intensidades son el vocabulario único (CONFIRMADO — intensity.js)

| Intensidad | Carácter | Densidad que gobierna |
|---|---|---|
| `quiet` | Calma máxima, una cosa a la vez | Lectura, datos, fichas, cierres, decisión |
| `balanced` | Estándar BAYONA (default) | Comportamiento general; hasta 2 elementos simultáneos |
| `immersive` | Narrativa espacial completa | Un único momento narrativo por página |

### I.2 El presupuesto por zonas es la ley de densidad (CONFIRMADO — motionBudget.js)

`hero 3 / body 2 / supporting 1 / cta 2 / background 0`, con límites por intensidad (`quiet 6 · balanced 8 · immersive 10`) y máximo una zona de peso 3. Traducción identitaria: **BAYONA gasta movimiento donde comunica, no donde decora** — el fondo pesa 0 porque el fondo de BAYONA es silencio (DERIVADO).

### I.3 Ritmo

- **Micro > macro:** movimientos pequeños y precisos antes que grandes gestos (regla de calma CONFIRMADA; principio D.2).
- **Alternancia movimiento → reposo:** la base del ritmo BAYONA (D.3/D.4 como pareja).
- **Sin rebotes, overshoot, elasticidad ni flashes** (CONFIRMADO): el ritmo de BAYONA es de respiración, no de percusión.
- **Duraciones cerradas** (fast/base/slow/curtain) y distancias cerradas (near/medium/far): el ritmo no se improvisa, se declara (CONFIRMADO — motionTokens.js).

### I.4 Regla de densidad por clase de página (PROPUESTO, derivado de SCROLL-STORY-MATRIX)

- Decisión/conversión: densidad mínima de movimiento (`quiet`), densidad máxima de claridad.
- Lectura: movimiento de revelado contenido; la densidad la lleva la tipografía.
- Narrativa: densidad alta permitida en UN momento; el resto respira.
- Recuperación: densidad mínima en todo.

---

## J. PRINCIPIO DE CLARIDAD (regla de veto)

**Cuando identidad y claridad entren en conflicto en una página de decisión o conversión: LA CLARIDAD GANA.**

- El movimiento sirve a la decisión, no al revés (CONFIRMADO como regla viva: "el CTA primario nunca se retrasa por movimiento" — MOTION-MAP; "máxima claridad, cero distracción" — checkout en SCROLL-STORY-MATRIX).
- La emoción nunca puede reducir la claridad (regla del auditor, Bloque 1).
- Esta regla está **por encima de los 10 principios**: cualquier principio (tensión, profundidad, materia) cede ante ella en zona de decisión. No es un principio más porque no describe la identidad: la limita donde hace falta (ver D.11.8).
- Alcance exacto: rige en páginas de decisión y conversión. En páginas narrativas, la identidad puede llevar el peso — sin eliminar nunca la legibilidad ni la salida (§44: el contenido se entiende sin animación).

---

## K. AUTOAUDITORÍA DEL ADN

### K.1 TEST 1 — Anti-genericidad

**Pregunta:** ¿podría este documento describir cualquier gimnasio premium?

**Resultado: NO.** Especificidad BAYONA verificable en cada sección:
- El producto es acompañamiento humano estructurado, no acceso (B.2, evidencia de offerings.js).
- La honestidad es un sistema operativo con claims tipados, no un tono (B.3, CLAIM_TYPES).
- La conversión es una conversación por WhatsApp sin pago online, no un checkout (B.7).
- El territorio es real y limitado (presencial España, academia con sede), no global ficticio (B.5/D.9).
- El ritmo es respiración con presupuesto, no estímulo constante (I.2/I.3).
- Los testimonios son biografías (postparto, dolor de espalda, familia), no arquetipos (B.4).
Un gimnasio genérico no podría usar este documento sin borrar la mitad: no vende acompañamiento tipado, no convierte por conversación, no declara sus límites.

### K.2 TEST 2 — Anti-copia

**Resultado: PASA.** Ningún principio, sección o regla deriva de Nike, Apple, Arc'teryx, Porsche, Aesop, Gymshark ni de plantillas Awwwards. Todo deriva de: documentos de identidad del proyecto (DOCUMENTO_MAESTRO §6–7, CONTEXTO-MAESTRO §0/§34–44), decisiones registradas (D-001, D-002, DF-006, D-008), código vivo (offerings, conversionContent, testimonials, ds-tokens, engine) y journeys implementados (J1–J10). La dirección "Awwwards-luxury" (D-001) es un nivel de acabado aprobado por Sebastián, no una plantilla conceptual: este documento define el ADN desde BAYONA, no desde referentes.

### K.3 TEST 3 — Anti-espectáculo

**Pregunta:** ¿cada principio aumenta la claridad y la coherencia o solo hace la web más espectacular?

**Resultado: PASA.** Cuatro de los diez principios son directamente anti-espectáculo: recuperación (D.4), precisión (D.2), decisión (D.10) y la regla J de veto. Los principios de carga (tensión, profundidad, materia) llevan presupuesto incorporado: un momento por página, materiales con límite, planos subordinados a la lectura. Ningún principio ordena añadir efectos; todos ordenan decidir. La pregunta de admisión 3D ("¿qué idea representa este objeto?") está incorporada en H.1.4.

### K.4 TEST 4 — Anti-vocabulario paralelo

**Resultado: PASA.** Vocabulario del engine usado exactamente: `quiet/balanced/immersive` (nunca calm/medium/intense); las 8 recetas por su id exacto; zonas `hero/body/supporting/cta/background`; rangos `traverse/enter/pin/exit` no se renombran; duraciones `fast/base/slow/curtain`; distancias `near/medium/far`; tokens `--ds-*` citados por su nombre real. Los términos nuevos de este documento (los 10 principios, los 7 estados de la curva, los 6 tipos de luz, los 4 tipos de profundidad) nombran conceptos identitarios que NO tienen nombre en el engine — no sustituyen ninguno existente. Las correspondencias con el engine se declaran conceptuales, nunca como APIs.

---

---
---

# PARTE II — MUNDOS 00–08

> Añadida en el Bloque 3 (2026-08-28). Prompts rectores: AUTORIZACIÓN DEL AUDITOR — FASE 6 · BLOQUE 3 + PROMPT COMPLEMENTARIO MAESTRO (complementa, no sustituye).
> Condiciones vinculantes: **DF-009** (evidencia), **DF-010** (territorio sin folclore), **DF-011** (diferenciación real — este es el bloque que DF-011 gobierna), **DF-012** (anti-burocracia).
> Documentos padre: PARTE I de este archivo (ADN) y `SPATIAL-LANGUAGE.md` (gramática espacial).
> Estado: **PROPUESTA DOCUMENTAL VINCULANTE** para Bloques 4–5 y Fases 7–8. No implementa nada.
> Las asignaciones de rutas son **PROVISIONALES**: no son blueprints (los blueprints son el Bloque 4).

## L. PROPÓSITO: QUÉ ES UN MUNDO

**Un mundo no es un tema, ni una paleta, ni un nombre bonito. Un mundo es un sistema de decisiones.** (Principio rector del Bloque 3, mandato del auditor.)

Cada mundo decide a la vez **once dimensiones**: función · pregunta del visitante · emoción · organización de la información · espacio · densidad · luz · materia · movimiento · profundidad · prohibiciones. Si dos mundos solo se diferencian en el nombre o en el tono del acento, no son dos mundos: son el mismo mundo duplicado (DF-011).

**Mundo ≠ tema.** Dos mundos pueden compartir negro, naranja, Montserrat y grano, y ser radicalmente distintos si sus decisiones difieren: uno puede vivir de datos compactos y otro de una sola voz en silencio. La diferenciación es estructural, no decorativa.

**Regla de oro del Bloque 3:** primero se diseña la función, el estado, la decisión, el ritmo y la jerarquía; después se traduce a lo visual. Nunca al revés.

**Pregunta central de cada mundo:** ¿qué experiencia mental vive aquí el usuario que no vive igual en ningún otro mundo? Cada ficha la responde en su primera línea.

**Relación con la Parte I:** los mundos expresan los 10 principios del ADN en proporciones distintas; cada ficha declara sus principios prioritarios.

**Relación con SPATIAL-LANGUAGE:** los mundos se construyen SOBRE los 7 estados espaciales, pero no fijan secuencias mecánicas: cada mundo declara sus estados naturales, raros e incompatibles. La secuencia completa sigue sin ser plantilla (SPATIAL-LANGUAGE §1).

**Relación con las rutas:** los mundos no fuerzan rutas para justificarse. El equilibrio numérico NO es calidad: un mundo puede habitar cinco rutas y otro una sola. Las asignaciones de este documento son hipótesis de trabajo provisionales para el Bloque 4.

**Regla de orden:** la numeración 00–08 es un índice de construcción (del origen a la continuidad), no un recorrido obligatorio. Ningún visitante recorre los mundos en orden (ver §Y.3).

## M. REGLAS DE CONSTRUCCIÓN

### M.1 Método y evidencia

1. **Evidencia primero (DF-009).** Cada mundo necesita al menos: 1 fuente de negocio + 1 fuente de experiencia + 1 fuente de identidad. La evidencia negativa es válida: "existe porque algo no cabe bien en otro mundo".
2. **Test de existencia por mundo.** A. Necesidad con evidencia · B. Pregunta del visitante derivada de journeys reales · C. Irreemplazabilidad (prueba de eliminación: qué pérdida real aparece) · D. Antiuso.
3. **Intercambiabilidad (DF-011).** Si dos mundos resultan intercambiables: identificar en qué se parecen → fusionar, redefinir o reforzar → documentar.
4. **No forzar rutas** para justificar mundos.
5. **Disciplina 3D.** Clasificar únicamente (PROHIBIDO / OPCIONAL / JUSTIFICADO / EXCEPCIONAL). Cero objetos, modelos, geometrías, escenas, prompts, shaders o componentes. **EL 3D NO ES UN PREMIO PARA LOS MUNDOS IMPORTANTES**: un mundo fundamental puede tener 3D PROHIBIDO si su función exige claridad, lectura o decisión. La pregunta de futuro es "¿qué parte del significado sería imposible comunicar mejor sin profundidad espacial?" — define necesidad, no diseña objeto.
6. **Anti-genericidad por mundo:** ¿podría existir igual en cualquier gimnasio premium? Si la respuesta es sí, el mundo se rehace.
7. **Sin copia:** Nike, Apple, Arc'teryx, Porsche, Aesop, Gymshark y plantillas Awwwards son contexto cultural, no plantilla (Parte I, C.6).
8. **Sin vocabulario nuevo del engine** (Parte I, K.4): intensidades `quiet/balanced/immersive`, las 8 recetas por su id, zonas y rangos existentes. Las relaciones con el engine se heredan de SCROLL-STORY-MATRIX (documento aprobado) y se citan, no se inventan.

### M.2 Preferencias y principios del producto

9. **Preferencia del propietario (CONFIRMADO como preferencia expresada):** "información pequeña, compacta, agrupada y fácilmente legible". La identidad de BAYONA no debe depender de titular gigante + párrafo + imagen. Lenguaje editorial compacto: eyebrows, etiquetas, metadatos, numeración, microcopy — piezas ya existentes (DM Mono, marcadores `01/02/03` de conversionContent).
10. **Memoria visual:** cada mundo debe poder reconocerse en una captura sin leer la URL — por su estructura, no porque "el naranja es diferente". Cada ficha declara su elemento de identificación.
11. **Sistema de símbolos:** solo si se demuestra función real. El Bloque 3 no inventa símbolos; registra los existentes (numeración editorial, tres puertas, etiquetas DM Mono, avatar circular).
12. **La paz como principio de producto (DERIVADO de evidencia confirmada):** sin urgencia fabricada (el contador hardcodeado de ELITE fue retirado del código con explicación explícita — `offerings.js`), `quiet` como intensidad de lectura/decisión/cierre, "sin humo ni promesas de resultado" (routeMeta), checkout que declara "aquí no se procesa ningún pago". Paz = saber dónde estás, entender, no ser perseguido, encontrar la siguiente acción.
13. **Propósito sin iconografía religiosa (PROPUESTO como criterio; evidencia base CONFIRMADA):** el propietario quiere BAYONA conectada a transformación personal, paz y propósito; el tagline declara "propósito humano". El propósito aparece como sentido, dirección, disciplina, gratitud, acompañamiento y transformación interior. Cero cruces, halos, iglesias ni estética religiosa. El catálogo actual no contiene contenido explícitamente religioso → no se inventa. Si el propietario quisiera hacerlo explícito algún día, es decisión humana y se registra aparte.
14. **No manipulación:** sin miedo, sin urgencia falsa, sin escasez falsa, sin culpa, sin presión. Información progresiva: nunca se oculta precio, CTA o condición crítica. Reversibilidad y acceso directo: la narrativa nunca quita atajos a quien sabe lo que quiere (J3 existe — CONFIRMADO).
15. **Los mundos no sustituyen la navegación:** Navbar, Breadcrumb, JourneyRibbon y NextChapter permanecen intactos (doctrina D12, FASE4). No se crea un quinto sistema de navegación disfrazado.
16. **Regulación emocional:** cada mundo produce calma, claridad, profundidad o confianza. Ningún mundo produce ansiedad, FOMO, presión ni urgencia.
17. **Definiciones contra el cliché:** humanidad ≠ fotos de personas; ciencia ≠ gráficos (evitar el cliché "dashboard fitness"); premium ≠ vacío, ni imágenes grandes, ni efectos (sin glow, partículas, distorsiones ni parallax por defecto).
18. **NO TODO DEBE IMPACTAR:** el sistema distribuye momentos — 1 gran momento narrativo (home), momentos normales (parkour, about) y momentos pequeños (reveals, rails, transiciones). Distribución derivada del presupuesto vivo: máximo un `immersive` por página (SCROLL-STORY-MATRIX, CONFIRMADO).

### M.3 Reglas de forma

19. **Cobertura de atributos sin burocracia (DF-012 + §14 del prompt rector).** Los atributos obligatorios se cubren por secciones agrupadas; no se falsifica el cumplimiento contando. Correspondencia: función narrativa y emoción objetivo → "Función y psicología" · materialidad, luz dominante, densidad y sonido visual → "Materia, luz y densidad" · movimiento, intensidad, receta principal y secundaria → "Movimiento" · profundidad y clasificación 3D → "Profundidad y 3D" · uso permitido y antiuso → "Uso y antiuso" · rutas que lo habitan → "Rutas que lo habitan".
20. **Jerarquía de autoridad:** 1 evidencia · 2 verdad del producto · 3 claridad · 4 coherencia de marca · 5 experiencia · 6 espectacularidad. La espectacularidad nunca gana a la claridad.
21. **Excepciones:** máximo 1–2 por mundo, documentadas como regla / excepción / motivo / límite.
22. **Regla de familia para los planes:** las 4 fichas de plan son EL MISMO MUNDO (07 DECISIÓN) con matices de acompañamiento, no 4 mundos distintos. Lo que varía es el grado de acompañamiento (CONFIRMADO — `planEditorialOverlays`: "Base guiada" → "Entrenamiento acompañado" → "Seguimiento avanzado" → "Acompañamiento privado"). No se inventan productos, precios ni claims. DP-5 intacto.

---

## N. MUNDO 00 — ORIGEN

**Pregunta central.** ¿Qué es esto y por dónde empiezo? Experiencia mental: ser recibido sin ser empujado; orientación sin tener que pedirla.

**Test de existencia.**
- **A. Necesidad (evidencia).** BAYONA recibe visitantes distintos — curioso (J1), comparador (J2), decidido (J3) — y desorientados (J9). Sin un mundo de recepción, todos chocarían con el mismo muro de contenido. Evidencia: tres puertas de la home EXPLORAR / ENCONTRAR MI CAMINO / VER PLANES (PAGE-EXPERIENCE-MATRIX fila 1, CONFIRMADO); onboarding umbral → 3 preguntas → ruta (J2, CONFIRMADO); 404 con 4 tarjetas de recolocación, "nunca callejón sin salida" (J9, CONFIRMADO).
- **B. Pregunta del visitante.** "¿Qué es BAYONA y por dónde empiezo?" (fila 1) y "¿Cuál es mi camino?" (fila 16) — CONFIRMADO.
- **C. Irreemplazabilidad.** Si se elimina, J1/J2/J9 se rompen: el sitio pierde el umbral y la entrada se convierte en catálogo o en espectáculo.
- **D. Antiuso.** No es catálogo (eso es EXPERIENCIA/MÉTODO), no es espectáculo narrativo que retrasa la orientación, no es onboarding que retiene (J3 necesita atajo).

**Función y psicología.**
- Función narrativa: recibir y orientar. Función humana: primer acompañamiento sereno (D.8). Función de negocio: entrada correcta del embudo (pre-embudo, CONFIRMADO — col. 12).
- Estado de atención: recepción abierta, compromiso bajo. Carga cognitiva: baja (puertas, no contenido). Modo de atención: panorámico → selectivo (elegir puerta). Riesgo cognitivo: desorientación si las puertas no son claras; sobreestímulo si la entrada es espectáculo.
- Emoción objetivo: confianza serena — "he llegado a un sitio con nombre". Regulación emocional: sin ansiedad, sin urgencia.
- Principios prioritarios del ADN: Acompañamiento (D.8), Precisión (D.2), Progresión (D.1).
- Eje humano ↔ sistémico: sistémico (un sistema de puertas recibe). Percepción temporal: presente puro — "dónde empiezo ahora".

**Espacio y composición.**
- Geometría de información: radial — puertas alrededor de un centro (tres puertas, CONFIRMADO); onboarding: túnel de pasos con salida.
- Escala: humana. Verticalidad: centrada con salidas; onboarding lineal por pasos. Distancia percibida: cerca — las puertas están a mano; el visitante no mira desde lejos, es recibido.
- Estados espaciales (SPATIAL-LANGUAGE): naturales ENTRADA y APROXIMACIÓN; rara DECISIÓN (solo como ruta recomendada suave, D9); incompatibles TENSIÓN en frío (§3.2: no hay tensión sin aproximación) e INMERSIÓN como clima permanente (la home la admite como momento único).
- Jerarquía de atención: PRIMERO las puertas · SEGUNDO la definición del método (una línea) · TERCERO la continuidad (NextChapter) · CUARTO nada más (la entrada no añade).

**Materia, luz y densidad.**
- Materialidad dominante: superficies de fondo (background/deep) con peso tipográfico; la home admite plano fotográfico en su momento único.
- Luz dominante: de fondo (escalera de superficies) + tipográfica (jerarquía de puertas); acento solo en la puerta principal.
- Densidad: baja-media; información agrupada y legible (preferencia del propietario, M.2.9).
- Silencio (material): respira entre puertas (sin estímulos encadenados); se concentra en el umbral del onboarding (sin chrome — J2); cambia al recomendarse la ruta.
- Sonido visual: cadencia lenta; sin repetición (sin marquee en la entrada); grafismo de etiquetas DM Mono en puertas.

**Movimiento.**
- Intensidad: `balanced` como régimen (CONFIRMADO — `/onboarding` balanced); `/` admite el único momento `immersive` (CONFIRMADO — SCROLL-STORY-MATRIX: "el método se presenta como un recorrido espacial sereno"); `/entrar` en `quiet`.
- Receta principal: `quiet-transition` (recepción serena). Receta secundaria: `editorial-slide` (cada paso del onboarding señala dirección y progreso).
- Herencia de motion (SCROLL-STORY-MATRIX, sin modificar): `/` = immersive · cinematic-stage + image-drift · sticky ● · parallax ● · text mask · 3D futuro ○ · `/onboarding` = balanced · editorial-slide + quiet-transition · mask · `/entrar` = quiet · quiet-transition.

**Profundidad y 3D.**
- Profundidad dominante: documental (hay más detrás: itinerario, capítulos) + visual (escalera de superficies).
- Clasificación 3D: **OPCIONAL**. Razón: la home ya tiene momento narrativo con candidato 3D futuro (○, CONFIRMADO en matriz). Si una escena existiera, debería representar "el método como recorrido con dirección" (objetivo narrativo de la fila). Onboarding: sin 3D (umbral sin chrome). Clasificación ≠ implementación: deciden Bloque 4 y Fase 7.
- Necesidad conceptual futura: el recorrido con dirección podría ganar con profundidad espacial; hoy no está demostrado que haga falta.

**Medios.**
- Medio dominante: tipografía (puertas, jerarquía). Apoyo: composición (distribución radial), movimiento (momento único en `/`). Prohibidos: catálogo (tarjetas con precio), fotografía protagonista fuera del momento único, 3D en onboarding.

**Uso y antiuso.**
- Uso permitido: recibir, orientar, ofrecer puertas, recomendar ruta (D9), recolocar (404).
- Antiuso específico: vender en la entrada (la conversión no es función de ORIGEN); retener con pasos obligatorios; dramatizar con tensión sin aproximación; convertir la home en marketplace.
- Fricción: reducir al mínimo (sin cuenta, sin datos — "Sin crear cuenta y sin compromiso", routeMeta onboarding, CONFIRMADO); mantener las 3 preguntas de recepción (fricción funcional: TE LEEMOS antes de recomendar); evitar fricción accidental (puertas ambiguas).
- Next-best-action: elegir puerta (home) · responder 3 preguntas (onboarding) · volver a un acceso (404).

**Herencia y variación.**
- Hereda del ADN: acompañamiento como recepción, precisión de puertas, progresión como itinerario.
- Introduce: geometría radial de puertas; umbral sin chrome (único del sistema).
- Nunca cambia: salida siempre visible; orientación antes que petición; sin tensión en frío.
- Excepción (1): momento único `immersive` en la home — regla: la raíz presenta el método como recorrido espacial; motivo: es el único lugar donde el método se presenta entero; límite: un solo momento, CTA nunca retrasado.

**Rutas que lo habitan (provisional).** Núcleo: `/`, `/onboarding` (+ alias `/entrar`). Periferia: 404 (recepción sin contexto — J9 recoloca con el tono de ORIGEN). `/design-system` (interna, categoría D) no habita mundo.

**Resiliencia.** Sin color: fuerte (las puertas funcionan por jerarquía). Sin imagen: fuerte. Sin 3D: fuerte (opcional; el momento de home degrada a estados apilados — comportamiento CONFIRMADO de `cinematic-stage`). Sin motion: fuerte (las puertas están; no necesitan entrar volando — SPATIAL-LANGUAGE §6). Mobile 390px: fuerte (puertas apiladas). Identidad conservada: **fuerte**.

**Implicación Fase 7:** si se admite escena en home, debe representar "recorrido con dirección" y degradar a estado estático coherente (fallback antes que escena). **Implicación Fase 8:** los contratos de home/onboarding heredan este mundo según SCROLL-STORY-MATRIX. **Herencia de UX (Fase 4):** home = raíz/orientación con tres puertas (validadas D11); onboarding = recepción con CTA final al plan recomendado (D9); 404 = recolocación.

**Anti-genericidad.** ¿Podría existir igual en cualquier gimnasio premium? NO. Un gimnasio genérico recibe con oferta ("EMPIEZA HOY", countdown). ORIGEN recibe con puertas y una recepción de 3 preguntas que lee antes de recomendar (TE LEEMOS), sin cuenta, sin datos, sin pago. Recepción como acompañamiento, no como captura.

**Elemento de identificación visual:** las tres puertas / el umbral sin chrome.

---

## O. MUNDO 01 — CUERPO

> **Refinamiento de definición documentado (M.1.3).** La hipótesis de partida "CUERPO" podía leerse como cuerpo-estética (cliché fitness). Definición refinada: **el cuerpo como realidad y biografía** — punto de partida, testimonio y cuidado. Evidencia del refinamiento: "TU CUERPO TE HABLA / Espalda, rodillas, cuello" (conversionContent, CONFIRMADO); testimonios como situaciones vitales concretas (testimonials.js, CONFIRMADO); categoría RECUPERACIÓN "Cuida tu cuerpo" (offerings.js, CONFIRMADO). Mejora: evita el cliché aspiracional y ancla la humanidad (D.7).

**Pregunta central.** ¿Quién ha pasado por esto, y qué pasa con mi cuerpo? Experiencia mental: reconocimiento — "esto habla de mi cuerpo y de mi situación; gente como yo ya lo hizo".

**Test de existencia.**
- **A. Necesidad (evidencia).** BAYONA acompaña cuerpos reales en situaciones concretas: postparto (Mai), dolor de espalda (Carlos), falta de tiempo (Paola), 50 años (Martín), una familia entera (Familia Rusa) — 10 experiencias publicadas con nombre, edad, oficio y ciudad (testimonials.js, CONFIRMADO). Sin el mundo del cuerpo, la prueba social sería stock aspiracional y el sitio perdería su diferenciador más fuerte (Parte I, B.4).
- **B. Pregunta del visitante.** "¿Quién hay detrás?" (PAGE-EXPERIENCE-MATRIX fila 2, CONFIRMADO). Derivada de journeys: J2 pasa por `/about` vía NextChapter; la home cierra explícitamente con "ANTES DE ELEGIR UN PLAN, CONOCE POR QUÉ EXISTE BAYONA" (bloque home-action, CONFIRMADO).
- **C. Irreemplazabilidad (prueba de eliminación).** Si se elimina, BAYONA se convierte en método sin caras: desaparece la prueba biográfica (el activo de prueba social más fuerte de la marca, según el propio comentario de `testimonials.js`) y el "propósito humano" del tagline pierde soporte.
- **D. Antiuso.** No es galería de cuerpos aspiracionales, no es muro decorativo de testimonios, no es claim médico (marco no médico — `COMMERCIAL_SCOPE_NOTICE`, CONFIRMADO).

**Función y psicología.**
- Función narrativa: reconocimiento y prueba por biografía. Función humana: "no estás solo; esto ya se ha vivido". Función de negocio: confianza antes de la decisión (about es pre-embudo, CONFIRMADO).
- Estado de atención: lectura empática. Carga cognitiva: media (las biografías se leen, no se escanean). Modo de atención: secuencial, persona a persona. Riesgo cognitivo: convertir el dolor en espectáculo; confundir experiencia publicada con resultado garantizado (los testimonios son experiencias publicadas con autorización, no evidencia verificada — marco editorial CONFIRMADO en testimonials.js).
- Emoción objetivo: reconocimiento y confianza — "yo podría ser uno de ellos".
- Principios prioritarios: Humanidad (D.7), Materia (D.5 — retrato, grano), Recuperación (D.4 — el cuerpo que se cuida).
- Eje humano ↔ sistémico: humano (el mundo más humano del sistema). Percepción temporal: pasado-presente — biografías de lo que el cuerpo atravesó.

**Espacio y composición.**
- Geometría: mosaico / constelación — fragmentos con nombre (retrato + cita + síntesis editorial), no grid uniforme.
- Escala: humana (escala de retrato y de voz). Verticalidad: modular con pausas de lectura; la constelación admite espacialidad 3D (globo) como plano excepcional. Distancia percibida: cerca — la voz habla en primera persona.
- Estados espaciales: naturales DESCUBRIMIENTO (las voces emergen al ritmo de lectura) y APROXIMACIÓN (la historia da contexto); rara TENSIÓN (solo como contraste biográfico contenido, sin drama); incompatibles INMERSIÓN como espectáculo y DECISIÓN (CUERPO no vende: testimonia).
- Jerarquía de atención: PRIMERO la historia (quién está detrás) · SEGUNDO las voces (constelación) · TERCERO la invitación a conocer el camino · CUARTO la continuidad.

**Materia, luz y densidad.**
- Materialidad dominante: fotografía de personas reales (luz biográfica), superficies content/raised, grano contenido.
- Luz dominante: fotográfica (la imagen trae su propia luz — Parte I, G.5) + tipográfica para las voces.
- Densidad: media; información compacta por voz: retrato + nombre + edad + oficio + cita + síntesis (estructura existente, CONFIRMADO).
- Silencio: respira entre voces (una cada vez, `editorial-reveal`); se concentra en la historia del fundador; cambia al entrar en el globo (plano excepcional).
- Sonido visual: cadencia de voces alternadas (cita → silencio → cita); repetición como ritmo de fragmento (nunca marquee de rostros); grafismo: síntesis editorial en DM Mono ("Hábitos transformados").

**Movimiento.**
- Intensidad: `balanced` (CONFIRMADO — `/about` balanced en SCROLL-STORY-MATRIX).
- Receta principal: `editorial-reveal` (la historia y las voces se leen con calma). Receta secundaria: `image-drift` (la fotografía da profundidad sin mareo).
- Herencia de motion (sin modificar): `/about` = balanced · editorial-reveal + image-drift · parallax ○ · text mask.

**Profundidad y 3D.**
- Profundidad dominante: visual (planos fotográficos) + plano 3D excepcional (globo).
- Clasificación 3D: **EXCEPCIONAL**. Razón: CUERPO ya aloja la única escena viva del sitio — Globe3D montada en `/about` (About.jsx:194, CONFIRMADO). Idea que representa: constelación de voces reales — 10 experiencias publicadas con geografía real (Bogotá, Valencia, Madrid, Miami, Buenos Aires; CONFIRMADO — testimonials.js). El globo no es una esfera porque sea fácil hacerla: es el mapa de personas que entrenaron. Qué parte del significado sería imposible comunicar mejor sin profundidad espacial: la simultaneidad de voces dispersas en lugares reales.
- Disciplina: EXCEPCIONAL no significa "más 3D" — el globo tiene fallback estático (fallback antes que escena, CONFIRMADO como arquitectura) y no compite con la lectura de las voces.

**Medios.**
- Medio dominante: fotografía (retrato real). Apoyo: tipografía (voz en primera persona), 3D (constelación, excepcional). Prohibidos: datos como protagonista (métricas, gráficas — ciencia ≠ dashboard), stock, vídeo-espectáculo.

**Uso y antiuso.**
- Uso permitido: testimoniar, reconocer, dar cara al método, contar la historia de quien está detrás.
- Antiuso específico: prometer resultados a través de testimonios (CLAIM_TYPES lo impide); convertir el dolor en drama; estetizar cuerpos; inventar personas o resultados; usar los testimonios como muro decorativo.
- Fricción: reducir a la lectura; evitar carruseles automáticos de rostros.
- Next-best-action: "conocer mi camino" (CTA de about a WhatsApp, CONFIRMADO fila 2) · continuar el itinerario (NextChapter).

**Herencia y variación.**
- Hereda: humanidad como representación, materia del retrato, prueba biográfica.
- Introduce: geometría de mosaico con nombres; el plano 3D excepcional (único del sistema).
- Nunca cambia: nombres reales, experiencias publicadas (no evidencia verificada), marco no médico, sin drama.
- Excepción (1): el globo como escena 3D — regla: la geografía real de las voces pide espacialidad; motivo: es la idea de la página (constelación); límite: solo en `/about`, con fallback estático, sin competir con la lectura.

**Rutas que lo habitan (provisional).** Núcleo: `/about`. Periferia: la zona de voces de la home (4 testimonios seleccionados = las 4 objeciones más frecuentes: Mai, Carlos, Martín, Paola — `HOME_TESTIMONIAL_IDS`, CONFIRMADO) funciona como puente hacia CUERPO; la home sigue siendo ORIGEN.

**Resiliencia.** Sin color: fuerte (retrato y voz funcionan en blanco y negro). Sin imagen: adecuada (las voces con nombre sostienen la función; se pierde materialidad, no función). Sin 3D: fuerte (el globo degrada a estado estático; el mosaico de voces permanece). Sin motion: fuerte (`editorial-reveal` → visible al instante). Mobile 390px: fuerte (el mosaico se vuelve columna; el globo degrada). Identidad conservada: **fuerte** (nombre + voz identifican sin URL).

**Implicación Fase 7:** el globo es la referencia viva; cualquier evolución debe proteger la lectura y el fallback. No se propone segunda escena para CUERPO. **Implicación Fase 8:** contrato de `/about` = balanced + editorial-reveal + image-drift + globo con handoff. **Herencia de UX:** about = marca, "¿Quién hay detrás?", CTA "conocer mi camino" (Fase 4 fila 2).

**Anti-genericidad.** NO. Un gimnasio genérico muestra cuerpos ideales sin biografía. CUERPO muestra situaciones concretas (postparto, espalda, 50 años, falta de tiempo, una familia) con nombre y ciudad, declarándolas experiencias publicadas, no promesas — y pone en el centro el cuerpo más vulnerable, no el más estético.

**Nota de propósito:** la transformación interior aparece aquí como testimonio ("cambió mi cuerpo, mi mente y mi empresa") — como sentido, sin iconografía religiosa (M.2.13).

**Elemento de identificación visual:** la constelación de retratos con nombre.

---

## P. MUNDO 02 — MÉTODO

**Pregunta central.** ¿Cómo funciona esto, cómo se estructura lo que voy a hacer? Experiencia mental: comprender el sistema — "esto tiene orden; sé qué haré cada día".

**Test de existencia.**
- **A. Necesidad (evidencia).** BAYONA vende estructura, no motivación: "NO DEPENDES DE TU MOTIVACIÓN", "DEJAS DE IMPROVISAR", "CADA SESIÓN TIENE UN OBJETIVO" (conversionContent, CONFIRMADO). La oferta son 4 niveles de acompañamiento + servicios por sesión, y necesita un mundo que la ordene y compare: TE LEEMOS → CONSTRUIMOS → TE ACOMPAÑAMOS (CONFIRMADO); comparador y calculadora en `/programs` (J3, CONFIRMADO); `membershipComparisonRows` con 8 filas de comparación (offerings.js, CONFIRMADO); 5 audiencias NIÑOS/JÓVENES/ADULTOS/DEPORTISTAS/SENIOR (`programAudiences`, CONFIRMADO).
- **B. Pregunta del visitante.** "¿Qué puedo entrenar y cuánto cuesta?" (fila 3, CONFIRMADO).
- **C. Irreemplazabilidad.** Si se elimina, la oferta no tiene dónde entenderse: J2/J3 se rompen (la comparación es el paso previo a la decisión).
- **D. Antiuso.** No es dashboard de métricas (ciencia ≠ gráficas), no es espectáculo narrativo, no es el lugar donde se decide (eso es DECISIÓN).

**Función y psicología.**
- Función narrativa: explicar la estructura. Función humana: dar certeza ("cada sesión tiene un objetivo"). Función de negocio: entrada del embudo (programs = entrada de embudo, CONFIRMADO col. 12).
- Estado de atención: comparación activa. Carga cognitiva: alta (datos, niveles, precios) pero organizada — la carga es alta, el desorden es cero. Modo de atención: analítico, por filas y niveles. Riesgo cognitivo: abrumar si el dato no se jerarquiza; caer en el cliché "dashboard fitness" si el dato se dramatiza.
- Emoción objetivo: claridad racional — "esto cabe en mi vida".
- Principios prioritarios: Precisión (D.2), Progresión (D.1 — la escalera de niveles), Decisión (D.10 — como frontera con el mundo 07).
- Eje humano ↔ sistémico: sistémico (la estructura habla). Percepción temporal: futuro — lo que harás.

**Espacio y composición.**
- Geometría: orden / escalera con eje de comparación — filas y niveles, no tarjetas sueltas.
- Escala: humana de mesa (datos a distancia de lectura). Verticalidad: apilada (escalera de comparación) con eje lateral (comparador). Distancia percibida: media.
- Estados espaciales: naturales APROXIMACIÓN (contexto antes del dato) y DESCUBRIMIENTO (comparación); rara DECISIÓN como zona (calculadora → configurador, D6: "ABRIR EL CONFIGURADOR BAYONA COMPLETO" bajo la calculadora, CONFIRMADO); incompatibles INMERSIÓN y TENSIÓN (matriz: programs sin sticky ni horizontal; SPATIAL-LANGUAGE §4.3).
- Jerarquía de atención: PRIMERO la escalera de 4 niveles · SEGUNDO la comparación (8 filas) · TERCERO las audiencias · CUARTO la salida al configurador/FAQ.

**Materia, luz y densidad.**
- Materialidad dominante: superficies content/raised para el dato; DM Mono como voz de la estructura.
- Luz dominante: tipográfica (jerarquía del dato) + de plano (filas que se elevan para comparar).
- Densidad: alta y organizada — el mundo con más información del sistema, y el que más respeta la preferencia del propietario: información pequeña, compacta, agrupada y legible. El dato no asusta si está jerarquizado.
- Silencio: respira entre bloques de comparación; se concentra en la calculadora (transición hacia la decisión); sin silencio decorativo.
- Sonido visual: cadencia regular de filas (`data-cascade` con stagger contenido — nunca retrasando dato crítico más de un segundo, contraindicación CONFIRMADA en MOTION-MAP); numeración `01/02/03` como grafismo de pasos.

**Movimiento.**
- Intensidad: `balanced` (CONFIRMADO — `/programs` balanced).
- Receta principal: `data-cascade` (jerarquía sin ruido). Receta secundaria: `editorial-slide` (dirección y progreso de niveles).
- Herencia de motion (sin modificar): `/programs` = balanced · data-cascade + editorial-slide · text none.

**Profundidad y 3D.**
- Profundidad dominante: documental (los niveles llevan a fichas de detalle) + visual (elevación de filas).
- Clasificación 3D: **PROHIBIDO**. Razón: el método se entiende por estructura, no por objetos; un 3D del "método" sería decoración abstracta ("no debe existir una esfera solo porque es fácil hacer una esfera", §39). Qué parte del significado sería imposible comunicar mejor sin profundidad espacial: ninguna — la escalera y el comparador ya lo comunican.

**Medios.**
- Medio dominante: dato (comparación, precios, niveles). Apoyo: tipografía (etiquetas DM Mono), composición (escalera). Prohibidos: fotografía protagonista, 3D, vídeo narrativo, gráficas dramatizadas.

**Uso y antiuso.**
- Uso permitido: presentar los 4 niveles, comparar por sesiones/seguimiento/servicios, mostrar precios públicos (D-002), segmentar por audiencia, abrir el configurador (D6).
- Antiuso específico: esconder el precio detrás de pasos; dramatizar el dato con efectos; convertir el comparador en narrativa; inventar prestaciones.
- Fricción: reducir el acceso a precio y comparador (J3 entra directo); mantener la comparación antes de la decisión (funcional); evitar stagger que abrume.
- Next-best-action: comparar → ficha de plan (`route.planHref`) o abrir configurador.

**Herencia y variación.**
- Hereda: precisión expresiva (claims tipados), progresión como escalera.
- Introduce: geometría de comparación; la densidad como valor.
- Nunca cambia: precio público en COP exactos, sin promesas de resultado, marco no médico visible (`COMMERCIAL_SCOPE_NOTICE`).
- Excepción (1): zona de decisión bajo la calculadora — regla: J3 necesita acceso directo al configurador; motivo: acceso directo de quien ya sabe; límite: es una salida, no narrativa; no convierte a programs en mundo DECISIÓN.

**Rutas que lo habitan (provisional).** Núcleo: `/programs`. Periferia: la zona de método de la home (home-mechanism TE LEEMOS/CONSTRUIMOS/TE ACOMPAÑAMOS, CONFIRMADO) como anticipo de MÉTODO; la home sigue siendo ORIGEN.

**Resiliencia.** Sin color: fuerte. Sin imagen: fuerte (no usa fotografía protagonista). Sin 3D: fuerte (prohibido). Sin motion: fuerte (`data-cascade` → todos los datos visibles a la vez). Mobile 390px: adecuada (el comparador pide re-apilado o scroll horizontal; debilidad declarada — la resuelve el Bloque 4). Identidad conservada: **fuerte** (escalera con etiquetas).

**Implicación Fase 7:** ninguna — 3D prohibido. **Implicación Fase 8:** contrato de `/programs` = balanced + data-cascade + editorial-slide; zona calculadora → configurador sin retraso. **Herencia de UX:** programs = catálogo/comparador, entrada de embudo, GoldButton → `/checkout` (D6), CTA secundario a FAQ (J8).

**Anti-genericidad.** NO. Un gimnasio genérico muestra planes como tarjetas con "más popular" y urgencia. MÉTODO muestra una escalera de acompañamiento con precios públicos, 8 filas de comparación, 5 audiencias reales, marco no médico y entrada al configurador sin cuenta. Estructura, no persuasión.

**Elemento de identificación visual:** la escalera de niveles con etiquetas DM Mono.

---

## Q. MUNDO 03 — MOVIMIENTO

**Pregunta central.** ¿Qué puede hacer mi cuerpo, cómo se practica? Experiencia mental: energía contenida — el movimiento como trayectoria y aprendizaje, no como espectáculo.

**Test de existencia.**
- **A. Necesidad (evidencia).** BAYONA tiene una academia física con progresiones técnicas (parkour) y el entrenamiento como práctica en vivo ("Entrenas en vivo con alguien que te guía", FUERZA — offerings.js). El movimiento es el primer sustantivo del tagline (CONFIRMADO). Evidencia: parkour-academy con "progresiones técnicas por edad y nivel, del primer salto al control" (chapters.js, CONFIRMADO); routeMeta parkour "aprender a moverse con control, desde iniciación hasta nivel avanzado"; servicio `parkour-tecnico` (offerings.js, CONFIRMADO); testimonio Sebastián, 14 años, "El parkour me enseñó disciplina y confianza" (CONFIRMADO).
- **B. Pregunta del visitante.** "¿Cómo aprendo parkour?" (fila 4, CONFIRMADO).
- **C. Irreemplazabilidad.** Si se elimina, el "movimiento" del tagline pierde territorio: desaparecen la academia (J5) y la práctica como experiencia; el único mundo de trayectoria se queda sin casa.
- **D. Antiuso.** No es adrenalina ni épica, no es hype de deporte extremo, no es vídeo acrobático decorativo, no vende plazas que no existen: pre-apertura honesta "Interés abierto · Sin pago · Sede y horarios por confirmar" (FASE4, registro CONFIRMADO en Parte I B.3).

**Función y psicología.**
- Función narrativa: sentir la práctica como trayectoria. Función humana: disciplina y confianza (testimonio Sebastián). Función de negocio: registro de interés de la academia (J5), pre-embudo.
- Estado de atención: atención absorbida. Carga cognitiva: baja-media (pocos mensajes, espaciales). Modo de atención: narrativo, de seguimiento. Riesgo cognitivo: épica que prometa lo que la academia aún no tiene (sede por confirmar); adrenalina que borre la honestidad.
- Emoción objetivo: energía contenida con dirección — "quiero aprender a moverme así".
- Principios prioritarios: Tensión (D.3 — el momento único contenido), Progresión (D.1 — niveles técnicos), Territorio (D.9 — sede física, tratado con DF-010: presencia real, sin folclore).
- Eje humano ↔ sistémico: humano-sistémico (la práctica une ambos). Percepción temporal: presente — el instante del movimiento.

**Espacio y composición.**
- Geometría: túnel / trayectoria — el scroll como avance (el pasaje horizontal es su gramática natural).
- Escala: arquitectónica (el obstáculo, el espacio que se cruza) con la figura humana como medida. Verticalidad: lateral (avance horizontal) con escenario fijo. Distancia percibida: media → lejos (la trayectoria mira hacia delante).
- Estados espaciales: naturales ENTRADA → APROXIMACIÓN → TENSIÓN (momento único) → DESCUBRIMIENTO (niveles, logística); rara INMERSIÓN (solo como momento único — matriz: parkour immersive con un escenario); incompatible DECISIÓN como clima (el registro es salida, no clima).
- Jerarquía de atención: PRIMERO el momento de trayectoria · SEGUNDO los niveles por edad · TERCERO la logística honesta (sede, interés) · CUARTO el registro por WhatsApp.

**Materia, luz y densidad.**
- Materialidad dominante: fotografía de práctica real (cuando exista — sin stock de parkour), superficies deep/raised, grano como ambiente.
- Luz dominante: fotográfica + de escena (en el momento único); acento como brasa contenida en el registro.
- Densidad: baja-media — el movimiento necesita espacio; información compacta y agrupada en niveles y logística.
- Silencio: respira antes del momento único (aproximación); se concentra en el escenario fijo; cambia en la logística (sede, niveles, registro).
- Sonido visual: cadencia de pulso (avance → pausa → avance); repetición como ritmo de niveles (`01/02/03` de progresiones); grafismo: etiquetas DM Mono de nivel.

**Movimiento.**
- Intensidad: `immersive` presupuestado (CONFIRMADO — parkour immersive; un único momento narrativo por página).
- Receta principal: `cinematic-stage` (el momento único que detiene el tiempo). Receta secundaria: `horizontal-passage` (la trayectoria como pasaje — candidato ○ en matriz; gramática de trayectoria según MOTION-MAP).
- Herencia de motion (sin modificar): `/parkour-academy` = immersive · cinematic-stage · sticky ○ · horizontal ○ · parallax ○ · mask · 3D futuro ○.

**Profundidad y 3D.**
- Profundidad dominante: espacial (planos que evolucionan por estados).
- Clasificación 3D: **JUSTIFICADO**. Razón: §39 da al parkour la dirección conceptual trayectoria/libertad y la matriz marca 3D futuro ○ candidato. JUSTIFICADO ≠ habrá 3D: si una escena existiera, debería representar la trayectoria real de la práctica — qué parte del significado sería imposible comunicar mejor sin profundidad espacial: el cruce de un obstáculo como trayectoria continua. Fase 7 decide, con presupuesto real (vendor-three 826.94 kB, CONFIRMADO).
- Aquí no se diseña ningún objeto: solo clasificación y necesidad conceptual.

**Medios.**
- Medio dominante: composición en movimiento (escenario fijo, pasaje). Apoyo: fotografía (práctica real), tipografía (niveles). Prohibidos: vídeo épico con música, partículas, efectos de velocidad sin función, stock de deportes extremos.

**Uso y antiuso.**
- Uso permitido: mostrar progresiones técnicas por edad y nivel, logística honesta (sede y horarios por confirmar), registro de interés por WhatsApp sin pago.
- Antiuso específico: prometer sede u horarios que no existen; vender plazas; convertir la academia en producto de adrenalina; usar menores como espectáculo (el segmento infantil exige tratamiento especialmente sobrio).
- Fricción: reducir la claridad de niveles; mantener el registro como conversación; evitar narrativa que oculte la logística.
- Next-best-action: registrar interés (WhatsApp) · continuar itinerario (NextChapter → `/app`, CHAPTER_ORDER).

**Herencia y variación.**
- Hereda: tensión contenida, progresión técnica, territorio honesto.
- Introduce: geometría de trayectoria (el mundo más espacial); ritmo de pulso.
- Nunca cambia: honestidad de pre-apertura, registro sin pago, tratamiento sobrio de menores.
- Excepción (1): momento único `immersive` — regla: la trayectoria justifica detener el tiempo una vez; motivo: es la idea del mundo; límite: un momento; en móvil degrada a secuencia apilada (CONFIRMADO).

**Rutas que lo habitan (provisional).** Núcleo: `/parkour-academy`. Periferia: ninguna (el servicio `parkour-tecnico` vive en EXPERIENCIA como oferta; MOVIMIENTO es la práctica, no el catálogo).

**Resiliencia.** Sin color: fuerte. Sin imagen: adecuada (niveles y progresiones sostienen el contenido; se pierde materialidad). Sin 3D: fuerte (JUSTIFICADO no es implementado; el escenario funciona sin escena). Sin motion: adecuada (`cinematic-stage` → estados apilados como sección normal, CONFIRMADO; la identidad de trayectoria se debilita sin scroll pero el contenido permanece — debilidad declarada: el mundo debe reconocerse también por composición, no solo por efecto). Mobile 390px: adecuada (apilado sin fijación; pasaje horizontal → pila vertical, CONFIRMADO). Identidad conservada: **adecuada-fuerte**.

**Implicación Fase 7:** mundo candidato a una segunda escena (tras el globo) si pasa el test de admisión (idea representada + presupuesto + fallback). **Implicación Fase 8:** contrato parkour = immersive + cinematic-stage (+ horizontal si el presupuesto lo permite). **Herencia de UX:** parkour = academia, registro de interés, NextChapter hacia `/app` (itinerario canónico).

**Anti-genericidad.** NO. Un gimnasio genérico no tiene academia de parkour con progresiones por edad, pre-apertura honesta (sede por confirmar dicha de frente) y registro sin pago. Y trata el parkour como formación (disciplina y confianza), no como espectáculo extremo.

**Elemento de identificación visual:** el escenario fijo de trayectoria (el avance que se detiene una vez).

---

## R. MUNDO 04 — EXPERIENCIA

> **Refinamiento de definición documentado (M.1.3).** La hipótesis "EXPERIENCIA" podía leerse como "cualquier cosa experiencial" (demasiado amplia). Definición refinada: **el ecosistema sin membresía** — servicios por sesión, productos consultables y BAYONA+. Evidencia: grupo IA EXPERIENCIAS (PAGE-EXPERIENCE-MATRIX), J4 (comprador sin membresía), J6 (curioso de BAYONA+), teaser de shop "sin comprometerte a una membresía" (chapters.js, CONFIRMADO). Mejora: separa el mundo de COMUNIDAD (personas) y de MÉTODO (estructura de la membresía).

**Pregunta central.** ¿Qué más existe aquí que pueda vivir sin comprometerme a una membresía? Experiencia mental: exploración libre del ecosistema — "puedo probar BAYONA sin atarme a nada".

**Test de existencia.**
- **A. Necesidad (evidencia).** BAYONA tiene un ecosistema paralelo a la membresía: 16 servicios por sesión en 3 categorías — CLASES ("Entrena con alguien"), RECUPERACIÓN ("Cuida tu cuerpo"), RENDIMIENTO ("Lleva tu cuerpo al siguiente nivel") — (offerings.js, CONFIRMADO); 6 productos consultables con código OBJ-01…OBJ-06 (shopCatalog.js, CONFIRMADO); BAYONA+ en desarrollo sin fechas (routeMeta, CONFIRMADO).
- **B. Pregunta del visitante.** "¿Qué puedo comprar sin membresía?" (fila 9) y "¿Qué es BAYONA+?" (fila 10) — CONFIRMADO.
- **C. Irreemplazabilidad.** Si se elimina, J4/J6 se rompen; el ecosistema pierde anchura y BAYONA parece solo membresía (barrera para quien aún no está listo).
- **D. Antiuso.** No es marketplace agresivo, no es urgencia falsa, no es promesa de app que no existe ("sin fechas comprometidas", routeMeta, CONFIRMADO).

**Función y psicología.**
- Función narrativa: mostrar la anchura del ecosistema. Función humana: entrada de baja fricción al producto. Función de negocio: conversión paralela (shop = conversión paralela, CONFIRMADO col. 12) y early access (app).
- Estado de atención: exploración de catálogo. Carga cognitiva: media — compacta y agrupada. Modo de atención: escaneo por categoría → pausa en el ítem. Riesgo cognitivo: saturación si todo grita (16 servicios + 6 productos); decepción si BAYONA+ promete lo que no hay.
- Emoción objetivo: curiosidad tranquila — "mira todo lo que hay".
- Principios prioritarios: Precisión (D.2 — catálogo con precios exactos), Humanidad (D.7 — conversación como salida), Territorio (D.9 — servicios presenciales con nota de ubicación y disponibilidad).
- Eje humano ↔ sistémico: sistémico (catálogo). Percepción temporal: presente — lo disponible ahora.

**Espacio y composición.**
- Geometría: modular / rejilla — tarjetas compactas por categoría con filtro y búsqueda (existentes: `catalogCategories` + `filterCatalog`, CONFIRMADO).
- Escala: humana (objeto y servicio a mano). Verticalidad: rejilla modular con raíles de categoría. Distancia percibida: cerca (el ítem se ve de cerca, como mostrador).
- Estados espaciales: naturales DESCUBRIMIENTO (explorar sin empuje) y APROXIMACIÓN (las categorías dan contexto); rara DECISIÓN como salida puntual (carrito → WhatsApp); incompatibles TENSIÓN e INMERSIÓN (el catálogo no dramatiza).
- Jerarquía de atención: PRIMERO las categorías · SEGUNDO el ítem (precio + descripción) · TERCERO la salida WhatsApp/carrito · CUARTO el rail de ambiente.

**Materia, luz y densidad.**
- Materialidad dominante: superficies raised/content para tarjetas; códigos DM Mono (OBJ-01…OBJ-06, existentes) como grafismo de catálogo.
- Luz dominante: de plano (la tarjeta se eleva con sombra lift) + tipográfica (precio y etiqueta).
- Densidad: alta y compacta — el catálogo es el mundo de la información agrupada por excelencia (preferencia del propietario).
- Silencio: respira entre bloques de categoría; se concentra en la ficha del ítem; cambia en la salida del carrito.
- Sonido visual: repetición como identidad (ritmo de tarjetas, códigos, precios); cadencia de raíl compacto (ambiente, nunca información crítica — contraindicación CONFIRMADA de `compact-rail`); sin countdowns.

**Movimiento.**
- Intensidad: `balanced` (CONFIRMADO — shop y app balanced).
- Receta principal: `data-cascade` (catálogo compacto con jerarquía). Receta secundaria: `compact-rail` (ambiente de categorías y etiquetas). Variante de `/app`: `editorial-slide` (la app se muestra como sistema en movimiento — CONFIRMADO en matriz).
- Herencia de motion (sin modificar): `/shop` = balanced · data-cascade + compact-rail · `/app` = balanced · editorial-slide + compact-rail · horizontal ○ · mask.

**Profundidad y 3D.**
- Profundidad dominante: documental (categoría → ítem → conversación WhatsApp).
- Clasificación 3D: **PROHIBIDO**. Razón: el catálogo necesita claridad; un producto sin modelo real sería una esfera decorativa. Qué parte del significado sería imposible comunicar mejor sin profundidad espacial: ninguna — la tarjeta con precio y salida WhatsApp ya lo comunica.

**Medios.**
- Medio dominante: catálogo (tarjeta, precio, código). Apoyo: tipografía (etiquetas), raíl compacto (ambiente). Prohibidos: 3D, fotografía dramatizada, efectos de urgencia, escasez falsa.

**Uso y antiuso.**
- Uso permitido: mostrar servicios por sesión con precio público, filtrar por categoría, carrito → pedido por WhatsApp (J4), early access de BAYONA+ con honestidad (J6), notas de disponibilidad presencial.
- Antiuso específico: procesar pago online (contrato del sitio: sin pago — CONFIRMADO); fabricar escasez (la lección del contador retirado de ELITE — comentario en offerings.js, CONFIRMADO); prometer fechas de BAYONA+; convertir el shop en marketplace agresivo.
- Fricción: reducir búsqueda y filtro; mantener la salida por conversación (verdad del producto); evitar carrito que oculte el total.
- Next-best-action: consultar ítem por WhatsApp · pedir early access.

**Herencia y variación.**
- Hereda: precisión de precios, conversación como conversión, territorio honesto.
- Introduce: geometría de rejilla modular; códigos y numeración de catálogo como grafismo.
- Nunca cambia: precio público, salida por WhatsApp, honestidad de desarrollo (BAYONA+), disponibilidad presencial visible.
- Excepción (1): `/app` admite horizontal ○ candidato — regla: la app se muestra como sistema en progresión; motivo: el producto es un sistema en construcción; límite: un pasaje, sin retrasar el early access.

**Rutas que lo habitan (provisional).** Núcleo: `/shop`, `/app`. Periferia: ninguna (la comunidad es mundo propio: es gratuita y de personas, no producto del ecosistema).

**Resiliencia.** Sin color: fuerte. Sin imagen: fuerte (tarjeta con código, etiqueta y precio se sostiene). Sin 3D: fuerte (prohibido). Sin motion: fuerte (cascada → visible; raíl estático con scroll manual, CONFIRMADO). Mobile 390px: fuerte (rejilla → columna; raíl estático con snap, CONFIRMADO). Identidad conservada: **fuerte** (código + precio + tarjeta compacta).

**Implicación Fase 7:** ninguna — 3D prohibido. **Implicación Fase 8:** contratos shop/app = balanced + data-cascade/compact-rail (shop), editorial-slide + compact-rail (app). **Herencia de UX:** shop = conversión paralela con carrito de persistencia local (`bayona:cart:v1`, J4); app = pre-embudo con early access.

**Anti-genericidad.** NO. Un gimnasio genérico vende packs con urgencia. EXPERIENCIA vende sesiones sueltas con precio público y salida por WhatsApp, muestra una app en desarrollo sin fechas y trata la presencialidad como condición (no como promesa). Catálogo sin presión.

**Elemento de identificación visual:** la rejilla compacta con códigos y precios.

---

## S. MUNDO 05 — COMUNIDAD

**Pregunta central.** ¿Con quién entreno, dónde pertenezco? Experiencia mental: pertenencia real sin pago — "aquí hay gente, y no necesito comprar para ser parte".

**Test de existencia.**
- **A. Necesidad (evidencia).** BAYONA sostiene el hábito con otros: "Entrena acompañado y sostén el hábito con otros" (routeMeta community, CONFIRMADO); comunidad gratuita por WhatsApp — "no necesitas contratar un plan" (CONFIRMADO); teaser "Acceso abierto y gratuito" (chapters.js, CONFIRMADO); J7 (persona que busca comunidad).
- **B. Pregunta del visitante.** "¿Dónde entrena la gente?" (fila 11, CONFIRMADO).
- **C. Irreemplazabilidad.** Si se elimina, J7 se rompe; BAYONA pierde el único espacio donde el producto es relación y no transacción; el acompañamiento (D.8) pierde su dimensión colectiva.
- **D. Antiuso.** No es mapa futurista de conexiones (mandato del auditor), no es "tribu" inventada ("somos una familia" sin evidencia — anti-patrón de D.7), no es lugar de venta de planes.

**Función y psicología.**
- Función narrativa: hacer visible la pertenencia. Función humana: compañía para sostener el hábito. Función de negocio: entrada gratuita al ecosistema (community es pre-embudo, CONFIRMADO; convierte en acceso por WhatsApp).
- Estado de atención: reconocimiento cálido. Carga cognitiva: baja (voces, nombres). Modo de atención: social, de escucha. Riesgo cognitivo: inventar comunidad donde hay un servicio; dramatizar voces.
- Emoción objetivo: calidez contenida — "quiero estar aquí".
- Principios prioritarios: Humanidad (D.7), Acompañamiento (D.8 colectivo).
- Eje humano ↔ sistémico: humano. Percepción temporal: tiempo cíclico (el hábito, la constancia).

**Espacio y composición.**
- Geometría: red de voces — raíl de personas ("voces en rail (patrón marquee ya presente)" — SCROLL-STORY-MATRIX, CONFIRMADO), no grafo de conexiones.
- Escala: humana (voz y nombre). Verticalidad: lateral (raíl) con pausas centrales de lectura. Distancia percibida: cerca (la voz te habla).
- Estados espaciales: naturales DESCUBRIMIENTO (las voces emergen) y ENTRADA (la comunidad también recibe: acceso gratuito); rara DECISIÓN (la solicitud de acceso es salida puntual); incompatibles TENSIÓN e INMERSIÓN (la calidez no dramatiza).
- Jerarquía de atención: PRIMERO las voces · SEGUNDO la condición de gratuidad · TERCERO el acceso por WhatsApp · CUARTO la continuidad.

**Materia, luz y densidad.**
- Materialidad dominante: superficies raised para voces; calidez tipográfica (citas alternadas).
- Luz dominante: tipográfica (voces) + acento como brasa contenida en el acceso.
- Densidad: media-baja — las voces necesitan aire; información compacta en las condiciones de acceso (gratis, WhatsApp, sin plan).
- Silencio: respira entre voces; se concentra en la invitación de acceso; cambia en la salida NextChapter.
- Sonido visual: cadencia de voces alternadas; repetición como ritmo de raíl (patrón marquee existente); grafismo: nombre + lugar en DM Mono.

**Movimiento.**
- Intensidad: `balanced` (CONFIRMADO — community balanced).
- Receta principal: `compact-rail` (voces en raíl). Receta secundaria: `editorial-reveal` (lectura de voces).
- Herencia de motion (sin modificar): `/community` = balanced · compact-rail + editorial-reveal · text none.

**Profundidad y 3D.**
- Profundidad dominante: documental (comunidad → acceso → WhatsApp).
- Clasificación 3D: **PROHIBIDO**. Razón: §39 lista "sistema / conexión" como dirección conceptual para Comunidad, pero el mandato del Bloque 3 prohíbe convertir la comunidad en un mapa futurista de conexiones sin evidencia real. La conexión humana se expresa con voces y nombres, no con grafos abstractos; además la espacialidad de constelación ya existe en CUERPO (el globo de `/about`) — duplicarla sería decorativismo. Qué parte del significado sería imposible comunicar mejor sin profundidad espacial: ninguna — el raíl de voces reales ya comunica pertenencia. (Tensión con §39 documentada y resuelta por jerarquía de evidencia: la evidencia viva — voces, patrón marquee, gratuidad — pesa más que una dirección conceptual.)

**Medios.**
- Medio dominante: voz (cita, nombre, lugar). Apoyo: raíl (ritmo compacto), tipografía. Prohibidos: grafos de conexión, partículas, 3D, stock de grupos celebrando.

**Uso y antiuso.**
- Uso permitido: mostrar voces reales, explicar el acceso gratuito (WhatsApp), invitar sin presión.
- Antiuso específico: vender planes aquí; inventar comunidad ("tribu"); cobrar el acceso (la gratuidad es verdad del producto); pedir datos (la promesa de privacidad se extiende); dramatizar voces con efectos.
- Fricción: reducir la solicitud de acceso (un WhatsApp); evitar formularios con datos.
- Next-best-action: solicitar acceso por WhatsApp (gratis).

**Herencia y variación.**
- Hereda: humanidad como voz, acompañamiento como presencia.
- Introduce: geometría de red de voces (el raíl como identidad).
- Nunca cambia: acceso gratuito, voces reales, sin pago, sin datos.
- Excepciones: ninguna — el primer mundo sin excepciones; su fuerza es la sobriedad.

**Rutas que lo habitan (provisional).** Núcleo: `/community`. Periferia: ninguna.

**Resiliencia.** Sin color: fuerte. Sin imagen: fuerte (voces con nombre se sostienen). Sin 3D: fuerte (prohibido). Sin motion: fuerte (raíl estático con scroll manual, CONFIRMADO). Mobile 390px: fuerte (raíl estático con snap). Identidad conservada: **fuerte** (raíl de voces).

**Implicación Fase 7:** ninguna — 3D prohibido (resolución documentada contra la dirección conceptual de §39). **Implicación Fase 8:** contrato community = balanced + compact-rail + editorial-reveal. **Herencia de UX:** community = pre-embudo, acceso por WhatsApp, NextChapter hacia `/resources` (itinerario).

**Anti-genericidad.** NO. Un gimnasio genérico vende "comunidad" como marketing y la cobra. COMUNIDAD es gratuita de verdad (dicho y sostenido), muestra voces y no pide datos. Pertenencia sin transacción.

**Elemento de identificación visual:** el raíl de voces con nombres.

---

## T. MUNDO 06 — CONOCIMIENTO

**Pregunta central.** ¿Qué puedo aprender, qué dudas me quedan? Experiencia mental: comprensión gratuita — "aprendo antes de comprar, y mis dudas se responden sin trampa".

**Test de existencia.**
- **A. Necesidad (evidencia).** BAYONA convierte sin fricción vía contenido gratuito: J1 (reto 30 días, protocolo 7 días — "sin cuenta, sin datos", CONFIRMADO) y resuelve objeciones antes de decidir: FAQ "ANTES DE DECIDIR — Precios, lesiones, presencialidad, garantía y BAYONA+. Sin rodeos" (chapters.js, CONFIRMADO); J8 (dudas antes de pagar).
- **B. Pregunta del visitante.** "¿Qué puedo probar gratis?" (fila 12) y "¿Qué dudas me quedan?" (fila 13) — CONFIRMADO.
- **C. Irreemplazabilidad.** Si se elimina, J1/J8 se rompen: el sitio pierde su entrada gratuita (el curioso sin intención de compra) y el lugar de las objeciones.
- **D. Antiuso.** No es blog-laberinto, no es lead magnet disfrazado (el contenido no pide datos), no es muro de jerga, no es lugar de drama.

**Función y psicología.**
- Función narrativa: formar y resolver. Función humana: generosidad antes de la venta. Función de negocio: conversión sin fricción (el recurso gratuito ES la conversión, J1) y despeje de objeciones (J8 → videollamada).
- Estado de atención: estudio y consulta. Carga cognitiva: media-alta (lectura) pero serena. Modo de atención: lectura lineal (resources) / búsqueda por pregunta (faq). Riesgo cognitivo: interrumpir el estudio con narrativa; convertir el FAQ en muro de venta.
- Emoción objetivo: calma clara — "entiendo, y nadie me empuja".
- Principios prioritarios: Precisión (D.2 — respuestas directas), Progresión (D.1 — contenido que se gana por pasos), Recuperación (D.4 — el FAQ como resolución).
- Eje humano ↔ sistémico: sistémico con voz humana. Percepción temporal: tiempo de aprendizaje (sin reloj).

**Espacio y composición.**
- Geometría: orden por columnas de lectura (resources) y pregunta → respuesta (faq); por capas, no radial.
- Escala: íntima (lectura a mano). Verticalidad: lineal por bloques con índice (eyebrows como guía). Distancia percibida: cerca (texto a distancia de lectura).
- Estados espaciales: naturales DESCUBRIMIENTO (lectura) y SALIDA (NextChapter devuelve al itinerario — el FAQ cierra volviendo a recepción, J8); admitida APROXIMACIÓN breve; PROHIBIDOS TENSIÓN e INMERSIÓN (SPATIAL-LANGUAGE §4.2: lectura sin tensión ni inmersión).
- Jerarquía de atención: PRIMERO la respuesta / el recurso · SEGUNDO el índice (categorías) · TERCERO la salida humana (WhatsApp/videollamada) · CUARTO la continuidad.

**Materia, luz y densidad.**
- Materialidad dominante: superficie content, tipografía de lectura (Inter), eyebrows DM Mono como índice.
- Luz dominante: tipográfica (jerarquía pura — el mundo donde la luz es más tinta y menos efecto).
- Densidad: alta en contenido, baja en estímulos — densidad de lectura, no de efectos.
- Silencio: respira entre bloques de lectura; se concentra en la respuesta (foco sin competencia); cambia en la salida (recurso → WhatsApp con contexto).
- Sonido visual: cadencia contemplativa (`editorial-reveal` al ritmo de lectura); repetición como estructura (pregunta/respuesta, epígrafes); grafismo: numeración y categorías DM Mono; silencio como material: nada suena mientras se lee.

**Movimiento.**
- Intensidad: `quiet` (CONFIRMADO — resources y faq quiet).
- Receta principal: `editorial-reveal` (el contenido emerge al ritmo de lectura). Receta secundaria: `data-cascade` (resources: contenido estructurado).
- Herencia de motion (sin modificar): `/resources` = quiet · editorial-reveal + data-cascade · `/faq` = quiet · editorial-reveal.

**Profundidad y 3D.**
- Profundidad dominante: documental (guías, protocolos, categorías de preguntas).
- Clasificación 3D: **PROHIBIDO**. Razón: lectura; nada compite con ella (matriz: "nada compite con la lectura"). Qué parte del significado sería imposible comunicar mejor sin profundidad espacial: ninguna.

**Medios.**
- Medio dominante: texto (guía, respuesta). Apoyo: tipografía (jerarquía), composición (índice). Prohibidos: 3D, vídeo protagonista, imágenes dramatizadas, efectos interactivos que interrumpan.

**Uso y antiuso.**
- Uso permitido: publicar guías y protocolos gratuitos sin cuenta; responder objeciones por categoría (precios, lesiones, presencialidad, garantía, BAYONA+); cerrar con videollamada o pregunta rápida por WhatsApp (J8).
- Antiuso específico: pedir datos para acceder al contenido; convertir el FAQ en muro de venta; usar lenguaje médico (marco no médico); dramatizar respuestas.
- Fricción: reducir al mínimo (J1: sin cuenta, sin datos — promesa de privacidad); evitar enlaces rotos y respuestas que remitan a otra página sin resolver.
- Next-best-action: recurso → WhatsApp con contexto (J1) · videollamada o pregunta rápida (J8).

**Herencia y variación.**
- Hereda: precisión expresiva, generosidad del método (el espíritu de TE LEEMOS).
- Introduce: geometría de lectura pura (el mundo más silencioso junto a DECISIÓN y CONTINUIDAD).
- Nunca cambia: gratuidad sin datos, respuestas directas, marco no médico, salida hacia recepción (faq → NextChapter a recepción, J8).
- Excepciones: ninguna.

**Rutas que lo habitan (provisional).** Núcleo: `/resources`, `/faq`. Periferia: ninguna.

**Resiliencia.** Sin color: fuerte (texto puro). Sin imagen: fuerte (no usa imagen protagonista). Sin 3D: fuerte (prohibido). Sin motion: fuerte (quiet por definición; reveal → visible al instante). Mobile 390px: fuerte (columna de lectura nativa). Identidad conservada: **fuerte** (lectura con eyebrows).

**Implicación Fase 7:** ninguna. **Implicación Fase 8:** contratos resources/faq = quiet + editorial-reveal (+ data-cascade en resources). **Herencia de UX:** resources = gratuito con salida WhatsApp con contexto; faq = pre-decisión con salida videollamada y retorno a recepción.

**Anti-genericidad.** NO. Un gimnasio genérico usa el contenido como cebo con formulario ("descarga tras dejar tu email"). CONOCIMIENTO da sin pedir (promesa J1), responde objeciones sin trampa — incluidos precios y lesiones — y cierra con conversación humana.

**Elemento de identificación visual:** la columna de lectura con índices DM Mono.

---

## U. MUNDO 07 — DECISIÓN

**Pregunta central.** ¿Cuál elijo? Experiencia mental: el instante protegido — "puedo elegir en silencio, nadie me empuja, todo está claro".

**Test de existencia.**
- **A. Necesidad (evidencia).** BAYONA convierte por conversación y necesita un lugar limpio para elegir: 4 fichas de plan con precio público + PDF + dos salidas (WhatsApp / configurador) y un configurador que prepara una solicitud (CONFIRMADO — filas 5–8 y 14; D-002 precios públicos; J2/J3).
- **B. Pregunta del visitante.** "¿Qué incluye X y qué me cuesta?" (filas 5–8) y "¿Cómo queda mi solicitud y cuánto sería?" (fila 14) — CONFIRMADO.
- **C. Irreemplazabilidad.** Si se elimina, la conversión se rompe (J2/J3): el sitio pierde el instante que respeta (Parte I, D.10).
- **D. Antiuso.** No es narrativa, no es countdown, no es dark pattern, no es venta permanente (DECISIÓN no invade CONTINUIDAD).

**Función y psicología.**
- Función narrativa: proteger la elección. Función humana: respeto por el instante del visitante. Función de negocio: conversión como conversación (WhatsApp), sin pago online.
- Estado de atención: focal, de elección. Carga cognitiva: media (comparar y elegir) → baja en el CTA (todo resuelto). Modo de atención: convergente (de opciones a una). Riesgo cognitivo: ruido que retrasa; opacidad que oculta el precio; presión que empuja.
- Emoción objetivo: silencio y control — "elijo yo".
- Principios prioritarios: Decisión (D.10), Claridad (regla J — veto), Precisión (D.2 — claims tipados, precio exacto).
- Eje humano ↔ sistémico: humano (la elección es personal; la salida es una conversación). Percepción temporal: el instante — tiempo detenido para elegir.

**Espacio y composición.**
- Geometría: centrada / orden → elección única; módulo comparativo (fichas) y pasos de configuración (checkout: PLAN → CLASES → EXTRAS → DATOS, CONFIRMADO fila 14).
- Escala: íntima (la decisión es personal). Verticalidad: centrada con salida clara; checkout lineal por pasos. Distancia percibida: cerca (precio y CTA a mano, sin perspectiva).
- Estados espaciales: estructurales DECISIÓN y SALIDA; admitida APROXIMACIÓN breve (contexto de ficha); PROHIBIDOS TENSIÓN e INMERSIÓN (SPATIAL-LANGUAGE §4.3/§4.4).
- Jerarquía de atención: PRIMERO precio y CTA · SEGUNDO el detalle del plan (incluye/excluye) · TERCERO las salidas secundarias (PDF, configurador, planes vecinos) · CUARTO nada más.

**Materia, luz y densidad.**
- Materialidad dominante: superficies content/raised, tipografía de lectura; acento solo en la acción.
- Luz dominante: tipográfica (jerarquía máxima del precio y el CTA) + acento como señal (si todo es acento, nada lo es).
- Densidad: media → baja a medida que se acerca al CTA — la densidad desciende cuando la decisión se acerca.
- Silencio: material protagonista — alrededor del precio y el CTA hay silencio. Respira entre pasos del configurador; se concentra en el CTA final.
- Sonido visual: cadencia mínima (`quiet-transition` entre bloques); sin repetición (sin marquee, sin countdown); grafismo: precio en escala numeric, etiquetas DM Mono de plan; silencio: ausencia total de estímulo que compita con la elección.

**Movimiento.**
- Intensidad: `quiet` (CONFIRMADO — planes y checkout quiet; "CTA sin retraso").
- Receta principal: `editorial-reveal` (lectura limpia de ficha). Receta secundaria: `quiet-transition` (transiciones serenas entre pasos; checkout usa solo `quiet-transition`).
- Herencia de motion (sin modificar): `/plan/*` = quiet · editorial-reveal + quiet-transition · text none · `/checkout` = quiet · quiet-transition.

**Profundidad y 3D.**
- Profundidad dominante: documental (ficha → PDF → configurador → WhatsApp).
- Clasificación 3D: **PROHIBIDO (absoluto)**. Razón: la claridad gana (Parte I, §J). El 3D no es un premio: DECISIÓN es el mundo comercialmente fundamental y tiene el 3D prohibido precisamente porque su función exige claridad, lectura y decisión. Qué parte del significado sería imposible comunicar mejor sin profundidad espacial: ninguna — precio, detalle y salida ya lo comunican.

**Medios.**
- Medio dominante: tipografía (precio, detalle, CTA). Apoyo: composición (jerarquía), PDF como material de referencia (existente, D8). Prohibidos: 3D, vídeo narrativo, fotografía protagonista, efectos, countdowns.

**Uso y antiuso.**
- Uso permitido: mostrar el plan completo con precio público (COP + aproximaciones EUR/USD, offerings.js), descargar PDF, salir por WhatsApp o configurador, configurar la solicitud (plan → clases → extras → datos), declarar que no se procesa pago (routeMeta checkout).
- Antiuso específico: retrasar el CTA con movimiento (regla viva); esconder el precio; fabricar urgencia (lección del contador de ELITE retirado); reinterpretar el claim DP-5 (congelado — solo Sebastián); añadir teatro narrativo al checkout.
- Fricción: reducir el camino al CTA; mantener la solicitud como conversación (verdad del producto: sin pago online); evitar pasos que no muestren el total.
- Next-best-action: QUIERO EMPEZAR (WhatsApp) o CONFIGURAR (checkout) — ambos siempre visibles.

**Herencia y variación.**
- **Regla de familia (las 4 fichas son UN mundo, no cuatro):** lo que varía entre RAÍZ / FUERZA / RENDIMIENTO / ELITE es el grado de acompañamiento, no el mundo — CONFIRMADO en `planEditorialOverlays`: "Base guiada" → "Entrenamiento acompañado" → "Seguimiento avanzado" → "Acompañamiento privado". La jerarquía es continua (escalera), el tono es el mismo, la estructura es la misma. FUERZA se destaca "con sobriedad" (DOCUMENTO_MAESTRO §7, vía Parte I D.8). DP-5 (ELITE "Acceso de por vida al contenido") intacto: sin reinterpretar, sin reformular, sin tocar.
- Hereda: veto de claridad, precisión expresiva.
- Introduce: el silencio como material dominante (el mundo más silencioso con mayor jerarquía).
- Nunca cambia: precio público, CTA sin retraso, salida humana, sin pago online, DP-5 congelado.
- Excepciones: ninguna — mundo sin excepciones por definición: cualquier excepción a la claridad es veto.

**Rutas que lo habitan (provisional).** Núcleo: `/plan/raiz`, `/plan/fuerza`, `/plan/rendimiento`, `/plan/elite`, `/checkout`. Periferia: la zona de decisión de programs (calculadora → configurador) como frontera con MÉTODO.

**Resiliencia.** Sin color: fuerte (la jerarquía es tinta). Sin imagen: fuerte (no usa imagen). Sin 3D: fuerte (prohibido). Sin motion: fuerte (ya era casi estático por definición — SPATIAL-LANGUAGE §6). Mobile 390px: fuerte (CTA alcanzable sin desplazamiento narrativo). Identidad conservada: **fuerte** (precio en silencio).

**Implicación Fase 7:** ninguna — 3D prohibido. **Implicación Fase 8:** contratos plan/checkout = quiet; CTA nunca retrasado; breadcrumb visible incluso en el embudo (J2). **Herencia de UX:** fichas con PDF (D8) + configurador (D6) + puentes a planes vecinos; checkout con `?plan=` fail-closed y handoff a confirmación (D7).

**Anti-genericidad.** NO. Un gimnasio genérico decide con presión ("solo hoy", "últimas plazas"). DECISIÓN decide con precio público, PDF de referencia, conversación como salida y un configurador que declara explícitamente "aquí no se procesa ningún pago". El silencio como forma de respeto.

**Elemento de identificación visual:** el precio rodeado de silencio.

---

## V. MUNDO 08 — CONTINUIDAD

**Pregunta central.** ¿Qué ocurre ahora, qué viene después? Experiencia mental: el después sereno — "sé qué pasa ahora; esto no termina aquí".

**Test de existencia.**
- **A. Necesidad (evidencia).** La conversión de BAYONA es el inicio de una relación, no un final épico (Parte I, E.2). Evidencia: `/order-confirmation` "¿Qué ocurre ahora?" (fila 15, J2/J3, CONFIRMADO); NextChapter como único cierre de página desde Fase 4 (D4, chapters.js, CONFIRMADO); JourneyRibbon como memoria (J10, CONFIRMADO); el itinerario cierra el círculo — "después del último se vuelve al primero, para que nunca haya un final sin salida" (comentario de chapters.js, CONFIRMADO).
- **B. Pregunta del visitante.** "¿Qué ocurre ahora?" (fila 15, CONFIRMADO).
- **C. Irreemplazabilidad.** Si se elimina, el post-conversión queda huérfano (el checkout huérfano fue el problema DP-3, resuelto en Fase 4 — registro histórico), la reentrada pierde memoria (J10) y el sitio pierde el retorno.
- **D. Antiuso.** No es footer bonito, no es upsell, no es venta nueva (DECISIÓN no invade CONTINUIDAD), no es teatro de celebración.

**Función y psicología.**
- Función narrativa: continuar y acompañar después de la decisión. Función humana: el acompañamiento del después (TE ACOMPAÑAMOS como tiempo). Función de negocio: retención sin presión; reentrada (J10).
- Estado de atención: cierre sereno con dirección. Carga cognitiva: baja (una puerta, una memoria). Modo de atención: de despedida / recepción. Riesgo cognitivo: vacío post-conversión; upsell que rompe la confianza; celebración que dramatiza.
- Emoción objetivo: serenidad con dirección — "sé qué pasa ahora".
- Principios prioritarios: Recuperación (D.4), Acompañamiento (D.8 — el después).
- Eje humano ↔ sistémico: humano. Percepción temporal: futuro inmediato — el siguiente paso.

**Espacio y composición.**
- Geometría: línea con retorno — una puerta hacia delante (NextChapter), memoria detrás (ribbon); no radial (no ofrece todo: ofrece lo siguiente).
- Escala: íntima. Verticalidad: lineal, salida centrada. Distancia percibida: cerca (el siguiente paso a mano).
- Estados espaciales: estructural SALIDA; admitida ENTRADA suave (la confirmación también recibe: "Solicitud recibida"); PROHIBIDOS TENSIÓN, INMERSIÓN y DECISIÓN (CONTINUIDAD no vende).
- Jerarquía de atención: PRIMERO qué ocurre ahora · SEGUNDO la salida a WhatsApp · TERCERO la continuidad (NextChapter) · CUARTO la memoria (ribbon, si existe).

**Materia, luz y densidad.**
- Materialidad dominante: superficies deep/content, tipografía de lectura.
- Luz dominante: tipográfica + de fondo (serenidad de superficie).
- Densidad: mínima — el después respira.
- Silencio: material dominante — el después es silencio con dirección. Respira en todo; se concentra en "qué ocurre ahora"; cambia en la puerta NextChapter.
- Sonido visual: cadencia de transición única (`quiet-transition`); sin repetición; grafismo: el ribbon como memoria (JourneyRibbon); silencio: total.

**Movimiento.**
- Intensidad: `quiet` (CONFIRMADO — order-confirmation quiet).
- Receta principal: `quiet-transition` ("continuidad sin teatro"; la matriz lo declara: "cierre sereno; confirmación sin teatro"). Receta secundaria: `editorial-reveal` (lectura de los siguientes pasos).
- Herencia de motion (sin modificar): `/order-confirmation` = quiet · quiet-transition.

**Profundidad y 3D.**
- Profundidad dominante: documental (lo que viene: WhatsApp, recursos, programas).
- Clasificación 3D: **PROHIBIDO**. Razón: el cierre sereno necesita dirección, no escena. Qué parte del significado sería imposible comunicar mejor sin profundidad espacial: ninguna.

**Medios.**
- Medio dominante: tipografía (el siguiente paso). Apoyo: ribbon (memoria), NextChapter (puerta). Prohibidos: 3D, vídeo, efectos, upsell.

**Uso y antiuso.**
- Uso permitido: confirmar la solicitud recibida, explicar los siguientes pasos (WhatsApp), ofrecer continuidad (NextChapter), mostrar memoria (ribbon, J10).
- Antiuso específico: upsell; celebrar con teatro; vender de nuevo; dejar al visitante sin dirección; convertir la confirmación en punto final.
- Fricción: reducir la comprensión del siguiente paso; mantener la salida a WhatsApp (el seguimiento es conversación); evitar finales muertos (el espíritu de J9 rige también aquí).
- Next-best-action: revisar en WhatsApp · continuar al siguiente capítulo.

**Herencia y variación.**
- Hereda: recuperación como salida, acompañamiento como continuidad.
- Introduce: geometría de retorno (línea con memoria); el tiempo como material (el después).
- Nunca cambia: dirección siempre presente, sin upsell, serenidad.
- Excepciones: ninguna.

**Rutas que lo habitan (provisional).** Núcleo: `/order-confirmation`. **Transversal (no ruta):** NextChapter como cierre de todas las páginas del itinerario (9 capítulos, chapters.js) — CONTINUIDAD existe como estado en cada salida y como ruta en el post-conversión.

**Resiliencia.** Sin color: fuerte. Sin imagen: fuerte. Sin 3D: fuerte. Sin motion: fuerte (quiet). Mobile 390px: fuerte. Identidad conservada: **fuerte** (puerta única + memoria).

**Implicación Fase 7:** ninguna. **Implicación Fase 8:** contrato order-confirmation = quiet + quiet-transition; handoff desde checkout (D7). **Herencia de UX:** post-conversión con salida WhatsApp y salidas secundarias a recursos/programas (fila 15).

**Anti-genericidad.** NO. Un gimnasio genérico termina en "pago recibido" o en upsell. CONTINUIDAD explica qué ocurre ahora, muestra la memoria del recorrido y ofrece el siguiente capítulo sin vender. La conversión como principio, no como final.

**Nota de propósito:** la gratitud y la serenidad del después aparecen aquí como tono (PROPUESTO; sin iconografía religiosa — M.2.13).

**Elemento de identificación visual:** la puerta única hacia delante con la memoria detrás.

---

## W. MATRICES DEL SISTEMA

### W.1 Matriz de diferenciación

| Mundo | Función | Emoción | Densidad | Luz | Movimiento | Profundidad | Antiuso | 3D |
|---|---|---|---|---|---|---|---|---|
| 00 ORIGEN | Recibir y orientar | Confianza serena | Baja-media | Fondo + tipográfica | `balanced` (único `immersive` en `/`) | Documental | No vender en la entrada | OPCIONAL |
| 01 CUERPO | Reconocer y testimoniar | Reconocimiento | Media | Fotográfica + tipográfica | `balanced` | Visual + 3D excepcional | No dramatizar ni prometer resultados | EXCEPCIONAL |
| 02 MÉTODO | Explicar la estructura | Claridad racional | Alta organizada | Tipográfica + de plano | `balanced` | Documental | No dramatizar el dato ni esconder precio | PROHIBIDO |
| 03 MOVIMIENTO | Sentir la práctica | Energía contenida | Baja-media | Fotográfica + de escena | `immersive` (1 momento) | Espacial | No épica ni vender lo que no existe | JUSTIFICADO |
| 04 EXPERIENCIA | Mostrar el ecosistema | Curiosidad tranquila | Alta compacta | De plano + tipográfica | `balanced` | Documental | No urgencia ni prometer lo que no hay | PROHIBIDO |
| 05 COMUNIDAD | Hacer visible la pertenencia | Calidez contenida | Media-baja | Tipográfica + brasa de acento | `balanced` | Documental | No vender ni inventar tribu | PROHIBIDO |
| 06 CONOCIMIENTO | Formar y resolver | Calma clara | Alta en texto | Tipográfica pura | `quiet` | Documental | No pedir datos ni muro de venta | PROHIBIDO |
| 07 DECISIÓN | Proteger la elección | Silencio y control | Media → baja | Tipográfica + acento señal | `quiet` | Documental | No presión ni retrasar CTA | PROHIBIDO |
| 08 CONTINUIDAD | Continuar después | Serenidad con dirección | Mínima | Tipográfica + de fondo | `quiet` | Documental | No upsell ni teatro | PROHIBIDO |

**Análisis crítico (no decorativo).** Ninguna fila repite la combinación función + emoción + densidad + movimiento. Los tres mundos `quiet` se diferencian por función y densidad: CONOCIMIENTO es lectura densa, DECISIÓN es elección con densidad descendente, CONTINUIDAD es después mínimo. Los cinco mundos `balanced` se diferencian por geometría y medio dominante: radial (ORIGEN), mosaico (CUERPO), escalera (MÉTODO), rejilla (EXPERIENCIA), raíl (COMUNIDAD). MOVIMIENTO es el único `immersive` y el único de profundidad espacial. El 3D no está repartido por importancia: está repartido por función — el mundo comercialmente central (DECISIÓN) lo tiene prohibido, y el único EXCEPCIONAL es el que ya aloja la escena viva (CUERPO). Si alguna fila futura se aproxima a otra, el test de la sección X obliga a fusionar o redefinir.

### W.2 Matriz de medios

| Mundo | Medio dominante | Apoyo (máx. 2–3) | Medios prohibidos |
|---|---|---|---|
| 00 ORIGEN | Tipografía (puertas) | Composición radial · movimiento (momento único) | Catálogo · fotografía protagonista fuera del momento · 3D en onboarding |
| 01 CUERPO | Fotografía (retrato real) | Tipografía de voz · 3D excepcional | Métricas/gráficas · stock · vídeo-espectáculo |
| 02 MÉTODO | Dato (comparación) | Tipografía DM Mono · composición de escalera | Fotografía protagonista · 3D · gráficas dramatizadas |
| 03 MOVIMIENTO | Composición en movimiento | Fotografía de práctica · tipografía de niveles | Vídeo épico · partículas · efectos de velocidad |
| 04 EXPERIENCIA | Catálogo (tarjeta/precio) | Tipografía de etiquetas · raíl compacto | 3D · urgencia · fotografía dramatizada |
| 05 COMUNIDAD | Voz (cita/nombre) | Raíl · tipografía | Grafos de conexión · partículas · 3D |
| 06 CONOCIMIENTO | Texto (guía/respuesta) | Tipografía · composición de índice | 3D · vídeo protagonista · efectos que interrumpan |
| 07 DECISIÓN | Tipografía (precio/CTA) | Composición · PDF de referencia | 3D · vídeo · countdowns · efectos |
| 08 CONTINUIDAD | Tipografía (siguiente paso) | Ribbon · NextChapter | 3D · upsell · celebración |

Lectura: ningún mundo tiene "todo alto". Cada mundo elige un medio dominante y renuncia a los demás — la renuncia es la diferenciación. La saturación multimedia (foto + dato + vídeo + 3D + motion a la vez) queda prohibida por construcción.

### W.3 Matriz de resiliencia

| Mundo | Sin color | Sin imagen | Sin 3D | Sin motion | Mobile 390px | Identidad se conserva |
|---|---|---|---|---|---|---|
| 00 ORIGEN | fuerte | fuerte | fuerte | fuerte | fuerte | **fuerte** |
| 01 CUERPO | fuerte | adecuada | fuerte | fuerte | fuerte | **fuerte** |
| 02 MÉTODO | fuerte | fuerte | fuerte | fuerte | adecuada | **fuerte** |
| 03 MOVIMIENTO | fuerte | adecuada | fuerte | adecuada | adecuada | **adecuada-fuerte** |
| 04 EXPERIENCIA | fuerte | fuerte | fuerte | fuerte | fuerte | **fuerte** |
| 05 COMUNIDAD | fuerte | fuerte | fuerte | fuerte | fuerte | **fuerte** |
| 06 CONOCIMIENTO | fuerte | fuerte | fuerte | fuerte | fuerte | **fuerte** |
| 07 DECISIÓN | fuerte | fuerte | fuerte | fuerte | fuerte | **fuerte** |
| 08 CONTINUIDAD | fuerte | fuerte | fuerte | fuerte | fuerte | **fuerte** |

**Debilidades declaradas (no se ocultan):**
1. **CUERPO sin imagen** pierde materialidad (el retrato es su medio dominante), pero la función permanece: voz + nombre sostienen el reconocimiento.
2. **MOVIMIENTO sin motion** debilita la identidad de trayectoria: el mundo debe reconocerse también por composición (niveles, escenario) cuando el movimiento no existe (reduced motion — SPATIAL-LANGUAGE §6: si al quitar el movimiento un estado desaparece, era un efecto, no un estado). El blueprint del Bloque 4 debe verificarlo.
3. **MÉTODO en mobile 390px**: el comparador de 8 filas × 4 planes es el reto de composición del sistema; lo resuelve el Bloque 4 (re-apilado o scroll horizontal), nunca eliminando comparación.

---

## X. PRUEBA DE INTERCAMBIABILIDAD

### X.1 Los 7 pares sensibles (revisión explícita, mandato del auditor)

**1. ORIGEN ↔ EXPERIENCIA — NO intercambiables.** ORIGEN orienta (puertas; no lista productos); EXPERIENCIA ofrece (catálogo con precios). Prueba de intercambio: si la home fuera catálogo, J1/J2 perderían el umbral; si el shop fuera recepción, J4 perdería la compra directa. Función distinta (orientar vs. ofrecer), geometría distinta (radial vs. modular), densidad distinta.

**2. CUERPO ↔ MOVIMIENTO — NO intercambiables.** Sustantivo vs. verbo: CUERPO es estado/biografía (lo que el cuerpo ha atravesado: mosaico de voces); MOVIMIENTO es acción/trayectoria (lo que el cuerpo hace: túnel de práctica). Prueba: parkour como mosaico de biografías no funciona (necesita trayectoria); about como trayectoria no funciona (necesita voces). Luz distinta (fotográfica de retrato vs. de escena), geometría distinta (constelación vs. túnel), intensidad distinta (balanced vs. immersive).

**3. MÉTODO ↔ CONOCIMIENTO — NO intercambiables.** MÉTODO = la estructura de la oferta (BAYONA-céntrico: niveles, comparador, precios); CONOCIMIENTO = la comprensión del visitante (visitante-céntrico: guías gratuitas, objeciones). Dirección distinta: uno explica el sistema, el otro forma y resuelve a la persona. Intensidad distinta (balanced vs. quiet), salida distinta (comparador → ficha vs. recurso → WhatsApp con contexto). Prueba: resources con precios y comparador dejaría de ser gratuito y rompería J1; programs con guías sin oferta rompería J3.

**4. EXPERIENCIA ↔ COMUNIDAD — NO intercambiables.** EXPERIENCIA = objetos y servicios (lo que obtienes: precio, carrito); COMUNIDAD = personas y relación (con quién: gratis, sin pago). Economía distinta: transacción vs. pertenencia. Prueba: shop sin precios se rompe (J4 necesita el dato); community con carrito se rompe (la gratuidad es su verdad — routeMeta: "no necesitas contratar un plan").

**5. DECISIÓN ↔ CONTINUIDAD — NO intercambiables.** El instante vs. el después: DECISIÓN termina en el CTA; CONTINUIDAD empieza donde la decisión terminó. Tiempo distinto (presente de elección vs. futuro inmediato). Anti-mezcla documentada: sin upsell en continuidad, sin narrativa en decisión. Prueba: order-confirmation con CTA de venta rompería la confianza del post-conversión; una ficha de plan "continuando" al siguiente capítulo retrasaría la elección.

**6. ORIGEN ↔ CONTINUIDAD — NO intercambiables (puertas de signo opuesto).** ORIGEN recibe SIN memoria (el visitante no conoce el sitio); CONTINUIDAD acompaña CON memoria (JourneyRibbon, J10). El 404 vive en ORIGEN porque recibe a un desorientado sin contexto; order-confirmation vive en CONTINUIDAD porque continúa una historia iniciada. Geometría distinta: radial (muchas puertas) vs. lineal (la siguiente puerta).

**7. MÉTODO ↔ DECISIÓN — NO intercambiables.** MÉTODO explica cómo funciona; DECISIÓN elige cuál. programs es MÉTODO con zona de decisión (excepción documentada en P): el comparador enseña la estructura; la calculadora abre la elección. Jerarquía distinta: MÉTODO distribuye la atención (comparación); DECISIÓN la concentra (precio + CTA en silencio). Prueba: un programs en silencio de decisión perdería la comparación que J2 necesita; una ficha de plan con densidad de comparador retrasaría el CTA.

### X.2 Matriz pairwise (las 36 combinaciones)

Riesgo: alto / medio / bajo según probabilidad de confusión al diseñar. Resultado en todas: **SEPARADOS** (ninguna fusión necesaria).

| Pareja | Riesgo | Diferencia crítica |
|---|---|---|
| 00–01 | bajo | Orientar (puertas) vs. testimoniar (voces) |
| 00–02 | bajo | Recibir sin contenido vs. explicar la estructura |
| 00–03 | bajo | Umbral sereno vs. trayectoria de práctica |
| 00–04 | medio | Orientar vs. ofrecer — resuelto en X.1.1 |
| 00–05 | bajo | Recibir vs. pertenecer |
| 00–06 | bajo | Puertas vs. lectura |
| 00–07 | medio | Orientar vs. elegir — ORIGEN no vende; DECISIÓN no orienta |
| 00–08 | medio | Puertas de signo opuesto — resuelto en X.1.6 |
| 01–02 | bajo | Biografía vs. estructura |
| 01–03 | medio | Sustantivo vs. verbo — resuelto en X.1.2 |
| 01–04 | bajo | Voces vs. objetos |
| 01–05 | medio | Testimonio (prueba) vs. pertenencia (presente) — CUERPO mira al pasado vivido; COMUNIDAD al hábito actual |
| 01–06 | bajo | Reconocimiento vs. comprensión |
| 01–07 | bajo | Testimoniar vs. elegir — CUERPO no vende |
| 01–08 | bajo | Biografía vs. después |
| 02–03 | bajo | Estructura del sistema vs. práctica del cuerpo |
| 02–04 | medio | Estructura de la membresía vs. ecosistema sin membresía — MÉTODO compara niveles; EXPERIENCIA lista sesiones sueltas |
| 02–05 | bajo | Sistema vs. personas |
| 02–06 | medio | Explicar la oferta vs. formar al visitante — resuelto en X.1.3 |
| 02–07 | medio | Cómo funciona vs. cuál elijo — resuelto en X.1.7 |
| 02–08 | bajo | Estructura vs. después |
| 03–04 | bajo | Práctica vs. catálogo — parkour-tecnico vive en EXPERIENCIA como oferta; MOVIMIENTO es la práctica |
| 03–05 | bajo | Trayectoria individual vs. pertenencia colectiva |
| 03–06 | bajo | Práctica vs. lectura |
| 03–07 | bajo | Energía vs. silencio — el registro de interés es salida, no clima de decisión |
| 03–08 | bajo | Instante del movimiento vs. después |
| 04–05 | medio | Objetos vs. personas — resuelto en X.1.4 |
| 04–06 | bajo | Catálogo vs. contenido gratuito — EXPERIENCIA cobra; CONOCIMIENTO da |
| 04–07 | medio | Explorar ofertas vs. elegir — EXPERIENCIA es pre-embudo; DECISIÓN es el embudo |
| 04–08 | bajo | Ecosistema vs. después |
| 05–06 | bajo | Pertenencia vs. aprendizaje — ambos gratuitos, pero COMUNIDAD es relación y CONOCIMIENTO es contenido |
| 05–07 | bajo | Pertenecer vs. elegir — la comunidad no vende |
| 05–08 | bajo | Pertenencia vs. después |
| 06–07 | medio | Resolver dudas vs. elegir — el FAQ despeja ANTES de la decisión (chapters: "ANTES DE DECIDIR"); no decide |
| 06–08 | bajo | Aprendizaje vs. después |
| 07–08 | medio | Instante vs. después — resuelto en X.1.5 |

**Conclusión de la prueba:** 36 pares revisados, 0 fusiones necesarias, 7 pares con revisión explícita. Los riesgos medios quedan resueltos por diferencias de función, geometría, densidad o tiempo — no por estética.

---

## Y. COHERENCIA DEL SISTEMA Y MAPA DE RELACIONES

### Y.1 Las cinco preguntas de coherencia

**1. ¿Todas las rutas tienen mundo?** SÍ. Cobertura contra el inventario normalizado (PLAN-FASE-6 §0.2):
- ORIGEN: `/`, `/onboarding` (+ alias `/entrar`), 404 (periferia).
- CUERPO: `/about`.
- MÉTODO: `/programs`.
- MOVIMIENTO: `/parkour-academy`.
- EXPERIENCIA: `/shop`, `/app`.
- COMUNIDAD: `/community`.
- CONOCIMIENTO: `/resources`, `/faq`.
- DECISIÓN: `/plan/raiz`, `/plan/fuerza`, `/plan/rendimiento`, `/plan/elite`, `/checkout`.
- CONTINUIDAD: `/order-confirmation` (+ NextChapter como estado transversal).
- `/design-system` (categoría D, interna): no habita mundo — es playground, fuera del itinerario y del sitemap (CONFIRMADO).
Total: 16 rutas de categoría A + 1 alias (B) + fallback (C) cubiertos; 1 interna (D) documentada. Ninguna ruta inventada, ninguna omitida.

**2. ¿Todos los mundos están habitados?** SÍ. Ocho mundos con ruta núcleo; CONTINUIDAD además existe como estado transversal en cada cierre (NextChapter). Ningún mundo existe solo para completar la lista: todos pasaron el test A–D.

**3. ¿El sistema produce páginas diferentes?** SÍ — y esta es la prueba que DF-011 exige. Nueve regímenes con decisiones distintas en las once dimensiones (W.1): geometrías distintas (radial, mosaico, escalera, túnel, rejilla, raíl, columna, centro, línea), intensidades distintas (1 immersive, 5 balanced, 3 quiet), medios dominantes distintos, 3D repartido por función. El Bloque 4 deberá convertir esto en blueprints distintos; si dos blueprints salen iguales, el fallo será del blueprint, no del sistema.

**4. ¿El sistema sigue siendo BAYONA?** SÍ. Homogeneidad garantizada por lo que NO cambia entre mundos: tipografía (Montserrat/Inter/DM Mono, escala única — §40), alineación con razón (§41), lenguaje de claims (CLAIM_TYPES), los cuatro sistemas de navegación intactos (doctrina D12), superficies y tokens existentes, tono adulto directo, conversión por conversación. Principio de continuidad: cada página dice "esto es diferente" y a la vez "claro que sigue siendo BAYONA".

**5. ¿El sistema respeta la claridad?** SÍ. Los tres mundos de lectura/decisión/después son `quiet`; TENSIÓN e INMERSIÓN prohibidas en decisión y conversión (SPATIAL-LANGUAGE §4); el CTA nunca se retrasa; la regla J de veto permanece por encima de todos los mundos.

### Y.2 Mapa de relaciones (diagrama textual)

```
                       [00 ORIGEN] ← puerta principal (/, onboarding, 404)
                      /      |       \
            [01 CUERPO]  [02 MÉTODO]  [06 CONOCIMIENTO]
             (about)     (programs)    (resources, faq)
                 \          |           /
                  \    [07 DECISIÓN]   ← (planes, checkout)
                   \        |
   [03 MOVIMIENTO]  |  [04 EXPERIENCIA]   [05 COMUNIDAD]
    (parkour)       |    (shop, app)       (community)
                    ↓
             [08 CONTINUIDAD] → (order-confirmation + NextChapter en todo cierre)
```

**Relaciones conceptuales** (qué mundo alimenta a cuál): ORIGEN remite a CUERPO (la home cierra con "conoce por qué existe BAYONA" — home-action, CONFIRMADO); MÉTODO remite a DECISIÓN (comparador → ficha, `route.planHref` D9, CONFIRMADO); CONOCIMIENTO despeja el camino de DECISIÓN (FAQ "ANTES DE DECIDIR", CONFIRMADO); MOVIMIENTO, EXPERIENCIA y COMUNIDAD son territorios paralelos del ecosistema; todos remiten a CONTINUIDAD vía NextChapter (cierre único, D4, CONFIRMADO).

**Recorrido real** (itinerario canónico, CHAPTER_ORDER — CONFIRMADO): `/` → `/about` → `/programs` → `/parkour-academy` → `/app` → `/community` → `/resources` → `/shop` → `/faq` → (vuelve a `/`). El itinerario es circular y va de menor a mayor compromiso, con salida gratuita siempre a mano (criterio declarado en chapters.js). **El itinerario real NO coincide con el orden de los mundos** — y eso es correcto: los mundos son territorios, no paradas.

### Y.3 Análisis del orden

La numeración 00–08 es índice de construcción (del origen a la continuidad), no recorrido obligatorio. Ningún visitante recorre los mundos en orden:
- J1 (curioso): 00 → 06.
- J2 (comparador): 00 → (01) → 02 → 07 → 08.
- J3 (decidido): 00 → 02 → 07 → 08 (sin narrativa).
- J4 (comprador): 00 → 04.
- J5 (academia): 00 → 03.
- J6 (BAYONA+): 00 → 04.
- J7 (comunidad): 00 → 05.
- J8 (dudas): 06 → 00 (el FAQ devuelve a recepción).
- J9 (perdido): 00 (recolocación).
- J10 (reentrada): cualquier mundo, con memoria (ribbon).

### Y.4 Puertas, estaciones y retorno

- **Mundo-puerta:** ORIGEN (puerta principal + puerta de emergencia 404). Recibe sin memoria.
- **Mundo-retorno:** CONTINUIDAD. Devuelve con memoria y dirección.
- **Mundos-estación:** los siete restantes — cada uno con función propia de parada.
- **Retorno favorecido:** el itinerario cierra el círculo (chapters.js); el FAQ devuelve a recepción (J8); NextChapter siempre ofrece lo siguiente; el 404 recoloca (J9). Ningún final sin salida.
- **Memoria:** JourneyRibbon (J10) es el sistema de memoria del recorrido — solo en memoria de sesión, sin cookies ni cuentas (promesa de privacidad, CONFIRMADO).

### Y.5 Transiciones entre mundos

Al pasar de un mundo a otro cambia el régimen, no la marca. Qué cambia en cada transición:
- **Densidad:** MÉTODO (alta) → DECISIÓN (descendente hacia el silencio).
- **Escala:** MOVIMIENTO (arquitectónica) → DECISIÓN (íntima).
- **Ritmo:** EXPERIENCIA (pulso de tarjetas) → COMUNIDAD (cadencia de voces).
- **Estructura:** ORIGEN (radial) → CUERPO (mosaico) → MÉTODO (escalera).
- **Temperatura:** CUERPO (cálida por fotografía) → CONOCIMIENTO (neutra de tinta).
- **Humano ↔ sistémico:** CUERPO (humano) → MÉTODO (sistémico) → DECISIÓN (humano de nuevo, como conversación).

Lo que NUNCA cambia: tipografía, alineación, claims tipados, navegación, tono. **Las transiciones prohibidas** (SPATIAL-LANGUAGE §3.2) se aplican entre mundos igual que entre estados: el embudo no vuelve al espectáculo (DECISIÓN → MOVIMIENTO/ORIGEN narrativo, prohibido); no hay tensión en frío; no se decide con tensión sin resolver. Una transición prohibida no debe sentirse como cambio de plantilla, sino como cambio de territorio dentro de la misma marca.

### Y.6 Distribución de momentos (NO TODO DEBE IMPACTAR)

- **1 gran momento:** la home (único `immersive` de entrada — el método como recorrido sereno).
- **Momentos normales:** el escenario de parkour, el globo de about.
- **Momentos pequeños:** reveals de lectura, raíles de ambiente, transiciones serenas — la mayoría del sistema.
Derivado del presupuesto vivo (un `immersive` por página, zonas con peso — SCROLL-STORY-MATRIX/MOTION-MAP, CONFIRMADO). Si el Bloque 4 intenta convertir más páginas en gran momento, viola esta distribución y la regla de calma.

---

## Z. AUTOAUDITORÍA FINAL

### Z.1 Auditoría interna A–I (mandato del auditor)

- **A. Cobertura 9×14.** COMPLETA por secciones agrupadas (tabla de correspondencia M.3.19): los 9 mundos declaran función narrativa, emoción objetivo, materialidad, movimiento (intensidad + receta principal + secundaria + por qué), profundidad, sonido visual (ritmo/cadencia/repetición/silencio/grafismo, sin audio), luz dominante (los 6 tipos de la Parte I, sin tokens nuevos), densidad conectada a función, uso permitido, antiuso específico, clasificación 3D razonada, rutas que lo habitan (provisionales). Además: psicología, jerarquía de atención, geometría, escala, distancia, medios, fricción, next-best-action, herencia, excepciones, resiliencia, implicaciones.
- **B. Mundos intercambiables.** NINGUNO — 7 pares sensibles con revisión explícita (X.1) + 36 pares en matriz (X.2); 0 fusiones.
- **C. Territorio / folclore (DF-010).** NINGÚN mundo introduce estética española inventada, paisajes, símbolos culturales, arquitectura regional, paletas geográficas ni mapas decorativos. El territorio aparece solo como presencia real: presencialidad en España con nota de disponibilidad (offerings.js), sede por confirmar dicha de frente (parkour), ciudades reales de los testimonios (testimonials.js).
- **D. Recetas / APIs inventadas.** NINGUNA. Las 8 recetas por id exacto, las 3 intensidades, zonas y rangos existentes; las relaciones de motion se heredan de SCROLL-STORY-MATRIX (documento aprobado) y se citan sin modificar. Ningún contrato, prop, token o firma nueva.
- **E. 3D.** Solo clasificación: 1 EXCEPCIONAL (escena viva citada, Globe3D en /about), 1 JUSTIFICADO (MOVIMIENTO, necesidad conceptual), 1 OPCIONAL (ORIGEN), 6 PROHIBIDO. Cero objetos, modelos, geometrías, escenas, prompts o shaders. "El 3D no es un premio" aplicado: DECISIÓN (mundo central) lo tiene prohibido.
- **F. Rutas inventadas.** NINGUNA — asignaciones contra el inventario §0.2 (16 A + 1 B + 1 C + nota D).
- **G. Alcance.** Sin blueprints (Bloque 4), sin matriz de decisión (Bloque 5), sin WORLD-3D-STRATEGY, sin tests D-01…D-07, sin Fase 7/8. Este documento no adelanta trabajo de otros bloques.
- **H. Producción.** 0 cambios de código (verificado con `git diff --stat` antes del commit).
- **I. Idioma.** Todo el texto nuevo en español; identificadores técnicos conservados exactamente (ids de recetas, tokens, rutas, nombres de planes).

### Z.2 Puertas creativas A–G

- **A. Evidencia:** cada mundo con fuente de negocio + experiencia + identidad. PASA.
- **B. Diferenciación:** 36 pares, 0 fusiones, diferencias estructurales (no estéticas). PASA.
- **C. Resiliencia:** matriz W.3 con 3 debilidades declaradas y su corrección remitida al Bloque 4. PASA.
- **D. Claridad:** 3 mundos quiet; veto J intacto; CTA nunca retrasado. PASA.
- **E. Paz:** ningún mundo produce ansiedad/FOMO/urgencia; no manipulación como regla (M.2.14); evidencia viva: contador de ELITE retirado del código. PASA.
- **F. BAYONA:** anti-genericidad respondida mundo a mundo. PASA.
- **G. Futuro:** cada mundo declara qué decisiones condiciona (Fases 7/8) sin implementarlas. PASA.

### Z.3 Test de excelencia (20 preguntas, verificación compacta)

1. ¿Cada mundo responde la pregunta central? SÍ (primera línea de cada ficha).
2. ¿Cada mundo existe por necesidad, no por estética? SÍ (test A con evidencia).
3. ¿Hay dos mundos intercambiables? NO (X).
4. ¿Las rutas están forzadas para justificar mundos? NO (asignaciones provisionales; equilibrio numérico no usado como criterio).
5. ¿El 3D es premio o función? FUNCIÓN (1 excepcional vivo, 6 prohibidos).
6. ¿Se diseñaron objetos 3D? NO (solo clasificación y necesidad conceptual).
7. ¿Se inventaron recetas o tokens? NO (Z.1.D).
8. ¿Se inventaron rutas? NO (Z.1.F).
9. ¿Se tocó código? NO (Z.1.H).
10. ¿El vocabulario del engine es exacto? SÍ (ids, intensidades, zonas).
11. ¿La secuencia espacial se usa como plantilla? NO (estados naturales/raros/incompatibles por mundo).
12. ¿La navegación permanece intacta? SÍ (M.2.15).
13. ¿Hay folclore territorial? NO (Z.1.C, DF-010).
14. ¿Hay manipulación o urgencia? NO (M.2.14, Z.2.E).
15. ¿El precio/CTA se oculta alguna vez? NO (información progresiva, M.2.14).
16. ¿Los planes se tratan como 4 mundos? NO (regla de familia, M.3.22; DP-5 intacto).
17. ¿La preferencia de información compacta del propietario está respetada? SÍ (M.2.9; densidades de MÉTODO/EXPERIENCIA).
18. ¿El propósito aparece sin iconografía religiosa? SÍ (M.2.13; notas en CUERPO y CONTINUIDAD).
19. ¿Un diseñador senior podría construir sin inventar intención? SÍ — cada decisión cita evidencia y razón; lo PROPUESTO está marcado.
20. ¿Un agente podría inventar a partir de este documento? NO — las etiquetas CONFIRMADO/DERIVADO/PROPUESTO separan lo que existe de lo propuesto (DF-009).

### Z.4 Pruebas del diseñador y del agente

- **Prueba del diseñador ausente:** un diseñador que no estuvo en la conversación puede leer una ficha y tomar decisiones de composición, luz, densidad y movimiento sin inventar la intención — cada ficha declara función, geometría, jerarquía, medios prohibidos y antiuso.
- **Prueba del agente que no debe inventar:** todo lo que existe hoy está etiquetado CONFIRMADO con fuente; toda regla nueva es PROPUESTO y se declara vinculante para fases futuras, inexistente hoy en el producto.

### Z.5 Registro de hallazgos

| ID | Severidad | Hallazgo | Resolución |
|---|---|---|---|
| F6-01 | MEDIO | §39 da a Comunidad la dirección conceptual "sistema/conexión", pero el mandato del Bloque 3 prohíbe mapas futuristas de conexión sin evidencia real | Resuelto ahora: 3D PROHIBIDO en COMUNIDAD con razón documentada (S. Profundidad y 3D). Diferido: si aparece evidencia real de red, Fase 7 puede reevaluar |
| F6-02 | BAJO | MOVIMIENTO debilita su identidad sin motion (resiliencia adecuada, no fuerte) | Diferido al Bloque 4: el blueprint de parkour debe sostener la trayectoria por composición en reduced-motion |
| F6-03 | BAJO | MÉTODO en mobile 390px: el comparador es el reto de composición del sistema | Diferido al Bloque 4: re-apilado o scroll horizontal, nunca eliminar comparación |
| F6-04 | MEDIO | CUERPO habita una sola ruta (/about) | No es problema (el equilibrio numérico no es calidad); la zona de voces de la home funciona como puente. El Bloque 4 decide cómo se materializa el puente sin duplicar el globo |
| F6-05 | MEDIO | Propósito/fe: el propietario quiere la dimensión de propósito; el catálogo actual no contiene contenido explícitamente religioso | Resuelto como criterio M.2.13 (propósito sin iconografía). Decisión humana diferida: si Sebastián quisiera hacer explícita esa dimensión, se registra como decisión aparte |

### Z.6 Nomenclatura

Sin cambios de nombres: los 9 nombres de la hipótesis de partida se mantienen. Dos definiciones refinadas y documentadas (CUERPO en O, EXPERIENCIA en R): original → problema (lectura cliché/amplia) → evidencia → mejora. No hubo fusiones ni reducciones: el sistema 00–08 se conserva íntegro, sin contradicción material demostrada.

---

*Clasificación global del documento: las citas de código y decisiones son **CONFIRMADO**; las síntesis marcadas son **DERIVADO**; las reglas nuevas de uso son **PROPUESTO** (vinculantes para Bloques 2–5 y Fases 7–8, pero inexistentes hoy en el producto); las referencias a Fase 1 son **HISTÓRICO** donde corresponde. En la Parte II: los 9 mundos, sus asignaciones de rutas y las matrices son **PROPUESTO** como sistema; toda la evidencia que citan (catálogo, journeys, matrices Fase 4/5, engine, testimonios) es **CONFIRMADO**. Este documento no implementa nada: gobierna.*
