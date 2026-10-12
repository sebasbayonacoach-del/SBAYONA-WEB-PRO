# BAYONA WEB — NUEVA SECCIÓN APP / LIFE OS

## Objetivo
Actualizar la web para que muestre el producto REAL actual: BAYONA ya no se presenta como una maqueta conceptual de fitness, sino como una app viva de organización personal, entrenamiento, decisión y progreso.

## Archivos principales
- `src/pages/AppExperience.jsx`
- `src/pages/AppOS.jsx`
- `src/pages/appExperienceContent.js`
- `src/config/bayonaAppIntegration.js`
- `src/styles/app.css`
- `src/styles/app-os.css`
- nuevas capturas reales en `public/images/bayona-live-app/`

## FASE 1 — COPY Y POSICIONAMIENTO
Narrativa:
- “BAYONA. Tu vida, en progreso.”
- “Tu cuerpo. Tu día. Tu progreso. En un solo sistema.”
- “Planifica. Actúa. Evoluciona.”
- “La app no te da más cosas que mirar. Te ayuda a decidir qué hacer ahora.”

Eliminar copy desactualizado que todavía describe BAYONA+ como una maqueta no operativa cuando se esté hablando de funciones ya implementadas.

Mantener honestidad:
- no App Store/Google Play si no existe publicación real
- no +100.000 usuarios
- no IA cloud si el backend/modelo no está activado
- no métricas inventadas

## FASE 2 — HERO DE LA APP
Mostrar teléfonos reales/capturas reales, no pantallas inventadas:
- Ahora
- Mi Día
- Misiones
- Rangos
- CORE / Vision

Hero:
- texto corto
- un CTA principal: Abrir BAYONA
- CTA secundario: Ver cómo funciona

## FASE 3 — DEMO GUIADA
Scroll narrativo de 5 capítulos:
1. Ahora
2. Mi Día
3. Misiones
4. Rangos
5. CORE

Cada capítulo muestra:
- una captura real
- una frase
- una función
- una prueba real del producto

## FASE 4 — JUEGO DE LA VIDA
Sección que explique:
- acciones reales → XP
- áreas de vida
- rachas
- misiones
- rangos
- desbloqueos

Sin estética infantil.

## FASE 5 — LIFE OS
Mostrar integraciones reales:
- calendario Android
- ICS
- BAYONA Inbox
- Maps
- música
- planner
- CORE

Diferenciar “funciona hoy” vs “en roadmap”.

## FASE 6 — MARKETING
Orden recomendado:
1. problema: demasiadas apps, demasiadas decisiones
2. promesa: un solo lugar para saber qué hacer ahora
3. producto
4. planner
5. gamificación
6. entrenamiento / Vision
7. conexiones
8. privacidad
9. CTA

## FASE 7 — CAPTURAS REALES
Generar capturas desde el build real:
- 390x844
- Android real si está disponible
- dark y light para QA
- sin datos personales

## FASE 8 — QA
- tests existentes AppExperience/AppOS
- build
- mobile responsive
- reduced motion
- copy claims audit
- links a BAYONA App
- imágenes optimizadas

## Orden de commits
1. `feat(app-page): align marketing with Life OS`
2. `feat(app-page): show real product screens`
3. `feat(app-page): add life game narrative`
4. `feat(app-page): explain real integrations`
5. `test(app-page): certify claims and responsive journey`
