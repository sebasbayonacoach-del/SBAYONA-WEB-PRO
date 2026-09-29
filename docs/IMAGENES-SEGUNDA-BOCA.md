# La segunda boca de las imágenes (2026-09-22)

## Qué se encontró

El brief de integración de imágenes mandaba revisar `src/config/siteMedia.js`:
todos los huecos declarados con `cinematicScene(...)`. Eso se hizo, y la
auditoría (`scripts/auditar-huecos-imagenes.mjs`) daba limpio.

No lo estaba. `siteMedia.js` es **una** de las dos formas que tiene este sitio de
pedir una fotografía. La otra es un literal `url('/images/…')` escrito dentro de
una hoja de estilo. Nadie la miraba, así que once capas decorativas seguían
sirviendo en producción el lote retirado `bayona-visuals/*.jpg` mientras el
inventario del config decía «95 de 147 en el banco nuevo, cero referencias al
lote defectuoso».

Dónde estaban:

| Fichero | Reglas | Secciones afectadas |
| --- | --- | --- |
| `src/styles/community.css` | 3 | `/community` · pulso, acceso, entrada |
| `src/styles/faq.css` | 3 | `/faq` · preguntas, tramos, contacto |
| `src/styles/auth-members.css` | 2 | `/entrar` · fondo de cuenta, panel de bienestar |
| `src/styles/onboarding.css` | 3 | `/onboarding` · etapas preguntas, regalo, ruta |

## Por qué el lote de 1920x1080 también está defectuoso

Medido fila a fila y columna a columna sobre los once archivos: un escalón de
luminancia cada **96 px** en las dos direcciones. Una retícula de losetas de 96,
no una costura horizontal como la del lote de 1792x1024. Ampliando una franja de
40 px centrada en la fila 288 se ven las líneas como un encaje blanco sobre la
fotografía (`artifacts/tmp/sellos-css.png`).

El contenido tampoco pasa el brief: `faq-questions-training` es una mujer con una
barra en un gimnasio interior con gomas rosas; `entrar-account-vault` un tiesto
contra una pared; `onboarding-route-parkour` unas piernas y una zapa. Gimnasio
cerrado y motivo ajeno al parkour, dos prohibiciones explícitas.

## Qué se puso en su lugar

Seis capas tomaron los seis `bank-*.png` del banco —las imágenes inclusivas que
el propio brief enumera y que hasta ahora no pedía ningún hueco—, elegidas por
mensaje y no por nombre:

- pulso semanal → `bank-teen-landing` (recepción controlada, el ritmo de la semana)
- «aquí cabemos todos» → `bank-senior-woman-step` (acceso real entre edades)
- «entrar es simple, tu primer paso» → `bank-child-precision-jump`
- preguntas de entrenamiento → `bank-child-supported-vault` (aprendizaje guiado)
- «sigue por tu tramo» → `bank-senior-man-balance`
- «elige tu siguiente paso» → `bank-grandfather-child-vault` (dos generaciones)

Las cinco de `/entrar` y `/onboarding` apuntan a escenas curated propias de BAYONA
en `public/images/scenes/` que ningún hueco registrado reclama
(`escena-app-dashboard`, `escena-nutricion-lujo`, `escena-metodo-decision`,
`escena-proceso-datos-premium`, `escena-parkour-gandia-cierre`).

**Cero imágenes repetidas.** Ninguna de las once capas repite una fotografía que
ya se esté viendo en otra sección.

> **Esta afirmación era falsa y está corregida más abajo.** Escrita desde el
> inventario de URLs, que solo mira una boca. Verificado por huella binaria con
> `scripts/duplicados-cross-mouth.mjs`: cinco de las once sí repetían fotografía.
> El estado real y justificado está en «Repetición declarada».

## El invariante que cortó el atajo

La primera versión de este arreglo reutilizaba PNGs del banco que ya estaban
colocados (`app-hero` en `/entrar`, `home-free-kit` en el regalo de onboarding…).
El cierre de `siteMedia.js` lo reventó en tiempo de carga:

```
Error: El registro multimedia contiene 3 URL duplicadas.
```

Ese invariante es anterior a este trabajo y tiene razón: copiar el mismo PNG con
otro nombre engorda el inventario de duplicados sin aportar una sola fotografía
nueva. Se intentó escribir un helper `bankScene()` para declarar la
reutilización; se borró. La salida correcta era la que estaba sin usar: los seis
`bank-*` y las escenas curated libres.

## Las tres escenas editoriales de Shopify Burst

`programs.services` (los tres paneles de «Servicios sueltos» de `/programs`)
usaba `boxing-gym-workout`, `restorative-yoga` y `gym-weight-lifting`: foto de
banco externo y gimnasio lleno. Sustituidas por `parkourGandiaTecnica`,
`parkourGandiaSeguridad` y `parkourGandiaHero` en su versión curated, cada una
con URL distinta y sin colisión con las seis escenas curated que aún sirven a
`resources-topic-*`.

