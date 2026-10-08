# BAYONA PRIME · Design QA — Unión negro/cielo
Fecha: 2026-10-04. Rama de trabajo: bayona-prime/hero-sky-dissolve-20261004.

**Referencia del usuario:** dos capturas de la preview local (686 px aprox.) donde la primera fotografía de `ScrollFilm` empezaba con un borde horizontal duro después del hero negro.

**Reproducción antes:** Chromium 686×920, preview 127.0.0.1:4285, scroll hacia el límite de hero y película. Captura local `/tmp/bayona-seam-before-1.png`. Se observaba un límite seco entre negro y cielo; el hero mide 920 px y la película empieza en 920 px, con la escena sticky dentro de un capítulo separado.

**Implementación después:** `src/styles/scroll-film.css` empareja el fondo del capítulo con el negro del hero (#050505) y aplica máscara graduada únicamente al primer fotograma: transparencia total en la costura → imagen completa a 35svh. La máscara también existe para la primera imagen en Modo calma. No se reestructura el DOM, no se añaden imágenes y no se tapa `MODO CALMA`.

**Evidencia comparable:** `test-results/playwright/home-sky-seam/tablet-686.png`; también capturas `phone-390.png` y `desktop-1440.png`. La costura ahora tiene degradación continua negro→cielo.

## Revisión de cinco superficies
- **Tipografía:** títulos, pesos y jerarquía existentes permanecen sin modificación; ningún texto queda dentro del área inicial de 35svh de la máscara.
- **Espaciado:** ni margenes negativos, ni nuevas alturas; misma relación hero / película.
- **Color:** #050505 coincide con el plano negro de cierre del hero; se conservan acentos naranjas y tonos naturales del cielo.
- **Imagen:** mismo asset, proporciones, enfoque y resolución; solo cambia la revelación del primer fotograma.
- **Contenido:** el texto, el orden de las tres escenas, el control Modo calma y los botones no cambian.

**Hallazgos posteriores:** sin P0/P1/P2 en el área de unión examinada; no supone auditoría completa de la portada ni de otras rutas.

**Verificación visual:** Playwright `e2e/home-sky-seam.spec.js` pasó 3/3 con las resoluciones anteriores, tras reproducir un fallo inicial en tablet antes del cambio. Se mantienen accesibles las capturas para comparar. El build y la batería general se verifican por separado.

## Auditoría adicional: corrección de la causa raíz
La captura posterior del usuario mostró un filete visible pese a la máscara de la imagen. La primera evaluación no había aislado las decoraciones globales, por lo que la conclusión anterior no era suficiente.

**Causa 1:** `award-experience.css`, regla `section:not(:first-child)::after`, dibujaba un filete naranja de 1px encima de `ScrollFilm`. La regla correspondiente de `prime-polish.css` también lo trataba como capítulo ordinario.

**Causa 2:** las reglas de `section:not(:first-child)` añadían padding superior e inferior al capítulo sticky, separando 92 px la primera imagen del hero en la captura de 728×415.

**Arreglo:** excluir `.scroll-film` de las seis reglas globales implicadas en `award-experience.css` y `prime-polish.css`, sin desactivar la decoración de los demás capítulos ni colocar superposiciones adicionales.

**Regresión roja antes del arreglo:** Playwright devolvió `Expected: none; Received: "\"\""` para `::after` con altura de 1px.

**Regresión verde después:** cuatro pruebas Playwright correctas (390, 686, 1440 px y modo calma). Comprobación separada con navegador a 728×415 y scroll Y=466: borde inferior del hero y borde superior del film ambos a 142,83 px; `paddingTop=paddingBottom=0px`; `::after.content=none`; `scroll-film__sticky.top=142,83px`. Nueva captura local: `/tmp/bayona-seam-728x415-after.png`.

**Verificaciones completas:** npm run build exit 0; npm test: 111 suites, 780 correctas, 1 omitida, ninguna fallida; npm run lint exit 0, 0 errores, 823 advertencias preexistentes; git diff --check exit 0. Producción no modificada.
