# BAYONA · Auditoría visual del 10-10-2026

## Fallos reproducidos y causas
1. En las dos capturas del usuario: footer con tipografía BAYONA enorme invadiendo la columna EXPLORAR, navegación secundaria en fila de chips difícil de leer, contraste pobre.
2. En Nosotros, GSAP ScrollTrigger cambiaba la historia activa, pero `pin: true` NO mantenía realmente la escena visible: al desplazar la página, el rectángulo de la etapa se encontraba miles de píxeles fuera del viewport. Esa es la causa concreta de los espacios vacíos.
3. El catálogo tenía diez historias publicadas, pero la narración fijada solo daba cuatro paradas con posibles huecos entre transiciones.

## Corrección
- `src/styles/footer-clarity-2026.css`: footer con CSS grid y áreas explícitas, grupos visibles y wordmark acotado. Incluye móvil y modo día. Específico para Footer, no cambia otras rutas.
- `editorial-outro`: categorías de exploración en grid 4/3/2 columnas, no fila desordenada de botones.
- `GlobeScrollDirector`: una introducción + las diez historias existentes en `config/testimonials.js` + cierre, sin nombres inventados; paso atómico sin tarjetas ocultas entre capítulos.
- `GlobeTestimonials`: wrapper estructural `.globe-atlas-runway`, con `position: sticky` del escenario en escritorio. ScrollTrigger se usa para dirigir las tarjetas, NO para hacer un pin transformado que no permanece visible.
- Pantallas reducidas y `prefers-reduced-motion`: todas las entradas en flujo normal y controles del mapa disponibles.
- `designly-interior-finish.css`: mejor contraste y gramáticas distintas para Servicios, Tienda, Parkour, Comunidad y Recursos, con el modo día y la Home intactos.
- Ningún bloqueo duro del desplazamiento; wheel, teclado y lectores pueden avanzar y salir.

## Controles de calidad
- El test `e2e/about-guided-motion.spec.js` exige que cada una de las 12 escenas esté VISIBLE dentro del viewport durante el recorrido completo (no solo `opacity=1` en un elemento que esté fuera de pantalla).
- `e2e/interior-clarity-20261010.spec.js` mide el solapamiento geométrico del footer, overflow horizontal y navegación de categorías en nueve rutas y dos anchos.
- Mantener tests de WebGL, fallback 2D, testimonios accesibles, móvil y movimiento reducido.

## Límites
- El catálogo utiliza el texto editorial existente en el repositorio. Sigue siendo contenido publicado, no una verificación independiente de resultados.
- Las geometrías particulares por página se han reforzado sin reescribir todos los módulos de las otras rutas; no se promete un rediseño total de todas las páginas.
