# SPATIAL-LANGUAGE

> Gramática espacial de BAYONA — FASE 6 · **BLOQUE 2**.
> Autorización del auditor (2026-08-28): BLOQUE 1 APROBADO → BLOQUE 2 ÚNICAMENTE.
> Condiciones vinculantes que gobiernan este documento: **DF-009** (disciplina de evidencia), **DF-010** (territorio no es folclore), **DF-012** (anti-burocracia). **DF-011** (diferenciación de mundos) gobierna el Bloque 3, que construirá sobre esta gramática.
> Documento padre: `BAYONA-WORLD-BIBLE.md` PARTE I (ADN VISUAL, Bloque 1).
> Estado: **PROPUESTA DOCUMENTAL VINCULANTE** para Bloques 3–5 y Fases 7–8. No implementa nada.

**Etiquetas de evidencia (DF-009):**
- **CONFIRMADO** — evidencia real verificable (código, documentación aprobada, decisión registrada, contenido comercial vivo).
- **DERIVADO** — inferencia trazable a evidencia concreta; responde "¿de qué sale esto?".
- **PROPUESTO** — decisión nueva de Fase 6; no existe hoy en la web.
- **HISTÓRICO** — registro del pasado.

**Regla de relación con el Motion Engine (requisito crítico del auditor):**
las relaciones entre estados espaciales y elementos del engine son **CONCEPTUALES, NO APIs**. Este documento dice "este estado *puede expresarse mediante*…"; nunca "este estado *implementa obligatoriamente*…". No se inventan contratos del engine, no se afirman equivalencias, no se crean tokens. El engine actual (recetas, intensidades, presupuestos) es CONFIRMADO; su uso como vocabulario expresivo de un estado es PROPUESTO como criterio.

---

## 1. PROPÓSITO DE LA GRAMÁTICA

### Qué problema resuelve

El Bloque 1 definió **qué** es BAYONA (ADN). El problema que originó la Fase 6 sigue abierto: las páginas "se sentían demasiado negras, planas y similares entre sí" y el visitante debe sentir que "está recorriendo una experiencia, no leyendo una página estática" (CONFIRMADO — CONTEXTO-MAESTRO-CONTINUIDAD §0/§34). El ADN por sí solo no lo resuelve: falta el **cómo espacial** — con qué estados se recorre una página.

SPATIAL-LANGUAGE convierte los 10 principios en un vocabulario de **estados espaciales**: situaciones reconocibles en las que una página puede colocar al visitante. Los mundos (Bloque 3) combinarán estos estados de forma distinta; los blueprints (Bloque 4) los declararán ruta por ruta.

### Qué es un estado espacial

Un estado espacial es **la situación perceptiva del visitante en un tramo de la página**: dónde está, qué se le pide, qué siente que puede hacer. No es una sección del layout, ni un componente, ni una animación: es el papel que ese tramo juega en el recorrido. Una misma sección puede cambiar de estado sin cambiar de contenido, solo cambiando su composición y su ritmo.

### Regla absoluta del documento

**LA SECUENCIA NO ES UNA PLANTILLA MECÁNICA.** (Regla del auditor, vinculante.)

- Cada página usa **solo los estados que su función necesite**.
- Ninguna página está obligada a recorrer los siete estados.
- **La claridad gana sobre la narrativa** (sección 7).
- La gramática describe posibilidades y límites; no prescribe recorridos completos.

### Qué no es este documento

- No es un sistema de scroll: el scroll lo gobiernan el Motion Engine y sus recetas (CONFIRMADO — `src/engine/`).
- No es una API ni un contrato técnico: ninguna afirmación de este documento crea obligaciones de código.
- No define mundos ni páginas: eso es trabajo de los Bloques 3 y 4.
- No añade vocabulario al engine: los estados son nombres de la capa conceptual, no del runtime.

---

## 2. LOS 7 ESTADOS ESPACIALES

Cada estado: **definición · qué produce en el visitante · qué principios del Bloque 1 expresa · gramática conceptual de movimiento · evidencia.**

---

