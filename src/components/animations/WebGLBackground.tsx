"use client";

import { Canvas, useFrame, extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useMemo } from "react";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/useMounted";

/* --------------------------------------------------
   SHADER MATERIAL
-------------------------------------------------- */

const BackgroundMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorA: new THREE.Color(),
    uColorB: new THREE.Color(),
    uIntensity: 0.3,
  },
  /* vertex */
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
  `,
  /* fragment */
  `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uIntensity;
  varying vec2 vUv;

  float noise(vec2 p) {
    return sin(p.x) * sin(p.y);
  }

  void main() {
    vec2 uv = vUv * 3.0;

    float n =
      noise(uv + uTime * 0.15) +
      noise(uv * 1.5 - uTime * 0.1) * 0.5;

    float mixVal = smoothstep(-0.3, 0.6, n);
    vec3 color = mix(uColorA, uColorB, mixVal);

    gl_FragColor = vec4(color, uIntensity);
  }
  `
);

extend({ BackgroundMaterial });

/* --------------------------------------------------
   ANIMATED PLANE
-------------------------------------------------- */

function AnimatedPlane() {
  const materialRef = useRef<any>(null);
  const { theme } = useTheme();
  const mounted = useMounted();

  // ⛔ prevent hydration mismatch
  if (!mounted) return null;

  const isDark = theme === "dark";

  // 🎨 memoized colors (important)
  const colors = useMemo(
    () => ({
      a: new THREE.Color(isDark ? "#2563eb" : "#93c5fd"),
      b: new THREE.Color(isDark ? "#7c3aed" : "#c7d2fe"),
      intensity: isDark ? 0.35 : 0.18,
    }),
    [isDark]
  );

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime += delta * 0.6; // slower, smoother
    }
  });

  return (
    <mesh scale={[1, 1, 1]}>
      <planeGeometry args={[2, 2, 1, 1]} />
      {/* @ts-ignore */}
      <backgroundMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        uColorA={colors.a}
        uColorB={colors.b}
        uIntensity={colors.intensity}
      />
    </mesh>
  );
}

/* --------------------------------------------------
   EXPORT
-------------------------------------------------- */

export default function WebGLBackground() {
  const mounted = useMounted();

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 1] }}
        dpr={[1, 1.5]} // 🔥 limits GPU load
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <AnimatedPlane />
      </Canvas>
    </div>
  );
}
