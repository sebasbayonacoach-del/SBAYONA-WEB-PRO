# BAYONA · Ledger de las 70 anotaciones (auditoría)

Fecha: 2026-09-22. Origen: `docs/ANOTACIONES-RAW-2026-09-22.md` (los 70 textos
literales, recuperados del transcript de Codex) y
`docs/BAYONA_DIRECCION_PRODUCTO_UX_2026-09-22.md` (su resumen, que perdió
detalles: se anotan abajo).

**Cómo leer el estado.** `verificado` = comprobado en el árbol actual con
fichero y línea, no por informe de agente. `en curso` = un carril lo está
tocando ahora. `bloqueado` = requiere algo de fuera (créditos del dueño o un
dato suyo). `relleno` = el resumen inventó o cosió algo que el dueño no dijo.

Leyenda: ✅ verificado · 🟡 parcial · ⏳ en curso · ⛔ bloqueado · ❔ sin intención

## Home (comentarios 1-18)

| # | Qué pidió, en sus palabras | Estado | Evidencia |
|---|---|---|---|
| 1 | «quiero ese formato en toda la web… entrenador + persona, desenfocado, minimalista y pro» | 🟡 | El formato existe y se aplica en home/community, pero **no en todas las secciones**: 80 secciones vs 19 escenas. Ver `LOTE-IMAGENES-63.md`. |
| 2 | «ponme imagen en los espacios en negro de MÉTODO, con animación» | ⏳ | `mechanism-section` sigue montado como escena (`Home.jsx:707`); el estilo de los 28 nombres nuevos de Programas lo está cerrando un agente. |
| 3 | «el título en dos colores, el 3 gigante mal, que la transición 3→4 sea uniforme» | 🟡 | Los números de capítulo están uniformados por `home-atelier.css`; el "dos colores" del titular no está verificado sección a sección → **falta la captura**. |
| 4 | «cada número necesita un artefacto que haga creíble lo que dice» | 🟡 | Home tiene folio, kit, recibo y dossier; no todas las secciones. Pendiente de ver con capturas. |
| 5 | «que se muevan solos hacia la derecha, con blur, una imagen por testimonio, fuera el 34/42/45/50, y ese aviso legal mata la venta» | ✅ | Carrusel `@keyframes experience-proof-deriva-derecha` (`experience-proof.css:73,83`); una imagen por testimonio con `srcSet` (`ExperienceProof.jsx:87-98`); edades fuera del JSX; el legal es ahora microcopy con el texto literal del brief (`ExperienceProof.jsx:128`). El cristal lo bloqueaban dos `!important` en `v2-editorial.css`: retirados. |
| 6 | «que vea el artefacto que recibe (protocolo, reto, comunidad); las puertas fuera de ahí» | ✅ | `FreeValue.jsx` reconstruido como un solo entregable tipo dossier con 4 piezas y escena propia. |
| 7 | «RAÍZ/FUERZA en otro color que juegue; el gris no lo manejamos; quita el 'previo experiencia en grande' y que desde la vista editorial se pueda descargar PDF o ver en web» | 🟡 | Doble CTA **sí** está: `DESCARGAR DOSSIER PDF` en `Programs.jsx:270` y `PlanPresentation.jsx:315`, y el marco duplicado se cambió por el dossier (`PlanPresentation.jsx:321-328`). El ajuste de **color de las etiquetas y el gris** queda pendiente de ver en captura. |
| 8 | «qué incluye exacto, menos MAYÚSCULAS agresivas, y el negro de los planes no vale: antes manejábamos un blanco de lujo; imagen fitness por plan» | 🟡 | `excluded` (qué NO incluye) en los 4 planes y escena por plan. Las mayúsculas y el blanco/negro **sin verificar visualmente**. |
| 9 | «el configurador: nada de números sueltos, todo cortado y desalineado; 'resumen de tu configuración' con nombre más claro; parece factura pero debe verse pro» | ⏳ | El configurador tenía **cero reglas CSS** antes de hoy; ahora tiene categorías, stepper y recibo. Falta la captura. |
| 10 | «no respira nada, una imagen por servicio, y 'revisa tu solicitud' debe ser un plan bonito e inevitable» | ⏳ | Mismo carril. |
| 11 | «la transición entre secciones debe ser limpia, que una aporte a la siguiente» | 🟡 | Existe `.home-passage` (`home.css:5230`) y revelados por cascada; uniforme en todas las transiciones: sin verificar en pantalla. |
| 12 | «fusiona el lead magnet con 'empieza hoy sin pagar' (son el mismo recurso) y añade un formulario personalizable para el dossier» | 🟡 | Fusionados: `FreeValue.jsx:875` + `LeadMagnet` en `Home.jsx:969` pasan props para no repetir la promesa. **El formulario extensible (Google Forms/Sheets) no está**: necesita que él decida plataforma y enlace. |
| 13 | «que al entrar reciba un tique/invitación VIP hermoso y minimalista, y que por la web haya regalos ESCONDIDOS que se descubren y se reclaman a clic» | ⏳ | El reclamo por clic ya es real en el bono de llegada; los sellos por explorar siguen sumándose solos en `lib/scale/UniverseScaleProvider.jsx:60-64` → **arreglo encargado al carril D con diseño cerrado**. |
| 14 | «al compartir, que aparezca una tarjeta de regalo GRANDE y personalizable ('yo regalo este pase a…'), descargable o fotografiable, con sus condiciones y las redes» | ⏳ | **Este comentario había desaparecido del resumen de Codex.** El carril está creando ahora `components/rewards/GiftPassCard.jsx` (11:22). |
| 15 | «el botón del asistente no me gusta: que sea YO como asistente con IA, que responda lo que sea, y si no sabe, que derive» | ⏳ | También perdido en el resumen. En curso en `components/companion/**` + `lib/companion/chatBrain.js`. **Nota honesta**: sin backend de IA contratado, lo que puede existir es un asistente con guion + escalada a WhatsApp, no una IA que responde de todo. |
| 16 | «botón de WhatsApp con logotipo real y directo» | ✅ | Glifo de WhatsApp (silueta del servicio, en `currentColor`: la marca veda el verde) + texto «Hablar por WhatsApp» en `Layout.jsx`; en ≤600 px vuelve a solo-icono para no tapar el FAQ (`overrides.css`). |
| 17 | «añade Facebook, LinkedIn y Twitter X al pie» | ⛔ | Bloqueado en un dato suyo: las tres URLs. No se publican enlaces inventados a páginas que pueden no ser suyas. |
| 18 | «el menú pierde a la persona: debe ser más fluido para ubicarse» | ✅ | Cuatro grupos por intención en orden de viaje (RECORRIDO / ENTRENAR / ECOSISTEMA / DECIDIR) + Inicio y Mi cuenta; su test, roto por el renombrado, reconciliado. |

