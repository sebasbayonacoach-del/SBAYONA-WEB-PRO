import { Component, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useCapabilities } from '../engine/hooks/useCapabilities.js'

export const GLOBE_MARKERS = Object.freeze([
  Object.freeze({
    id: 'colombia',
    label: 'Colombia',
    description: 'Origen y experiencia profesional',
    latitude: 4.57,
    longitude: -74,
    kind: 'place',
  }),
  Object.freeze({
    id: 'europe',
    label: 'España / Europa',
    description: 'Formación y desarrollo actual',
    latitude: 40.42,
    longitude: -3.7,
    kind: 'place',
  }),
  Object.freeze({
    id: 'international',
    label: 'Internacional',
    description: 'Visión de crecimiento',
    position: [0, 1.72, 0],
    kind: 'vision',
  }),
])

export function resolveGlobeConfig({ mode = 'mobile', reducedMotion = false, dprLimit = 1.5 } = {}) {
  const desktop = mode === 'desktop'
  return Object.freeze({
    sphereDetail: desktop ? 4 : 2,
    dpr: Math.min(desktop ? 2 : 1.5, dprLimit),
    enableControls: desktop && !reducedMotion,
    rotate: !reducedMotion,
    rotationSpeed: reducedMotion ? 0 : 0.08,
    frameloop: reducedMotion ? 'demand' : 'always',
  })
}

export function supportsWebGL() {
  if (typeof document === 'undefined') return false

  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext
      && (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl')),
    )
  } catch {
    return false
  }
}

function markerPosition(marker, radius = 1.39) {
  if (marker.position) return marker.position
  const phi = (90 - marker.latitude) * (Math.PI / 180)
  const theta = (marker.longitude + 180) * (Math.PI / 180)
  return [
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ]
}

function GlobeMarker({ marker }) {
  const [open, setOpen] = useState(false)
  const position = useMemo(() => markerPosition(marker), [marker])
  const tooltipId = `globe-tooltip-${marker.id}`

  return (
    <group position={position}>
      <mesh>
        <octahedronGeometry args={[0.055, 0]} />
        <meshBasicMaterial color="#F4A261" toneMapped={false} />
      </mesh>
      <mesh scale={2.2}>
        <octahedronGeometry args={[0.055, 0]} />
        <meshBasicMaterial
          color="#E76F51"
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <Html center distanceFactor={7} style={{ pointerEvents: 'auto' }}>
        <div className={`globe-marker-ui ${marker.kind === 'vision' ? 'is-vision' : ''}`}>
          <button
            type="button"
            className="globe-marker-button"
            aria-label={`${marker.label}: ${marker.description}`}
            aria-expanded={open}
            aria-describedby={open ? tooltipId : undefined}
            onBlur={() => setOpen(false)}
            onClick={() => setOpen((current) => !current)}
            onFocus={() => setOpen(true)}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <span aria-hidden="true" />
            {marker.label}
          </button>
          {open && (
            <span className="globe-marker-tooltip" id={tooltipId} role="tooltip">
              {marker.description}
            </span>
          )}
        </div>
      </Html>
    </group>
  )
}

function GlobeScene({ config }) {
  const globe = useRef(null)

  useFrame((_, delta) => {
    if (config.rotate && globe.current) {
      globe.current.rotation.y += delta * config.rotationSpeed
    }
  })

  return (
    <>
      <ambientLight intensity={0.8} color="#b8b3ac" />
      <directionalLight position={[4, 3, 5]} intensity={2.2} color="#F4A261" />
      <group ref={globe} rotation={[0.12, -0.35, -0.05]}>
        <mesh>
          <icosahedronGeometry args={[1.34, config.sphereDetail]} />
          <meshStandardMaterial
            color="#0B0B0C"
            emissive="#F4A261"
            emissiveIntensity={0.16}
            metalness={0.55}
            roughness={0.62}
            flatShading
          />
        </mesh>
        <mesh scale={1.012}>
          <icosahedronGeometry args={[1.34, config.sphereDetail]} />
          <meshBasicMaterial color="#F4A261" wireframe transparent opacity={0.22} />
        </mesh>
        {GLOBE_MARKERS.map((marker) => <GlobeMarker key={marker.id} marker={marker} />)}
      </group>
      {config.enableControls && (
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI * 0.32}
          maxPolarAngle={Math.PI * 0.68}
          minAzimuthAngle={-Math.PI * 0.32}
          maxAzimuthAngle={Math.PI * 0.32}
          rotateSpeed={0.35}
        />
      )}
    </>
  )
}

export function GlobeFallback() {
  return (
    <div className="globe-fallback" role="group" aria-label="Trayectoria y visión internacional">
      <p>Visualización simplificada</p>
      <ul>
        {GLOBE_MARKERS.map((marker) => (
          <li key={marker.id}>
            <strong>{marker.label}</strong>
            <span>{marker.description}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

class GlobeErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? <GlobeFallback /> : this.props.children
  }
}

export default function Globe3D({ webglAvailable }) {
  const caps = useCapabilities()
  const config = useMemo(() => resolveGlobeConfig(caps), [caps])
  const [available, setAvailable] = useState(webglAvailable ?? null)

  useEffect(() => {
    if (webglAvailable === undefined) setAvailable(supportsWebGL())
    else setAvailable(webglAvailable)
  }, [webglAvailable])

  if (available !== true) return <GlobeFallback />

  return (
    <figure className="globe-figure" aria-label="Globo interactivo de trayectoria y visión internacional">
      <GlobeErrorBoundary>
        <Canvas
          camera={{ position: [0, 0.15, 4.4], fov: 42 }}
          dpr={[1, config.dpr]}
          frameloop={config.frameloop}
          gl={{ antialias: caps.mode === 'desktop', alpha: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', (event) => {
              event.preventDefault()
              setAvailable(false)
            }, { once: true })
          }}
        >
          <GlobeScene config={config} />
        </Canvas>
      </GlobeErrorBoundary>
      <figcaption>Arrastra con suavidad en escritorio para explorar. Los marcadores describen trayectoria y visión; no representan clientes ni sedes.</figcaption>
    </figure>
  )
}
