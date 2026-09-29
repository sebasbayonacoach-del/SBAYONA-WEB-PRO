// Shaders de la geometría insignia: ruido simplex 3D + degradado "aurora".
// (Requirement 2.1)
//
// Estos exports son SNIPPETS de GLSL (strings) componibles: no incluyen
// `#version` ni `precision`, porque se inyectan como "chunks" dentro de un
// ShaderMaterial ensamblado por SignatureGeometry (tarea 8.2). Cada snippet
// declara funciones reutilizables que otros módulos de shader pueden invocar
// una vez compuestos.

// NOISE_GLSL: implementación estándar y correcta de simplex noise 3D.
// Autoría: Ian McEwan / Stefan Gustavson (Ashima Arts, "webgl-noise"),
// licencia MIT. Expone `float snoise(vec3 v)` con rango aproximado [-1, 1].
// Es la ÚNICA definición de ruido del engine; los demás shaders la reutilizan
// vía composición (se antepone este chunk antes de quien lo necesite).
export const NOISE_GLSL = /* glsl */ `
// --- Helpers de simplex noise (Ashima / Stefan Gustavson) ---
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

// snoise(vec3): ruido simplex 3D continuo, rango ~[-1, 1].
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  // Primer vértice del símplex.
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  // Otros vértices.
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  // Permutaciones.
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  // Gradientes: 7x7 puntos sobre un cuadrado mapeados a un octaedro.
  float n_ = 0.142857142857; // 1.0 / 7.0
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z); // mod(p, 7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_); // mod(j, N)

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  // Normalización de gradientes.
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mezcla del valor final de ruido.
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`

// AURORA_GLSL: degradado tipo amanecer entre `colorA` (dorado) y `colorB`
// (naranja) modulado por el tiempo `t` (uTime) y por `mixFactor` (posición
// base del degradado, típicamente altura del vértice o un valor de ruido 0..1).
// Devuelve el color RGB resultante.
export const AURORA_GLSL = /* glsl */ `
vec3 auroraColor(float mixFactor, vec3 colorA, vec3 colorB, float t) {
  // 'flow' desplaza el degradado con el tiempo para simular el avance del
  // amanecer; oscila suavemente en 0..1.
  float flow = 0.5 + 0.5 * sin(t * 0.5 + mixFactor * 3.14159265);

  // Combina la posición base con el flujo temporal y limita a 0..1.
  float gradient = clamp(mix(mixFactor, flow, 0.35), 0.0, 1.0);

  // Curva suave para una transición de amanecer más orgánica.
  gradient = smoothstep(0.0, 1.0, gradient);

  // Mezcla dorado -> naranja según el degradado calculado.
  vec3 sunrise = mix(colorA, colorB, gradient);

  // Realce cálido en las crestas del degradado (halo de amanecer).
  sunrise += colorB * pow(gradient, 3.0) * 0.15;

  return sunrise;
}
`

// Uniforms por defecto para el snippet aurora.
// uColorA = #F4A261 (orange), uColorB = #E76F51 (orange-fire), en RGB 0..1.
export const auroraUniforms = {
  uColorA: { value: [0.957, 0.635, 0.380] }, // #F4A261 orange
  uColorB: { value: [0.906, 0.435, 0.318] }, // #E76F51 orange-fire
  uTime: { value: 0 },
}
