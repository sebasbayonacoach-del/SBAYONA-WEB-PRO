import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

/**
 * Procedural, physically three-dimensional orbital craft. No image, SVG, GLB
 * download, particle dependency or texture required. All geometry is original.
 */
function CraftModel({ progress, chapter, reducedMotion }) {
  const craft = useRef(null)
  const emission = useRef(null)
  useFrame((state, delta) => {
    if (!craft.current || reducedMotion) return
    const p = Math.max(0, Math.min(1, progress?.get?.() ?? chapter / 2))
    const targetYaw = Math.sin(p * Math.PI * 2) * .28 + .4
    craft.current.rotation.y = THREE.MathUtils.damp(craft.current.rotation.y, targetYaw, 2.6, delta)
    craft.current.rotation.z = THREE.MathUtils.damp(craft.current.rotation.z, -.09 - p * .24, 2.6, delta)
    craft.current.position.y = Math.sin(state.clock.elapsedTime * 1.15) * .045
    if (emission.current) emission.current.scale.y = .74 + Math.sin(state.clock.elapsedTime * 7) * .1
  })

  return (
    <group ref={craft} rotation={[.2, .45, -.07]} scale={1.14}>
      {/* central aerospace fuselage — tapered titanium hull */}
      <mesh>
        <cylinderGeometry args={[.30, .41, 1.63, 24, 1]} />
        <meshStandardMaterial color="#c6c6c4" metalness={.91} roughness={.28}/>
      </mesh>
      <mesh position={[0,.97,0]}>
        <coneGeometry args={[.30, .79, 24]} />
        <meshStandardMaterial color="#e4e2de" metalness={.83} roughness={.22}/>
      </mesh>
      <mesh position={[0, .10, .312]} rotation={[Math.PI/2,0,0]}>
        <sphereGeometry args={[.20, 20, 16, 0, Math.PI * 2, 0, Math.PI]} />
        <meshPhysicalMaterial color="#121d23" metalness={.72} roughness={.12} clearcoat={.96} emissive="#21313a" emissiveIntensity={.16}/>
      </mesh>
      {/* two separation collars, ceramic copper detail */}
      {[-.46,.5].map(y=><mesh position={[0,y,0]} key={y}>
        <cylinderGeometry args={[.417,.417,.06,24]} />
        <meshStandardMaterial color="#e9a164" metalness={.86} roughness={.33}/>
      </mesh>)}
      {/* fins, physically radial: not flat icon artwork */}
      {[0,Math.PI*2/3,Math.PI*4/3].map((yaw,i)=>(
        <group rotation={[0,yaw,0]} key={i}>
          <mesh position={[0,-.56,.49]} rotation={[0,0,-.05]}>
            <boxGeometry args={[.14,.83,.61]}/>
            <meshStandardMaterial color="#676d74" metalness={.93} roughness={.32}/>
          </mesh>
          <mesh position={[0,-.67,.77]}>
            <boxGeometry args={[.11,.47,.24]}/>
            <meshStandardMaterial color="#f0a460" metalness={.77} roughness={.28}/>
          </mesh>
        </group>
      ))}
      {/* nozzle and internal hot exhaust, not animated in calm mode */}
      <mesh position={[0,-.92,0]}>
        <cylinderGeometry args={[.29,.23,.33,24]} />
        <meshStandardMaterial color="#22292b" metalness={.84} roughness={.27}/>
      </mesh>
      <mesh position={[0,-1.11,0]} rotation={[Math.PI,0,0]}>
        <coneGeometry args={[.2,.48,16]}/>
        <meshBasicMaterial color="#ed9851" transparent opacity={.76}/>
      </mesh>
      <mesh ref={emission} position={[0,-1.43,0]} rotation={[Math.PI,0,0]}>
        <coneGeometry args={[.15,.43,16]}/>
        <meshBasicMaterial color="#fff2ce" transparent opacity={.57}/>
      </mesh>
    </group>
  )
}

export default function FlightCraft3D({ progress, chapter = 0, reducedMotion = false }) {
  return (
    <Canvas
      className="bayona-flight-canvas"
      camera={{position:[0,.08,5.2],fov:36,near:.1,far:25}}
      dpr={[1,1.4]}
      frameloop={reducedMotion ? 'demand' : 'always'}
      gl={{alpha:true,antialias:true,powerPreference:'low-power'}}
      onCreated={({gl})=>gl.setClearColor('#000000',0)}
    >
      <ambientLight intensity={.62}/>
      <hemisphereLight args={['#f7e3c9','#202532',1.25]}/>
      <directionalLight position={[3,5,5]} intensity={2.5} color="#fff4e5"/>
      <directionalLight position={[-3,-1,-2]} intensity={2} color="#f4a261"/>
      <pointLight position={[0,-2,2]} intensity={1.4} color="#ed9150" distance={5}/>
      <CraftModel progress={progress} chapter={chapter} reducedMotion={reducedMotion}/>
    </Canvas>
  )
}
