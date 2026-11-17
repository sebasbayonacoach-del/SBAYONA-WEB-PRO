/**
 * BAYONA / sourcing 2026-11-12
 * Candidatos de suministro, NO proveedores contratados ni stock confirmado.
 * No utilizar estos estados para activar checkout o afirmar disponibilidad.
 * Mantener privada la información de negociaciones comerciales.
 */
export const apparelSourcing = Object.freeze({
  'tank-top-performance': Object.freeze({ supplier: "Printful", url: "https://www.printful.com/es/ropa-personalizada", status: 'pending' }),
  'short-tecnico-bayona': Object.freeze({ supplier: "Roly Dortmund 6688", url: "https://roly.eu/es/model_PA6688", status: 'pending' }),
  'legging-pro-mujer': Object.freeze({ supplier: "Printful POD / Protex fabricación técnica consultada", url: "https://protex.es/tu-marca/", status: 'sample' }),
  'camiseta-manga-larga': Object.freeze({ supplier: "Stanley/Stella Creator 2.0 Long Sleeve", url: "https://stanleystella.com/es-eu/collection/t-shirts", status: 'pending' }),
  'top-deportivo-mujer': Object.freeze({ supplier: "Printful POD / Protex confección técnica consultada", url: "https://protex.es/tu-marca/", status: 'sample' }),
  'camiseta-compresion': Object.freeze({ supplier: "MLS Textiles — consultar si puede certificar compresión", url: "https://mls1992.com/fabricante-de-ropa-tecnica/", status: 'blocked' }),
  'hoodie-origins': Object.freeze({ supplier: "Stanley/Stella Cruiser 2.0", url: "https://stanleystella.com/es-eu/cruiser-2-0-stsu177", status: 'pending' }),
  'hoodie-premium': Object.freeze({ supplier: "8Merch / Stanley Stella", url: "https://stanleystella.8merch.com/en/", status: 'sample' }),
  'camiseta-origins': Object.freeze({ supplier: "Stanley/Stella Creator 2.0", url: "https://stanleystella.com/es-eu/collection/t-shirts", status: 'pending' }),
  'pantalon-jogger-premium': Object.freeze({ supplier: "Printful", url: "https://www.printful.com/es/ropa-personalizada", status: 'sample' }),
  'gorra-bayona': Object.freeze({ supplier: "Printful", url: "https://www.printful.com/es/ropa-personalizada", status: 'pending' }),
  'chaqueta-windstopper': Object.freeze({ supplier: "Roly / Protex — cortavientos; no usar marca Windstopper", url: "https://protex.es/tu-marca/", status: 'blocked' }),
  'sudadero-recovery': Object.freeze({ supplier: "Stanley/Stella Changer 2.0", url: "https://stanleystella.com/es-eu/collection/sweatshirts", status: 'pending' }),
  'calcetines-compresion-pack-3': Object.freeze({ supplier: "MLS Textiles — tecnología y nivel de compresión por validar", url: "https://mls1992.com/fabricante-de-calcetines-tecnicos/", status: 'blocked' }),
  'zapatillas-move': Object.freeze({ supplier: "Bullfeet España (zapatillas casuales) / Printful", url: "https://bullfeet.com/es/pages/personalizar-zapatillas", status: 'sample' }),
  'zapatillas-trainer-pro': Object.freeze({ supplier: "Bullfeet contactado solo para zapatilla casual; rendimiento no acreditado", url: "https://bullfeet.com/es/pages/personalizar-zapatillas", status: 'blocked' }),
  'zapatillas-parkour-free': Object.freeze({ supplier: "Fabricante técnico parkour por validar", url: "https://printify.com/custom-shoes/", status: 'blocked' }),
  'chanclas-recovery': Object.freeze({ supplier: "Printify / chanclas casual", url: "https://printify.com/custom-shoes/", status: 'sample' }),
})

export const clothingDropIds = Object.freeze([
  'camiseta-origins',
  'hoodie-origins',
  'gorra-bayona',
  'tank-top-performance',
  'short-tecnico-bayona',
  'sudadero-recovery',
])

export const sourcingStatus = Object.freeze({
  pending: 'Pendiente de cotización',
  sample: 'Requiere muestra',
  blocked: 'No vender con esas prestaciones sin validar',
})