Con eso, **las 40 escenas que salían de `public/images/burst/` se reducen a 37 y
ninguna es editorial**: las 37 restantes son fotos de producto del catálogo de la
tienda (`shop.products.*`).

## Lo que queda fuera, y por qué no se tocó

Dos bocas externas siguen vivas, y ninguna de las dos se arregla con una escena
de parkour:

- **37 fotos de producto** en `public/images/burst/`, bajadas de
  `burst.shopifycdn.com` (Shopify Burst). Son leggings, mancuernas, zapatillas,
  mochila, báscula.
- **6 fotos de producto** enlazadas caliente a
  `pub-aaa82e9851064d22b954c3ebbafc9ae6.r2.dev` (FoodiesFeed): whey, creatina,
  pre-workout, omega-3, multivitamínico, colágeno.

Poner ahí una fotografía de parkour mentiría dos veces: el comprador vería un
salto al muro en lugar del bote que está comprando. Lo que hace falta son fotos
reales del producto o una generación con los botes como motivo, y eso depende de
Sebastián. Se borraron además cinco entradas de FoodiesFeed que estaban declaradas
en `siteMedia.js` y no leía nadie (`salmonBowl`, `falafelBowl`, `breakfast`,
`yogurtBowl`, `greens`): cinco enlaces calientes menos, cero cambios en pantalla.

## El guard que evita la recaída

`src/test/imageSourceGovernance.test.js` recorre los 429 ficheros `.css`, `.js`
y `.jsx` de `src/`, quita comentarios y exige:

1. ninguna referencia a `bayona-visuals/`;
2. ninguna imagen servida desde un host externo, salvo siete URLs nombradas y
   fechadas (seis fotos de producto + la textura `earth-dark.jpg` de la librería
   `three-globe`, que es asset del motor 3D y no contenido editorial);
3. que toda ruta local exista en `public/` y no pese cero;
4. que la lista de excepciones no crezca de callada (techo de 7) ni conserve
   entradas que ya no usa nadie.

El primer test del fichero comprueba que el explorador encuentra ficheros y
referencias: sin esa comprobación, un regex roto aprobaría el guard por ceguera.
Medido: 429 ficheros, 14 referencias en CSS, 27 en JS/JSX, 7 externas.

## Repetición declarada (lo que el primer cierre no veía)

`scripts/duplicados-cross-mouth.mjs` resuelve las dos bocas, baja cada archivo a
`sha256` y agrupa por huella. Dos secciones con la misma huella son la misma
fotografía, se llamen como se llamen. Primera pasada: **una repetición dentro de
la misma página y nueve entre páginas**, seis de ellas creadas por mí.

Por qué el config no lo avisó: `bank-senior-man-balance.png` y `faq-hero.png`
son **copias byte a byte** (mismo hash) con distinto nombre. La URL es distinta,
así que el invariante de `siteMedia.js` duerme tranquilo; y la auditoría de
duplicados del banco sí lo decía, pero nadie cruzaba ese informe con lo que
pedían las hojas de estilo.

Corregido con las seis fotografías propias que no pintaba ninguna de las dos
bocas:

| Capa | Antes (repetía) | Ahora |
| --- | --- | --- |
| `.faq-exits::before` | `faq-hero` · **misma página** | `escena-playa.jpg` |
| `.entrar-page::after` | `escena-app-dashboard` (ya en `/`) | `escena-proceso-wow-lab.jpg` |
| `.entrar-shell::before` | `escena-nutricion-lujo` (ya en `/`) | `escena-problema-amanecer.jpg` |
| onboarding · `regalo` | `escena-proceso-datos-premium` (ya en `/resources`) | `escena-proceso-freelance-gandia.jpg` |
| `.community-week::after` | `parkour-hero` | `escena-coach-anonimo-terraza.jpg` |

**Cuatro repeticiones se mantienen a propósito**, y son las que el brief manda
declarar al final:

| Capa | Repite la fotografía de | Motivo |
| --- | --- | --- |
| `.community-access::after` | `parkourAcademy.safety` | mujer mayor escalando un bloque con el coach: es LA imagen de «aquí cabemos todos» |
| `.community-entry::after` | `onboarding.threshold` | primer salto de un niño: es literalmente «tu primer paso» |
| `.faq-section::before` | `parkourAcademy.levels` | vault apoyado guiado: «aprende a preguntar» |
| `.faq-contact::before` | `parkourAcademy.closing` | abuelo y nieto salvando el mismo bloque: «elige tu siguiente paso» |

La alternativa que quedaba para esas cuatro era una fotografía de mesa de trabajo
o de playa sin gente: cumpliría la regla de unicidad pero rompería la de
contenido (parkour técnico, edades diversas, dos personas como máximo), que es la
que decide qué se parece a BAYONA. Se eligió conservar parkour y declarar.

