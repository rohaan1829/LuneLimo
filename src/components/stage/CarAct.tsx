"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { activeActs, clamp, easeIn, easeInOut, easeOut, mix, range, stage } from "@/lib/stage";
import { Escalade, applyRig, createRig } from "./Escalade";

/* Camera keyframes around the car, in cylindrical coordinates (theta from the nose, towards
   the passenger side). Each beat holds long enough to read the copy that sits beside it. */
const KEYS = [
  { t: 0.0, theta: 0.3, r: 10.2, y: 1.05, ty: 0.9 }, // the hero: nose-on with a little of the flank
  { t: 0.15, theta: 0.3, r: 9.8, y: 1.05, ty: 0.9 },
  { t: 0.34, theta: 0.74, r: 10.8, y: 1.6, ty: 0.82 }, // front three-quarter
  { t: 0.56, theta: 1.56, r: 11.6, y: 1.25, ty: 0.92 }, // profile
  { t: 0.76, theta: 2.42, r: 10.8, y: 1.9, ty: 0.86 }, // rear three-quarter
  { t: 0.88, theta: 1.62, r: 12.6, y: 1.3, ty: 0.92 }, // wide profile for the departure
  { t: 1.0, theta: 1.62, r: 12.6, y: 1.3, ty: 0.92 },
];

function cameraAt(c: number) {
  let i = 0;
  while (i < KEYS.length - 2 && c > KEYS[i + 1].t) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const k = easeInOut(range(c, a.t, b.t));
  return {
    theta: mix(a.theta, b.theta, k),
    r: mix(a.r, b.r, k),
    y: mix(a.y, b.y, k),
    ty: mix(a.ty, b.ty, k),
  };
}

const groundVertex = /* glsl */ `
  varying vec3 vW;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

/* Wet tarmac at night: ink everywhere, a soft footprint under the car, the reflection showing
   through close to it, and pools of headlight ahead. No tone mapping, so the far ground matches
   the page's #0A0A0A exactly and the edge of the world never shows. */
const groundFragment = /* glsl */ `
  uniform vec3 uInk;
  uniform vec3 uPoolColor;
  uniform float uCarX;
  uniform float uPool;
  uniform float uReflect;
  varying vec3 vW;
  void main() {
    vec2 p = vec2(vW.x - uCarX, vW.z);
    float foot = length(vec2(p.x / 2.9, p.y / 1.15));
    float shadow = 1.0 - smoothstep(0.6, 1.2, foot);
    float near = length(vec2(p.x / 5.0, p.y / 2.8));
    float alpha = mix(1.0 - uReflect, 1.0, smoothstep(0.5, 1.5, near));
    alpha = max(alpha, shadow * 0.96);
    float pool = exp(-pow((p.x - 5.6) / 3.0, 2.0) - pow(p.y / 1.35, 2.0)) * uPool;
    vec3 col = uInk * (1.0 - shadow * 0.85) + uPoolColor * pool;
    gl_FragColor = vec4(col, clamp(max(alpha, pool), 0.0, 1.0));
    #include <colorspace_fragment>
  }
