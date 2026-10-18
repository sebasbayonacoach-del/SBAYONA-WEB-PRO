# BAYONA — Puesta en marcha comercial (sin ventas ficticias)

## Estado técnico verificado

- La página `/checkout?plan=FUERZA` genera un presupuesto orientativo con los importes del catálogo canónico.
- El visitante abre voluntariamente un enlace oficial de WhatsApp. **Este paso no crea una venta, reserva ni cobro**.
- Los cuatro planes publicados están denominados en COP; las equivalencias EUR/USD son orientativas.
- Los eventos `guided_visit_started`, `guided_visit_completed`, `plan_selected`, `request_builder_opened`, `checkout_handoff_started` y `whatsapp_click` no incluyen nombres, teléfonos ni correos.
- `lead_submitted` se utiliza solamente tras confirmar una inserción real en el backend de contactos.
- Los scripts de analítica externa requieren consentimiento explícito y configuración activa. Sin esos datos no hay métricas del proveedor.
- `npm run audit:bundle:3d` falla si la entrada vuelve a importar estáticamente WebGL.

## Para habilitar cobros reales — pendiente del propietario

1. Conectar una cuenta comercial verificada de Stripe (u otro proveedor), configurada legalmente para la entidad y moneda aplicables.
2. Confirmar oferta, impuestos, ubicación de prestación y si cada plan es un pago único o una suscripción renovable. No crear pagos o suscripciones hasta confirmar esos términos.
3. Crear los productos y precios oficiales en el proveedor; validar importes y servicios incluidos.
4. Integrar un endpoint **de servidor** que cree sesiones de pago con importes validados por el backend, nunca recibidos sin comprobar desde el navegador.
5. Verificar firma del webhook y el estado efectivo de pago. Emitir `purchase` únicamente tras la confirmación del proveedor y evitar duplicados mediante idempotencia.
6. Probar el flujo en modo de prueba, política de cancelación y reembolso y recibos antes de habilitar producción.

No se han creado productos, precios, sesiones, pagos ni suscripciones en Stripe. Ninguna cuenta de pagos estaba conectada durante este trabajo.

## Para medir conversiones reales — pendiente de conectar un proveedor

- Configurar al menos una fuente autorizada: `VITE_GA4_ID`, `VITE_PLAUSIBLE_DOMAIN` o `VITE_META_PIXEL_ID` en el entorno de despliegue.
- Verificar que el consentimiento impide cargar scripts antes de ser concedido.
- Separar en los informes **vista → visita guiada → plan visto → consulta iniciada → WhatsApp abierto → lead recibido → pago verificado**.
- La apertura de WhatsApp no demuestra que el usuario haya pulsado «Enviar», ni que el negocio haya respondido.
- Probar el despliegue en un dominio real vinculado a Vercel antes de invertir en anuncios.

## Rendimiento

El paquete 3D no se importa en la entrada estática tras separar el helper de precarga y Zustand. La primera carga móvil de la vista previa de producción bajó de aproximadamente 505 a 268 KB de JavaScript transferido (una medición local, sin estrangulación de red). No equivale a una puntuación Lighthouse ni garantiza tiempos en redes reales.
