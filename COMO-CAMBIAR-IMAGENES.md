# Cómo poner imágenes diferentes en toda la web BAYONA

## Dónde están las imágenes originales nuevas

La carpeta principal es:

`public/images/bayona-generated/`

Cada archivo lleva el nombre exacto de su lugar en la web. Ejemplos:

- `home-hero.png`: portada de Inicio.
- `about-hero.png`: portada de Nosotros.
- `programs-audience-kids.png`: sección infantil de Programas.
- `programs-audience-senior.png`: sección para adultos mayores.

Los archivos que empiezan por `bank-` son fotografías reutilizables que todavía no están atadas a una sección concreta. El índice y la descripción de cada una están en `public/images/bayona-generated/README.md`. Otro agente puede copiarlas o renombrarlas para ocupar cualquier hueco compatible.

## Sustituir una imagen sin tocar el diseño

1. Prepara una imagen horizontal con proporción aproximada 16:9.
2. Usa formato PNG.
3. Dale exactamente el mismo nombre que el archivo que quieres reemplazar.
4. Copia la imagen a `public/images/bayona-generated/` y acepta reemplazar únicamente ese archivo.
5. Ejecuta `npm run build` y recarga la página.

El texto, los botones y la composición de la web no se modifican.

## Añadir una imagen nueva a otro lugar

1. Busca el nombre del hueco en `src/config/siteMedia.js`. Los nombres aparecen como segundo argumento de `cinematicScene`, por ejemplo `app-hero` o `community-group`.
2. Guarda la imagen como `public/images/bayona-generated/NOMBRE-DEL-HUECO.png`.
3. Añade `NOMBRE-DEL-HUECO` a la lista `GENERATED_BAYONA_SCENES` del mismo archivo.
4. Ejecuta `npm run build`.

Mientras un nombre no esté en `GENERATED_BAYONA_SCENES`, la web conserva temporalmente su imagen anterior. Así nunca queda una sección rota mientras se completa el banco nuevo.

## Para usar la cara de Sebastián como entrenador

1. Usar una foto frontal nítida, otra de tres cuartos y, si es posible, una de perfil.
2. Luz natural, sin gafas, sin filtros y con la cara completa visible.
3. Indicar que Sebastián es el entrenador de 23 años y que su identidad debe conservarse.
4. Mantener la regla de cada escena: Sebastián con una sola persona entrenada, o la persona entrenada sola.
5. Generar una imagen distinta para cada hueco; no reutilizar la misma fotografía con recortes.

## Dirección visual actual: parkour profesional

Las imágenes nuevas deben mostrar parkour técnico y creíble: precisión, recepciones, vaults, equilibrio, saltos controlados, preparación física específica y lectura del entorno. El protagonista puede entrenar solo o acompañado por Sebastián como entrenador joven.

## Reglas visuales del proyecto

- Máximo dos personas por imagen.
- Si aparecen dos: un entrenador y una persona entrenada.
- Incluir niños, jóvenes, adultos y adultos mayores donde el contenido lo pida.
- Nada de gimnasios llenos, grupos, multitudes ni gente decorativa al fondo.
- Sin texto, logotipos ni marcas de agua dentro de la imagen.
- Estilo editorial realista, mediterráneo, negro y azul noche con luz ámbar.
- El movimiento principal es parkour profesional; evitar fitness genérico cuando la sección admita una escena de parkour.
- Usar obstáculos bajos, arquitectura realista y técnica segura; nada de acrobacias imposibles.
- Cada sección debe tener una imagen propia, no una repetición con otro recorte.

## Las imágenes entran por dos sitios, no por uno

Esto es lo que más veces se ha pasado por alto, y la última el 22-09-2026.

1. **`src/config/siteMedia.js`** → cada hueco es un `cinematicScene(escena, 'nombre-del-hueco', descripción)`. El segundo argumento es el nombre del archivo: `public/images/bayona-generated/nombre-del-hueco.png`, y hay que añadir ese nombre a `GENERATED_BAYONA_SCENES`.
2. **Literales dentro de los CSS** → `community.css`, `faq.css`, `auth-members.css` y `onboarding.css` pintan capas decorativas con `url('/images/…')` en sus propios `::before` y `::after`. Esas capas **no pasan por `siteMedia.js`**: cambiar el config no las toca.

Por eso, antes de dar por buena una limpieza de imágenes, hay que mirar las dos bocas:

```bash
grep -rn "/images/" src --include=*.css --include=*.jsx --include=*.js
node scripts/auditar-huecos-imagenes.mjs          # el config, hueco a hueco
node scripts/inventario-de-escenas-por-pagina.mjs # qué carpeta pinta cada página
MSYS_NO_PATHCONV=1 node scripts/probe-imagenes-que-cargan.mjs http://localhost:4188  # lo que descarga el navegador
```

Y desde el 22-09-2026 hay un test que falla si cualquiera de las dos bocas vuelve
a pedir el lote retirado o una foto de un host ajeno: `src/test/imageSourceGovernance.test.js`.

## Una URL por sección (esto no es una sugerencia)

Al final de `siteMedia.js` hay un cierre que lanza

```
Error: El registro multimedia contiene N URL duplicadas.
```

y con él se cae el build, los tests y el arranque de Vite. Si el banco de imágenes
propias se queda sin originals libres, **no se arregla copiando el mismo PNG con
otro nombre ni repitiendo fotografía en dos secciones**: se busca una escena
curated propia que aún no esté colocada en `public/images/scenes/` (19 archivos,
muchos libres) o se pide una generación nueva.
