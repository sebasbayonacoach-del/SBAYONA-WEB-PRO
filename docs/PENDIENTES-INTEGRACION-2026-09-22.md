# BAYONA · pendientes de integración (2026-09-22)

Estado a media mañana, mientras los 4 carriles terminan. Este fichero existe
porque la sesión anterior de Qoder se rompió a mitad de trabajo y el contexto
se perdió. Si esto se vuelve a romper, se retoma aquí.

Fuente de verdad de las 70 anotaciones:
`docs/BAYONA_DIRECCION_PRODUCTO_UX_2026-09-22.md`

---

## 1. YA HECHO Y VERIFICADO EN CÓDIGO (no repetir)

Verificado leyendo el fichero, no por informe de agente.

| Brief | Prueba en disco |
|---|---|
| Com. 45 / §4: un solo sistema de "siguiente parada" | `src/config/chapters.js` es la única fuente; `NextChapter.jsx` se monta una vez en `App.jsx`. `PremiumRouteChrome.jsx` retiró su `ROUTE_CONTINUATIONS` duplicado (comentario propio, línea 6-14). |
| §3 orden del recorrido | `CHAPTER_ORDER` = `/`, `/about`, `/programs`, `/parkour-academy`, `/community`, `/app`, `/shop`, `/resources`, `/faq`, `/entrar`. BAYONA+ enlaza a tienda. FAQ cierra antes de cuenta. |
| §4 nav izquierda→derecha | `NAV_GROUPS` en `Layout.jsx`: RECORRIDO(Método) · ENTRENAR(Programas, Parkour) · ECOSISTEMA(Comunidad, BAYONA+, Tienda) · DECIDIR(Recursos, FAQ) + Inicio + Mi cuenta. Mismo orden que el brief. |
| §6 regla de producto: bono de llegada no es crédito hasta que se reclama | `RewardsProvider.jsx`: `bonusClaimed:false` y `totalEur` solo suma el bono si está reclamado. |
| Com. 4 / esta mañana: etiqueta que no convencía | `universeScale.js` etapa 3: "Las instalaciones" → **"El recorrido"**. |
| Com. 5: línea de progreso "cortada, distinta según la página" | `v3-finish.css` anclada a `--nav-height` (antes 73 px fijos); `route-identity.css`: fuera las pautas `mask-image` de about/programs/shop y de las 4 fichas de plan, fuera el anclaje inferior exclusivo de /community, grosor unificado a 2 px. |
| Com. 62-63: el mando parecía "otra aplicación" | `bayona-polish.css`: el navbar se ocultaba a matar en las 4 rutas de producto. Ahora solo en caja y confirmación; `/panel` recupera cabecera (con `product-site-chrome` compensando el navbar fijo) y pie (`FOOTER_ROUTES` en `App.jsx`). |
| Com. 8: WhatsApp poco reconocible | `Layout.jsx`: glifo real de WhatsApp + "Hablar por WhatsApp", en `currentColor` (la regla de marca prohíbe el verde). `overrides.css`: en ≤600 px vuelve a solo-icono para no tapar el acordeón del FAQ. |

Tests: `Layout.test.jsx` + `Layout.nav.test.jsx` + `universeScale.test.js` → 17/17 en verde.

**Arreglo de herencia:** Codex renombró los grupos del menú y dejó
`Layout.nav.test.jsx` esperando ENTRENAR/EXPERIENCIAS/CONOCER/APRENDER.
4 tests en rojo en el repo al empezar. Actualizado a la arquitectura nueva con
la razón escrita en el propio test.

---

## 2. PENDIENTE OBLIGATORIO AL INTEGRAR (causa conocida, arreglo diseñado)

### 2.1 Sellos que se regalan por explorar — incumple §6 y Fase 0

- Dónde: `src/lib/scale/UniverseScaleProvider.jsx:60-64`
- Qué hace: `for (const mision of misiones) if (mision.hecha) award({ id, label, eur })`
  Las misiones se evalúan contra `routes` y `sections` visitadas, o sea **crédito
  automático por navegar**, que es lo que el brief veta: «El usuario debe
  descubrir y hacer clic para reclamar regalos. No se regalan por scroll
  pasivo» (§6) y «Evitar créditos automáticos por scroll» (Fase 0).
- Arreglo diseñado (no ejecutar a ciegas):
  1. `RewardsProvider`: `seals` pasa a `descubiertos` + `reclamados`; `totalEur`
     solo cuenta los reclamados. Añadir `claimSeal(id)` (idempotente, solo sobre
     descubiertos).
  2. `UniverseScaleProvider`: dejar de llamar a `award()`; seguir publicando
     `misiones` con `hecha` para que la interfaz las enseñe como "descubierto,
     pendiente de reclamar".
  3. `components/rewards/ArrivalBonusCard.jsx` + `styles/rewards.css`: botón
     RECLAMAR por sello y estados `encontrado / pendiente / reclamado / usado`
     (§6 los pide con esos nombres).
- **Por qué no lo hago ya:** el paso 1 y el 3 son ficheros del carril D
  (`lib/rewards/**`, `components/rewards/**`, `styles/rewards.css`) que está
  editando ahora. Escribir encima produciría conflicto de cascado o trabajo
  duplicado. Se hace en la pasada de integración, con el carril D terminado.

