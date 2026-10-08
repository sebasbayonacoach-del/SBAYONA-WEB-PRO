# BAYONA — Auditoría visual real y correcciones del 4/10/2026

## Alcance realizado
- Inspección Playwright de Home compilada, tres momentos por 15 áreas identificables a **390, 726 y 1440 px**: 135 capturas de pantalla en total. La consulta inicial buscaba erróneamente `.home-proof-section` cuando la clase real es `.proof-section`; se verificó después con capturas adicionales de 390/726/1440, sin atribuir un falso error de ausencia.
- Comprobación de las rutas públicas principales a 390 y 1440 px (13 rutas por tamaño; primera vista), más prueba de permanencia de la pantalla de carga en /programs, /shop, /community y /resources.
- Inspección de opacidad, color efectivo, naturalWidth de fotografías, roturas de red, errores JS, scroll, movimiento reducido, cabecera y salidas a programas/recursos.

## Hallazgos, comprobados y corregidos
1. **Galería y hero:** fotos cargaban correctamente y no tenían respuestas HTTP de error; se conservaron.
2. **Método/galaxia y claridad:** son figuras SVG/CSS, con `img` ausentes por diseño. La larga sucesión de paneles negros debilitaba su impacto. Se añadieron fotografías WebP locales como capas ambientales oscuras, sin sustituir recorrido ni cámara.
3. **Reto 30 días:** pantalla de cine gráfica, ahora con fotografía real como capa dentro de la pantalla; CTA /resources intacto.
4. **04 / EXPERIENCIA:** verificación reveló tres pasos estáticos en móvil sin imagen, con espacio visual débil. Añadida fotografía editorial identificada explícitamente como **ilustración y no evidencia de resultados**: un único panel para el primer paso estático y una capa tras la visualización espacial dinámica, sin simular testimonios ni inventar datos.
5. **05 / MEMBRESÍAS:** corte brusco de pasarela oscura hacia gran área crema vacía. La propia sección computaba `rgb(245,241,232)`. Unificado entorno oscuro `rgb(8,9,12)`, título blanco `rgb(247,247,243)`, manteniendo fichas de venta claras y sus precios/controles.
6. **07 / CIERRE:** el párrafo de cierre podía mantener `opacity:0` y translateY de +30px incluso tras entrar en viewport. Eliminada dependencia de animación de entrada para texto/CTAs esenciales y añadida fotografía de horizonte local. Comprobado `opacity:1` al entrar y retroceder.
7. **Carga inicial en rutas:** se observa temporalmente `CARGANDO EXPERIENCIA 0%` al comenzar navegación. En /programs, /shop, /community y /resources desapareció al cabo de ~2,2 s en Chromium; no se modificó el loader porque su temporización depende del contrato de assets 3D y no representa imagen rota.

## Decisiones conservadas
- Ninguna fotografía inventada ni descarga externa. Archivos locales `public/images/burst/*.webp` usados con alt decorativo; se preservan accesibilidad/movimiento reducido.
- Módulos de ventas, planes, precios, políticas, testimonios realmente publicados, tienda, checkout y ramas `main` intactos.
- No se añadieron dependencias, WebGL canvas ni otro controlador de scroll.

## Evidencia y límites
- Logs y capturas instrumentales de auditoría en la máquina autorizada bajo `/tmp/bayona-visual-audit-20261004/`. No se insertan capturas no verificadas en el repositorio.
- Primera vista de otras rutas no equivale a auditoría integral de checkout o a test de todas las interacciones; esas rutas se comprobaron en cuanto a respuestas, fallos de recursos y desbordamiento temprano.
- Build/tests/lint y navegación final se adjuntarán únicamente después de confirmarlos en terminal.

## Entrega comprobada
- Resultado de `npm run build` final: **exit 0**; se mantiene aviso no bloqueante de chunk `vendor-three` cercano a 893 kB.
- Vitest completo: **112 suites, 784 casos correctos, 1 omitido, 0 fallidos**.
- ESLint: **exit 0**, **0 errores**, **831 advertencias**.
- Playwright específico de auditoría: **4/4**, sobre fotografías reales, fondo CSS respetando el contrato de beneficios, evidencia ilustrada sin falsos claims, /resources, planes y cierre. Escenas existentes: **6/6** en comprobación anterior de esta misma rama, antes del ajuste de fondo CSS. Contrato Home: **18/18** después del ajuste.
- Preview compilada `127.0.0.1:4285` a **390/726/1440**: fondo programas `rgb(8,9,12)`, titular `rgb(247,247,243)`, texto final opacidad `1`, fotografías del bloque 04 presentes, fotografía de beneficios implementada como `background-image` y **cero etiquetas `img` en beneficios**. Sin JavaScript errors ni overflow.
- Examen de rutas públicas: **26 primeras vistas** a 390/1440 sin imágenes HTTP 4xx ni errores JS; no se afirma auditoría exhaustiva de todas las interacciones por ruta.
- No se modifica ni despliega rama `main` ni producción.