### 2.1 ENTRADA — el umbral

**Definición.** El visitante acaba de llegar. La entrada es el tramo que lo recibe: le dice dónde está, que alguien lo esperaba, y le ofrece puertas. La entrada no pide nada: recibe.

**Qué produce en el visitante.** "He llegado a un sitio con nombre." Recepción sin agresión: ni espectáculo que aturde ni vacío que desorienta. Orientación inmediata: el visitante sabe en segundos qué puede hacer aquí.

**Principios que expresa.** Acompañamiento (D.8 — recibir es la primera forma de acompañar), Humanidad (D.7 — voz de adulto a adulto), Precisión (D.2 — puertas claras, jerarquía inmediata).

**Gramática conceptual de movimiento.** La entrada puede expresarse mediante transiciones serenas (`quiet-transition`: "continuidad sin teatro", CONFIRMADO como receta), mediante revelación calmada del contenido (`editorial-reveal`), o mediante la **ausencia deliberada de chrome** cuando la entrada es un umbral guiado (CONFIRMADO — recepción de onboarding: "inmersivo, sin breadcrumb", J2). La entrada no necesita teatro: necesita puertas.

**Evidencia.** Home con tres puertas EXPLORAR / ENCONTRAR MI CAMINO / VER PLANES (CONFIRMADO — PAGE-EXPERIENCE-MATRIX fila 1, validadas en D11); onboarding como umbral → 3 preguntas → ruta (CONFIRMADO — J2); `quiet-transition` como receta de aperturas (CONFIRMADO — MOTION-MAP).

---

### 2.2 APROXIMACIÓN — el contexto antes de la petición

**Definición.** El visitante se acerca al contenido y el sitio le da contexto **antes de pedirle nada**: quién es BAYONA, cómo funciona, qué viene después. La aproximación prepara; no vende todavía.

**Qué produce en el visitante.** Confianza y orientación: "esto lo entiendo sin esfuerzo". El visitante percibe que el sitio le explica el terreno antes de pedirle una decisión — la misma lógica del método: TE LEEMOS antes de CONSTRUIMOS (CONFIRMADO — conversionContent.js).

**Principios que expresa.** Progresión (D.1 — los pasos se ganan, el contexto precede a la petición), Precisión (D.2 — contexto sin ruido), Acompañamiento (D.8 — el sitio orienta antes de convertir).

**Gramática conceptual de movimiento.** La aproximación puede expresarse mediante entradas laterales que señalan dirección y progreso (`editorial-slide`, CONFIRMADO como receta con ese propósito declarado), mediante cascadas moderadas de datos de contexto (`data-cascade`), mediante la revelación progresiva de la información en el orden en que se necesita. La aproximación no debe retrasar: si el visitante ya sabe lo que quiere, debe poder saltarla (J3 existe — CONFIRMADO).

**Evidencia.** Onboarding: 3 preguntas antes de la ruta recomendada (CONFIRMADO — J2, D9); método TE LEEMOS → CONSTRUIMOS → TE ACOMPAÑAMOS (CONFIRMADO); sistemas de orientación Breadcrumb/NextChapter como acompañamiento constante (CONFIRMADO — doctrina D12); `editorial-slide` "señala dirección y progreso" (CONFIRMADO — MOTION-MAP).

---

### 2.3 TENSIÓN — el momento contenido

**Definición.** Un tramo breve en que algo está a punto de cambiar: el problema real del visitante, el instante antes de la transformación. La tensión en BAYONA es siempre **breve, justificada y se resuelve** — nunca es clima permanente (CONFIRMADO como principio — BIBLE D.3).

**Qué produce en el visitante.** Atención: contiene la respiración un instante. Y sobre todo: siente el valor del reposo siguiente. Sin tensión no hay contraste; con tensión permanente hay ruido.

**Principios que expresa.** Tensión (D.3), Precisión (D.2 — la tensión es acotada y resuelta, no decorativa).