### 2.2 Fondos con `!important` — ✅ COMPROBADO, riesgo cerrado

`src/styles/luxury-typography-final.css:297-359` pinta fondo con imagen sobre
`.experience-proof-section.v2-plane--bone`, `.home-memberships-section` y
`.home-services-configurator`. Medido tras terminar el carril A: los tres
selectores **siguen existiendo** en el marcado (3, 2 y 3 ocurrencias en JSX) y
las tres imágenes están en `public/images/scenes/`. No se apagó nada.

### 2.4 Pines de copy literals: reaccionar en UNA pasada al final

El repo pinea cadenas literales de copy en contratos
(`Home.contract.test.jsx`, `conversionContent.test.js`,
`test/conversionRegression.test.jsx`). Como el dueño mandó reescribir el copy de
toda la web, **cada página que tocan los carriles rompe pines**. Ya
reconciliados 6 con la guarda de honestidad intacta:

- h1 de Home en 3 ficheros → 'ENTRENA CON DIRECCIÓN. CONSTRUYE UN CUERPO QUE SÍ
  PUEDAS SOSTENER.'
- `primaryAction.label` → 'QUIERO ENTRENAR CON DIRECCIÓN'
- cuerpo del bloque de proceso → 'No fabricamos cifras ni antes/después falsos…'
  (sigue negando cifras inventadas; no se rebajó la exigencia)
- 4 títulos del bloque de problema → en voz del cliente
- `LeadMagnet.test.jsx` (3 búsquedas por nombre accesible) → 'Tu primera acción
  clara, gratis' / 'QUIERO MI PRIMERA RUTINA'

Quedan 2 rojos en Home y se espera más en programs/plan/parkour/comunidad/
recursos/faq/tienda/app/onboarding/panel. **No ir corrigiendo uno a uno**: al
cerrar los carriles, ejecutar `npx vitest run`, leer los pares
`expected «nuevo» to be «pineado»` y decidir cada uno. Regla de decisión: se
actualiza el pin si el copy nuevo no introduce plazo, urgencia, cifras,
testimonios fabricados ni claims médicos; si los introduce, se corrige el copy.

### 2.5 Chrome devuelto por Lane A (verificado en disco, no por su informe)

- Cristal de las tarjetas: vive en `luxury-typography-final.css:406-421`
  (`.experience-proof-marquee .experience-proof-card`, `blur(16px)`). Lo mataban
  dos bloques con `!important` en `v2-editorial.css` (líneas 204-208 y 242-245).
  **Retirados** el 2026-09-22 citando §10. Comprobar en captura que la tarjeta se
  ve de verdad translúcida sobre el plano hueso.
- Microcopy legal del brief: presente en `ExperienceProof.jsx:128` y
  `GlobeTestimonials.jsx:1074`, literal del doc.
- Edades 34/42/45/50: fuera del JSX (queda solo un comentario que explica
  por qué).
- Carrusel hacia la derecha: `@keyframes experience-proof-deriva-derecha`
  (`experience-proof.css:73`, aplicado en `:83`).

### 2.13 Pines de copy reconciliados (8) y rectificación sobre la tienda

**Pines actualizados** (todos: el dueño mandó reescribir el copy, así que se mueve
el literal y se conserva la guarda; ninguno se ha borrado ni debilitado):

| Contrato | Pineado antes | Ahora | Guarda que sigue viva |
|---|---|---|---|
| h1 Home (×3 ficheros) | PASA. TE ENSEÑO BAYONA. | ENTRENA CON DIRECCIÓN. CONSTRUYE… | sin claims, sin plazo |
| `primaryAction.label` | QUIERO EMPEZAR MI TRANSFORMACIÓN | QUIERO ENTRENAR CON DIRECCIÓN | destino `/programs` |
| cuerpo del proceso | No inventamos números… | No fabricamos cifras ni antes/después falsos… | niega cifras inventadas |
| 4 problemas de Home | DESPIERTAS CANSADO… | en voz del cliente | siguen siendo 4 |
| dolor «cuerpo que habla» | Espalda, rodillas, cuello… | No dramatizamos ni prometemos curas… | claims médicos vetados |
| heading de visión | ESTO ES LO QUE VAS A NOTAR. | EL CAMBIO EMPIEZA CUANDO DEJAS DE ADIVINAR. | sin «90», en plural |
| 5 sensaciones de visión | Te levantas con otra energía… | Abres el día con una acción concreta… | 5, sin resultado medible |
| 3 pasos del método | TE LEEMOS / CONSTRUIMOS / TE ACOMPAÑAMOS | LEEMOS TU REALIDAD / DISEÑAMOS TU RUTA / AJUSTAMOS CONTIGO | 3, marcadores 01-03, marco no médico |

Para las dos últimas **no aflojé la guarda**: el contrato también exigía que el
cuerpo de la visión empezara con «El espejo va detrás.» y terminara en «Vamos a
verlo juntos.», y el reescritado se los había cargado. En vez de borrar las dos
aserciones, **devolví esa frase al copy** (`conversionContent.js`), que es
mejor texto de todos modos.

Verificación: `conversionContent`, `Home.contract`, `Home.test`,
`conversionRegression`, `About.test`, `commercialSync` → **38/38 en verde**.

