/* Un solo atlas interactivo: textura cartográfica proyectada sobre la esfera
   y marcadores anclados a coordenadas. El mapa plano queda como fallback. */
import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { BackSide, DoubleSide, TextureLoader, SRGBColorSpace } from 'three'

const RADIUS = 1.58
const EARTH = '/images/system/earth-dark.jpg'

export function toSpherePosition(lat, lng, radius = RADIUS) {
  const a = lat * Math.PI / 180
  const b = lng * Math.PI / 180
  return [radius * Math.cos(a) * Math.cos(b), radius * Math.sin(a), -radius * Math.cos(a) * Math.sin(b)]
}

function AtlasPoint({ marker, onSelect, active, count = 1 }) {
  const position = useMemo(() => toSpherePosition(marker.lat, marker.lng, RADIUS + .035), [marker.lat, marker.lng])
  const mesh = useRef(null)
  useFrame(({ clock }) => {
    if (!mesh.current) return
    mesh.current.scale.setScalar(active ? 1.2 + Math.sin(clock.elapsedTime * 2.3) * .12 : 1)
  })
  return (
    <group position={position}>
      <mesh ref={mesh} onClick={(event) => { event.stopPropagation(); onSelect(marker) }}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = '' }}>
        <sphereGeometry args={[count > 1 ? .049 : .038, 14, 14]} />
        <meshBasicMaterial color={active ? '#ffffff' : '#f4a261'} toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[count > 1 ? .082 : .065, 16, 16]} />
        <meshBasicMaterial color="#f4a261" transparent opacity={active ? .25 : .15} depthWrite={false} />
      </mesh>
    </group>
  )
}

function Earth({ markers, selectedId, onSelect, storyStage = -1, reducedMotion }) {
  const texture = useLoader(TextureLoader, EARTH)
  texture.colorSpace = SRGBColorSpace
  const places = useMemo(() => {
    const cities = new Map()
    for (const marker of markers) {
      const key = `${marker.country}|${marker.city}`
      const place = cities.get(key)
      if (place) place.count += 1
      else cities.set(key, { ...marker, count: 1 })
    }
    return [...cities.values()]
  }, [markers])
  const groupRef = useRef(null)
  useFrame((_, delta) => {
    if (!groupRef.current || storyStage < 0 || reducedMotion) return
    const angles = [-.75, .58, 1.2, -.3]
    const target = angles[storyStage] ?? -.75
    const factor = 1 - Math.exp(-1.65 * delta)
    groupRef.current.rotation.y += (target - groupRef.current.rotation.y) * factor
  })
  return (
    <group ref={groupRef} rotation={[0, -.75, 0]}>
      <mesh>
        <sphereGeometry args={[RADIUS, 96, 64]} />
        <shaderMaterial
          uniforms={{ uMap: { value: texture } }}
          vertexShader={`
            varying vec2 vUv;
            varying vec3 vNormalView;
            void main(){
              vUv = uv;
              vNormalView = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform sampler2D uMap;
            varying vec2 vUv;
            varying vec3 vNormalView;
            void main(){
              vec3 tex = texture2D(uMap, vUv).rgb;
              float value = dot(tex, vec3(0.2126, 0.7152, 0.0722));
              float land = smoothstep(0.0025, 0.020, value);
              vec3 oceanColor = vec3(0.085, 0.13, 0.145);
              vec3 landColor = vec3(0.68, 0.56, 0.42);
              vec3 surface = mix(oceanColor, landColor, land);
              float light = 0.85 + 0.15 * max(dot(normalize(vNormalView),normalize(vec3(-0.5,0.7,1.0))),0.0);
              float edge = 1.0 - max(dot(normalize(vNormalView),vec3(0.0,0.0,1.0)),0.0);
              surface += vec3(0.23,0.11,0.055) * pow(edge,4.0);
              gl_FragColor = vec4(surface * light, 1.0);
            }
          `}
        />
      </mesh>
      <mesh scale={1.075}>
        <sphereGeometry args={[RADIUS, 48, 32]} />
        <meshBasicMaterial color="#de8f4e" transparent opacity={.09} side={BackSide} depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI/2,0,0]}>
        <torusGeometry args={[RADIUS + .014, .002, 4, 144]} />
        <meshBasicMaterial color="#f4a261" transparent opacity={.27} side={DoubleSide} />
      </mesh>
      {places.map((place) => (
        <AtlasPoint key={`${place.city}-${place.country}`} marker={place} count={place.count}
          active={place.testimonialId === selectedId} onSelect={onSelect} />
      ))}
    </group>
  )
}

function CameraMotion({ reducedMotion }) {
  const controls = useRef(null)
  useFrame(() => { if (controls.current && !reducedMotion) controls.current.update() })
  return (
    <OrbitControls ref={controls} makeDefault enablePan={false} enableZoom={false}
      enableDamping dampingFactor={.08} autoRotate={!reducedMotion} autoRotateSpeed={.22}
      minPolarAngle={Math.PI * .25} maxPolarAngle={Math.PI * .75} />
  )
}

export default function StoryGlobe3D({ markers, selectedId, onSelect, reducedMotion, compact, storyStage = -1, onReady }) {
  return (
    <div className="bayona-globe-three" aria-label="Globo terrestre tridimensional con lugares de historias publicadas">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, .15, compact ? 6.45 : 4.65], fov: 44 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        onCreated={onReady}>
        <ambientLight intensity={1.8} />
        <directionalLight position={[-3, 4, 5]} intensity={2.2} color="#ffe5c5" />
        <pointLight position={[3, -1, 3]} intensity={1.5} color="#f4a261" />
        <Suspense fallback={null}>
          <Earth markers={markers} selectedId={selectedId} onSelect={onSelect} storyStage={storyStage} reducedMotion={reducedMotion} />
        </Suspense>
        <CameraMotion reducedMotion={reducedMotion || storyStage >= 0} />
      </Canvas>
    </div>
  )
}
