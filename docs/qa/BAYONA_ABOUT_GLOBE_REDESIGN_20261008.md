# BAYONA Nosotros — rediseño del atlas y ritmo editorial

## Defecto original
El capítulo Nosotros combinaba un globo WebGL decorativo sin entrada y un mapa interactivo plano independiente. La sección duplicaba la cartografía y acumulaba demasiado espacio visual, mientras Valores y Método dependían de escenarios sticky a pantalla completa.

## Solución implementada
- Atlas con un solo globo 3D: textura terrestre, marcadores por ciudad sobre coordenadas geográficas, rotación directa y selección de la historia desde los puntos.
- Cinco puntos de ciudad representan las diez historias registradas; el índice de diez entradas permite recorrer cada historia de forma individual.
- WebGL se carga de forma diferida desde `engine/scene/StoryGlobeScene.jsx`; sin WebGL se mantiene un mapa plano interactivo, accesible mediante teclado, y los controles regionales.
- Las fotos de las fichas se solicitan al abrirlas, sin `loading=lazy`.
- Cuatro valores simultáneos en una cuadrícula editorial; tres decisiones del método visibles sin largas zonas sticky.
- Fotografía contextual del entorno de parkour de Gandía en la sección del fundador: es ilustrativa, NO debe etiquetarse como retrato verificado de Sebastián.
- Home, servicios, pagos y texto legal no se modificaron.

## Evidencia de cierre técnico
- Suite Vitest: 115 archivos correctos, 788 pruebas superadas, una omitida (8 oct 2026).
- Build de producción correcto; sigue advertencia de chunk grande de Three.js (no bloqueante).
- Playwright: 11/11 pruebas específicas de Nosotros, globo, mapa alternativo y segundo capítulo correctas.
- En una regresión transversal anterior, 43/44 pasaron, con un fallo por superposición de puntos en el mapa fallback; resuelto con pin único por ciudad y revalidado en el nuevo conjunto de 11 pruebas.

## Aún por validar antes del despliegue público
- Confirmar imágenes personales auténticas del fundador; no convertir fotos ilustrativas en afirmaciones de identidad.
- Revisión comercial/legal de la web, ya documentada en BAYONA_RELEASE_GATE_20261008.md.