**Rectificación que debo.** Dije que la tienda enseñaba la misma foto a productos
distintos (manga-larga vs compresión; reloj vs báscula). Medido otra vez ahora:
**43 productos, 43 fotos distintas, 0 colisiones**. En el momento en que lo medí
era cierto, pero mi sonda contaba también `siteMediaInventory`, que es un espejo
del mismo objeto, así que inflaba los conteos ×3 (de ahí el «x4» que te cité).
Lo que sí queda, y es un problema distinto: **`bascula-inteligente` se ilustra con
`getting-business-finances-in-order.jpg`** —una foto de finanzas para una báscula.
No es repetición, es stock que no representa el producto: justo el «imagen que no
suma» del comentario 19.

### 2.14 Reparto de escenas completado (agente de media)

- Reuso máximo global 25 → 19 contando espejos; en `siteMedia` puro **12 → 9**.
- Repeticiones **dentro de la misma página: 36 → 18**.
- Sin ninguna repetición: about, los 4 planes, parkourAcademy, faq, onboarding.
- Las 141 rutas locales comprobadas en disco: **0 apuntando a un fichero que no
  exista**.
- Fotos nuevas necesarias para llegar a cero repeticiones: **18** (home 1,
  programs 1, app 3, community 2, resources 11). Actualiza `LOTE-IMAGENES-63.md`:
  el número grande era 63 para "una imagen por sección"; para "sin repetir en la
  misma página" son 18.
- 18 entradas **no** se movieron a propósito porque su `alt` pasaría a mentir
  (playa, terraza, círculo, comida real…). Si se generan fotos, son las primeras
  de la lista.


### 2.16 Defectos visivos medidos en pantalla (capturas reales, no informes)

Montado un build verificado aparte (`dist-verify`, `vite preview` en
**`http://localhost:4188`** — ojo: escucha solo en IPv6, `127.0.0.1` responde
000) y capturadas `/`, `/programs` y `/parkour-academy` a 1440×900 en
`artifacts/latest/viewport/v-*.png`, sin errores de JS.

**Lo que se ve bien y vale lo que pidió:** el bloque de visión de Home con
entrenador + persona y fondo desenfocado (comentario 1), titular en dos tonos,
WhatsApp con glifo real y texto explícito (16), y el pase VIP desplegado como
tique con selector de país, `RECLAMAR` y `RECLAMAR TODO` con la línea honesta
«cortesía para tu plan, no dinero retirable» (13).

**Cuatro defectos que ningún test ve, los cuatro en ficheros del carril D:**

1. **El pase VIP desplegado tapa contenido.** En `/programs` es un panel fijo de
   ~25 % del ancho que deja la columna `03 · SERVICIOS` y el arranque de
   `PUNTOS DE PARTIDA` debajo. `scripts/probe-overlays.mjs` lo mide: cubre el
   **100 %** del rótulo «01» en Home y el **94-100 %** de «04»/«05» en Parkour.
   → `styles/rewards.css`: que el panel no pise contenido (ancho, o empujar el
   `main`, o plegar al hacer scroll).
2. **El tooltip del asistente sale cortado y encima de titulares.** En Home se
   lee «Vamos juntos. Te enseñé la c…» truncado sobre el párrafo; en `/programs`
   aparece literalmente **«Cuat»** solapado al H2 «TU EDAD, TU NIVEL».
   → `components/companion/companion-chat.css` + `GuideCompanion.jsx`: ancho
   mínimo, no solapar cabeceras, y que el texto quepa.
3. **«PREGUNTAR» pisa el H2** en `/programs` (esquina inferior izquierda).
4. **Cuadradito naranja huérfano con un punto** a la izquierda de `/programs`
   (~y 685) y otro bajo el tooltip en Home: parecen restos de un marcador sin
   estilo. Identificar antes de borrar.

**Lo que NO voy a perseguir, y por escrito para que no parezca olvido:** de los
36 solapes, la mayoría es texto pasando **bajo el navbar fijo** a mitad de
scroll. Con cabecera fija translúcida eso es el comportamiento normal de
cualquier web, y `probe-overlays` lo cuenta porque mide «en reposo en ese paso».
**0 controles bloqueados** en las tres rutas: nada es inclicable-incorrecto. Lo
que sí se arregla es lo que se ve en la pantalla, no el número.

### 2.17 P0 NUEVO · la billetera tapa el hero de Comunidad

Visto en `artifacts/latest/viewport/f-community-00.png` (1440×900, scroll 0):
`ArrivalBonusCard` en estado abierto es un panel **fijo a la derecha que se
queda durante todo el scroll** y en `/community` tapa el «PASE DE SOCIO» —que es
el artefacto del bloque de referencia que el dueño usa como vara para todo el
sitio— dejando literalmente «ENTRADA GR…», «REQUI…», «SE PIDE POR WHATSAP…» y la
tarjeta «02 RITMO SEMANAL» cortadas.

No es el mismo defecto que 2.16 (duplicación widget+pase): este es **la capa
flotante cubriendo contenido de valor en el primer pantallazo**, en la página
que más le gusta. En `/programs` repite con las filas de audiencia.