## /programs (19-24, 27-31)

| # | Qué pidió | Estado | Evidencia |
|---|---|---|---|
| 19 | «fuera la montaña, las mancuernas y las pepitas; 'mismo estándar' no suma nada; ahí se rompe la letra grande» | ✅ | `audienceIcons` y el SVG fuera; cero hits de montaña en el fichero; la frase "mismo estándar" solo queda en un comentario que explica por qué se fue (`Programs.jsx:384`). |
| 20 | «esta página entera debe ser más PRO, igual que la home pero mejor» | 🟡 | Rediseño aplicado. Las 28 clases nuevas **ya tienen estilo**: `probe-clases-huerfanas.mjs` da 0 defectos en Programs (la que quedaba, `programs-stage-img`, es un nombre reenviado a `<StockImage>` y el nodo está maquetado por `.programs-stage-media img`). Queda el veredicto de sus ojos sobre la captura. |
| 21 | «no quiero imágenes dentro de cuadrados; la imagen va de fondo; mejor imagen a un lado y texto al frente, y que baje alternando» | 🟡 | El panel de imágenes dentro de tarjeta se quitó; el alternado imagen/texto hay que confirmarlo en pantalla. |
| 22 | «una imagen flotando con todo el protagonismo que no suma; imágenes repetidas dentro de cada acompañamiento» | ✅ | Método con figura sobre su propia foto; repeticiones dentro de página bajaron de 36 a 18 en todo el sitio. |
| 23 | «la persona tiene que DESCUBRIR y CLICAR los regalos; si no clicó, no los encontró; no debe sumarse solo» | ✅ | Cerrado el 22-09: se quitó el `useEffect` que regalaba crédito al pasar por la etapa en `UniverseScaleProvider.jsx`. Ahora solo `discover` (llegar a la escena) abre el sello y `claimSeal` (clicar) lo suma. Comprobado en el código: ya no hay ningún `award()` disparado por entrar en la etapa. **No** se ha vuelto a medir en el navegador recorriendo el universo con la cuenta vacía, así que queda pendiente de esa prueba. |
| 24 | «el cuadrado gigante con checks de 'así se ve dejar de improvisar' se ve horrible, rediseña la zona» | 🟡 | Los 5 checks se convirtieron en secuencia numerada de semana; falta confirmación visual. |
| 27 | «información repetida que confunde: 'servicios adicionales, personaliza lo que necesitas' ya está dicho arriba, quítalo» | ✅ | Panel de añadidos por ficha (3ª copia) eliminado (`Programs.jsx:295-387` fuera). |
| 28 | «si quieres, haz una mini-tienda de servicios donde ver vídeos e imágenes, pero no lo repitas explícito» | 🟡 | Catálogo y carrito unificados; la "mini-tienda" con vídeo queda pendiente de ver si la pidió como página nueva. |
| 29 | «demasiadas opciones, se satura y no compra: o eliminas esta zona o la combines en una sola cosa» | ✅ | Calculadora + servicios + configurador combinados en una sola experiencia con recibo. |
| 30 | «esas pesas al lado izquierdo, feas: diseña algo mejor» | ⏳ | Dentro del barrido de CSS de Programs. |
| 31 | *(el texto literal del dueño son dos puntos: `..`)* | ❔ | **Sin intención recuperable.** Verificado en el bloque crudo. El resumen de Codex no le asignó nada, correcto. |

