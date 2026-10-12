# BAYONA WEB — Rediseño visual comprobado · 12/10/2026

Rama editable: `copia-para-mimo`. Base oficial protegida: `backup/BAYONA-WEB-OFICIAL-2026-10-11` (`de50d0c`).

## Por qué el diseño anterior se veía mal

1. `/programs` acumulaba más de diez mil píxeles en escritorio, con cards de casi 680 px y un comparador de planes de ~2.900 px de alto.
2. `.plan-explorer` posicionaba selector y panel en columnas incorrectas: la ficha de plan caía en solo 290 px, mientras la lista de selección ocupaba 936 px.
3. La regla antigua `.home-memberships-section::before/after` pintaba una lámina translúcida **beige** sobre el comparador oscuro de Servicios. Resultado: letras blancas sobre fondo claro, imposible de leer. Se deshabilitó únicamente en `.services-memberships`.
4. Varias rutas estaban llenas de bordes modificados que pasaban inadvertidos. Se creó una pasada visual tangible y específica para cada sección.

## Cambios visibles y estructuras

- Hero de Servicios: titular «Nuestros Servicios.» (contrato SEO preservado) y lema visual «Tu cuerpo. Tu camino.», fotografía lateral con máscara cinematográfica, texto breve, dos CTAs y tres señales de método.
- Navegación editorial bajo el hero: anclas «Formas de entrenar / Membresías / Sesiones».
- Servicios: composición bento asimétrica 7/5 + 5/7, imágenes originales y tarjetas de 340–440 px, no gigantes de 680 px.
- Membresías: escritorio con selector fijo lateral (320 px) y ficha ancha a la derecha (más de 700 px), contraste real en día y noche; móvil apilado sin scroll horizontal.
- Catálogo: índice de tres disciplinas sobre papel, acordeones claros y tarjetas de sesión en blanco cálido, conservación de precios reales del repositorio.
- Cierre: banda oscura con CTA a recursos y FAQ.
- Portada: recursos y progreso de inicio reforzados.
- Nosotros: cuatro principios y línea de tiempo diferenciados.
- Tienda: seis categorías como tarjetas de selección visibles en retícula 3×2, responsive 2 columnas; productos con delimitación clara.
- App pública: bento de módulos sin tocar la APP real.
- Comunidad: pase de comunidad y tarjetas sociales.
- Recursos: fichas de biblioteca que se distinguen del fondo.
- FAQ: buscador funcional existente, panel de búsqueda y acordeones con selección clara.
- Parkour: trayectoria de progresión con borde de nivel y jerarquía.

## Archivo y mantenimiento

- `src/styles/services-visual-rebuild-20261012.css`: importado **desde Programs.jsx** (carga por ruta), para aislar todo el rediseño de Servicios.
- `src/styles/bayona-visual-impact-20261012.css`: importado desde `src/main.jsx` antes de `ds-experience`, `ds-atelier` y `home-atelier` (conserva el contrato de capas).
- `src/pages/Programs.jsx`: título, textos de presentación, navegación nueva y composición.
- `e2e/services-visual-rebuild-20261012.spec.js`: interacción en navegador y prueba de proporciones, contraste, anclas y responsive.

Las imágenes son locales y originales del sitio; no se añade ninguna librería JS, WebGL, analytics ni servicios nuevos. Las restricciones comerciales (ubicación, COP, precio y disponibilidad) se conservan.

## Reglas de edición

La web oficial sigue protegida en GitHub. **Solo** `copia-para-mimo` recibe cambios. La vista previa local nunca equivale a un despliegue Vercel; probar en móvil, escritorio, claro y oscuro antes de publicar.