**Lo que hay que decidir al arreglar** (el dueño pidió un modal bloqueante a la
llegada, así que no es quitarlo):
- (a) **modal de verdad**: velo que oscurece el fondo, tarjeta centrada, y al
  cerrar ya no vuelve a aparecer en la visita. No compite con el contenido
  porque el contenido está detrás del velo.
- (b) **panel que se pliega solo al empezar a bajar**, como ya hacen el orbe del
  acompañante y el botón de WhatsApp con `useRecedeWhileScrolling`.
(a) es más fiel a «esto es lo primero que aparece en la web y no puede avanzar
sin recibir su tique» (comentario 13). Recomiendo (a) y dejo (b) como plan B.

Comprobación obligatoria tras el arreglo: volver a capturar `/community` y `/`
a 1440 y a 390 y **ver** que el pase de socio se lee entero.

### 2.18 Nota sobre el instrumento, para no volver a engañarnos

«El bocadillo del asistente sale cortado a *Cuat*» **era falso**: es el efecto de
máquina de escribir (`companion__typed`) y `capture-viewport.mjs` espera 800 ms
entre pantallas. Repetido con `ESPERA=4200 ESPERA_INICIAL=5000` el texto sale
entero. Cuatro instrumentos distintos han dado alarma falsa hoy (grep sin
contexto, espejo de `siteMediaInventory` contando ×3, sonda sin `styles.css`, y
esta captura con espera corta). Regla práctica que se queda: **antes de arreglar,
repetir la medición cambiando el instrumento.**


### 2.20 Patrón de defecto: huecos de medio SIN imagen y columnas que no respiran

Mirando capturas una a una (no por informe), aparece **la misma tres familias de
defecto en páginas distintas**. Esto es lo que queda entre "compila" y "se ve de
lujo".

**a) Contenedores de imagen que se pintan vacíos.**
- `/programs` fila 01 NIÑOS: `div.programs-stage-media` con `background:
  rgb(12,12,13)` y **sin `<img>`**; por detrás asoman las esferas grises del
  canvas 3D. Los datos existen (`siteMedia.programs.audiences[0..4].src`): falta
  el conector. → delegado al agente `programs-media`.
- `/parkour-academy` tarjetas de edad (`f-parkour-academy-02.png`): **dos
  rectángulos grises vacíos** debajo de «8—12 EXPLORADORES» y «18+ MOVIMIENTO
  ADULTO».
- Sospecha sin confirmar: puede haber más huecos así en `/resources` y `/shop`.
  Hay que barrerlo con una sonda, no a ojo: un `div` con clase `*-media`,
  `*-figure`, `*-visual` que no contenga `img`, `video`, `canvas` ni
  `background-image` es un candidato.

**b) Columnas de texto tan estrechas que parten las frases a una palabra por
línea.** En `/parkour-academy`: «Juego, / coordinación y / confianza para /
moverse con / atención.» y «Técnica y / fuerza / para / convertir / energía / en
/ movimiento / controlado.». Es el «no respira nada» del comentario 10 dicho de
otra forma, y se ve roto. Causa probable: la retícula de tres tarjetas reparte
el ancho entre el número grande y el texto sin dar mínimo al segundo.

**c) Las capas fijas se comen contenido en el primer pantallazo.** Ver 2.17
(Comunidad) y 2.16. En `/parkour-academy` la billetera y el bocadillo del
asistente tapan la tercera tarjeta.

**Qué NO está roto, para que el cuadro no salga sesgado:** `/app` es la página
más lograda de las revisadas — «ACCESO PRIORITARIO» en vez de «en desarrollo»,
titular de tres líneas con blanco y naranja alternados bien hecho, mockups de
móvil y tablet con su dashboard, fondo cinematográfico desenfocado y chrome
completo. Eso son los comentarios 39-42 entregados de verdad.


```
npx vite build --outDir dist-verify                 # EXIT 0, solo el aviso de vendor-three
npx vite preview --outDir dist-verify --port 4188 --strictPort   # solo IPv6: usar localhost
MSYS_NO_PATHCONV=1 PASOS=5 SALTO=880 DISMAR=RECLAMAR PREFIJO=v- \
  node scripts/capture-viewport.mjs http://localhost:4188 / /programs /parkour-academy
MSYS_NO_PATHCONV=1 ANCHO=1440 ALTO=900 node scripts/probe-overlays.mjs http://localhost:4188 / /programs
node scripts/probe-clases-huerfanas.mjs             # 44 en todo el sitio
```


### 2.15 ☠️ BUG DE PRECIO EN LA PASARELA (corregido, verificar tú)

**Gravedad: la más alta encontrada hoy.** `src/lib/commerce/plans.js` definía la
oferta de introducción como `'PRIMER MES €0 · DESPUÉS €1/MES'` con
`thenAmountEur: 1`. `src/lib/commerce/order.js:64` convertía ese 1 en
`recurringEur` del pedido, y el label se pintaba en la **página de ventas de
cada plan** (`PlanPresentation.jsx`) y en la caja (`Checkout.jsx:431` →
`CheckoutPanel`). Resultado: un cliente de FUERZA (70 €/mes) o RENDIMIENTO
(116 €/mes) leía y aceptaba **1 € al mes recurrente**.