## /plan/fuerza (25-26)

| # | Qué pidió | Estado | Evidencia |
|---|---|---|---|
| 25 | «todo debe tener imagen, hasta 'experiencias en cuatro países'; y el asistente debería poder pausarte para que le leas» | 🟡 | Escenas por plan puestas. **El asistente que pausa el scroll no existe** y tampoco está en el resumen: anotado para decidir (es una mecánica intrusiva, no la haré sin su OK). |
| 26 | «ese rectángulo de precio rompe el lujo; 'primer mes 0 euros, después un mes' no va ahí porque se rompe; y hazte una auditoría de cómo se vende todo» | ✅ | **Aqui estaba el bug de verdad**: la oferta recurrente era literalmente `1 € /mes` y se colaba en el checkout y en Stripe/PayPal. Corregido en `plans.js`, `order.js`, ambos adapters y la ficha. El test que pineaba el 1 € ahora exige el precio real. |

## /parkour-academy (32-37)

| # | Qué pidió | Estado | Evidencia |
|---|---|---|---|
| 32 | «el plano cenital ese sobra, no se ve de lujo» | ✅ | `academy-figure--plano` fuera del JSX. |
| 33 | «al pulsar la flecha debe desplegarse hacia abajo los beneficios de esa edad» | ✅ | Edades como `<details>` con beneficios. |
| 34 | «ahora mismo la flecha no hace nada» | ✅ | Misma corrección: el desplegable es nativo, funciona sin JS. |
| 35 | «espacios enormes, no se entiende nada: deja un sitio para vídeo» | 🟡 | Niveles con preview y «se ve / subes cuando». El hueco de **vídeo real** no está resuelto: no hay vídeos en el repo. |
| 36 | «la escalera esa fea y 'observar-preparar-progresar-integrar' no aporta nada» | 🟡 | Método en 3 escenas reales absorbiendo seguridad. La palabra "escalera" solo queda en un comentario del código. |
| 37 | «cuadrados enormes que no dicen nada + la regla de oro: imagen totalmente distinta por sección, multiplica» | 🟡 | Logística en franja. La regla de fondo es el lote de fotos: 18 para no repetir en una página, ~63 para una por sección. |