`;

const target = new THREE.Vector3();

export function CarAct({ reflections }: { reflections: boolean }) {
  const root = useRef<THREE.Group>(null!);
  const car = useRef<THREE.Group>(null!);
  const rim = useRef<THREE.DirectionalLight>(null!);
  const key = useRef<THREE.DirectionalLight>(null!);
  const rig = useMemo(() => createRig(), []);

  const groundMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: groundVertex,
        fragmentShader: groundFragment,
        transparent: true,
        uniforms: {
          uInk: { value: new THREE.Color("#0a0a0a") },
          uPoolColor: { value: new THREE.Color("#8f97ad") },
          uCarX: { value: 0 },
          uPool: { value: 0 },
          uReflect: { value: 0.5 },
        },
      }),
    [],
  );

  useEffect(() => {
    // The car is the first thing on screen; the preloader holds until it has mounted.
    stage.ready = true;
    return () => groundMaterial.dispose();
  }, [groundMaterial]);

  useFrame((state) => {
    const acts = activeActs();
    root.current.visible = acts.escalade;
    if (!acts.escalade) return;

    const cam = state.camera as THREE.PerspectiveCamera;
    const { width: vw, height: vh } = state.size;
    const aspect = vw / vh;
    const landscape = aspect > 1.05;

    const c = stage.car;
    let reveal: number;
    let carX = 0;
    let pose = cameraAt(c);

    if (stage.view.book && !stage.view.car) {
      // Closing shot behind the booking form: nose-on, lights up, slowly creeping closer.
      const b = stage.book;
      reveal = easeOut(range(b, 0.1, 0.45));
      rig.drl = reveal;
      rig.head = reveal;
      rig.tail = reveal;
      rig.beams = 0;
      pose = { theta: 0.16, r: mix(10.5, 9.2, b), y: 1.0, ty: 0.9 };
    } else {
      // Ignition plays once as the preloader lifts: running lights draw down, headlamps, then the body.
      const i = stage.intro;
      rig.drl = easeOut(range(i, 0, 0.35));
      rig.head = range(i, 0.3, 0.42);
      rig.tail = range(i, 0.35, 0.6);
      reveal = easeInOut(range(i, 0.35, 1));
      carX = easeIn(range(c, 0.86, 1)) * 19;
      // Light shafts only read from the side; head-on they would wash the frame.
      rig.beams = rig.head * range(pose.theta, 0.35, 0.9);
    }
    rig.wheelAngle = -carX / 0.42;
    applyRig(rig);

    car.current.position.x = carX;
    state.scene.environmentIntensity = reveal * 1.15;
    rim.current.intensity = reveal * 2.2;
    key.current.intensity = reveal * 0.6;
    groundMaterial.uniforms.uCarX.value = carX;
    groundMaterial.uniforms.uPool.value = rig.head * 0.16;

    // Narrow screens pull back just far enough for the car, as wide as it looks from this angle
    // (5.4 m long, 2.1 m wide), to fill ~78% of the frame. Wide screens slide it right of the copy.
    const span = Math.abs(Math.sin(pose.theta)) * 5.4 + Math.abs(Math.cos(pose.theta)) * 2.1;
    const needed = span / 0.78 / (2 * Math.tan((cam.fov * Math.PI) / 360) * aspect);
    const fit = landscape ? 1 : clamp(needed / pose.r, 1, 2.5);
    const r = pose.r * fit;
    cam.position.set(Math.cos(pose.theta) * r, pose.y + (fit - 1) * 0.6, Math.sin(pose.theta) * r);
    target.set(0, pose.ty, 0);
    cam.lookAt(target);
    if (landscape) cam.setViewOffset(vw, vh, -vw * 0.11, 0, vw, vh);
    else cam.setViewOffset(vw, vh, 0, vh * 0.1, vw, vh);
  });

  return (
    <group ref={root} visible={false}>
      <Environment resolution={256} frames={1}>
        {/* Long softbox overhead: the reflection that runs down the bonnet and roof. */}
        <Lightformer form="rect" intensity={0.9} position={[0, 7, 0]} rotation-x={Math.PI / 2} scale={[14, 1.1, 1]} />
        {/* Horizon strips on both sides: the "line" every car ad draws along the doors. */}
        <Lightformer form="rect" intensity={2.2} position={[0, 1.6, 9]} scale={[22, 0.3, 1]} />
        <Lightformer form="rect" intensity={0.9} position={[0, 1.6, -9]} rotation-y={Math.PI} scale={[22, 0.35, 1]} />
        {/* Champagne key from the front quarter, cool moonlight behind. */}
        <Lightformer form="rect" color="#c5b79b" intensity={1.6} position={[8, 2.5, 4]} rotation-y={-Math.PI / 3} scale={[4, 3, 1]} />
        <Lightformer form="rect" color="#aebcff" intensity={1.1} position={[-8, 4, -3]} rotation-y={Math.PI / 2.5} scale={[5, 3, 1]} />
        <Lightformer form="ring" intensity={0.8} position={[0, 4, 9]} scale={2} />
      </Environment>

      <directionalLight ref={rim} position={[-6, 7, -5]} color="#c8d3ff" intensity={0} />
      <directionalLight ref={key} position={[6, 3, 6]} color="#e8dcc2" intensity={0} />

      <group ref={car}>
        <Escalade rig={rig} />
        {reflections && (
          <group scale={[1, -1, 1]}>
            <Escalade rig={rig} reflection />
          </group>
        )}
      </group>

      <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, 0]} material={groundMaterial} renderOrder={0}>
        <planeGeometry args={[80, 80]} />
      </mesh>
    </group>
  );
}