Lo había señalado el dueño en el **comentario 26** de sus anotaciones: «dice
primer mes 0 euros, después un mes. Eso no va ahí… no se puede pagar 0 euros y
después un mes, porque se rompe».

**Añadido:** un test pineaba exactamente ese importe (`recurringEur` → `toBe(1)`),
así que el suite estaba **blindando el error** y daba verde.

**Arreglo aplicado (22-09 09:16):**
- La oferta ya no trae importe recurrente: `thenAmountEur: null` = «el precio
  publicado del plan».
- `order.js`: `recurringEur` cae al total del plan cuando la oferta no fija
  importe propio.
- Adapters Stripe y PayPal: envían `order.recurringEur`, no la constante.
- `PlanPresentation.jsx`: «PRIMER MES SIN COSTE · después <precio real del
  plan>», leído de `plan.priceDisplay`, imposible de desincronizar.
- `commerce.test.jsx`: en vez de `toBe(1)`, exige `recurringEur === subtotalEur`
  y `=== 70`, con la explicación en el propio test.
- Verificado: `npx vitest run src/test/commerce.test.jsx src/pages/Checkout.test.jsx
  src/components/commerce` → **29/29 en verde**.

**Decisión pendiente del dueño:** si el primer mes gratis **no** es una oferta
real de su negocio, hay que quitar el bloque entero (se lo propongo en la
entrega). Lo que no puede quedarse es el número.

### 2.15-bis Quedaba otra boca del mismo anuncio (14:07, cerrado con guarda)

Al repasar el árbol después de arreglar el modelo, `Checkout.jsx:419` seguía
diciendo a mano, en el paso de pago:

> Primer mes €0 · después €1/mes en la pasarela

Mentira del mismo tipo que la del §2.15 y en el sitio más delicado: justo antes
de introducir la tarjeta. El arreglo del `plans.js` no la tocaba porque el texto
no venía del modelo, estaba escrito en el JSX. Cambiada a «Primer mes sin coste ·
después, el precio publicado del plan», sin cifra: aquí el importe real ya se ve
arriba, en la línea del total, y en la propia pasarela.

Para que no vuelva a quedar una boca suelta, guarda nueva en
`src/test/conversionRegression.test.jsx` — *Honestidad · el precio recurrente no
se escribe a mano en una pantalla*: recorre **todas** las fuentes de producto
(`pages/`, `components/`, `App.jsx` y, desde esta ronda, `lib/` y `config/`) y
revienta si detrás de un «después» aparece un euro con número o un `1/mes`.
`después de 3 meses` es legal; `después €X` no, porque ese número tiene que salir
de `order.recurringEur` o de `plan.priceDisplay`.

Y como un «0 culpables» no prueba nada por sí solo (en esta sesión ya pasaron
cinco veces), el mismo test lleva el caso positivo pineado con el texto exacto
que estaba en pantalla y tres negativos. Los cuatro comentarios de
`plans.js`, `order.js`, `stripe.js` y `paypal.js` que describían la oferta como
«1 €/mes después» decían ahora lo contrario del código: corregidos, porque un
comentario que explica un defecto se copia.

**Comprobado:** `npx vitest run src/test/conversionRegression.test.jsx` → 9/9.

### 2.21 El cromo fijo de la izquierda se comía el principio de las frases

**Qué se veía.** En `/about`, el lead del titular de entrada empezaba
«**itrenamiento**, fuerza y nutrición desde tu punto de partida»: la «E» estaba
detrás del chip «PASE VIP $70.000». En Home, `probe-overlays.mjs` marcaba
«PUNTO DE PARTIDA» con el 17 % cubierto por `.arrival-bonus-layer`. Capturas de
prueba: `zz-about-00.png` (antes) y `zz2-about-00.png` (después).

**Por qué pasaba.** El muelle abajo-izquierda (acompañante, orbe y billetera) es
`position: fixed` en `--dock-left` (20 px) y su columna mide 80 px: invade 100 px
de pantalla. El contenedor editorial arrancaba en 80 px de foso
(`--layout-gutter: clamp(1.25rem, 4.2vw, 5rem)`). Y el capado del ancho del chip
existía, pero solo desde `90rem` (1440 px): de 1100 a 1439 el chip seguía en su
versión de una línea, con 165 px metiéndose 45 px dentro del texto.

**Qué se cambió, y por qué ahí.**

- `luxury-system.css`: a partir de 1100 px, `--layout-gutter` pasa a
  `calc(var(--dock-left) + 5rem + 1.25rem)` (120 px). Se reserva el carril; no se
  mueve la billetera.
- `rewards.css`: el bloque que capaba el chip a `50vw - 620px - dock-left` baja de
  1440 a 1100 px y el ancho pasa a `max(5rem, …)`, para que en pantallas enormes
  siga aprovechando el hueco real y en 1100-1439 quepa dentro del foso.

**No se tocó la geometría del muelle** (`--dock-slot-*` en `ds-tokens.css`): está
casillada a propósito, y mover una casilla vuelve a montar el orbe sobre el
crédito — el defecto que el propio comentario de ese fichero cuenta.