## Chrome y sistema (38-70, resumidos por Codex; verificados aquí)

| # | Tema | Estado | Nota |
|---|---|---|---|
| 38 | FAQ simple y claro | ✅ | Cerrado en el carril de comunidad/FAQ, con su test de destinos por tramo. |
| 39-40 | BAYONA+ visión sin parecer abandonado | 🟡 | El carril D está en el árbol y la cadena «en desarrollo» queda **exactamente una vez** en pantalla (verificado por grep y lo exige `AppExperience.test.jsx`). Lo de «sin parecer abandonado» es juicio de sus ojos sobre `/app`: hay 4 capturas (`f-app-0*`) y no las he aprobado yo. |
| 41 | Mockups de dispositivo como dirección | ✅ | `app-device-flat` con `aria-label` «Maqueta de escritorio y pase de acceso prioritario» (`AppExperience.jsx:964`) y el pase conceptual (`:990`). En el árbol; sin revisar pantalla a pantalla. |
| 42 | Lista de interés → acceso prioritario | ✅ | «ACCESO PRIORITARIO» como rótulo (`AppExperience.jsx:690`), como título de capítulo (`config/chapters.js:59`) y en el meta de `/app` (`lib/seo/routeMeta.js:64-66`). |
| 43-44 | Reducir repetición de «en desarrollo» | ✅ | De varias veces a **1 en pantalla** + 1 en el mensaje pre-escrito de WhatsApp, con test que lo fija. |
| 45 | Siguiente parada coherente y ordenada | ✅ | `config/chapters.js` como única fuente; `/app` → `/shop`. |
| 46 | Tienda boutique integrada | 🟡 | Carril C; CTAs de servicio ya son botones reales. |
| 47 | Hero del FAQ con doble corte | ✅ | Una sola capa de imagen. |
| 48 | Rutas de siguiente parada sin mandar hacia atrás | ✅ | Ídem 45. |
| 49-55 | Comunidad como club, pulso semanal como sistema, 3 niveles premium, CTA correcto | ✅/⏳ | Pulso navegable con `lib/schedule/clubPulse.js` (día con agenda = botón, sin agenda = texto, con foco devuelto) y su test ampliado; duplicidad del hero resuelta; niveles y paleta oscura pendientes. |
| 56 | Portada de revista como referencia estética | ✅ | Extendida a recursos y dossieres. |
| 57-58 | Reto 30 días explicado; revista como biblioteca | 🟡 | Carril C. |
| 59 | Consulta experta gratuita con adjuntos | 🟡 | Loader del estado «PREPARANDO» corregido. |
| 60 | Unificar primera acción gratis | ✅ | Ver comentario 12. |
| 61 | Sesiones sueltas como siguiente paso | ✅ | En tienda. |
| 62 | Acceso/BAYONA OS parte de la web | ✅ | **El navbar se ocultaba a matar en 4 rutas**: acotado a caja y confirmación; `/panel` recupera barra y pie, con el hueco compensado. Contrato de gobernanza reescrito para fijar la excepción a mano. |
| 63 | Dashboard con recursos/compras/créditos | 🟡 | El carril D lo dejó en el árbol (`/panel`, con navbar y pie recuperados — ver 62). **No lo he abierto en pantalla**: es de lo que falta por mirar. |
| 64-66 | Bienvenida cinematográfica; nombre+idioma; país explicado | ✅ | Recepción en `Onboarding.jsx` (puertas que se abren solas + la casa detrás, `ob4-onboarding-00.png`) y orden real de la recepción en `lib/onboarding/questions.js`: **nombre → idioma → país → objetivo → ritmo** (§20), con el país justificado porque cambia la moneda y `CURRENCIES` solo sostiene EUR/COP/USD. |
| 67-68 | Objetivo planteado como problema | 🟡 | El paso existe en `questions.js` dentro de ese orden. Si el redactado convierte el objetivo en problema concreto, eso se comprueba leyendo la pantalla, no el fichero. |
| 69 | Valor ganado según reclamo real | ✅ | Quitado el `award()` automático por el que el crédito subía con solo navegar; queda `discover` + `claimSeal` (clic). Es la misma corrección de 13/23. |
| 70 | Tres puertas al final, no al principio | ✅ | `Onboarding.jsx:48`: la apertura son las puertas del umbral y **el cierre son tres puertas en horizontal** (ruta, recurso gratis, comunidad) en el paso de ruta. |