**Gramática conceptual de movimiento.** La tensión puede expresarse mediante un escenario que detiene el tiempo un instante (`cinematic-stage`: "un único momento narrativo por página que justifica detener el tiempo", CONFIRMADO como receta), mediante el paso horizontal que convierte el scroll en avance (`horizontal-passage`), mediante contraste de composición (un elemento domina, el resto calla). La tensión **requiere aproximación previa** (no hay tensión en frío) y **resolución posterior** (no se deja al visitante suspendido).

**Evidencia.** Copy editorial de tensión real: "DESPIERTAS CANSADO / ENTRENAS SIN RESULTADOS / TU CUERPO TE HABLA / NO TIENES TIEMPO" (CONFIRMADO — conversionContent.js); `cinematic-stage` con límite de un momento por página (CONFIRMADO — MOTION-MAP + SCROLL-STORY-MATRIX); secuencia narrativa "elemento aparece → cámara cambia → texto se reconfigura" (CONFIRMADO como dirección — §35).

---

### 2.4 INMERSIÓN — dentro de la experiencia

**Definición.** El scroll se convierte en espacio: el visitante ya no lee una página, **está dentro**. La inmersión es el estado más intenso y por eso el más regulado: un único momento por página (CONFIRMADO — SCROLL-STORY-MATRIX), y solo donde la función lo justifica.

**Qué produce en el visitante.** La sensación que el propietario pidió: "recorrer una experiencia, no leer una página estática" (CONFIRMADO — §0/§34). Profundidad percibida: hay planos, hay recorrido, hay mundo.

**Principios que expresa.** Profundidad (D.6 — el eje Z de la identidad), Materia (D.5 — la inmersión se siente por la calidad de las superficies, no por efectos), Tensión (D.3 — la inmersión sostiene el momento narrativo).

**Gramática conceptual de movimiento.** La inmersión puede expresarse mediante la intensidad `immersive` (CONFIRMADO — "un único momento narrativo por página"), mediante escenarios fijos que evolucionan por estados o pasajes horizontales (recetas `cinematic-stage` / `horizontal-passage`), mediante deriva contenida de la imagen (`image-drift`: "profundidad sin mareo"), y — como excepción justificada — mediante el plano 3D (hoy: Globe3D en `/about`, única escena viva, CONFIRMADO; mañana: lo que Fase 7 admita vía `useScrollHandoff()`, cuyo snapshot congelado ya existe como arquitectura de entrega — CONFIRMADO en `scrollHandoff.js`). **Definir la inmersión no es ordenar escenas 3D**: el 3D sigue siendo excepción que requiere justificación (§39: "¿qué idea de la página representa este objeto?").

**Evidencia.** Visión del propietario "profundidad + movimiento + narrativa" (CONFIRMADO — §0); sistema de profundidad §42 (superficies, iluminación, fotografía, textura, 3D, contraste, composición, espacios); Globe3D viva en `/about` (CONFIRMADO — verificado en checkpoint V2.0); `useScrollHandoff()` + `createHandoffSnapshot()` congelada (CONFIRMADO — `src/engine/scroll/scrollHandoff.js`, PHASE5 §14).

---

### 2.5 DESCUBRIMIENTO — explorar sin ser empujado

**Definición.** El contenido emerge al ritmo de la lectura y el visitante explora por curiosidad, sin fricción y sin presión. Es el estado del que prueba gratis, del que curiosea, del que aprende.

**Qué produce en el visitante.** Curiosidad calmada: "puedo explorar". La experiencia de J1 — llega por un enlace, no quiere pagar, y aun así encuentra valor (reto 30 días, protocolo 7 días) sin cuenta, sin datos, sin fricción (CONFIRMADO — J1).

**Principios que expresa.** Progresión (D.1 — el contenido se gana por pasos), Humanidad (D.7 — se muestra, no se impone), Precisión (D.2 — cada hallazgo tiene jerarquía y razón).

**Gramática conceptual de movimiento.** El descubrimiento puede expresarse mediante revelación al ritmo de lectura (`editorial-reveal`: "el contenido emerge con calma al ritmo de la lectura", CONFIRMADO), mediante cascadas de datos con jerarquía (`data-cascade`), mediante rails compactos de ambiente (`compact-rail` — decoración declarada, nunca información crítica), mediante puertas que aparecen al final de cada tramo (NextChapter, CONFIRMADO como único cierre de página desde Fase 4).