**Medida después del arreglo, sobre el build:** `probe-overlays.mjs` a 1440 ya no
devuelve **ningún** solape del muelle en `/`, `/about` ni `/programs` (los 30 que
quedan son texto pasando bajo el navbar fijo, que es el comportamiento normal, y
0 controles bloqueados), y a 1200 tampoco. A 900 px el chip sigue en su versión
estrecha y **vuelve a tocar** («CRITERIO», 35 %): el foso allí es de 38 px y no
hay carril que reservar sin comerse el ancho. Queda abierto, con dos salidas
posibles y ninguna elegida: bajar el muelle a una sola casilla (solo orbe) por
debajo de 1100, o centrarlo abajo. Decisión del dueño, porque cambia el gesto.

**Sueltos que la sonda confirmó y no se han tocado:**

- `/programs`: el globo del acompañante con su `×` cae sobre la lista de
  prácticas de la ficha NIÑOS/JÓVENES (2 avisos, visto también en
  `zz3-programs-02.png`). Es plegable con el `×` y se aparta al scrollear, así
  que está clasificado como diseño y no como defecto. Si él quiere los chips
  siempre legibles, la opción es que el globo se ancle arriba a la derecha.
- `/programs`: «Al mes» bajo el botón fijo de WhatsApp, 69 %, a 1440 (scroll
  9703). Mismo familia: capa fija sobre texto.
- `/about`: el mapa del globo de testimonios cubre su propia etiqueta «Explora el
  mapa» (`.globe-testimonials-world-map`, que es `width: min(106%, 1440px)`).
  **Resultado al revisarlo: aviso falso de la sonda.** La etiqueta tiene
  `pointer-events: none` y `z-index: 4`, o sea se pinta DELANTE; lo que hace
  `elementFromPoint` es atravesarla y devolver el mapa de detrás. Añadido el
  aviso en `probe-solapes.mjs` (`[etiqueta pointer-transparente: el hit-test no
  vale aquí]`) para que no vuelva a contarse como defecto.
- **Botón `×` del globo del acompañante deformado** (medido en DOM en `/about` a
  1440): `companion.css:232` pide `1.45rem` (23 px) de lado y lo que sale es
  **23 × 48 px**, un rectángulo alto. Es un `min-height: 48px` de diana táctil
  que gana por cascada desde otra hoja; **no está localizado** (los candidatos de
  `app.css`, `community.css`, `programs.css` y `about.css:652` son todos de otro
  alcance). Para cazarlo: abrir el globo y pasar
  `probe-regla-que-gana.mjs <base> .companion__dismiss min-height`.
- **El globo del acompañante tapa titulares cuando se abre abajo a la
  izquierda.** No es solo teórico: en `glo-about-08.png` (scroll 7040) el recuadro
  «Empecé sin método y lo pagué caro…» está encima de la H2 de la sección
  EXPERIENCIAS y le come las primeras letras. Es plegable, pero **aparece solo** y
  sobre un titular, así que esto sí es un defecto, no diseño. La decisión es de
  él: anclar el globo arriba a la derecha, o que no se abra sobre un titular.

### 2.22 La diana táctil de 48 px estaba deformando botones en escritorio

**Qué pasaba.** `src/overrides.css:89` fijaba `min-height: 48px` a **todos** los
`<button>` del sitio. En el dedo es lo correcto (WCAG 2.5.5); en escritorio, no.
Medido con la sonda nueva `scripts/probe-botones-estirados.mjs` sobre el build:
**25 controles compactos deformados en 6 rutas** —la `×` del globo del
acompañante (23 × 48), los diez puntos del mapa de testimonios de About
(24 × 48), seis steppers de cantidad del configurador de Programas (32 × 48) y
tres celdas del calendario de Comunidad (27-33 × 48)—. Ninguno se diseñó así:
su propia hoja les daba un tamaño cuadrado y una regla global les estiraba el
alto.

**Qué se cambió.** Suelo de **24 px** en puntero fino (WCAG 2.5.8, AA, y respeta
el tamaño diseñado) y los **48 px** completos dentro de `@media (pointer:
coarse)`, que es donde la diana grande evita el fallo de puntería. Un botón no
puede ser un cuadrado y una diana de dedo a la vez con la misma regla.

**Medido después:** 25 → **6** en puntero fino, y **0** en modo táctil a 390 px
(la diana grande sigue ahí donde hace falta). Los 6 que quedan son los steppers
de Programas, y **no se han tocado**: `programs.css:169-175` declara a propósito
«Route-local 48px interaction targets» para toda la zona de oferta y
calculadora. Un rectángulo alto de 32 × 48 en un +/− es ese diseño, no el
defecto. Verificado con `diana-about-08.png`: la `×` del globo vuelve a ser
cuadrada.

 Suite tras el cambio: **744/744** y `vite build` correcto.

**Qué no puede decir esta sonda.** Mira ancho < 48 y alto ≈ 48, así que no
distingue «estirado por la global» de «así lo pidió la hoja de la ruta» sin leer
el comentario de esa hoja. Por eso los 6 restantes se cerraron leyendo
`programs.css`, no con el número.

### 2.23 `/panel` y `/entrar` estaban a 115 px mientras la sonda decía «todos los titulares en escala»