## Lo que el resumen de Codex perdió y hubo que rescatar del texto crudo

1. **Comentario 14** (tarjeta de regalo personalizable y descargable) → no
   existía en el doc. En construcción.
2. **Comentario 15** (el asistente debe ser él, con IA) → reducido a «asistente
   con personalidad». En construcción, con la salvedad honesta de que no hay
   IA conectada.
3. **Comentario 25** (que el asistente pause el scroll para que le leas) → no
   estaba. **No hecho a propósito**: es mecánica intrusiva y hay que decidirlo.
4. **Comentario 12** (formulario externo para el dossier personalizado) → no
   estaba. Bloqueado en su elección de plataforma.
5. **Viñeta inventada**: el doc §2.3 dice «evitar imágenes aleatorias de playa».
   La palabra *playa* no aparece en los 70 textos literales, y el propio
   `siteMedia.js` documenta que ese fondo lo pidió él. No se purgó nada.
6. **Comentario 31** es `..`: cualquier contenido que el doc le atribuyera
   sería relleno de la IA.

## Cierre verificado (22-09 10:06, medido por el coordinador, no por informes)

| Qué | Número | Cómo se midió |
|---|---|---|
| Suite completo | **739 tests / 107 ficheros, todos verdes** | `npx vitest run` (antes de esta sesión había 12 rojos y 4 de ellos los dejó Codex) |
| Compilación | OK, solo el aviso conocido de `vendor-three` | `npx vite build --outDir dist-verify` |
| Errores de JS en pantalla | **0 en las 10 rutas del recorrido**, escritorio y 390 px | `scripts/capture-viewport.mjs` (49 capturas en `artifacts/latest/viewport/f-*.png` y `fm-*.png`) |
| Clases del DOM sin estilo | 44 → **7** (About 4, Checkout 1, DesignSystem 1, Home 1) | `scripts/probe-clases-huerfanas.mjs`, tras arreglar la sonda (no leía `src/styles.css`). **Superado a las 14:00: son 0 defectos y 3 ganchos. Ver ronda 2.** |
| Titulares fuera de escala | Home 89 px → **66 px**, igual que el resto | `scripts/probe-tipografia-h1.mjs` |
| Regalos que se sumaban solos | **0** | quitado el `award()` automático en `lib/scale/UniverseScaleProvider.jsx`; ahora `discover` + `claimSeal` |
| «en desarrollo» en BAYONA+ | **1 vez en pantalla** (`AppExperience.jsx:1145`) + 1 en el mensaje pre-escrito de WhatsApp | `grep`; las dos las exige `AppExperience.test.jsx` |
| Fotos repetidas dentro de una página | 36 → **18**, con 141 rutas comprobadas en disco | agente de media + `siteMedia.js` |

## Cierre verificado (22-09 14:05, segunda pasada)

Todo esto se volvió a medir sobre el árbol de ahora. Donde digo «la sonda», la
sonda está en `scripts/` y se puede relanzar.

