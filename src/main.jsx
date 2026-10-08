import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { initializeSiteTheme } from './lib/ui/siteTheme.js'
import AppErrorBoundary from './components/AppErrorBoundary.jsx'
import { ExperienceProvider } from './engine'
import { VisitorJourneyProvider } from './lib/onboarding/VisitorJourneyProvider.jsx'
import { RewardsProvider } from './lib/rewards/RewardsProvider.jsx'
import { AuthProvider } from './lib/auth/AuthContext.jsx'
import { initAnalytics } from './lib/analytics/analytics.js'

/**
 * Hojas globales. Las de página (about, shop, community, resources…) se
 * importan desde su propia página, así que ahora viajan en el chunk de esa
 * ruta en lugar de en el CSS de entrada.
 */
import './styles.css'
import './styles/fonts.css'
import './styles/social.css'
import './styles/home-scroll-animations.css'
import './styles/media-scenes.css'
import './overrides.css'
/*
 * Arquitectura de experiencia (Fase 4): navegación agrupada + miga de pan.
 * Van tras overrides.css porque matizan .desktop-nav, .mobile-nav y .footer,
 * y antes de las capas de acabado (v2/v3) para que estas sigan pudiendo
 * matizarlas a su vez.
 */
import './styles/nav-architecture.css'
import './styles/breadcrumb.css'
import './styles/premium-route-chrome.css'
import './styles/luxury-system.css'
/*
 * Último en la cascada a propósito: son detalles de acabado (tipografía óptica,
 * foco, superficie, scroll bajo la barra fija) que deben poder matizar
 * cualquier hoja anterior sin recurrir a !important.
 */
import './styles/elite-refinements.css'
/*
 * Sistema visual v2. Va después de todo lo anterior porque tiene que poder
 * matizar el `border-radius: 0 !important` global de styles.css en las
 * superficies que flotan, sin perderlo donde construye la marca.
 */
import './styles/v2-surface.css'
/*
 * La escala tipográfica va después de la superficie porque hace un reset por
 * rol semántico sobre los 258 tamaños distintos que había repartidos en 26
 * hojas. Tiene que poder ganarles.
 */
import './styles/v2-typography.css'
import './styles/v2-editorial.css'
import './styles/v2-hero-depth.css'
import './styles/v2-image-grade.css'
import './styles/v2-pricing.css'
import './styles/v2-scroll-motion.css'
/*
 * V3 finish: grano fílmico, selección/scroll de lujo, acento champán y
 * micro-interacciones. Última capa, solo añade pulido.
 */
import './styles/v3-finish.css'
/*
 * Design System 2.0 (Fase 3). Capa ADITIVA y prefijada `.ds-`: declara tokens
 * en :root y estilos de los componentes base del sistema. No toca ningún
 * selector existente: las 17 rutas conservan su estado visual hasta que cada
 * página migre al sistema en su propia fase.
 */
import './styles/ds-tokens.css'
import './styles/ds-base.css'
/*
 * Safe-area para la WebView de Capacitor (notch + barra de gestos).
 * Va ANTES de las capas de experiencia a propósito: solo reserva
 * env(safe-area-inset-*) en el body (no-op en escritorio) y el contrato
 * experienceSystemContract exige que las tres últimas hojas sean
 * ds-experience + ateliers. Ver cabecera del fichero.
 */
import './styles/capacitor.css'
/*
 * IMMERSIVE LUXURY (Fase C, §9/§30). Lenguaje de transición global:
 * clip-reveal de titulares y line-draw de filetes. CSS-first con
 * animation-timeline: view() y fallback estático explícito para
 * reduced-motion y navegadores sin soporte. Cero dependencias.
 * Va DETRÁS de los pases atelier a propósito: sus primitivas son base sobre
 * la que aquellos matizan, no la última palabra de la cascada.
 */
import './styles/immersive-motion.css'
/*
 * ROUTE IDENTITY. Rompe la repetición entre rutas: fija por ruta los tokens
 * --route-hero-size / --route-hero-min / --route-ground / --route-section-space
 * que luxury-system.css y overrides.css ahora consultan, y añade el dispositivo
 * de etiqueta, el tratamiento de h2 y el remate propios de cada página.
 * Diferencia por GEOMETRÍA, RITMO Y ESCALA, nunca por color (PAGE-BLUEPRINTS
 * TEST 4). Va antes de la capa de experiencia para no alterar el contrato de
 * las tres últimas hojas globales; sus valores por defecto son los históricos,
 * así que una ruta sin declarar queda exactamente como estaba.
 */
