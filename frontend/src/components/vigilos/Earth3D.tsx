import React, { useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';

const EarthSphere = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  // Load textures
  const [albedoMap, bumpMap, cloudsMap, nightLightsMap] = useLoader(TextureLoader, [
    '/earth-textures/earth albedo.jpg',
    '/earth-textures/earth bump.jpg',
    '/earth-textures/clouds earth.png',
    '/earth-textures/earth night_lights_modified.png'
  ]);

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.002;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.0025;
    }
  });

  return (
    <group>
      {/* Earth Surface */}
      <mesh ref={earthRef} rotation={[0, 0, 23.5 * (Math.PI / 180)]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          map={albedoMap}
          bumpMap={bumpMap}
          bumpScale={0.02}
          emissiveMap={nightLightsMap}
          emissive={new THREE.Color('#ffc166')} // Tint city lights warm gold/orange
          emissiveIntensity={4.0} // High intensity for the glowing cities
          specular={new THREE.Color(0x111111)}
          shininess={15}
          color={new THREE.Color(0x336699)} // Tint base earth bluish/dark
        />
      </mesh>

      {/* Cloud & Atmosphere Layer */}
      <mesh ref={atmosphereRef} rotation={[0, 0, 23.5 * (Math.PI / 180)]}>
        <sphereGeometry args={[1.02, 64, 64]} />
        <meshPhongMaterial
          map={cloudsMap}
          transparent={true}
          opacity={0.3}
          color={new THREE.Color('#00aaff')} // Cyan atmospheric tint
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Atmospheric Rim Glow */}
      <mesh>
        <sphereGeometry args={[1.06, 64, 64]} />
        <meshBasicMaterial 
          color="#0066ff" 
          transparent={true} 
          opacity={0.15} 
          blending={THREE.AdditiveBlending} 
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

export function Earth3D() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
      {/* The background is completely transparent by default in R3F */}
      <Canvas camera={{ position: [0, 0, 2.8], fov: 45 }}>
        <ambientLight intensity={0.05} />
        <directionalLight position={[-5, 3, 5]} intensity={0.5} color="#00e5ff" />
        <directionalLight position={[5, -3, 2]} intensity={0.2} color="#0066ff" />
        <React.Suspense fallback={null}>
          <EarthSphere />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