Queda **una repetición anterior a este trabajo**, no tocada: `resources.topics[5]`
y `.home-services-configurator::before` (en `/`) comparten
`escena-app-dashboard.jpg`. Arreglarla pasa por registrar ese tema de
`/resources` en el banco —bloqueado por generación— o por editar una de las tres
hojas globales que vigila `experienceSystemContract`, y eso ya no es integrar
imágenes.

**Dos repeticiones más, hechas visibles al cerrar el hueco (2026-09-22).** Al
registrar `resources-topic-creativity` y `resources-topic-motivation` en el banco
se copia su escena curated al nombre del hueco; la fotografía no cambia en
pantalla, pero deja de ser una URL suelta y pasa a ser un PNG del banco que
**comparte imagen** con lo que ya pinta otro canal:

| Hueco del banco | Muestra la misma foto que | Dónde |
| --- | --- | --- |
| `resources-topic-creativity.png` | `escena-proceso-freelance-gandia.jpg`, la etapa `regalo` de `/onboarding` | `/resources` ↔ `/onboarding` |
| `resources-topic-motivation.png` | `weight-lifting-man.jpg`, foto de producto del hoodie | `/resources` ↔ `/shop` |

Ninguna de las dos repite dentro de una misma página, y `resources-topic-creativity`
es la única del sitio donde el control **por bytes** tampoco la veía: el par está
en distinto formato, así que solo phash/dhash la descubre. Se dejan y se declaran:
quitarlas exigiría una imagen nueva que la cuenta no puede generar.

## Verificación

| Comprobación | Resultado |
| --- | --- |
| `npx vitest run` | 108 ficheros · **750 pruebas** en verde (partían de 107 · 744) |
| `npm run build` | `✓ built in 15.61s`, sin errores |
| Imágenes rotas y 404, 13 rutas × {1440, 390} | 0 |
| `bayona-visuals` servido por el navegador | 0 en las 13 rutas |
| Enlaces calientes pintados | solo `unpkg.com/three-globe/.../earth-dark.jpg` |
| Escenas del config servidas del banco propio | **104 de 147** (95 → 96 → 104; las 43 restantes son fotos de producto de `/shop`, ver más abajo) |
| Escenas del config servidas de `public/images/scenes/` | **0** (eran 8; pasaron al banco con `scripts/colocar-desde-curated.py`, sin cambiar lo que se ve). Las hojas de estilo siguen pintando 7 curated propias: `escena-playa`, `escena-coach-anonimo-terraza`, `escena-proceso-wow-lab`, `escena-problema-amanecer`, `escena-metodo-decision`, `escena-parkour-gandia-cierre`, `escena-proceso-freelance-gandia` — todas del banco propio de BAYONA, ninguna externa |
| Fotografías distintas pintadas entre las dos bocas | 165 |
| Repeticiones **dentro de una misma página** | **0** medidas por apariencia (`phash` + `dhash`), que es el instrumento válido desde el reenvasado a WebP |
| Grupos de la misma fotografía entre páginas distintas | 7 por apariencia: 4 declaradas en la tabla de arriba + `app-dashboard` preexistente + `resources-topic-creativity`↔`escena-proceso-freelance-gandia.jpg` + `resources-topic-motivation`↔`weight-lifting-man.jpg` (foto del hoodie en `/shop`) |
| Originales sin colocar | 0 huecos. En disco quedan 16 archivos que ningún canal pide: los 6 `bank-*.png` (ahora se sirven por su gemelo `-1672.webp`), `community-entry.png` y 9 escenas curated |
| URL duplicadas en el inventario del config | 0 (invariante del config) |
| Proporción del banco | min 1,78 · mediana 1,78 · max 1,78 |
| Peso de imágenes por ruta, `vite build` + preview | `/resources` 41,2 → **4,4 MB** · `/programs` 26,1 → **3,7** · `/` 19,2 → **4,9** · `/community` 2,7 · `/faq` 0,8 |
| Banco servido en WebP | 222 derivados (`-1600` y `-1672`, q80) con `scripts/derivar-webp-banco.py`; lo resuelve `webpAnchosDe()` en `siteMedia.js` y lo vigila la prueba 6 del guard |

### Y apareció un tercer canal, no resuelto

`src/config/testimonials.js` sirve diez retratos desde
`public/images/testimonials/` —ni `siteMedia` ni un CSS. Los diez son fotografía
de banco, y tres desmienten a quien firma la cita. Detalle, evidencia visual y
las tres salidas posibles en **`docs/TESTIMONIOS-SON-STOCK.md`**. El guard añade
una prueba que verifica lo mecánico (existen, pesan, traen `-256` y `-960`); si
la foto es la persona real no lo puede decidir un test.

Instrumentos nuevos: `scripts/inventario-de-escenas-por-pagina.mjs` (qué carpeta
pinta cada página, antes de decidir), `scripts/capture-secciones.mjs` (captura una
sección concreta centrada en viewport, en el ancho que se le pase) y
`scripts/duplicados-cross-mouth.mjs` (repeticiones por huella cruzando las dos
bocas; sale con código distinto de cero con `STRICT=1` si aparece una dentro de la
misma página).
