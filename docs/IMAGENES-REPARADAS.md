# Imágenes reparadas de la generación anterior

Fecha: 2026-09-22. Autor: coordinador de la integración de imágenes.

Para qué existe este fichero. Seis huecos de `/resources` se cerraron con
fotografías del lote viejo de `public/images/bayona-visuals/` (1792×1024), que
lleva una **capa translúcida en una franja horizontal**. Es la única vez en este
proyecto en que se toca un píxel de una imagen, y por eso queda escrito con
precisión: qué archivo, de dónde salió, qué se le quitó y cómo se revierte.

## Qué se hizo, en una línea

Se midió el salto de brillo fila a fila; en estos seis el salto aparece en el
**97-100 % de las columnas**, o sea es una capa uniforme (una veladura) y no el
recorte de otra fotografía. Se resta ese escalón solo por debajo de la línea,
con un fundido de 26 filas para no dejar un corte nuevo, y se recorta al centro
a la geometría del banco, **1672×941 (ratio 1,777)**.

| Archivo en el banco | Origen (intacto) | Fila de la costura | Escalón (0-255) | Por qué entra |
|---|---|---:|---:|---|
| `resources-fresh-nutrition.png` | `bayona-visuals/resources-fresh-nutrition.jpg` | 690 | 7,4 | hierba cortada a mano: es literalmente «comida real» |
| `resources-magazine.png` | `bayona-visuals/resources-magazine.jpg` | 228 | 30,8 | editorial oscuro con tecnología, encaja con «revista viva» |
| `resources-topic-rest.png` | `bayona-visuals/resources-topic-rest.jpg` | 66 | 0,9 | movilidad con aro: descanso activo |
| `resources-topic-health.png` | `bayona-visuals/resources-topic-health.jpg` | 695 | 25,7 | salud como hábito, una sola persona |
| `resources-topic-business.png` | `bayona-visuals/resources-topic-business.jpg` | 695 | 17,1 | reloj y cuerpo medido: «decisiones de alto nivel» |
| `resources-topic-creativity.png` | `bayona-visuals/resources-topic-creativity.jpg` | 306 | 18,3 | terraza mediterránea con material de trabajo |

## Qué se quedó fuera, y por qué

- `resources-topic-training` y `resources-topic-relationship`: el salto **no** es
  uniforme (79,7 % y 64,6 % de las columnas). Es el recorte de otra foto dentro
  del encuadre; eso no se quita sin inventar píxeles.
- `resources-topic-mindset`: cuatro piernas sin ninguna cara. Regla: máximo dos
  personas.
- `resources-topic-data`: seis personas sentadas en una terraza. Multitud.
- `resources-topic-security`: un periódico con titulares legibles dentro del
  encuadre. Regla: sin texto.
- `resources-topic-meditation`: saco de golpeo y guantes. No es meditación.
- `resources-topic-nutrition` y `resources-topic-motivation`: limpias tras la
  reparación, pero la escena de respaldo que usan hoy (nutrición de lujo y
  horizonte de playa) cuenta mejor ese mensaje que una esterilla y una barra.
  Se dejan como estaban: el criterio no es «hay archivo», es «gana a lo que ya
  se estaba mostrando».

## Cómo revertir

Borrar los seis PNG de `public/images/bayona-generated/` y sus seis nombres en
`GENERATED_BAYONA_SCENES` (`src/config/siteMedia.js`). Esas secciones vuelven
solas a su escena de respaldo; el JPG de origen no se tocó nunca.

## Comprobación hecha

- `scripts/auditar-huecos-imagenes.mjs`: 93 de 101 huecos con PNG y registrado,
  los dos conteos cuadran, ninguno registrado sin archivo, ningún 1792×1024 en
  el banco, ningún fichero a cero bytes, ratio 1,78 en todo el banco.
- `scripts/probe-imagenes-que-cargan.mjs` sobre `/resources`, en 1440 y en 390:
  las seis aparecen pintadas y **0 imágenes rotas, 0 peticiones 404**.
- Capturas recortadas al elemento en escritorio y en móvil
  (`artifacts/tmp/sitio/`): la costura no se ve a tamaño de sección y ningún
  titular tapa la acción principal más de lo que lo hace el resto del sitio,
  que usa el mismo fondo velado.
- `npm run build` correcto.
