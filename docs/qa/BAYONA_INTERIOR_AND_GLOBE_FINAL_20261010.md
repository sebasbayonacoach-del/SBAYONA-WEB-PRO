# BAYONA · Refinamiento visual 2026-10-10

## Reparaciones
- Parkour: «TRES NIVELES. NINGÚN ATAJO.» ya no es un StickyStage opaco de 180vh ni contiene marcos «PREVIEW» vacíos. Los tres niveles Base/Flujo/Rendimiento se ven simultáneamente en retícula editorial, o secuencia vertical en móvil; progresiones y criterios originales intactos.
- Nosotros, método: titulares en columna clara, retícula de tres decisiones alineadas, tarjetas más cortas y con suficiente contraste, fondo fotográfico atenuado. Copia y enlaces conservados.
- Servicios: membresías dejan de renderizarse como blanco lavado bajo tema noche; fondo grafito, tipografía marfil, pestañas contrastadas. El tema día ofrece papel cálido y texto oscuro. La Home permanece intacta.
- Microdetalles: etiquetas compactas de capítulos y secuencias editoriales inspiradas en Parkour, adaptadas a Servicios, Nosotros, Tienda, Comunidad y Recursos.
- Globo: rotación orgánica constante fuera de historia y micro-deriva durante historias; orientación 3D por coordenadas lat/lng mediante cuaterniones, escala de foco suave, halos expansivos y pulsos en marcadores. Testimonios de catálogo usan sus fotografías existentes, nombre, ciudad, rol, cita y descripción editorial. Transiciones de testimonio por fade/traslación/ligero desenfoque. Los puntos inferiores desplazan al capítulo correspondiente en escritorio; en móvil abren la ficha. El recorrido sticky y fallback sin movimiento se conservan.

## Riesgos y límites
- Testimonios son experiencias publicadas en el repositorio, no verificación médica ni garantía.
- El globo tridimensional depende de WebGL y preferencias de movimiento. Fallback 2D accesible conservado; la rotación continua se desactiva con movimiento reducido.
- No se han modificado ofertas, precios, cuentas ni la Home.
- La aplicación BAYONA independiente no ha sido tocada.

## QA
- Unitarias específicas: Parkour, About, Programs, Globo.
- Navegador: `e2e/bayona-visual-priority-20261010.spec.js`, `e2e/about-guided-motion.spec.js` y `e2e/f8-consolidation.spec.js` verifican 3 niveles, responsive, tema de servicios, estructura del método y 12 capítulos del atlas sin espacios vacíos.
