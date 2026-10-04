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