**El agujero del instrumento.** `probe-tipografia-h1.mjs`, sin rutas por
argumento, recorría `['/']`. Con eso anunciaba «Todos los titulares dentro del
umbral» y `/panel` y `/entrar` estaban a **115 px** (umbral 76), es decir: el
mismo defecto del que salió el «modo luxury» del dueño, vivo en dos rutas que
nadie medía. No era un descuido de gusto, era un sondeo que miraba una página.

**Arreglado por las dos puntas.**

- `rutas-de-auditoria.mjs` exporta ahora `rutasDelEnrutador()`: lee `App.jsx`,
  quita el wildcard y las rutas con `:parametro`, y **se niega a devolver lista
  vacía**. `probe-tipografia-h1.mjs` la usa por defecto cuando no se le pasan
  rutas. Barrido completo: 17 rutas, todas a 66 px.
- `auth-members.css`: `.entrar-command h1` deja de llevar su propio
  `clamp(3.2rem, 8vw, 7.4rem)` y pasa a `var(--lux-fs-h1)` (66 px a 1440), el
  token que ya manda en el resto del sitio. Medido antes y después con la sonda.
- En la misma hoja, los techos de `44rem` / `45rem` del bloque y del párrafo
  pasaron a `min(…, 100%)`: con el titular a 115 px la tercera tarjeta de estado
  («INVITACIÓN COMPARTIDA») salía por fuera del área de lectura y
  `overflow: hidden` de `.entrar-page` la cortaba. En `oj-panel-00.png` se ve
  entera desde el cambio.

**El desborde, resuelto al segundo intento — y por qué el primero no hizo nada.**
La línea más larga del titular, «desbloqueado.», pintaba de 768 a 1330: 102 px
más allá de su propio cajón. Se intentó ensanchando la retícula en
`auth-members.css` (`.entrar-shell`) y **la columna no se movió un píxel**. La
causa, leída del DOM: `bayona-polish.css:604` redeclara la retícula con
`.entrar-page > .section-shell`, que **gana por especificidad** (dos clases y un
descendiente contra una), y su tope era `minmax(300px, 460px)`. Subido a
`minmax(300px, 37rem)` —592 px, lo que pide la palabra, que son 563 px de
tinta—, la medida pasa de `+103` a **−29** a 1440, −92 a 1280 y −108 a 1000: la
línea vive dentro de su columna y cuadra con el borde de las tres tarjetas
(1245 contra 1246). El cambio de `auth-members.css` se revirtió tal como estaba;
no se deja en el repo un repartido tocado sin prueba de que mueva algo.

**El testigo de la escala se leía ENCIMA del titular.** En `/panel` el H1 pinta
por encima del `z-index: 58` del testigo, así que «GUARDA LO QUE» salía mezclado
con «MISIONES 0 DE 5 · LA SIGUIENTE: PASAR POR RECEPCIÓN». Mi primer diagnóstico
fue equivocado: subí la opacidad del fondo creyendo que era traslucidez, y la
captura siguiente enseñó que el texto grande estaba **delante**, no detrás.
Revertido ese cambio y resuelto por contenido: en esta ruta el dato del testigo
ya lo dice la propia página («Te faltan 3 piezas por reclamar: el pase de
llegada, los sellos de las estaciones y la invitación por compartir»), así que el
cromo es redundario además de molesto. Queda oculto solo aquí con
`body:has(.entrar-page) .universe-scale { display: none }`, y verificado ruta por
ruta: sigue visible en `/` y `/community`, oculto en `/panel` y `/entrar`.
Resultado: `oj7-panel-00.png`. Suite tras todo esto: **744/744**.

**Lección de instrumento, vale para todo el proyecto.** Un
`getBoundingClientRect()` del elemento devuelve su CAJÓN, no su TINTA. La sonda
de desbordes comparaba cajas, por eso dijo «0 desbordes» en `/panel` mientras la
última palabra se salía 102 px de la columna. Para texto que puede desbordar sin
ensanchar el cajón hay que medir con `Range.getClientRects()` línea a línea.

**Un test que cojea, dicho tal cual.** `TrajectoryLab.spatial.test.jsx` («un
lienzo que no consigue contexto WebGL pasa a error y se retira del árbol») falló
una vez en la pasada completa (743/744) y pasó solo (15/15) y en la pasada
siguiente (744/744). Es un flaky por carga, no un retroceso de esta sesión, y
conviene aislarlo (reintentar o fijar el reloj) en vez de acostumbrarse a
repetir la suite hasta que dé verde.

### 2.10 Reparto de escenas (agente dedicado)



Sonda `probe-clases-huerfanas` + inventario de `siteMedia.js`: 22 ficheros, reuso
máximo 25 veces. Agente `media-decollision` repartiendo para que ninguna página
repita imagen. Regla que se le dio: **no borrar playa/casa/mansión** (él las
pidió; «evitar playa» del doc §2.3 es un invento del resumen, la palabra «playa»
no aparece en las 70 anotaciones literales).

### 2.12 Clases del DOM sin ninguna regla CSS (defecto silencioso)

Medido con `scripts/probe-clases-huerfanas.mjs` (sonda nueva, 22-09): **63 clases
en todo el sitio** cuyo nombre usa el `className` y no tiene ni una regla en
`src/styles/`, `overrides.css` ni hojas de componente. No lo rompe el build, no
lo ve ningún test: se ve en pantalla como bloque sin maquetar.

