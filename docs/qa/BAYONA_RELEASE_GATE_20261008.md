# BAYONA WEB — Puerta de lanzamiento (8 de octubre de 2026)

## Estado comprobado
- Rama de diseño: `bayona-prime/visual-rescue-20261008`.
- Último commit comprobado antes de este documento: `eb755c0`; GitHub sincronizado.
- Vista previa independiente Vercel: https://bayona-1mnh2cn58-sevisionari-3740s-projects.vercel.app/ (requiere autenticación Vercel).
- Compilación remota `READY`, sin el defecto previo de sintaxis CSS. Build incluye 13 HTML de rutas para SEO.
- 36/36 pruebas transversales Playwright, 11/11 pruebas tras reparación CSS y 787/787 unitarias de la pasada anterior, con una prueba omitida. Estas cifras corresponden a ejecuciones distintas; no deben sumarse como un único test suite.
- Comprobadas 11 rutas, 11 destinos internos únicos sin HTTP de error y 0 errores JS durante la revisión.
- Checkout rellenable: genera URL wa.me y muestra instrucción de enviar el mensaje; no crea un pedido ni realiza cobro. El enlace fue simulado en navegador, sin mensaje real.

## Bloqueos antes de anunciar un comercio plenamente operativo
1. **Modelo de cobro:** Checkout es una solicitud por WhatsApp. No hay verificación de compra ni pasarela online final. Debe venderse como 'solicitar/confirmar', nunca como 'pagar al instante'.
2. **Información legal y privacidad:** la navegación pública no enlaza a política de privacidad/aviso legal; hay captación de nombre, email y WhatsApp. Preparar textos con datos verificables del responsable, contacto y actividad, bases del tratamiento y derechos, y revisar el uso real de cookies/analítica antes de producción. No inventar NIF, razón social ni dirección.
3. **Accesibilidad/performance:** avisos no bloqueantes de React/Three.js y chunk `vendor-three` de ~893 KB. Deben controlarse en la siguiente optimización; no impiden que Vite construya.
4. **Publicación:** producción `bayona-jet.vercel.app` no ha sido reemplazada. El preview está protegido por autenticación.

## Decisión de lanzamiento
- Vía rápida: **web comercial de captación con asesoramiento por WhatsApp**, aclarando explícitamente 'sin pago online', tras publicar información legal validada.
- Vía e-commerce: integrar y probar pasarela real, confirmación del pedido, condiciones, logística/stock y devoluciones antes de llamar 'tienda con compra online'.
- Promover a producción solo una versión que pase las puertas anteriores y una última inspección en `390px` y `1440px`.
