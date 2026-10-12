# BAYONA WEB — Auditoría visual completa V4 · 12/10/2026

## Diagnóstico renderizado

Se revisaron Inicio, Nosotros, Servicios, Tienda, Comunidad, Recursos, BAYONA+, Parkour, FAQ y 404 en 1440×900 y 390×844.

Problemas encontrados antes del V4:

- identidad inconsistente entre rutas: cada página parecía usar una dirección visual distinta;
- exceso de negro continuo y microtexto en mayúsculas;
- portada y secciones intermedias con demasiado scroll ceremonial;
- Home con servicios a una sola columna pese al ancho disponible;
- Servicios: selector de membresías en la columna derecha y ficha activa atrapada en 290 px;
- Tienda: colecciones completas agrupadas en columnas, produciendo huecos enormes;
- Recursos: capas cinematográficas lavaban el contraste del capítulo de 30 días;
- BAYONA+: nueve funciones en columnas demasiado estrechas y altas;
- FAQ: barras grises poco jerárquicas;
- hojas recientes de Refero/21st acumuladas sobre estilos antiguos, sin un owner final.

## Dirección V4

Una única identidad: grafito + crema cálido + naranja amanecer.

- tipografía grande y legible;
- navegación limpia en papel cálido;
- hero fotográfico con mensaje y CTA sin adornos innecesarios;
- alternancia deliberada entre capítulos claros y oscuros;
- cards con imagen solo cuando aporta contexto;
- dos columnas para servicios y tres columnas para catálogos/productos;
- mobile a una columna, sin scroll horizontal;
- menos motion y cero dependencia nueva.

## Implementación

- Owner: `src/styles/bayona-final-visual-v4.css`.
- Importado desde `src/main.jsx` y como última hoja en las 10 rutas auditadas.
- Las capas experimentales globales de Refero/21st creadas durante iteraciones previas dejaron de importarse.
- La 404 conserva su arte orbital específico y recibe el ajuste final V4.
- No se tocaron precios, productos, autenticación, formularios, tracking, checkout ni la APP real.

## Seguridad

- versión previa congelada: `backup/pre-full-visual-redesign-20261012` → `8a6f279`;
- oficial histórica intacta: `backup/BAYONA-WEB-OFICIAL-2026-10-11` → `de50d0c`;
- edición únicamente en `copia-para-mimo`.
