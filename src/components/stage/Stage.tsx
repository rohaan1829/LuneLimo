"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { gsap } from "gsap";
import { activeActs, stage } from "@/lib/stage";
import { CAMERA_Z, FOV, MoonAct } from "./MoonAct";
import { CarAct } from "./CarAct";

/**
 * Renders the scene from the shared GSAP ticker, after Lenis and ScrollTrigger have run, so the
 * 3D and the DOM always draw the same scroll position. When no act has anything to show, it
 * stops rendering altogether and the GPU idles.
 */
function Driver() {
  const advance = useThree((s) => s.advance);
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    const wrapper = gl.domElement.parentElement?.parentElement;
    const pointer = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let shown = true;
    const tick = (time: number) => {
      stage.pointer.x += (pointer.x - stage.pointer.x) * 0.05;
      stage.pointer.y += (pointer.y - stage.pointer.y) * 0.05;
      const { moon, escalade } = activeActs();
      const on = moon || escalade;
      if (on !== shown) {
        shown = on;
        if (wrapper) wrapper.style.opacity = on ? "1" : "0";
      }
      // With frameloop="never", R3F takes this value as clock.elapsedTime, so it must be seconds.
      if (on) advance(time);
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [advance, gl]);

  return null;
}

function detectQuality() {
  const small = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
  return small
    ? { maxDpr: 1.5, stars: 700, reflections: false }
    : { maxDpr: 1.75, stars: 1400, reflections: true };
}

export default function Stage() {
  const [quality] = useState(detectQuality);
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio, quality.maxDpr));

  return (
    <Canvas
      className="stage-canvas"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100lvh", pointerEvents: "none" }}
      frameloop="never"
      dpr={dpr}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: FOV, near: 0.1, far: 200, position: [0, 0, CAMERA_Z] }}
      aria-hidden
    >
      <Driver />
      <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(1, d - 0.5))} />
      <Suspense fallback={null}>
        <MoonAct starCount={quality.stars} />
      </Suspense>
      <CarAct reflections={quality.reflections} />
    </Canvas>
  );
}