import './styles/route-identity.css'
/*
 * BAYONA polish. Corrección ejecutiva de jerarquía, copy visual, ritmo de
 * tarjetas y showroom de planes, sin reescribir rutas. Entra ANTES de la capa
 * de experiencia: el contrato de cascada (`experienceSystemContract.test.js`)
 * reserva las tres últimas hojas globales a ds-experience → ds-atelier →
 * home-atelier, que son las que unifican las 18 rutas por encima de todo lo
 * demás. Ponerla detrás no la hacía más fuerte —le robaba a esas tres la
 * última palabra—, así que se queda aquí y pierde la guerra donde debe
 * perderla. Cero `!important` en toda la hoja.
 */
import './styles/bayona-polish.css'
/*
 * Luxury typography (escala óptica del sitio completo).
 *
 * Va aquí, y NO al final de la cascada como la dejó la pasada anterior. Motivo
 * medido, no de gusto: `src/test/experienceSystemContract.test.js` fija como
 * invariante 8 que las tres últimas hojas globales son
 * `ds-experience / ds-atelier / home-atelier`, y al encadenar esta detrás se
 * rompía el contrato (test en rojo). No se ha tocado el contrato para dejarlo
 * pasar: se ha recolocado la hoja.
 *
 * Reubicarla aquí no le quita mando. Sus reglas de tipo de letra van con
 * `!important`, y a las tres hojas que tiene por delante el propio contrato les
 * prohíbe escribir `!important` (`experiencePropagation.test.js`, FASE 4B:
 * «ningún bloque de la fase define colores nuevos, !important ni canvas»). Con
 * `!important` delante de declaraciones normales, el orden deja de decidir.
 */
import './styles/luxury-typography-final.css'
/*
 * Pase editorial 2026-09-23. Unifica aire, medida de lectura y cromo flotante
 * después de las hojas de ruta, sin romper el contrato que reserva las tres
 * últimas importaciones a la experiencia y los ateliers.
 */
import './styles/editorial-breathing-pass.css'
import './styles/award-experience.css'
import './styles/prime-polish.css'
/* Criterio compartido de marca: mismas superficies, contenedores y fichas sin fotos. */
import './styles/bayona-visual-unity.css'
/*
 * Capa de experiencia (FASE 4). Última hoja global a propósito: solo aliasa
 * tokens del sistema y matiza por cascada, así que puede unificar el lenguaje
 * de las 18 rutas sin reescribir ninguna hoja de página ni abrir una guerra de
 * `!important`. El laboratorio (`.lab-*`) conserva su propia hoja.
 */
import './styles/day-mode.css'
import './styles/ds-experience.css'
/*
 * Pase atelier (FASE 4C). Detrás de la capa de experiencia porque la afina:
 * atmósfera del marco, máscara de línea en los titulares, señal al tocar y
 * rótulos en canto. Misma regla que arriba: CERO `!important`, cero colores
 * nuevos. Ámbito `data-experience-scope="brand"`: el playground interno y su
 * laboratorio no reciben este pase.
 */
import './styles/ds-atelier.css'
/*
 * Portada atelier (FASE 4D). Es la hoja que unifica las doce secciones de la
 * home —que viven repartidas en `home.css`, `free-value.css`,
 * `experience-proof.css` y componentes compartidos— sin reescribir seis
 * ficheros ajenos. Va la última por el mismo motivo: unifica ritmo de capítulo
 * y jerarquía por cascada. Cero `!important`, cero colores nuevos, y todo
 * selector encerrado en el marco de marca + un ancestro propio de la portada.
 */
import './styles/home-atelier.css'

/**
 * Arranca la medición. No carga ningún proveedor hasta que haya consentimiento
 * explícito (RGPD) y es no-op si no hay IDs configurados en el entorno.
 */
initAnalytics()
initializeSiteTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <ExperienceProvider>
            {/*
              Memoria del recorrido. Va por encima de App para que sobreviva a
              los cambios de ruta, y solo en memoria: el onboarding promete que
              no se guarda nada. Ver VisitorJourneyProvider.jsx.
            */}
            <VisitorJourneyProvider>
              {/*
                Crédito y sellos de la visita (bono de llegada). Misma regla
                que el recorrido: solo memoria, nada persiste al recargar.
                Ver lib/rewards/RewardsProvider.jsx.
              */}
              <RewardsProvider>
                <AuthProvider>
                  <App />
                </AuthProvider>
              </RewardsProvider>
            </VisitorJourneyProvider>
          </ExperienceProvider>
        </BrowserRouter>
      </HelmetProvider>
    </AppErrorBoundary>
  </StrictMode>,
)
