// Shader de disolución para la geometría insignia.
// (Requirement 2.2)
//
// Snippet GLSL componible (sin `#version` ni `precision`): SignatureGeometry
// (tarea 8.2) lo inyecta en el ShaderMaterial. Es autocontenido; espera recibir
// un valor de ruido ya calculado (p. ej. `snoise(vec3) * 0.5 + 0.5` desde
// NOISE_GLSL) como entrada, por lo que no depende de ningún otro snippet.

// DISSOLVE_GLSL: calcula el factor de disolución.
// `noiseVal` se espera normalizado a 0..1.
// `progress` (uDissolve): 0 => sólido (factor ~1), 1 => totalmente disuelto
// (factor ~0). El valor devuelto sirve como alpha para mezcla o como umbral
// para `discard` (p. ej. `if (dissolveAlpha(n, p) < 0.5) discard;`).
export const DISSOLVE_GLSL = /* glsl */ `
float dissolveAlpha(float noiseVal, float progress) {
  // Ancho del borde de disolución: da una transición suave y evita aliasing.
  const float edge = 0.05;

  // Remapea 'progress' para cubrir el borde completo, garantizando los
  // extremos exactos: en 0 nada se disuelve; en 1 desaparece toda la
  // superficie (incluida la franja del borde).
  float threshold = progress * (1.0 + 2.0 * edge) - edge;

  // ~1.0 donde el material permanece, ~0.0 donde se disuelve.
  return smoothstep(threshold - edge, threshold + edge, noiseVal);
}
`

// Uniform por defecto para el snippet de disolución.
// uDissolve en 0..1 controla el umbral de disolución (0 = sólido).
export const dissolveUniforms = {
  uDissolve: { value: 0 },
}