**Evidencia.** J1 completo (CONFIRMADO); itinerario canónico de capítulos (CONFIRMADO — chapters.js); recursos gratuitos como conversión sin fricción (CONFIRMADO — routeMeta); recetas de lectura (CONFIRMADO — MOTION-MAP).

---

### 2.6 DECISIÓN — el instante protegido

**Definición.** El visitante elige. En ese instante, todo lo demás se aparta: ni narrativa, ni espectáculo, ni estética que compita. La decisión es el estado donde BAYONA demuestra que respeta al visitante (CONFIRMADO como principio — BIBLE D.10).

**Qué produce en el visitante.** Silencio y control: "nadie me empuja, puedo elegir". La conversión de BAYONA no se siente como cierre de venta sino como inicio de acompañamiento: la salida es una conversación (WhatsApp), no un pago (CONFIRMADO — J2/J3/J4).

**Principios que expresa.** Decisión (D.10), Claridad (regla J — la claridad gana), Precisión expresiva (D.2 — claims tipados, precio público, sin promesas).

**Gramática conceptual de movimiento.** La decisión puede expresarse mediante intensidad `quiet` (CONFIRMADO — páginas de decisión en quiet, "CTA sin retraso"), mediante jerarquía máxima del precio y la acción con silencio alrededor, mediante énfasis puntual de la zona `cta` que **nunca retrasa** el CTA primario (CONFIRMADO — MOTION-MAP: presupuesto cta 2, "nunca retrasar el CTA primario"). En decisión, el movimiento máximo admisible es una transición serena; nada de `immersive`.

**Evidencia.** SCROLL-STORY-MATRIX: `/plan/*` y `/checkout` en `quiet`, sin sticky ni horizontal, "máxima claridad, cero distracción" (CONFIRMADO); precios públicos en COP exactos (CONFIRMADO — D-002); CLAIM_TYPES sin promesas de resultado (CONFIRMADO).

---

### 2.7 SALIDA — continuidad o despedida con dirección

**Definición.** El tramo final: el visitante se va **sabiendo qué ocurre después**. La salida puede ser continuidad (siguiente capítulo) o despedida (confirmación serena, recolocación). Nunca es un corte seco ni un callejón.

**Qué produce en el visitante.** "Sé qué pasa ahora." Cierre sereno: la confirmación sin teatro (CONFIRMADO — `/order-confirmation` en SCROLL-STORY-MATRIX), la recolocación sin culpa (CONFIRMADO — J9: el 404 "nunca callejón sin salida").

**Principios que expresa.** Recuperación (D.4 — el retorno al equilibrio), Acompañamiento (D.8 — la continuidad es acompañamiento después de la decisión).

**Gramática conceptual de movimiento.** La salida puede expresarse mediante transiciones serenas entre bloques y capítulos (`quiet-transition`, CONFIRMADO), mediante continuidad visible (NextChapter, CONFIRMADO), mediante recolocación orientada (las 4 tarjetas del 404, CONFIRMADO). La salida no necesita clímax: necesita dirección.

**Evidencia.** NextChapter único cierre desde Fase 4 (CONFIRMADO — D4); order-confirmation "qué ocurre ahora" (CONFIRMADO — J2/J3, D7); 404 con 4 tarjetas de recuperación (CONFIRMADO — J9); `quiet-transition` como receta de cierres (CONFIRMADO — MOTION-MAP).

---

### 2.8 Nota sobre la recuperación

La recuperación (principio D.4 del Bloque 1) **no es un octavo estado espacial**: es la **condición de las transiciones**. Vive en el reposo entre estados — la alternancia movimiento → reposo (CONFIRMADO — reglas de calma del Motion Engine) — y en el carácter sereno de la SALIDA. Donde el Bloque 1 hablaba del ritmo tensión → recuperación, esta gramática lo traduce así: la TENSIÓN es un estado; la recuperación es el silencio que lo rodea y lo resuelve.

