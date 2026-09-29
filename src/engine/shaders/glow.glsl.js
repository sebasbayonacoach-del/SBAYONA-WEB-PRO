// Shader de glow fresnel para el contorno de la geometría insignia.
// (Requirement 2.3)
//
// Snippet GLSL componible (sin `#version` ni `precision`): SignatureGeometry
// (tarea 8.2) lo inyecta en el ShaderMaterial. Es autocontenido; opera sobre
// la normal y la dirección de vista que provee el propio material.

// GLOW_GLSL: glow de tipo Fresnel (brillo de borde / rim light).
// `normal`    -> normal de superficie interpolada (espacio de vista o mundo).
// `viewDir`   -> dirección hacia la cámara desde el fragmento.
// `glowColor` -> color del halo (dorado brillante por defecto).
// `intensity` -> multiplicador global del brillo.
// El término Fresnel es máximo en los bordes (donde n·v ≈ 0), produciendo un
// halo luminoso alrededor de la silueta.
export const GLOW_GLSL = /* glsl */ `
vec3 fresnelGlow(vec3 normal, vec3 viewDir, vec3 glowColor, float intensity) {
  // Normaliza por seguridad: los vectores interpolados pierden longitud.
  vec3 n = normalize(normal);
  vec3 v = normalize(viewDir);

  // Fresnel base: 1.0 en el contorno, 0.0 de frente a la cámara.
  float fresnel = 1.0 - max(dot(n, v), 0.0);

  // Curva de potencia para concentrar el brillo en el borde.
  fresnel = pow(fresnel, 3.0);

  return glowColor * fresnel * intensity;
}
`

// Uniforms por defecto para el snippet de glow.
// uGlowColor = #E76F51 (orange-fire) en RGB 0..1; uGlowIntensity escala el halo.
export const glowUniforms = {
  uGlowColor: { value: [0.906, 0.435, 0.318] },
  uGlowIntensity: { value: 1.0 },
}