| Qué | Número | Cómo se midió |
|---|---|---|
| Suite completo | **744 tests / 107 ficheros, verdes** | `npx vitest run` (los 3 últimos son la guarda nueva del precio recurrente y su auto-comprobación; los 2 de la ronda anterior eran pines de copy que discutían entre ellos) |
| Compilación | OK, sigue solo el aviso de `vendor-three` | `npx vite build --outDir dist-verify` |
| Billetera apretada sobre el pase (com. 13) | **Cerrado** | `artifacts/latest/viewport/r2-community-00.png`: «pase de socio» se lee completo y la billetera queda plegada a la izquierda |
| Cajas grises de Parkour (com. 32-37) | **Cerrado** | `probe-medios-vacios.mjs` → 0 huecos de medio sin pintar; `pk2-parkour-academy-0*.png` con tarjetas limpias y «VER ↓» funcionando |
| Recepción de `/onboarding` | casa detrás de las puertas, titular en dos líneas | `ob4-onboarding-00.png` leído, no supuesto |
| Clases del DOM sin estilo | 7 → **0 defectos** y 3 ganchos con motivo | ver «Las dos correcciones de la sonda», abajo |
| Texto de código visible en pantalla | **0 en 11 rutas** | barrido propio tras pillarme a mí metiendo un comentario con `/* */` en JSX |
| Desborde horizontal | **0 en 39 combinaciones** (13 rutas comerciales × 360/768/1440) | sonda nueva `probe-desborde-horizontal.mjs`, sobre el build |
| Titulares tras el cambio de foso | Siguen en **66 px** en Home, About y Programas (`/about` en 2 líneas, `/programs` en 3, portada en 6) y «dentro del umbral» | `probe-tipografia-h1.mjs` relanzada a las 14:24 sobre el build nuevo |
| Huecos de medio sin pintar, tras el foso | **0** en Home, About y Programas. Y **0 errores de JS** en la captura nueva de la portada | `probe-medios-vacios.mjs` + `capture-viewport.mjs` (`zz4-*`) a las 14:29 |
| Botones deformados por la diana táctil global | 25 → **6** en puntero fino (los 6 restantes los pide a propósito `programs.css`) y **0** en modo táctil, que es donde los 48 px hacen falta | sonda nueva `probe-botones-estirados.mjs` + `diana-about-08.png` (la `×` del globo vuelve a ser cuadrada) |
| Escala de titulares en TODO el sitio | `/panel` y `/entrar` estaban a **115 px** mientras la sonda recorría solo `/`. Ahora **66 px en las 17 rutas** navegables | `probe-tipografia-h1.mjs` con la lista nueva `rutasDelEnrutador()`; el arreglo es `var(--lux-fs-h1)` en `auth-members.css`. **Corrige lo afirmado arriba a las 14:24**, que solo cubría las rutas comerciales |
| Cromo fijo comiéndose texto | Casa cerrada: `PASE VIP` tapaba la primera letra del lead de `/about` y 17 % de «PUNTO DE PARTIDA» en Home. A 1440 ya **no queda ningún solape del muelle** | reservado el carril en `luxury-system.css` (`--layout-gutter` ≥1100 px) y capado el ancho del chip desde 1100 en `rewards.css`; medido con `probe-overlays.mjs` antes y después, y con `zz-about-00.png` → `zz2-about-00.png` |

### Las dos correcciones de la sonda de clases, que valen más que el arreglo

La ronda anterior cerraba en «quedan 7 clases sin estilo». Al mirarlas una a una
eran **cero defectos**, y el ruido era del instrumento:

1. Solo leía ficheros `.css`. Dos de las cuatro de About sí tienen regla: escrita
   en un `<style>` dentro de `GlobeTestimonials.jsx`. Ahora se barren también los
   bloques `<style>` de todo `.js`/`.jsx` bajo `src/`. 6 → 4.
2. Las otras tres (`checkout-gateway`, `dsp-passage`, `programs-stage-img`) van en
   el `className` de un **componente** (`<CheckoutPanel>`, `<HorizontalPassage>`,
   `<StockImage>`), que lo reenvía a un nodo que ya está maquetado por otra clase.
   La sonda ahora distingue *defecto* (un nodo pide un nombre que nadie escucha)
   de *gancho* (nombre extra sobre un nodo que ya tiene estilo), y lista los
   ganchos aparte con el motivo. `final-seal` es el único nombre propio sin regla
   en un nodo DOM: se midió su caja a 360 y 1440 (324/324 y 1280/1280, sin
   desbordar) y quedó en `EXCEPCIONES_MEDIDAS` con la prueba al lado.

Moraleja que se aplica a las cinco alarmas falsas de hoy: **un instrumento que
pita de más enseña a ignorarlo**, y este ya estaba a punto de ir a `STRICT=1` con
ese ruido dentro.

