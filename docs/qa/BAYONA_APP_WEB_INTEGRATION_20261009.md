# BAYONA WEB ↔ BAYONA App | Auditoría e integración | 09-10-2026

## Fuente de verdad y versiones
- App real: repositorio separado `SBAYONA-APP-PRO`, ruta local `/home/sebastian/TRABAJO/02_DESARROLLO/SBAYONA-APP-PRO`.
- Trabajo local App: rama `brand-unify-app-20261008` con archivos modificados/no versionados de otro proceso. **No se editó, revirtió, fusionó ni publicó** esa rama.
- App pública comprobada con navegador y `curl -IL`: `https://bayona-app-one.vercel.app/` devuelve HTTP 200, `last-modified` 06-10-2026. La App del servidor y los cambios locales del día 09 **no son necesariamente la misma versión**.
- El encabezado `X-Frame-Options: DENY` impide embeberla en la web mediante iframe. No se intenta eludir la protección ni se duplican claves/sesiones.
- Entrada real con selector de perfiles verificada: `https://bayona-app-one.vercel.app/?source=pwa` (soportada por `js/ui/landing-boot.js`); en navegador nuevo carga pantalla **MI APP** y **COACH STUDIO**.
- Capacidades anunciadas en la App: plan del día, entrenamientos, nutrición, recuperación, progreso, y herramientas de entrenador. Son capacidades del proyecto App; **no implica que backend, cuentas, niveles de permisos, pagos y sincronización estén certificados para producción**.
- La documentación App declara sincronización/cloud y backend pendientes de configuración. Un APK/IPA firmado tampoco resulta de esta integración.

## Cambios en BAYONA WEB
1. **Home pública**: nueva escena editorial de producto con captura real de la App, explicación de dos roles y CTA a la App + página informativa `/app`. El funnel de entrenamientos, planes, recursos y captación se conserva intacto.
2. **`/app` público**: el hero ahora dirige a la app real y muestra el selector de roles mediante capturas verificadas de escritorio y móvil. Las representaciones conceptuales de teléfono/tablet/reloj se identifican por separado como visión de futuro.
3. **`/app` con usuario autenticado (`AppOS`)**: el panel sigue operando, pero contiene un enlace explícito a la App independiente y la advertencia de que las sesiones/datos no se transfieren automáticamente.
4. **Footer de producto / roadmap**: explica que el acceso web existe y deja como pendientes la conexión de membresías, la sincronización definitiva, el pago real y la disponibilidad en tiendas.
5. **Seguridad**: enlaces externos `target="_blank" rel="noopener noreferrer"`, sin `iframe`, sin pedir credenciales en WEB, sin transportar tokens ni datos a otro dominio.
6. **Capturas**: `public/images/bayona-live-app` contiene capturas de la versión publicada, realizadas por Playwright; no son pantallas renderizadas inventadas.

## Validaciones
- Unit tests: `src/components/app/BayonaLiveAppShowcase.test.jsx`, `src/pages/Home.test.jsx`, `src/pages/AppExperience.test.jsx`, `src/pages/AppOS.test.jsx`.
- E2E: `e2e/live-bayona-app-bridge.spec.js`, más `e2e/pro-final-routes.spec.js` para desktop/móvil de Home y BAYONA+.
- La integración añade altura deliberadamente. `pro-final-routes` mantiene los límites anteriores **descontando solo el nuevo bloque real de App**, al que se aplica su propio límite de altura. No se relajan umbrales generales.
- Comprobar compilación, tests, estado Git y despliegue preview antes de dar por cerrado.

## Límites pendientes
- No es una fusión de dos repos ni un sistema de autenticación compartida.
- No se publicó ninguna modificación en la aplicación independiente ni se llevó a producción el nuevo diseño de BAYONA WEB.
- Enlazar a la versión existente NO valida permisos, cuentas, pagos, suscripciones, privacidad ni APK de la App.