---

## 3. TRANSICIONES

Las transiciones describen qué estados pueden seguir a cuáles. Son PROPUESTO como criterio (derivado de la evidencia de cada estado); los estados y recetas citados son CONFIRMADO.

**Regla previa (CONFIRMADO — §38):** prohibido el scroll hijacking. Toda transición la decide el visitante con su scroll; la gramática describe el terreno, no arrastra a nadie.

### 3.1 Transiciones permitidas

| Desde | Hacia | Por qué (evidencia) |
|---|---|---|
| ENTRADA | APROXIMACIÓN | J2: umbral → preguntas → ruta (CONFIRMADO) |
| ENTRADA | DESCUBRIMIENTO | J1: llegar y explorar directamente (CONFIRMADO) |
| ENTRADA | DECISIÓN | J3: visitante que ya sabe qué quiere (CONFIRMADO) |
| APROXIMACIÓN | DESCUBRIMIENTO | El contexto prepara la exploración (DERIVADO) |
| APROXIMACIÓN | TENSIÓN | La tensión requiere aproximación previa (DERIVADO de BIBLE D.3) |
| APROXIMACIÓN | DECISIÓN | Contexto breve y decisión (programs → comparador, CONFIRMADO) |
| TENSIÓN | INMERSIÓN | La tensión se profundiza en espacio (PROPUESTO) |
| TENSIÓN | DESCUBRIMIENTO | La tensión se resuelve en contenido: problema → método (DERIVADO del copy: tensión → aspiración serena, CONFIRMADO) |
| INMERSIÓN | DESCUBRIMIENTO | Del espacio al contenido (PROPUESTO) |
| INMERSIÓN | DECISIÓN | Del momento narrativo a la elección (PROPUESTO) |
| INMERSIÓN | SALIDA | El momento termina con dirección (PROPUESTO) |
| DESCUBRIMIENTO | DESCUBRIMIENTO | Iteración de exploración: capítulos encadenados (CONFIRMADO — itinerario) |
| DESCUBRIMIENTO | APROXIMACIÓN | Profundización: más contexto antes de decidir (PROPUESTO) |
| DESCUBRIMIENTO | DECISIÓN | El hallazgo lleva a la elección (CONFIRMADO — recursos → WhatsApp con contexto, J1) |
| DESCUBRIMIENTO | SALIDA | Fin de la exploración con continuidad (CONFIRMADO — NextChapter) |
| DECISIÓN | SALIDA | Elegir y salir con dirección (CONFIRMADO — checkout → order-confirmation) |
| (cualquier estado) | SALIDA | La salida siempre está disponible: nunca un callejón (DERIVADO de J9 + doctrina de continuidad) |

### 3.2 Transiciones prohibidas

| Prohibida | Razón (evidencia) |
|---|---|
| ENTRADA → TENSIÓN | No hay tensión en frío: sin aproximación previa, la tensión es agresión (DERIVADO de BIBLE D.3: "nunca sin aproximación previa") |
| TENSIÓN → TENSIÓN | Encadenar clímax = ruido; un único momento narrativo por página (CONFIRMADO — SCROLL-STORY-MATRIX) |
| INMERSIÓN → INMERSIÓN | Ídem: la inmersión no se encadena; un momento por página (CONFIRMADO) |
| TENSIÓN → DECISIÓN sin resolución | No se decide con la tensión sin resolver: la tensión siempre se resuelve antes de pedir una elección (DERIVADO de BIBLE D.3 + regla de claridad) |
| DECISIÓN → TENSIÓN o INMERSIÓN | El embudo no vuelve al espectáculo: una vez en decisión, se avanza hacia la salida (DERIVADO de SCROLL-STORY-MATRIX: el embudo es quiet, "cero distracción") |
| Cualquier transición forzada | Scroll hijacking prohibido; el visitante controla el desplazamiento (CONFIRMADO — §38) |

---

## 4. CLASES DE PÁGINA Y SUS ESTADOS

