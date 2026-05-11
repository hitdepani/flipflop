"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line, MeshTransmissionMaterial } from "@react-three/drei";
import { memo, useMemo, useRef } from "react";
import * as THREE from "three";

function Gate({ position, color, rotation }: { position: [number, number, number]; color: string; rotation: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = rotation[1] + Math.sin(clock.elapsedTime * 0.35 + position[0]) * 0.28;
    ref.current.rotation.x = rotation[0] + Math.cos(clock.elapsedTime * 0.3 + position[1]) * 0.14;
  });

  return (
    <Float speed={1.1} rotationIntensity={0.35} floatIntensity={0.75}>
      <group ref={ref} position={position} rotation={rotation}>
        <mesh>
          <boxGeometry args={[1.1, 0.62, 0.12]} />
          <MeshTransmissionMaterial
            color={color}
            transmission={0.25}
            roughness={0.24}
            thickness={0.6}
            emissive={color}
            emissiveIntensity={0.1}
          />
        </mesh>
        <mesh position={[0.52, 0, 0.09]}>
          <sphereGeometry args={[0.13, 24, 24]} />
          <meshBasicMaterial color={color} transparent opacity={0.82} />
        </mesh>
        <mesh position={[-0.52, 0.18, 0.09]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.55} />
        </mesh>
        <mesh position={[-0.52, -0.18, 0.09]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.55} />
        </mesh>
      </group>
    </Float>
  );
}

function ParticleField() {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const data = new Float32Array(280 * 3);
    for (let i = 0; i < 280; i += 1) {
      data[i * 3] = (Math.random() - 0.5) * 15;
      data[i * 3 + 1] = (Math.random() - 0.5) * 8;
      data[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return data;
  }, []);

  useFrame(({ clock, mouse }) => {
    if (!points.current) return;
    points.current.rotation.y = clock.elapsedTime * 0.025 + mouse.x * 0.08;
    points.current.rotation.x = mouse.y * 0.04;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.022} color="#67e8f9" transparent opacity={0.62} sizeAttenuation />
    </points>
  );
}

function NeuralLines() {
  const paths = useMemo(
    () => [
      [
        [-5.8, -1.8, -1.2],
        [-3.8, -0.7, -0.6],
        [-1.2, -1.1, 0.2],
        [1.3, -0.15, -0.2],
        [4.8, -0.72, -0.8],
      ],
      [
        [-4.8, 1.4, -1.6],
        [-2.6, 0.88, -0.7],
        [-0.2, 1.15, 0.1],
        [2.5, 0.5, -0.4],
        [5.4, 1.1, -1.2],
      ],
      [
        [-5.2, 0.1, -2.2],
        [-2.4, -0.15, -1.4],
        [0.6, 0.12, -0.9],
        [3.8, -0.08, -1.4],
      ],
    ],
    [],
  );

  return (
    <group>
      {paths.map((path, index) => (
        <Line
          key={index}
          points={path as [number, number, number][]}
          color={index === 1 ? "#a78bfa" : "#22d3ee"}
          lineWidth={1}
          transparent
          opacity={0.24}
        />
      ))}
    </group>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#02040a"]} />
      <ambientLight intensity={0.7} />
      <pointLight position={[3, 3, 4]} color="#67e8f9" intensity={20} />
      <pointLight position={[-4, -1, 2]} color="#a78bfa" intensity={10} />
      <ParticleField />
      <NeuralLines />
      <Gate position={[-3.3, 0.5, -1.1]} rotation={[0.25, -0.4, 0.08]} color="#22d3ee" />
      <Gate position={[2.8, 0.8, -1.6]} rotation={[-0.15, 0.34, -0.08]} color="#a78bfa" />
      <Gate position={[0.9, -1.25, -0.9]} rotation={[0.16, 0.68, 0.04]} color="#f6b84b" />
    </>
  );
}

function AmbientScene() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 6.2], fov: 48 }} dpr={[1, 1.6]} performance={{ min: 0.5 }}>
        <Scene />
      </Canvas>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,4,10,0.25)_42%,rgba(2,4,10,0.88)_100%)]" />
      <div className="noise-mask" />
    </div>
  );
}

export default memo(AmbientScene);
