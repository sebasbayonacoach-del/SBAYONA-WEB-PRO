/**
 * BAYONA: 21 original procedural interpretations of the AIDesigner catalog.
 * No shader code copied. Each effect occupies one editorial section only.
 */
export const EFFECT_PLACEMENTS=Object.freeze({
 '/':[
  {effect:'mesh-gradient',selector:'#bayona-app-real-home'},
  {effect:'dot-grid-wave',selector:'#como-empezar'},
  {effect:'glow-orbs',selector:'#regalos'},
 ],
 '/about':[{effect:'fluted-glass',selector:'.bayona-app-bridge'}],
 '/programs':[
  {effect:'noise-shimmer',selector:'.page-hero'},
  {effect:'heatmap',selector:'.services-final'},
 ],
 '/movimiento-adaptado':[{effect:'topo-lines',selector:'.bayona-adapted__limits'}],
 '/parkour-academy':[
  {effect:'light-rays',selector:'.academy-hero'},
  {effect:'riso-dither',selector:'.academy-levels'},
  {effect:'starfield',selector:'.academy-closing'},
 ],
 '/community':[
  {effect:'bokeh-dust-drift',selector:'.community-week'},
  {effect:'aurora-flow',selector:'.community-access'},
  {effect:'silk-waves',selector:'.community-closing'},
 ],
 '/resources':[
  {effect:'halftone',selector:'.resources-hero'},
  {effect:'ascii-plasma',selector:'.protocolo-checkin'},
  {effect:'pixel-grid',selector:'#revista'},
  {effect:'fluid-smoke',selector:'#resources-lead'},
 ],
 '/shop':[
  {effect:'holo-foil',selector:'.shop-feature'},
  {effect:'caustics',selector:'.shop-process'},
 ],
 '/app':[
  {effect:'liquid-glass',selector:'.bayona-launch__roles'},
  {effect:'liquid-metal',selector:'.bayona-launch__install'},
 ],
})
export const EFFECT_NAMES=Object.freeze({
 'fluted-glass':'Fluted Glass','riso-dither':'Riso Dither',
 'noise-shimmer':'Noise Shimmer','dot-grid-wave':'Dot Grid Wave',
 'fluid-smoke':'Fluid Smoke','light-rays':'Light Rays',
 'holo-foil':'Holo Foil','halftone':'Halftone',
 'caustics':'Caustics','aurora-flow':'Aurora Flow',
 'silk-waves':'Silk Waves','liquid-metal':'Liquid Metal',
 'heatmap':'Heatmap','liquid-glass':'Liquid Glass',
 'mesh-gradient':'Mesh Gradient','starfield':'Starfield',
 'bokeh-dust-drift':'Bokeh Dust Drift','glow-orbs':'Glow Orbs',
 'ascii-plasma':'ASCII Plasma','pixel-grid':'Pixel Grid','topo-lines':'Topo Lines'
})
export const ALL_EFFECT_NAMES=Object.freeze(Object.values(EFFECT_NAMES))
export const ALL_EFFECT_SLUGS=Object.freeze(Object.keys(EFFECT_NAMES))
