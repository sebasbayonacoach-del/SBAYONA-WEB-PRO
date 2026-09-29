/**
 * BAYONA · SOCIAL HUB — ÚNICO ARCHIVO DE CONFIGURACIÓN
 * ---------------------------------------------------------------------------
 * Pega aquí la URL de cada red social oficial de BAYONA.
 * El resto (plataforma, usuario, color de marca, glifo, categoría y feeds
 * cuando la plataforma los expone) se deriva automáticamente.
 *
 * · Deja "" para ocultar una plataforma.
 * · Cualquier plataforma soportada (o futura) se reconoce por su URL.
 * · Los campos opcionales en `overrides` permiten refinar manualmente
 *   descripción, métricas verificables y contenido destacado.
 *
 * Toda la copia visible está en español.
 */

export const socialLinks = {
  instagram: 'https://instagram.com/sebasbayona',
  youtube: 'https://youtube.com/@sevisionari',
  tiktok: 'https://tiktok.com/@sebasbayona',
  linkedin: '',
  github: '',
  facebook: '',
  threads: '',
  x: '',
  spotify: '',
  discord: '',
  behance: '',
  dribbble: '',
  medium: '',
  substack: '',
  patreon: '',
  gumroad: '',
  calendly: '',
  twitch: '',
  pinterest: '',
  website: '',
}

/**
 * Per-platform overrides. 100% opcional.
 * Si un dato no es verificable, déjalo vacío: la tarjeta se renderiza con
 * elegancia sin inventar cifras.
 *
 *   description  → copia corta editorial (máx ~90 caracteres recomendado)
 *   followers    → SOLO si la cifra es real y verificable (string, ej. "12,4K")
 *   verified     → true para mostrar el sello de verificado
 *   accent       → anula el color de marca para esta tarjeta
 *   latestItems  → contenido destacado curado manualmente.
 *                  Cada item: { title, url, date?, thumb?, kind? }
 *                  kind ∈ 'video' | 'article' | 'post' | 'podcast' | 'product' | 'event'
 *                  Cuando se define, tiene prioridad sobre el feed automático.
 */
export const overrides = {
  instagram: {
    description: 'Diario visual del ecosistema BAYONA.',
  },
  youtube: {
    description: 'Documentales y clases sobre ciencia del movimiento.',
    channelId: 'UCfMvWtmoiScRVjga59GX8Pw',
  },
  tiktok: {
    description: 'Píldoras de entrenamiento, parkour y mentalidad.',
  },
}

/** Texto del hub y de los estados vacíos / de carga. */
export const hubCopy = {
  kicker: 'ECOSISTEMA DIGITAL · SEDE DE REDES',
  titleLine1: 'UN UNIVERSO,',
  titleLine2: 'UNA IDENTIDAD.',
  intro:
    'Cada plataforma refuerza la misma idea: moverse con propósito. Reúne aquí todo lo que BAYONA crea, enseña y comparte.',
  emptyTitle: 'AÚN NO HEMOS ENLAZADO ESTA PLATAFORMA',
  emptyBody:
    'Vuelve pronto. Estamos conectando nuevos espacios para acompañarte donde tú estés.',
  loadingLabel: 'SINCRONIZANDO',
  followerLabel: 'COMUNIDAD',
}
