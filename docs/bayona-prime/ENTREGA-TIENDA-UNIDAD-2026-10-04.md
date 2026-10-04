# BAYONA PRIME — Tienda y sistema visual unificado

Fecha de trabajo: 2026-10-04.
Rama: `bayona-prime/shop-unified-20261004`.
Fuente: `SBAYONA-WEB-PRIME-20261004`; creada desde el commit local 4539623.
Publicación de producción: NO REALIZADA.

## Decisiones implementadas

1. Conservar el catálogo existente de 39 referencias, 4 colecciones y las categorías registradas, sin inventar inventario, fabricantes, certificaciones, tallas ni disponibilidad.
2. Rehacer las tarjetas del catálogo en lenguaje editorial: icono, categoría, descripción, precio, peso cuando procede, añadir al carrito y consultar por WhatsApp; sin imagen, vídeo ni WebGL dentro de las fichas.
3. Declarar expresamente que precios, características, disponibilidad, tallas y entrega deben confirmarse antes de finalizar un pedido. Las conversiones EUR/USD de la fuente son aproximaciones indicativas, no tasas vigentes garantizadas.
4. Sustituir las imágenes empotradas de colección por un escenario abstracto de marca. Retirar la presentación de vídeo con póster comercial no verificado en la tienda. Conservar la fotografía de escenas grandes fuera de tarjetas cuando pertenece al diseño de página.
5. Dar a todas las fichas de producto un grid común (3 columnas grandes, 2 medianas y 1 móvil) que no oculte productos mediante carruseles obligatorios.
6. Mostrar todas las opciones de filtro móvil sin cubrir los productos con una barra fija demasiado alta.
7. Introducir una capa `bayona-visual-unity.css` de contenedor, tipografía, borde, fondo y controles de foco para rutas de marca; ocultar fotografías incrustadas en clases de tarjeta reutilizadas por páginas existentes.
8. Corregir el fallo de `useTransform` cuando `StickyStage` entrega progreso numérico en modo estático de movimiento reducido: separar `DecisionBeam` del `StaticDecisionBeam`.

## Qué permanece intacto
- Rutas, sesiones, miembros y comunidad.
- Selección de planes y precios publicados en los archivos fuente.
- Carrito, variantes, filtros, búsqueda, CTA WhatsApp.
- Checkout de solicitud por WhatsApp; no se representa como cobro procesado.
- Diseño de escenas de página a sangre (no contenido dentro de tarjetas).

## Comprobaciones
- Test específico Shop + contratos de sistema y contenido: 36/36 inicialmente correctos después de la transformación.
- Vitest completo inicial de iteración: 111 suites correctas, 780 casos correctos, 1 omitido, cero fallidos.
- Build inicial: exit 0.
- ESLint inicial: exit 0, 822 advertencias no bloqueantes.
- Playwright nuevo `e2e/shop-unified.spec.js`: 3/3, incluyendo móvil 390px, escritorio 1440px, cuatro rutas y fallback de movimiento reducido.
- Última batería completa y compilación: consultar `/tmp/bayona-shop-final-tests2.log` y `/tmp/bayona-shop-final-build2.log` para resultados frescos tras el arreglo de `StaticDecisionBeam`.

## No certificado
- Disponibilidad comercial ni compras reales.
- Auditoría completa de WCAG en todas las rutas.
- Umbrales de Core Web Vitals en producción.
- Despliegue público.
- Optimización del paquete grande `vendor-three`.

## Verificacion final de cierre
Vitest: 111 suites; 780 pruebas correctas, una omitida y cero fallidas. Compilacion Vite: exit 0. ESLint: exit 0, cero errores y 823 advertencias. Playwright de tienda y unidad visual: 3 de 3 correctas, incluido movimiento reducido y cuatro rutas. git diff --check: exit 0. La web publica no ha sido modificada.
