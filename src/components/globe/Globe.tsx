'use client';

import { Canvas, type ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import * as THREE from 'three';
import type { CountryMock } from '@/data/mockCountryData';

type GlobeProps = {
  countries: CountryMock[];
  onSelect: (country: CountryMock) => void;
};

const EARTH_RADIUS = 1.2;

const latLngToVector3 = (lat: number, lng: number, radius: number) => {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lng + 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
};

type EarthProps = {
  children?: ReactNode;
};

const BASE_ROTATION_SPEED = 0.05;
const CLOUD_ROTATION_OFFSET = 0.01;

const createGlowTexture = () => {
  if (typeof document === 'undefined') {
    return null;
  }

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.1,
    size / 2,
    size / 2,
    size * 0.5
  );

  gradient.addColorStop(0, 'rgba(252, 211, 77, 0.9)');
  gradient.addColorStop(0.45, 'rgba(249, 115, 22, 0.55)');
  gradient.addColorStop(1, 'rgba(249, 115, 22, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};

const Earth = ({ children }: EarthProps) => {
  const [colorMap, normalMap, specularMap] = useTexture([
    '/textures/earth-day.jpg',
    '/textures/earth-normal.jpg',
    '/textures/earth-specular.jpg'
  ]);
  const cloudsMap = useTexture('/textures/earth-clouds.png');

  const { gl } = useThree();
  const planetGroupRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy?.() ?? 8;
    if (colorMap) {
      colorMap.colorSpace = THREE.SRGBColorSpace;
      colorMap.anisotropy = Math.min(maxAnisotropy, 16);
      colorMap.minFilter = THREE.LinearMipMapLinearFilter;
      colorMap.magFilter = THREE.LinearFilter;
      colorMap.needsUpdate = true;
    }
    if (cloudsMap) {
      cloudsMap.colorSpace = THREE.SRGBColorSpace;
      cloudsMap.anisotropy = Math.min(maxAnisotropy, 8);
      cloudsMap.needsUpdate = true;
    }
    [normalMap, specularMap].forEach((map) => {
      if (map) {
        map.anisotropy = Math.min(maxAnisotropy, 8);
        map.needsUpdate = true;
      }
    });
  }, [cloudsMap, colorMap, gl, normalMap, specularMap]);

  useEffect(() => {
    if (!colorMap?.image || (colorMap.userData?.enhanced ?? false)) {
      return;
    }

    const image = colorMap.image as HTMLImageElement | HTMLCanvasElement | ImageBitmap;
    const width = image.width;
    const height = image.height;

    if (!width || !height) {
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    ctx.drawImage(image, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const { data } = imageData;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const waterScore = b - (r + g) * 0.5;

      if (waterScore > 20) {
        const oceanDarken = 0.92;
        data[i] = Math.min(255, r * oceanDarken);
        data[i + 1] = Math.min(255, g * oceanDarken);
        data[i + 2] = Math.min(255, b * 0.98);
      } else {
        const landBoostR = 1.18;
        const landBoostG = 1.24;
        const landBoostB = 1.08;

        data[i] = Math.min(255, r * landBoostR + 6);
        data[i + 1] = Math.min(255, g * landBoostG + 8);
        data[i + 2] = Math.min(255, b * landBoostB + 4);
      }
    }

    ctx.putImageData(imageData, 0, 0);
    colorMap.image = canvas;
    colorMap.needsUpdate = true;
    colorMap.userData = { ...(colorMap.userData ?? {}), enhanced: true };
  }, [colorMap]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (planetGroupRef.current) {
      planetGroupRef.current.rotation.y = elapsed * BASE_ROTATION_SPEED;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = elapsed * CLOUD_ROTATION_OFFSET;
    }
  });

  return (
    <group ref={planetGroupRef}>
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS, 128, 128]} />
        <meshPhongMaterial
          map={colorMap}
          normalMap={normalMap}
          specularMap={specularMap}
          emissive="#1e40af"
          emissiveIntensity={0.12}
          shininess={12}
        />
      </mesh>
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[EARTH_RADIUS + 0.01, 128, 128]} />
        <meshPhongMaterial
          map={cloudsMap}
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS + 0.12, 64, 64]} />
        <meshBasicMaterial
          color={new THREE.Color('#60a5fa')}
          side={THREE.BackSide}
          transparent
          opacity={0.15}
        />
      </mesh>
      {children}
    </group>
  );
};

type CountryMarkerProps = {
  country: CountryMock;
  onSelect: (country: CountryMock) => void;
};

const CountryMarker = ({ country, onSelect }: CountryMarkerProps) => {
  const position = useMemo(
    () => latLngToVector3(country.lat, country.lng, EARTH_RADIUS + 0.045),
    [country.lat, country.lng]
  );

  const markerRef = useRef<THREE.Mesh>(null);
  const spriteRef = useRef<THREE.Sprite>(null);
  const glowTexture = useMemo(() => createGlowTexture(), []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    if (markerRef.current) {
      const scale = 0.85 + Math.sin(time * 2.1) * 0.1;
      markerRef.current.scale.setScalar(scale);
    }

    if (spriteRef.current) {
      const wave = 0.16 + Math.sin(time * 1.8) * 0.02;
      spriteRef.current.scale.set(wave, wave, 1);
      const spriteMaterial = spriteRef.current.material as THREE.SpriteMaterial;
      spriteMaterial.opacity = 0.55 + Math.sin(time * 2.2) * 0.1;
    }
  });

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onSelect(country);
  };

  const handlePointerOver = () => {
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    document.body.style.cursor = '';
  };

  return (
    <group
      position={position}
      onPointerDown={handlePointerDown}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <mesh ref={markerRef}>
        <icosahedronGeometry args={[0.02, 1]} />
        <meshStandardMaterial
          color="#fb923c"
          emissive="#facc15"
          emissiveIntensity={0.45}
          metalness={0.08}
          roughness={0.4}
        />
      </mesh>
      {glowTexture && (
        <sprite ref={spriteRef} scale={[0.16, 0.16, 0.16]} position={[0, 0, 0]}>
          <spriteMaterial
            map={glowTexture}
            transparent
            opacity={0.65}
            depthWrite={false}
            depthTest
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      )}
    </group>
  );
};

export const Globe = ({ countries, onSelect }: GlobeProps) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45, near: 0.1, far: 1000 }}
      className="pointer-events-auto"
    >
      <color attach="background" args={[0.08, 0.12, 0.2]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#f8fafc", "#0f172a", 0.45]} />
      <directionalLight position={[5, 5, 5]} intensity={1.6} />
      <directionalLight position={[-4, -2, -3]} intensity={0.6} />
      <spotLight
        position={[2, 3, 1]}
        angle={0.55}
        penumbra={0.4}
        intensity={0.8}
        color="#60a5fa"
      />
      <Earth>
        {countries.map((country) => (
          <CountryMarker
            key={country.code}
            country={country}
            onSelect={onSelect}
          />
        ))}
      </Earth>
      <Stars
        radius={50}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1.5}
      />
      <OrbitControls enablePan={false} enableDamping dampingFactor={0.15} rotateSpeed={0.6} zoomSpeed={0.6} minDistance={2.4} maxDistance={6} />
    </Canvas>
  );
};