**Atribución corregida a tiempo.** Mi primera lectura culpo al carril C de las 15
de `Community.jsx`. Medido contra el snapshot previo a los carriles
(`.snapshot-anot-20260922-1005`, estado en que lo dejó Codex a las 10:05):

- **Codex ya había dejado 14** de esas clases sin estilo, entre ellas
  `community-week-grid`, `community-day-card`, `community-tier-grid`,
  `community-live-media`, `community-identity-points` y
  `community-tier-feeling-label` — es decir, la estructura del pulso semanal y
  de los niveles, que es justo lo que el brief §18 pide convertir en sistema.
- El carril C **redujo la lista de 17 a 14** (descuenta 3 falsos positivos de
  estado `is-youtube`/`is-instagram`/`is-tiktok`) y **solo introdujo 2 nuevas**:
  `community-moment-body` y `community-scene-block`.

Lo relevante para el negocio: Codex escribió a las 07:21 **«Comunidad ya está
verificada»**, con `npm run build` en verde, y la página tenía 14 clases vivas
sin estilo. Un build que compila no es una verificación de que se vea bien. La
sonda existe para no volver a comprar esa afirmación.

Pendiente real (independiente de quién la rompió): cerrar las 63 antes de dar
por buena la pasada, y re-ejecutar la sonda en la verificación final.

### 2.8 Badge de cupos que late

`src/pages/Programs.jsx:110` — `PULSING_BADGE_COPY = /(?:MÁS ELEGIDO|10 CUPOS)/i`
hace **latir** «SOLO 10 CUPOS DISPONIBLES» en la ficha de ELITE. El dato es
legítimo: `offerings.js` lo documenta como tope publicado, y `faqContent.js` lo
repite («un máximo publicado de 10 cupos»); el mismo fichero explica que se
borró un `urgency: 'Quedan 3 cupos de 10'` hardcodeado por publicidad engañosa.
Pero el breve §12 pide «precio y condiciones **sin parecer agresivo**», y un
contador que pulsa es un dispositivo de urgencia aunque el dato sea cierto.
Decisión propuesta: quitar `10 CUPOS` de los que laten y dejar el cupo como texto
sereno. Es de `Programs.jsx`, lo aplico al integrar para no pisar el carril B.


### 2.6 Anotaciones 1-37 crudas recuperadas

`docs/ANOTACIONES-RAW-2026-09-22.md` (64 KB): los 70 comentarios con página,
selector y captura, sacados del transcript de Codex. Reparto de los 1-37:
Home 1-18, `/programs` 19-24 y 27-31, `/plan/fuerza` 25-26, `/parkour-academy`
32-37. Tres cosas que cambian la auditoría:

1. **No hay ningún registro de «comentario N aplicado»**. Codex escribió a las
   06:52 «No he empezado a implementar cambios todavía» y luego trabajó por
   fases. Lo único aplicable es medir contra el código.
2. El **comentario 31 es literalmente `..`**: no tiene intención recuperable. Si
   el doc le asignó un contenido, es relleno.
3. Hubo **dos envíos previos de marcas** con numeración reiniciada (7 frases que
   no entran en el 1-70), copiados en un apéndice del fichero raw.

---


### 2.3 Regla de "en desarrollo" de BAYONA+

`src/pages/AppExperience.test.jsx` exige literalmente la cadena `en desarrollo`.
El brief pide reducir su repetición, no borrarla. Aceptar solo si queda **una**
mención honesta; si el carril D tocó el test para quitarla, revertir el test.

---

## 3. Secuencia de cierre (ejecutar tal cual cuando paren los carriles)

```bash
cd C:/Users/sevis/Documents/Qoder/2026-09-19/73d38e0b/bayona-live
npm run build                                   # compila y delata CSS/JSX roto
npx vitest run                                  # suite completa, sin filtro
node scripts/probe-clases-huerfanas.mjs         # 0 clases sin regla = gate
# previa de la última compilación, en un puerto libre (4179 está pillo con build viejo)
npx vite preview --port 4183 --strictPort &     # esperar "Local:"
MSYS_NO_PATHCONV=1 PASOS=5 node scripts/capture-viewport.mjs http://127.0.0.1:4183 / /programs /plan/fuerza /parkour-academy /community /resources /faq /shop /app /entrar /onboarding
MSYS_NO_PATHCONV=1 ANCHO=390 ALTO=844 PASOS=4 PREFIJO=m- DISMAR=RECLAMAR node scripts/capture-viewport.mjs http://127.0.0.1:4183 / /community /programs /faq
```

Después: leer los PNG con la herramienta de visión (no fiarse de «se ve bien»
sin verlo), y cerrar el ledger de 70 con evidencia por anotación.

Reglas de decisión ya fijadas en esta sesión:
- Si un test pinea una cadena de copy y el dueño mandó reescribir el copy →
  se actualiza el pin, **nunca** la guarda de honestidad, y se anota el par.
- Si una regla de gobernanza estorba a un cambio pedido → se escribe la pieza
  que falta (como con `FOOTER_ROUTES` en `experiencePropagation.test.js`), no
  se afloja la regla.
- `en desarrollo` en BAYONA+ debe seguir existiendo exactamente una vez
  (`AppExperience.test.jsx`).

