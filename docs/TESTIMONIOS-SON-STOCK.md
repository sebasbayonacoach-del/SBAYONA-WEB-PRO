# Los 10 retratos de experiencia son stock (2026-09-22)

## Cómo salió

El brief de imágenes mandaba revisar `siteMedia.js` y el banco. Los retratos de
`src/config/testimonials.js` no pasan por ninguno de los dos: son un cuarto canal
(`public/images/testimonials/`, 10 retratos + sus variantes `-256` y `-960`,
30 ficheros) y nadie lo había mirado nunca. Se audita ahora porque el brief
prohíbe expresamente «imágenes descargadas de páginas web ni bancos externos» y
porque `BAYONA-WORLD-BIBLE.md` ya lo tenía escrito como riesgo principal de la
marca:

> «Riesgo. **Falsa humanidad: stock emocional**, frases de poster, "somos una
> familia" sin evidencia.» (línea 291)
>
> «Medio dominante: fotografía (retrato real). […] **Prohibidos: […] stock**.»
> (línea 773)

Hoja de contacto mirada con los ojos: `artifacts/tmp/testimonios.png`.

## Qué se ve, retrato a retrato

| Fichero | Testimonio declarado | Lo que enseña la foto |
| --- | --- | --- |
| `andrea-empresaria.jpg` | Andrea, 38, empresaria, Bogotá | Mujer en top negro con **logotipo de Nike legible**, gimnasio interior con anillas de suspensión |
| `carlos-administrador.jpg` | Carlos, 45, administrador | Retrato de estudio, camisa estampada (no ropa técnica) |
| `familia-rusa.jpg` | Familia Rusa | **Solo unas piernas y unas zapatillas** sobre escalones de hormigón: no hay familia |
| `laura-bienestar.jpg` | Laura, 29, profesional del bienestar | Plancha lateral en gimnasio con **rack de kettlebells de colores** al fondo |
| `mai-madre.jpg` | Mai, 34, madre y emprendedora | Retrato lateral en gimnasio, reloj inteligente visible |
| `martin-abogado.jpg` | Martín, 50, abogado | Retrato de estudio **con traje y corbata**: sin relación con el entrenamiento |
| `nestor-profesional.jpg` | Néstor, 40, profesional | **Biblioteca**: una mujer de pelo corto y un niño leyendo. Ni la persona ni el sitio coinciden |
| `paola-empresaria.jpg` | Paola, 42, empresaria | Abdominales en leggings naranjas, pabellón deportivo |
| `sebastian-atleta.jpg` | Sebastián, **14 años**, joven atleta | **Hombre adulto** negro haciendo battle ropes bajo un puente |
| `valeria-emprendedora.jpg` | Valeria, 33, emprendedora | Retrato de estudio |

Ninguno es de BAYONA. Los diez son fotografía de banco: luz de retrato de estudio,
modelos, ropa de marca, interiores de gimnasio.

## Los tres problemas, por orden de gravedad

1. **Identidad.** Tres retratos desmienten a la persona que firma el testimonio:
   Néstor (mujer + niño en una biblioteca), Sebastián-atleta (un adulto donde el
   copy dice «14 años») y Familia Rusa (unas piernas). El resto son modelos
   anónimos presentados con nombre, edad, oficio, ciudad y coordenadas en el
   globo 3D.
2. **Marca ajena.** `andrea-empresaria.jpg` muestra el wordmark y el swoosh de
   Nike. El brief lo prohíbe («sin logos», «no pueden incluir texto, letras,
   logotipos») y una web comercial que vende entrenamiento lo está exhibiendo.
3. **Estilo.** Gimnasio cerrado, material de colores, traje de abogado: justo lo
   que la Parte I de la world bible pone en «prohibidos».

No hay archivo de licencia ni nota de procedencia en el repo (`docs/`, `*.md`,
`scripts/` buscados por `pexels|unsplash|pixabay|freepik|licencia|fuente`): cero
resultados. Los JPG no traen EXIF de autor. Es decir: **no hay constancia de que
se puedan usar**, y tampoco de quién los bajó.

## Lo que NO he hecho, y por qué

No he tocado `testimonials.js` ni he borrado ni sustituido ningún retrato. El
mismo brief dice «no cambies textos, estructura, componentes», y además esto no
es una decisión técnica:

- Sustituirlos por escenas de parkour del banco sería peor: convertiría «Andrea,
  38, Bogotá» en la foto de un atleta anónimo, que es exactamente la falsa
  humanidad que la bible prohíbe.
- Borrar los retratos deja los testimonios sin cara, y si las citas son de
  clientes reales con autorización, el sitio pierde su activo de prueba social.
- Regenerarlos con IA no puede dar la cara de la clienta real, y una cara
  generada presentada como cliente existente es un problema mayor que el actual.

Las tres salidas reales dependen de material o de una decisión que no es mía.

## Lo que sí queda verificado

Los 30 ficheros existen, ninguno pesa cero, ninguna ruta está rota y las
variantes `-256`/`-960` están servidas. El defecto no es de integración: es de
origen.