Continuidad directa de BAYONA-WORLD-BIBLE §E.3 (las cinco clases derivadas de J1–J10 y SCROLL-STORY-MATRIX). Para cada clase: estados **estructurales** (la página no funciona sin ellos), estados **admitidos** (pueden aparecer si aportan) y estados **prohibidos** (no deben aparecer — requisito 9 del auditor).

### 4.1 Narrativa — home, about, parkour-academy

- **Estructurales:** ENTRADA, SALIDA.
- **Admitidos:** APROXIMACIÓN, TENSIÓN (un momento), INMERSIÓN (un momento), DESCUBRIMIENTO.
- **Prohibidos:** ninguno de los siete — pero TENSIÓN e INMERSIÓN con límite de un momento cada una (CONFIRMADO — SCROLL-STORY-MATRIX: `/` y `/parkour-academy` immersive con un escenario; `/about` balanced).
- **Lógica:** son las páginas que cargan la identidad; aquí la narrativa puede llevar el peso, sin eliminar nunca la legibilidad ni la salida.

### 4.2 Lectura — resources, faq

- **Estructurales:** DESCUBRIMIENTO, SALIDA.
- **Admitidos:** APROXIMACIÓN breve.
- **Prohibidos:** TENSIÓN, INMERSIÓN.
- **Lógica:** la lectura manda; nada compite con ella (CONFIRMADO — SCROLL-STORY-MATRIX: resources/faq en `quiet`, "nada compite con la lectura"). La tensión narrativa interrumpiría el estudio; la inmersión convertiría el contenido en espectáculo.

### 4.3 Decisión — /plan/raiz, /plan/fuerza, /plan/rendimiento, /plan/elite, /programs

- **Estructurales:** DECISIÓN, SALIDA.
- **Admitidos:** APROXIMACIÓN breve (contexto de comparación en programs).
- **Prohibidos:** TENSIÓN, INMERSIÓN.
- **Lógica:** "Decisión: lectura limpia, CTA sin retraso" (CONFIRMADO — SCROLL-STORY-MATRIX, las 4 fichas + programs en quiet/balanced sin sticky ni horizontal). Ningún estado que compita con la elección puede aparecer aquí.

### 4.4 Conversión — /checkout, /order-confirmation

- **Estructurales:** DECISIÓN, SALIDA.
- **Admitidos:** ninguno adicional.
- **Prohibidos:** TENSIÓN, INMERSIÓN, DESCUBRIMIENTO (como distracción), ENTRADA teatral.
- **Lógica:** "Máxima claridad, cero distracción" y "cierre sereno; confirmación sin teatro" (CONFIRMADO — SCROLL-STORY-MATRIX). El embudo es quiet de principio a fin; incluso el breadcrumb sigue visible para no perder al visitante (CONFIRMADO — J2).

### 4.5 Recuperación — 404

- **Estructurales:** ENTRADA (recepción), SALIDA (recolocación).
- **Admitidos:** ninguno adicional.
- **Prohibidos:** TENSIÓN, INMERSIÓN, DECISIÓN.
- **Lógica:** el visitante perdido no necesita narrativa ni venta: necesita cuatro puertas y un tono sereno (CONFIRMADO — J9: "recolocación en el sitio; nunca callejón sin salida"). El 404 no convierte: recoloca.

### 4.6 Nota sobre recepción — /onboarding (+ alias /entrar)

Recepción no es una sexta clase: es una página narrativa especial. Su ENTRADA es un **umbral inmersivo sin chrome** (CONFIRMADO — J2: "inmersivo, sin breadcrumb") que encadena APROXIMACIÓN (3 preguntas) → DECISIÓN suave (ruta recomendada, D9). Es la única página donde la entrada misma absorbe al visitante — y funciona porque no vende: orienta. Su inmersión es absorción sin distracción, no espectáculo.

---

## 5. MOBILE

**Base (CONFIRMADO — §43):** "Mobile no es un mini-desktop." Los estados **persisten** (el recorrido es el mismo); la gramática que los expresa **se simplifica**.