### Control de la sonda nueva, antes de creérsela

`probe-desborde-horizontal.mjs` en su primera versión devolvía «0 sospechosos» en
Home. Falso: el sitio tiene `body { overflow-x: clip }`, y como la sonda paraba
el recorrido de ancestros sin límite, ese `clip` global eximía los **29** nodos
que sí se salían (medido a 1440 con un guionito de control). Corregido para que
solo exima un recorte *local* y para denunciar el nodo que pinta fuera del borde
derecho de la ventana — que es lo que se ve, aunque la página no pueda tener
scroll. Lección vieja en este proyecto: se comprueba el instrumento con un caso
que se sabe que falla antes de fiarse de su «OK».

### El fallo mío de esta ronda, por escrito

Para dejar la casa detrás de las puertas escribí un comentario en JSX como
`/* ... */` sin las llaves. No es un comentario: es texto, y se veía como párrafo
en la parte superior de `/onboarding` (así salió en `ob3-onboarding-00.png`). Lo
pillé leyendo la captura, no con un test — ningún test mira eso. Arreglado a
`{/* ... */}` y, en vez de quedarme en el caso concreto, barrí las 11 rutas
buscando literales de código en el texto visible: limpio.


### Cambios que se verificaron en el navegador, no en el código

- **Titular de portada en dos colores** (comentario 3): primera frase en
  `--ds-color-ink`, segunda en naranja. Comprobado con
  `scripts/probe-regla-que-gana.mjs`: `color computado rgb(255,255,255)` en
  `.hero-title-word--base`. Antes de medir, mi primer intento con `color:
  inherit` **no hacía nada** porque el `<h1>` del hero es el que pinta el
  naranja: heredaba justo el color que quería quitar.

### Lo que sigue abierto, dicho sin adornos

1. ~~**Billetera duplicada**~~ → **cerrada a las 13:18** (comentario 13). Medido
   en `r2-community-00.png`: el pase se lee entero y la billetera queda plegada a
   la izquierda. El aviso de las 10:06 era cierto en ese momento.
2. **17** — faltan las 3 URLs (Facebook, LinkedIn, X).
3. **1 y 37** — fotos: 18 para no repetir en una página, ~63 para una por
   sección. La generación está cerrada en la cuenta (403).
4. **12** — el formulario externo del dossier personalizado necesita que él
   elija plataforma.
5. **15** — el asistente ya habla como Sebastián y **declara que no hay IA
   conectada** («no hay ninguna IA conectada detrás de esto»), con escalada a
   WhatsApp. Una IA que responda de todo es un backend que hay que contratar.
6. **25** — el asistente que pausa el scroll para que le leas: **no hecho**,
   es intrusivo y es decisión suya.
7. **31** — sin intención recuperable (el texto literal son dos puntos).
8. ~~Quedan 7 clases sin estilo~~ → **0 defectos** (3 ganchos con motivo, ver
   ronda 2). Siguen en pie **18 repeticiones de foto** dentro de página, que son
   las 18 imágenes que hay que generar y no se pueden generar (403).
9. **Precio recurrente escrito a mano en el paso de pago**: `Checkout.jsx` seguía
   prometiendo «después €1/mes» después de arreglar `plans.js`. Corregido el texto
   y cerrada la boca con una guarda que recorre todo el código de producto
   (`conversionRegression.test.jsx`). Queda su decisión de fondo: si el primer
   mes gratis no es una oferta real de su negocio, se quita el bloque entero.
10. **El muelle fijo entre 760 y 1100 px** sigue tocando texto (medido a 900:
    «CRITERIO» 35 % bajo la billetera). Arreglado de 1100 para arriba reservando
    el carril. Por debajo de 1100 no hay foso que reservar sin comerse el ancho:
    hay que decidir entre dejar solo el orbe o centrar el muelle abajo.
11. **El globo del acompañante se abre encima de un titular.** En
    `diana-about-08.png` (About, scroll 7040) el recuadro «Empecé sin método y lo
    pagué caro…» tapa las primeras letras de la H2 de la sección EXPERIENCIAS.
    Es plegable, pero aparece solo. Su decisión: anclarlo arriba a la derecha, o
    que no se abra cuando taparía un titular.
