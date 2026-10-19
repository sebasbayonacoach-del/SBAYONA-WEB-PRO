# BAYONA — Catálogo de Stripe, únicamente en entorno de prueba

**Cuenta autorizada:** Entorno de prueba de New business · `livemode=false`.

**Decisión comercial:** mantener la suscripción mensual como modalidad recomendada para acompañamiento continuo; permitir comprar un mes sin renovación para quien no desee compromiso recurrente. Mismo importe por plan en ambas modalidades durante esta simulación.

**AVISO:** enlaces, productos y precios son de prueba. No reciben dinero real, no acreditan compra y no activan servicios de BAYONA. No publicarlos en el sitio de producción ni enviarlos como enlaces de cobro real.

| Plan | Precio publicado | Mensual renovable — Stripe sandbox | Pago único de un mes — Stripe sandbox |
|---|---:|---|---|
| RAÍZ | 149.000 COP | https://buy.stripe.com/test_14A3cv9BHeEmcbx8lxgQE00 | https://buy.stripe.com/test_7sYaEXaFLao62AXfNZgQE01 |
| FUERZA | 299.000 COP | https://buy.stripe.com/test_28EcN5aFL9k24J531dgQE02 | https://buy.stripe.com/test_7sYeVd8xDcwe3F145hgQE03 |
| RENDIMIENTO | 499.000 COP | https://buy.stripe.com/test_6oU8wP4hndAib7t59lgQE04 | https://buy.stripe.com/test_7sY5kD15bgMu1wTdFRgQE05 |
| ELITE | 899.000 COP | https://buy.stripe.com/test_aFafZhbJPfIq1wT31dgQE06 | https://buy.stripe.com/test_dRmbJ1dRXgMu8Zl0T5gQE07 |

## IDs técnicos (sandbox)

| Plan | Product ID | Precio mensual | Precio pago único |
|---|---|---|---|
| RAÍZ | `prod_VT24Bt5lDmjViM` | `price_1US60NDe5lykCn8xydfpiiL5` | `price_1US60iDe5lykCn8xEXQBsvj0` |
| FUERZA | `prod_VT24rltvsrz34Q` | `price_1US60kDe5lykCn8x0hNgvYOa` | `price_1US60nDe5lykCn8xJhWTTjUF` |
| RENDIMIENTO | `prod_VT24F9398NNsaC` | `price_1US60pDe5lykCn8x6KPYZaAt` | `price_1US60rDe5lykCn8xJqsWKus1` |
| ELITE | `prod_VT24I1btCbEsrA` | `price_1US60sDe5lykCn8x7QNAG3G8` | `price_1US60uDe5lykCn8xgZUE3kYP` |

Los importes de Stripe se expresan en unidades mínimas para COP (dos decimales en pagos): `14900000`, `29900000`, `49900000`, `89900000`. En la página de prueba se verificó visualmente RAÍZ a **COP 149,000.00 per month** y FUERZA pago único a **COP 299,000.00**.

### Pendientes antes de producción

- Determinar entidad legal y país de la cuenta comercial real; completar verificación de Stripe. Actualmente solo se ve una cuenta de prueba.
- Revisar si las membresías se renuevan mensualmente, qué pasa al cancelar, el alcance del servicio y el inicio de prestación; presentar consentimiento explícito antes de suscribirse.
- Verificar disponibilidad de la moneda COP y métodos de pago en la futura cuenta real. No fijar conversión COP→EUR contractual usando las equivalencias orientativas de la web.
- Configurar impuestos y facturación legal, códigos de impuestos para servicios de entrenamiento, política de cancelaciones y reembolsos, información del titular y branding (ahora el sandbox muestra “Entorno de prueba de New business”).
- Integrar un backend de cobro autenticado con los ID de precios en variables de servidor y un webhook firmado. El backend debe verificar estado real del pago/subscripción e idempotencia antes de conceder acceso. No poner claves secretas en Vite.
- Probar los flujos de cancelación, reembolso, webhook y portal de cliente en sandbox. Prohibido registrar una compra únicamente al abrir un Payment Link.
- No sustituir el CTA público de WhatsApp hasta completar las condiciones anteriores y confirmar la cuenta comercial real.

### Estado a 2026-10-19

4 productos, 8 precios, 8 Payment Links creados y leídos de Stripe en **`livemode=false`**. Página mensual RAÍZ y pago único FUERZA cargan correctamente como sandbox en navegador. **Ningún pago real ejecutado.**
