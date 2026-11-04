# SEBASTIAN BAYONA — Estado del lanzamiento (4 noviembre de 2026)

## Entregables implementados
- Nombre comercial visible: **SEBASTIAN BAYONA**; sistema visual editorial compartido entre Inicio, La Historia, Experiencias, Parkour Lab, El Círculo, SB+, La Colección y La Biblioteca.
- Portada SB+ rediseñada, vistas interactivas y capturas reales regeneradas desde la aplicación en esta versión (no fotos ni dashboards inventados).
- App real bajo `/mi-app/`: textos y metadatos de entrada, pantalla de login, selector de perfiles, PWA y portada pública integrados con **SB+ / SEBASTIAN BAYONA**. No se migraron IDs internos, claves de almacenamiento, autenticación ni backend.
- Stripe **no** están habilitados para cobrar al público; el proceso de consulta sigue enviando la solicitud a WhatsApp. El carrito es una selección consultable, NO un pedido pagado.
- Sin mensajes de «misión en curso» en páginas públicas, sin estadísticas ficticias, sin imágenes rotas ni saltos horizontales en las comprobaciones previas.
- Copys de contacto de tienda y configurador de servicios alineados con el nuevo nombre; precios y SKU sin modificar.
- Compilación Vite + auditoría de distribución sin enlaces sandbox y auditoría de JavaScript de entrada aprobadas. El bundle de Three.js pesado se carga bajo demanda.

## Restricciones comprobadas — necesarias antes de anunciar una tienda operativa
1. **Stripe:** la única cuenta accesible es `Entorno de prueba de New business` y devuelve `livemode: false`. No hay credenciales de cobro reales verificadas. No se han creado cargos reales ni se ha activado suscripción alguna.
2. **Inventario y proveedores:** faltan evidencias de stock, tallas, plazos y condiciones de entrega/devoluciones. Mantener mensajes de consulta y confirmación previa; no habilitar pagos a ciegas.
3. **Mercado y divisas:** la tienda y los planes conservan referencias en COP y equivalencias estimadas. Confirmar mercado de venta, país de envío, moneda final y fiscalidad antes de lanzar campañas.
4. **Imagen y privacidad:** los vídeos y personas aún requieren confirmación documental de derechos antes de anuncios o publicación general.
5. **Producción:** el sitio verificado está en previsualización local. No se ha desplegado esta rama al dominio público.

## Puertas de salida / aceptación de lanzamiento
- **Diseño y funcionalidad:** sin errores JavaScript, navegación usable, CTA reales, imagen de marca coherente y revisión móvil.
- **Pagos:** cuenta live verificada, pruebas de pago fallido/correcto, webhook idempotente y confirmación de pedidos antes de habilitar checkout real.
- **Comercio:** cada producto debe tener identificador, stock/proveedor, precio final verificable, tallas, envío, devolución y contacto de atención.
- **Privacidad y legal:** páginas reales de condiciones de venta, protección de datos, consentimiento de marketing, aviso legal y comunicaciones legítimas antes de captar contactos a escala.
- **Analítica:** medir visita, clic de interés, consulta legítima, solicitud enviada, pago verificado y recurrencia por separado; nunca contabilizar clic de WhatsApp como venta.
- **Publicación:** desplegar primero en staging accesible por HTTPS, repetir pruebas de compra real solo con configuración live autorizada, y recién entonces publicar y medir.

## Previsualización
`http://127.0.0.1:4292/` — disponible solo desde el ordenador donde se ejecuta el servidor local.

## Ruta de cierre
1. Conectar cuenta Stripe en modo live mediante autorización del propietario y verificar su contexto.
2. Confirmar inventario, condiciones, divisa y país de entrega.
3. Ejecutar pruebas y QA de checkout real; configurar webhooks backend.
4. Aprobar imágenes y copys, desplegar a staging/pública, activar campañas con consentimiento y medir conversiones.

## Verificaciones de esta revisión
- Compilación de producción y auditorías poscompilación: **aprobadas**.
- Pruebas Playwright de nueva identidad real de app + imágenes + solicitud comercial: **3/3 aprobadas**.
- Pruebas de aplicación compatible y colección completa: **24/24 aprobadas**. La tienda presenta un adelanto editorial de cada colección (hasta ocho piezas por colección) y permite abrir sus fichas completas; se verificaron todas las fichas y enlaces individuales de WhatsApp.
- API Stripe en entorno de prueba: **15/15 pruebas aprobadas**. Esto no valida ni habilita pagos reales.
- Manifiesto instalable PWA: marca «SB+»; cache del Service Worker incrementada de v43 a v44 para invalidar visuales antiguos.
- Capturas de entrada y selección de perfiles regeneradas desde el DOM real de la app. Para documentación visual se ocultó momentáneamente la pantalla de autenticación durante la captura del selector; **no** se eludió la autenticación en la app ni se creó una sesión ficticia. Los archivos de presentación de la web muestran ese selector auténtico.
- Las credenciales, rutas del backend, identificadores de productos, claves de almacenamiento y permisos de entrenador se preservaron.
- Advertencia de rendimiento conocida: paquete 3D de 909 kB (242 kB gzip) cargado dinámicamente; no forma parte del JavaScript crítico inicial.

## Estado final de la revisión
Completada la mejora de identidad, el control de compatibilidad y la verificación del recorrido de consulta. **No se declara lanzamiento comercial terminado:** la cuenta conectada de Stripe es exclusivamente de prueba y faltan datos reales de inventario, condiciones de envío y derechos de imagen. Tampoco se ha desplegado esta nueva versión al dominio público sin esas verificaciones.
