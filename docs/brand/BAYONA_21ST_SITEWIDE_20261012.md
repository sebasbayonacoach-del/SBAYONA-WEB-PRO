# BAYONA WEB × 21st.dev — integración en 12 áreas
Fecha: 2026-10-12 · Rama de desarrollo: `copia-para-mimo`.

## Alcance verificado

La biblioteca 21st.dev tiene miles de componentes de múltiples autores: **no** hay un
tema único llamado "aplicar todo". Se adaptan patrones distintos a la función
de cada sección, sin instalar decenas de dependencias ni copiar diseños completos.

| Área real de BAYONA | Patrón / inspiración 21st.dev | Resultado |
|---|---|---|
| 01. Navegación global | Navigation / active tab | Subrayado de sección activa y foco visible |
| 02. Home / inicio guiado | Stepper / progress | Puntos de progreso accesibles, estados de foco y señales de confianza |
| 03. Programas / caminos | Feature Bento | Bordes reactivos en tarjetas con foto, sin perder contenido |
| 04. Comparador de membresías | Pricing tabs / comparison | Selección resaltada y filas comparables; respeta precios canónicos |
| 05. Programas / catálogo | Accordion / disclosures | Resumen navegable, estado abierto y contorno de selección |
| 06. Nosotros | Timeline / values | Hitos cronológicos y principios con señal de lectura |
| 07. Tienda | Cards / category chips / product grid | Selección visible, foco accesible y acercamiento visual discreto |
| 08. BAYONA App (página pública) | Feature grid / Bento | Mejor distinción de módulos y foco en las acciones |
| 09. Comunidad | Social cards / membership pass | Jerarquía de acceso y tarjetas sociales interactivas |
| 10. Recursos | Knowledge library / media cards | Biblioteca de recursos con foco y estados de interacción |
| 11. FAQ | Search input + accessible accordion | **Buscador funcional** por pregunta y respuesta, contador en vivo, reinicio y estado vacío |
| 12. Parkour Academy | Roadmap / progression cards | Etapas destacables y enlaces accesibles |

Piezas previas que se conservan: spotlight de servicios/recursos de Home y shimmer del
CTA, implementados en el commit `1def78c`. Se mantienen sin duplicación.

## Archivos

- `src/styles/21st-sitewide-patterns.css`: estilos sectorizados a
  `.ds-frame[data-experience-scope='brand']`.
- `src/pages/FAQ.jsx`: filtro accesible que busca sobre los textos de
  `questionCategories` (fuente única de verdad). Conserva los índices originales
  de cada acordeón, incluso al filtrar.
- `src/main.jsx`: importa la capa ANTES de `ds-experience`, `ds-atelier` y
  `home-atelier` para preservar el contrato original del sistema visual.
- `src/test/twentyfirstSitewide.test.js`: contrato de rutas, selectores,
  tokens, accesibilidad, integración y límites de rendimiento.

## Restricciones importantes

- 100% en `copia-para-mimo`. **NO** modificar
  `backup/BAYONA-WEB-OFICIAL-2026-10-11`,
  `web-oficial-20261011-pre-edicion-externa` ni `main`.
- No se altera el producto BAYONA APP: solo la página de promoción del sitio WEB.
- No se crean precios, testimonios, fechas, limitaciones, planes o servicios nuevos.
- No se instalan nuevas dependencias, WebGL, scripts de terceros ni llamadas de red.
- Se conserva día/noche y `prefers-reduced-motion`. Foco de teclado visible,
  controles táctiles mínimos de 44px y búsqueda con `role=search` + `role=status`.
- El gran visual original de la marca no se reemplaza con elementos genéricos.
- Confirmar visualmente funcionamiento en 375 y 1440 px y pruebas del buscador.
- No publicar automáticamente en producción sin comprobación explícita.

Fuentes: https://21st.dev/community/components y
https://docs.21st.dev/blog/react-feature-section-components,
https://docs.21st.dev/blog/react-faq-accordion-components,
https://docs.21st.dev/blog/react-input-components.