| Estado | En mobile (evidencia) |
|---|---|
| ENTRADA | Igual: puertas claras, jerarquía inmediata; el umbral sin chrome funciona igual (DERIVADO de J2) |
| APROXIMACIÓN | Igual, con recorridos cortos: `editorial-slide` reduce amplitud a `near` en móvil (CONFIRMADO — MOTION-MAP) |
| TENSIÓN | Se vuelve **composicional**: sin escenarios fijos — `cinematic-stage` degrada a "secuencia estática apilada, sin fijación" (CONFIRMADO — MOTION-MAP) |
| INMERSIÓN | Pierde sticky y horizontal (pila vertical convencional, CONFIRMADO); el parallax se limita (factor 0.4, máximo una capa simultánea, CONFIRMADO — `image-drift`); la profundidad se conserva por composición, no por efectos (DERIVADO de §43: "menos capas, menos partículas, menor DPR") |
| DESCUBRIMIENTO | Igual: revelado contenido con recorridos `near`; rails en modo estático con scroll manual y snap (CONFIRMADO — `compact-rail`) |
| DECISIÓN | Igual o más estricta: el CTA debe ser alcanzable sin desplazamiento narrativo (DERIVADO de la regla de claridad) |
| SALIDA | Igual: continuidad y recolocación intactas (DERIVADO) |

**Regla:** si un estado solo funciona en desktop con efectos que mobile no puede sostener, el estado está mal diseñado — no la versión mobile. La gramática debe sostenerse en la composición antes que en el efecto (PROPUESTO, derivado de §43/§44).

---

## 6. REDUCED MOTION

**Base (CONFIRMADO — §44):** reduced motion es una experiencia completa, no degradada. El contenido se entiende sin animación.

**Regla central (PROPUESTO como criterio, derivado de §44):** los estados espaciales son **espaciales, no temporales**. Existen por composición, jerarquía, material y orden — no por movimiento. Por tanto la gramática se sostiene íntegra sin animación:

- ENTRADA: las puertas están; no necesitan entrar volando.
- APROXIMACIÓN: el contexto está ordenado; no necesita deslizarse.
- TENSIÓN: el contraste composicional permanece (un elemento domina por escala y silencio alrededor).
- INMERSIÓN: los planos y la jerarquía de superficies permanecen; `cinematic-stage` muestra "estados apilados como sección normal" (CONFIRMADO — MOTION-MAP); el 3D degrada a estado estático coherente (fallback antes que escena — CONFIRMADO como arquitectura).
- DESCUBRIMIENTO: todo visible al instante (`editorial-reveal` → "visible al instante", CONFIRMADO).
- DECISIÓN: ya era casi estática por definición.
- SALIDA: continuidad visible; corte limpio sin cortina (CONFIRMADO — `quiet-transition`).

**Prueba del nueve:** si al quitar todo movimiento un estado desaparece, ese estado era un efecto, no un estado. Se corrige en el blueprint correspondiente.

---

## 7. REGLA ABSOLUTA DE CLARIDAD

**Cuando un estado espacial entre en conflicto con la claridad en una página de decisión o conversión: LA CLARIDAD GANA.** (Continuidad de BIBLE §J; regla del auditor para este bloque.)

Concreción en esta gramática:

1. Los estados que compiten con la elección — TENSIÓN e INMERSIÓN — están **prohibidos** en las clases decisión y conversión (sección 4).
2. El CTA primario **nunca se retrasa por movimiento** (CONFIRMADO — MOTION-MAP y SCROLL-STORY-MATRIX como reglas vivas).
3. Ningún estado puede ocultar, retrasar o dramatizar el precio, la disponibilidad o las condiciones (DERIVADO de CLAIM_TYPES + D-002).
4. Fuera de las páginas de decisión/conversión, la narrativa puede llevar el peso — pero la legibilidad y la salida nunca se eliminan (CONFIRMADO — §44: el contenido se entiende sin animación; J9: nunca callejón sin salida).

---

## 8. AUTOAUDITORÍA