12. **Banda crema vacía en About** (misma captura): entre el tramo de RIGOR y el
    siguiente queda un hueco grande de fondo claro sin contenido, y otro bajo
    «EDUCACIÓN». Es el «aquí no respira nada» del comentario 10, en otra página.
    Las medidas en píxeles no están tomadas todavía.
13. ~~**En `/panel` y `/entrar` la última palabra del titular se sale 102 px de su
    columna**~~ → **cerrado**. El culpable no era `.entrar-shell` sino
    `bayona-polish.css:604` (`.entrar-page > .section-shell`, que gana por
    especificidad) con su tope de 460 px. Subido a 37 rem, la línea queda 29 px
    DENTRO de su cajón y cuadra con las tarjetas. Medido con `Range`, no a ojo.
14. ~~**El HUD de escala tapa la primera línea del titular en `/panel`**~~ →
    **cerrado por contenido**: en esa ruta el dato ya lo dice el cuerpo de la
    página, así que el testigo se oculta solo ahí (`body:has(.entrar-page)`).
    Verificado que sigue visible en `/` y `/community`. Primer intento (subir la
    opacidad) iba mal encaminado y se revirtió.
15. **Un test cojea**: `TrajectoryLab.spatial.test.jsx` (contexto WebGL que falla
    → retira el lienzo) dio rojo una vez en la pasada completa y verde solo y en
    la pasada siguiente. Flaky por carga, no retroceso de esta sesión.


### Capturas: cuántas se han mirado de verdad, y con qué criterio

Estado a las 14:19. Hay **175 capturas de hoy** en
`artifacts/latest/viewport/` (muchas en grupos sueltos de cada arreglo: `f-*`,
`a8-*`, `r2-*`, `pk2-*`, `ob*`, `zz-*`, `zz2-*`).

- **Miradas por el coordinador, una a una:** portada antes/después del titular,
  Programas, `/community` (r2, pase de socio), `/parkour-academy` (pk2, 3
  pantallas), `/onboarding` (ob3 con el fallo y ob4 arreglado), `/about` a 1440
  en dos versiones (zz-about-00 con la letra comida y zz2-about-00 ya limpia).
- **Barrido con dos agentes de visión** sobre 48 capturas (Home/About/Programas
  y el resto del recorrido + móvil). Los dos devolvieron «defectos en las 48» y
  «sin defectos en ninguna», que es el sesgo conocido de un revisor al que se le
  pide encontrar algo: señal de alarma, no sentencia.
- **Adjudicado con sondas, no con opiniones.** `probe-overlays.mjs` y
  `probe-solapes.mjs` sobre el build real miden qué capa fija tapa qué y si lo
  tapado es un control. De los 24 avisos de los agentes, la sonda confirmó **una
  familia real y repetida** (el muelle fijo de la izquierda sobre texto:
  «PASE VIP» sobre el lead de /about y 17 % de «PUNTO DE PARTIDA» en Home),
  **no confirmó ninguna** de las «columnas cortadas a media palabra»: ninguna
  sonda de solape ni de medios vacíos ve ese texto recortado, y en este proyecto
  ya se pilló una vez que la espera corta de la captura coincide con el revelado
  tipo máquina de escribir (`f-*` con 800 ms). Queda dicho como sospecha con
  prueba parcial, no como sentencia. Y **no encontró ni un control inaccesible**
  a 390 px en las tres rutas comerciales.

Lo que esto cambia: la familia del muelle se arregló reservando el carril
(`luxury-system.css` + `rewards.css`), y el resto de los avisos queda abierto con
nombre y clase para no volver a mirar 48 imágenes a ciegas.

Los comentarios que **solo** se pueden dar por buenos con los ojos del dueño
siguen siendo **2, 4, 7, 8, 9, 10, 11, 20, 21, 24, 28, 30, 35 y 36**. Un build en
verde y 744 tests no dicen nada sobre si «se ve de lujo».

