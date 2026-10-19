# BAYONA PRIME — integración de pagos en sandbox

**Estado:** preparado para ensayar pagos de prueba. **No habilitado para cobros reales, no representa una compra ni activa el servicio.**

## Lo que ya funciona

- Stripe tiene 4 productos y 8 precios verificables en la cuenta de prueba `Entorno de prueba de New business`: mensual renovable y pago único por un mes, en COP. IDs y enlaces: `docs/STRIPE_SANDBOX_CATALOGO.md`.
- En desarrollo, `/checkout?plan=FUERZA` presenta la selección **MES A MES** (predeterminada) / **UN MES**, con el mismo precio oficial visible. Un enlace directo abre Stripe Sandbox.
- La prueba se oculta completamente en la compilación pública de producción (guardia `import.meta.env.DEV` y comprobación automática).
- Cuando hay sesiones o extras seleccionados, el enlace de prueba se desactiva para no presentar un pago de menor importe como si cubriera la cesta entera. Las prestaciones adicionales siguen siendo consultas por WhatsApp.
- `api/stripe/create-checkout.js` contiene una función de Vercel preparada para crear sesiones exclusivamente de **Stripe test mode** con el identificador de precio seleccionado en una lista cerrada del servidor. No acepta importes, cupones, precios ni rutas arbitrarias del navegador.
- Se bloquea por defecto si no existe configuración explícita de sandbox. También rechaza una clave `sk_live_*`, solicitudes de origen distinto y URLs de Stripe inesperadas.
- Volver del sandbox a la web **no acredita un pago**. El frontend jamás marca la compra como realizada.

## Ensayar ahora (solo la vista de desarrollo)

1. Abrir `http://127.0.0.1:4187/checkout?plan=FUERZA`.
2. Bajar a **Stripe · Sandbox**. Probar las dos modalidades y cambiar de plan.
3. Pulsar **ABRIR PAGO DE PRUEBA**. La página de Stripe muestra `Sandbox`, el importe COP y si es renovable.
4. No enviar datos reales de tarjeta para realizar esta prueba. Para probar transacciones completas se usarán exclusivamente credenciales y tarjetas de test de Stripe.
5. La web pública todavía mostrará el contacto voluntario de WhatsApp.

## Función segura de servidor (preparada; no activada)

En **secrets del entorno de staging de Vercel**, nunca en `.env.example`, `VITE_*` ni Git:

```dotenv
BAYONA_STRIPE_SANDBOX_ENABLED=true
BAYONA_STRIPE_RETURN_ORIGIN=https://tu-dominio-de-staging.example
STRIPE_SECRET_KEY=sk_test_...    # Guardar exclusivamente en los secretos del servidor
```

Solicitud POST a `/api/stripe/create-checkout` desde el mismo origen:

```json
{"planId":"FUERZA","billingMode":"monthly"}
```

Respuesta esperada: `{ "url": "https://checkout.stripe.com/...", "mode": "monthly", "livemode": false }`. La lista de precios está en la función, nunca se confía en importes enviados por el navegador.

**La interfaz de demostración usa los enlaces de pago ya creados; no necesita esta función ni una clave privada para ejecutarse.** La función queda preparada para pruebas de integración contra un servidor staging una vez se autoricen y configuren los secretos.

## Verificaciones automáticas

- `npm run test:stripe:sandbox-api`: seguridad del endpoint, precios por catálogo, claves, origen, respuesta test vs. live.
- `npx vitest --run src/config/stripeSandboxCatalog.test.js src/pages/Checkout.test.jsx`: integridad de los 8 enlaces y cálculos canónicos.
- `npx playwright test e2e/bayona-stripe-sandbox-20261019.spec.js`: prueba interactiva en navegador, escritorio/móvil y extras.
- `npm run build && npm run audit:stripe:production`: ninguna URL test ni interfaz de sandbox se filtra a los assets públicos.

## Condiciones obligatorias antes de cobrar dinero real

1. Identificar titular legal de negocio, país de cuenta, impuestos, facturación, moneda de cobro y capacidad para prestar los servicios.
2. Confirmar expresamente prestaciones, entrega, inicio de servicio, renovaciones, plazo de baja, devoluciones y cancelaciones; obtener el consentimiento adecuado.
3. Crear precios **live** en una cuenta habilitada para cobrar, con su propia configuración aislada; nunca reutilizar URLs, IDs ni secretos de sandbox.
4. Implementar webhook Stripe firmado, almacenamiento persistente e idempotente del evento y verificación del pago/suscripción antes de conceder acceso o anunciar ventas.
5. Probar errores, reintentos, reembolsos, renovaciones, bajas y portal de clientes. Asegurar registro, permisos y tratamiento legal de datos.
6. Vincular Vercel/dominio de producción solo después de superar todo lo anterior y disponer de pruebas de aceptación.

**No se ha habilitado ningún cobro ni suscripción live.**


## Confirmación de pago verificada (nueva fase)

- `GET /api/stripe/session-status?session_id=cs_test_...` consulta **directamente** el estado en Stripe con una clave exclusivamente de prueba (servidor).
- Además de `payment_status=paid`, verifica `livemode=false`, metadatos de BAYONA, modalidad, COP, identificación real de la tarifa Stripe y el importe total publicado. No devuelve datos personales.
- Solo devuelve `paid_test` cuando Stripe confirma `status=complete` y `payment_status=paid`; si no, `pending_test` o error. **Ningún estado crea ventas ni activa membresías**.
- El retorno a `/checkout?stripe_test_return=1&session_id=...` consulta automáticamente ese endpoint en desarrollo, cuando está accesible. Un retorno a la web **nunca** se interpreta como pago por sí solo.
- `api/stripe/webhook.js` usa el manejador Web Request de Vercel para leer el cuerpo sin transformarlo y verificar `Stripe-Signature` con HMAC SHA-256, tolerancia de 5 minutos y comparación en tiempo constante. Consulta documentación oficial de Vercel / Stripe sobre la importancia del cuerpo original.
- Como no hay un almacenamiento transaccional conectado, los eventos de pago válidos devuelven `503 DURABLE_EVENT_STORAGE_REQUIRED` para evitar confirmar una entrega inexistente. **No registrar el webhook real hasta incorporar persistencia idempotente**.
- Queda pendiente crear un registro duradero con `event.id` único, reconciliación con Checkout Session y transacción que actualice el estado de la membresía solamente después de validación de pagos y derechos de acceso. Los reintentos de Stripe no deben duplicar accesos.

### Prueba real iniciada (sin cobro)

Se creó una Checkout Session de FUERZA pago único en la cuenta Sandbox de Stripe, importe 299.000 COP, **livemode=false**. Se comprobó en Stripe que sigue `open` y `unpaid`. No se completó automáticamente la tarjeta de prueba y no se efectuó ninguna transacción ni ingreso. La verificación de `paid_test` se cubre con pruebas de servidor que simulan respuestas autenticadas de Stripe, no con una operación monetaria completada.

### Comandos adicionales

```bash
node --test api/stripe/create-checkout.test.mjs api/stripe/session-status.test.mjs api/stripe/webhook.test.mjs
npx playwright test e2e/bayona-stripe-return-security-20261019.spec.js
npm run build
```

Para registrar un endpoint webhook, configurar `STRIPE_WEBHOOK_SECRET=whsec_...` exclusivamente como secreto del backend staging, sin copiar a `VITE_*`. Mantener `BAYONA_STRIPE_SANDBOX_ENABLED=false` hasta que existan dominio staging, secretos, base de datos y verificación de integración real.