### 8.1 Test anti-plantilla mecánica
**Pregunta:** ¿obliga este documento a todas las páginas a recorrer la secuencia completa?
**Resultado: NO.** La regla absoluta (sección 1) declara que cada página usa solo los estados que su función necesite; la sección 4 define estados prohibidos por clase (lectura sin tensión/inmersión; conversión sin descubrimiento; 404 solo entrada+salida); la sección 3 permite entradas directas a DECISIÓN (J3) y salidas desde cualquier estado. La secuencia completa existe como vocabulario, no como plantilla.

### 8.2 Test anti-API
**Pregunta:** ¿afirma este documento que un estado "es" o "implementa" una receta, intensidad o contrato del engine?
**Resultado: NO.** Todas las relaciones usan "puede expresarse mediante" (verificable en las secciones 2.1–2.7). No se inventan contratos, tokens, props ni firmas. Los elementos del engine citados existen (verificado contra `src/engine/`: recetas en MOTION-MAP/recipes, `SECTION_RANGES` traverse/enter/pin/exit en `useSectionProgress.js`, `useScrollHandoff`/`createHandoffSnapshot` en `scrollHandoff.js`) y se citan como vocabulario disponible, nunca como obligación.

### 8.3 Test anti-folclore (DF-010)
**Pregunta:** ¿introduce esta gramática estética territorial, paisajes, símbolos o paletas geográficas?
**Resultado: NO.** Ningún estado apela al territorio como estética. Territorio es un principio del ADN (presencia real, presencialidad, personas), no un estado espacial; cuando necesite expresión espacial (Bloque 3, mundo de la academia), se hará desde evidencia concreta (sede, sesión, lugar real), nunca desde folclore inventado.

### 8.4 Test de vocabulario
**Pregunta:** ¿usa este documento el vocabulario del engine exactamente, sin sinónimos paralelos?
**Resultado: SÍ.** Intensidades: `quiet/balanced/immersive` (nunca calm/medium/intense). Recetas por id exacto: `editorial-reveal`, `editorial-slide`, `compact-rail`, `cinematic-stage`, `data-cascade`, `image-drift`, `horizontal-passage`, `quiet-transition`. Zonas: `hero/body/supporting/cta/background`. Rangos existentes citados sin renombrar: traverse/enter/pin/exit. Los siete estados (ENTRADA/APROXIMACIÓN/TENSIÓN/INMERSIÓN/DESCUBRIMIENTO/DECISIÓN/SALIDA) son vocabulario nuevo de la capa conceptual y no sustituyen ningún término del engine.

### 8.5 Test anti-burocracia (DF-012)
**Pregunta:** ¿genera este documento documentación derivada, subdocumentos o registros redundantes?
**Resultado: NO.** Un solo documento. Las decisiones nuevas del auditor (DF-009/010/011/012) se registraron una sola vez en `docs/DECISIONS.md`. Sin checkpoints adicionales, sin SHAs congelados, sin documentos que documentan este documento.

### 8.6 Test de preparación del Bloque 3 (DF-011)
**Pregunta:** ¿permite esta gramática que los mundos sean realmente diferentes entre sí?
**Resultado: SÍ, es la condición de diseño.** Los siete estados se combinan de forma distinta por clase de página (sección 4) y podrán combinarse de forma distinta por mundo (Bloque 3): un mundo puede vivir de DESCUBRIMIENTO + APROXIMACIÓN, otro de un único momento de INMERSIÓN, otro de DECISIÓN pura. La diferenciación real la exigirá DF-011 con sus cinco preguntas; esta gramática proporciona el material para responderlas. Los mundos aún no existen: este documento no los anticipa ni los condiciona más allá del vocabulario.

---

*Clasificación global: los elementos del engine, recetas, reglas de calma, journeys y matrices citados son **CONFIRMADO** (verificados contra el repo en la ejecución del Bloque 2); las síntesis marcadas son **DERIVADO**; las reglas de transición y combinación son **PROPUESTO** (vinculantes para Bloques 3–5, inexistentes hoy en el producto). Este documento no implementa nada: gobierna.*
