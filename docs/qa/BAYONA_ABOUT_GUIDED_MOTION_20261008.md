# BAYONA · Nosotros como recorrido narrativo dirigido

## Dirección implementada
- Siete capítulos de lectura: Propósito → Persona → Recorrido → Mundo → Valores → Método → Empezar.
- Indicador de progreso integrado en la página, enlaces a las siete paradas, estado activo, navegación por teclado; sin secuestro de scroll.
- GSAP / ScrollTrigger se importa solamente desde `engine/motion/gsapMotionBridge.js` con una única excepción explícita y auditada a la regla que prohíbe imports distribuidos del motor.
- Revelados por scroll de titulares existentes y transformación sutil de fotografía del recorrido.
- Globo con un pin GSAP limitado a escritorio y sin `prefers-reduced-motion`, duración relativa de 210% viewport; el texto avanza por cuatro fases Colombia → España → Internacional → siguiente paso.
- Selección de historias y orientación inicial de la esfera según la etapa de scroll. La interacción manual con el globo y sus historias se conserva.
- En móvil, tablet o movimiento reducido, las cuatro escenas se presentan de forma estática, legibles y ordenadas; sin pin ni scroll bloqueado.
- Mapa 2D permanece disponible si WebGL no existe.

## Guardarraíles
No se exige bloquear el desplazamiento del usuario: la idea de 'recorrido obligatorio' se implementa como continuidad narrativa, no como scroll-jacking o pérdida del control de navegación. No hay historias, resultados o referencias personales añadidas sin respaldo en el catálogo existente. No se modifica la Home ni producción.

## QA
- `e2e/about-guided-motion.spec.js`: rutas de siete capítulos, pin de globo, fases de narración y modo accesible.
- Se mantiene `e2e/about-story-visual-regression.spec.js`, que detecta la columna de 34 px anterior.
- Confirmar artefactos de compilación y pruebas antes de publicar vista previa.
