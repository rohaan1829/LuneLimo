"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * A stand-in Cadillac Escalade, modelled from the real proportions (5.4 m long, 2.06 m wide,
 * 1.94 m tall, 3.07 m wheelbase) and built for low-key night lighting: the silhouette, the
 * chrome window line and the vertical light signature carry the read.
 *
 * Swap for a licensed GLB of the client's car when it arrives; the rig below (lights, wheels)
 * is the contract the scene animates against.
 */

/** Mutable animation inputs, written by the scene every frame. */
export type EscaladeRig = {
  /** Daytime running lights, grows top to bottom, 0 → 1. */
  drl: number;
  head: number;
  tail: number;
  /** Light-shaft opacity, 0 → 1. */
  beams: number;
  wheelAngle: number;
};

export const createRig = (): EscaladeRig => ({ drl: 0, head: 0, tail: 0, beams: 0, wheelAngle: 0 });

const AXLE_FRONT = 1.62;
const AXLE_REAR = -1.46;
const WHEEL_R = 0.42;
const TRACK = 0.86;
const BODY_DEPTH = 1.9;
const BODY_BEVEL = 0.08;
const HALF_WIDTH = BODY_DEPTH / 2 + BODY_BEVEL; // 1.03
const CABIN_DEPTH = 1.62;
const CABIN_HALF = CABIN_DEPTH / 2 + 0.08; // 0.89

/* ---------- geometry ---------- */

function lowerBodyShape() {
  const s = new THREE.Shape();
  s.moveTo(2.5, 0.34);
  s.lineTo(2.18, 0.34);
  s.absarc(AXLE_FRONT, 0.42, 0.56, -0.14, Math.PI + 0.14, false);
  s.lineTo(-0.9, 0.34);
  s.absarc(AXLE_REAR, 0.42, 0.56, -0.14, Math.PI + 0.14, false);
  s.lineTo(-2.5, 0.36);
  s.quadraticCurveTo(-2.7, 0.38, -2.7, 0.58);
  s.lineTo(-2.68, 1.36);
  s.lineTo(1.28, 1.32);
  s.lineTo(2.5, 1.22);
  s.quadraticCurveTo(2.68, 1.21, 2.69, 1.08);
  s.lineTo(2.71, 0.52);
  s.quadraticCurveTo(2.7, 0.36, 2.5, 0.34);
  return s;
}

function cabinShape() {
  const s = new THREE.Shape();
  s.moveTo(1.34, 1.24);
  s.lineTo(0.66, 1.84);
  s.quadraticCurveTo(0.54, 1.94, 0.3, 1.94);
  s.lineTo(-2.34, 1.94);
  s.quadraticCurveTo(-2.58, 1.93, -2.62, 1.76);
  s.lineTo(-2.66, 1.24);
  s.lineTo(1.34, 1.24);
  return s;
}

function windowShapes() {
  const front = new THREE.Shape();
  front.moveTo(1.16, 1.38);
  front.lineTo(0.64, 1.8);
  front.quadraticCurveTo(0.58, 1.83, 0.48, 1.83);
  front.lineTo(0.1, 1.83);
  front.lineTo(0.1, 1.38);
  front.lineTo(1.16, 1.38);

  const rear = new THREE.Shape();
  rear.moveTo(-0.04, 1.38);
  rear.lineTo(-0.04, 1.83);
  rear.lineTo(-1.2, 1.83);
  rear.lineTo(-1.2, 1.38);
  rear.lineTo(-0.04, 1.38);

  const cargo = new THREE.Shape();
  cargo.moveTo(-1.36, 1.38);
  cargo.lineTo(-1.36, 1.83);
  cargo.lineTo(-2.26, 1.83);
  cargo.quadraticCurveTo(-2.38, 1.82, -2.4, 1.7);
  cargo.lineTo(-2.42, 1.38);
  cargo.lineTo(-1.36, 1.38);

  return [front, rear, cargo];
}

/** The chrome line that runs round the side glass, the Escalade's most recognisable stroke. */
function chromeLine() {
  const pts = [
    [1.24, 1.335],
    [0.68, 1.845],
    [0.5, 1.87],
    [-2.28, 1.87],
    [-2.43, 1.78],
    [-2.46, 1.335],
  ].map(([x, y]) => new THREE.Vector3(x, y, 0));
  const top = new THREE.CatmullRomCurve3(pts, false, "centripetal", 0.2);
  const belt = new THREE.LineCurve3(new THREE.Vector3(-2.46, 1.335, 0), new THREE.Vector3(1.24, 1.335, 0));
  const path = new THREE.CurvePath<THREE.Vector3>();
  path.add(top);
  path.add(belt);
  return new THREE.TubeGeometry(path, 260, 0.012, 6, false);
}

function box(w: number, h: number, d: number, x: number, y: number, z: number) {
  return new THREE.BoxGeometry(w, h, d).translate(x, y, z);
}

function grilleGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  const x = 2.722;
  const zHalf = 0.58;
  const yLo = 0.52;
  const yHi = 1.04;
  const t = 0.028;
  parts.push(box(0.02, t, zHalf * 2, x, yHi, 0));
  parts.push(box(0.02, t, zHalf * 2, x, yLo, 0));
  parts.push(box(0.02, yHi - yLo, t, x, (yHi + yLo) / 2, zHalf));
  parts.push(box(0.02, yHi - yLo, t, x, (yHi + yLo) / 2, -zHalf));
  for (let i = 1; i < 8; i++) {
    const y = yLo + ((yHi - yLo) * i) / 8;
    parts.push(box(0.012, 0.012, zHalf * 2 - 0.04, x - 0.004, y, 0));
  }
  // Rear garnish bar between the tail lamps.
  parts.push(box(0.012, 0.03, 1.4, -2.7, 1.2, 0));
  return mergeGeometries(parts)!;
}

function tireGeometry() {
  const profile = [
    [0.29, -0.15],
    [0.37, -0.156],
    [0.405, -0.14],
    [WHEEL_R, -0.1],
    [WHEEL_R, 0.1],
    [0.405, 0.14],
    [0.37, 0.156],
    [0.29, 0.15],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  return new THREE.LatheGeometry(profile, 56).rotateX(Math.PI / 2);
}

function spokeGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) {
    const g = new THREE.BoxGeometry(0.075, 0.24, 0.03).translate(0, 0.15, 0.15);
    g.rotateZ((i / 6) * Math.PI * 2);
    parts.push(g);
  }
  parts.push(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 24).rotateX(Math.PI / 2).translate(0, 0, 0.155));
  parts.push(new THREE.TorusGeometry(0.29, 0.014, 8, 64).translate(0, 0, 0.15));
  return mergeGeometries(parts)!;
}

function extrude(shape: THREE.Shape, depth: number, bevel: number) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: bevel,
    bevelOffset: -bevel,
    bevelSegments: 5,
    curveSegments: 36,
  });
  g.translate(0, 0, -depth / 2);
  g.computeVertexNormals();
  return g;
}

const additiveBlend = {
  transparent: true,
  depthWrite: false,
  toneMapped: false,
  blending: THREE.CustomBlending,
  blendEquation: THREE.AddEquation,
  blendSrc: THREE.OneFactor,
  blendDst: THREE.OneFactor,
  blendSrcAlpha: THREE.ZeroFactor,
  blendDstAlpha: THREE.OneFactor,
} as const;

const glowVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/* Bloom without a post pass: a tight core plus a wide, faint skirt, faded to zero at the quad edge. */
const glowFragment = /* glsl */ `
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float d = length((vUv - 0.5) * 2.0);
    float g = exp(-d * d * 14.0) * 0.9 + exp(-d * 4.5) * 0.28;
    g *= 1.0 - smoothstep(0.75, 1.0, d);
    gl_FragColor = vec4(uColor * g, 0.0);
  }
`;

const glowMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: glowVertex,
    fragmentShader: glowFragment,
    side: THREE.DoubleSide,
    ...additiveBlend,
    uniforms: { uColor: { value: new THREE.Color(0, 0, 0) } },
  });

const beamVertex = /* glsl */ `
  uniform float uHeight;
  varying float vAlong;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vAlong = position.y / uHeight + 0.5;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vPosW = w.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const beamFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uStrength;
  varying float vAlong;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vec3 v = normalize(cameraPosition - vPosW);
    float facing = abs(dot(normalize(vNormalW), v));
    float soft = pow(facing, 2.5);
    float fall = pow(vAlong, 2.2) * (1.0 - smoothstep(0.94, 1.0, vAlong));
    gl_FragColor = vec4(uColor * soft * fall * uStrength, 0.0);
  }
`;

/* ---------- materials, shared by the car and its reflection ---------- */

type Materials = ReturnType<typeof buildMaterials>;
let materials: Materials | null = null;

function buildMaterials() {
  return {
    paint: new THREE.MeshPhysicalMaterial({
      color: "#070707",
      metalness: 0.6,
      roughness: 0.34,
      clearcoat: 1,
      clearcoatRoughness: 0.035,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: "#020305",
      metalness: 0.1,
      roughness: 0.04,
      clearcoat: 1,
      clearcoatRoughness: 0,
      envMapIntensity: 1.6,
    }),
    pane: new THREE.MeshPhysicalMaterial({
      color: "#020305",
      metalness: 0.15,
      roughness: 0.03,
      envMapIntensity: 1.8,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    }),
    chrome: new THREE.MeshStandardMaterial({ color: "#e2d6bd", metalness: 1, roughness: 0.16 }),
    trim: new THREE.MeshStandardMaterial({ color: "#030303", roughness: 0.7 }),
    grilleBack: new THREE.MeshStandardMaterial({ color: "#010101", roughness: 0.5, metalness: 0.4 }),
    tire: new THREE.MeshStandardMaterial({ color: "#0b0b0b", roughness: 0.82 }),
    rim: new THREE.MeshStandardMaterial({ color: "#1c1c1c", metalness: 1, roughness: 0.3 }),
    spokes: new THREE.MeshStandardMaterial({ color: "#d9d2c4", metalness: 1, roughness: 0.2 }),
    lamp: new THREE.MeshBasicMaterial({ color: "#000000", toneMapped: false }),
    drl: new THREE.MeshBasicMaterial({ color: "#000000", toneMapped: false }),
    tail: new THREE.MeshBasicMaterial({ color: "#000000", toneMapped: false }),
    glowWhite: glowMaterial(),
    glowRed: glowMaterial(),
    /** Stands in for every body surface in the reflection: the environment can't be mirrored, so
        the reflected car is a black silhouette that only lets its lights through. */
    occluder: new THREE.MeshBasicMaterial({ color: "#000000" }),
    beam: new THREE.ShaderMaterial({
      vertexShader: beamVertex,
      fragmentShader: beamFragment,
      side: THREE.DoubleSide,
      ...additiveBlend,
      uniforms: {
        uColor: { value: new THREE.Color("#d9e2ff") },
        uStrength: { value: 0 },
        uHeight: { value: 6 },
      },
    }),
  };
}

export function getMaterials() {
  if (!materials) materials = buildMaterials();
  return materials;
}

const WHITE = new THREE.Color("#f2f5ff");
const RED = new THREE.Color("#ff2b22");

/** Push the rig's light levels into the shared materials. Call once per frame. */
export function applyRig(rig: EscaladeRig) {
  const m = getMaterials();
  m.drl.color.copy(WHITE).multiplyScalar(rig.drl);
  m.lamp.color.copy(WHITE).multiplyScalar(rig.head);
  m.tail.color.copy(RED).multiplyScalar(rig.tail);
  (m.glowWhite.uniforms.uColor.value as THREE.Color).copy(WHITE).multiplyScalar(Math.max(rig.drl, rig.head) * 0.75);
  (m.glowRed.uniforms.uColor.value as THREE.Color).copy(RED).multiplyScalar(rig.tail * 0.6);
  m.beam.uniforms.uStrength.value = rig.beams * 0.22;
}

type Geometries = ReturnType<typeof buildGeometries>;
let geometries: Geometries | null = null;

function buildGeometries() {
  const panes = new THREE.ShapeGeometry(windowShapes(), 8);
  return {
    body: extrude(lowerBodyShape(), BODY_DEPTH, 0.06),
    cabin: extrude(cabinShape(), CABIN_DEPTH, 0.09),
    panes: panes.translate(0, 0, CABIN_HALF + 0.004),
    chrome: chromeLine(),
    grille: grilleGeometry(),
    tire: tireGeometry(),
    rim: new THREE.CylinderGeometry(0.3, 0.3, 0.03, 48).rotateX(Math.PI / 2).translate(0, 0, 0.13),
    spokes: spokeGeometry(),
    beam: new THREE.ConeGeometry(1.25, 6, 32, 1, true),
  };
}

function getGeometries() {
  if (!geometries) geometries = buildGeometries();
  return geometries;
}

/* ---------- components ---------- */

const SURFACES = ["paint", "glass", "pane", "chrome", "trim", "grilleBack", "tire", "rim", "spokes"] as const;
type Surfaces = Record<(typeof SURFACES)[number], THREE.Material>;

function surfacesFor(reflection: boolean): Surfaces {
  const m = getMaterials();
  const surfaces = {} as Surfaces;
  for (const k of SURFACES) surfaces[k] = reflection ? m.occluder : m[k];
  return surfaces;
}

function Wheel({ x, side, rig, m }: { x: number; side: 1 | -1; rig: EscaladeRig; m: Surfaces }) {
  const spin = useRef<THREE.Group>(null!);
  const g = getGeometries();
  useFrame(() => {
    spin.current.rotation.z = rig.wheelAngle;
  });
  return (
    <group position={[x, WHEEL_R, TRACK * side]} scale={[1, 1, side]}>
      <group ref={spin}>
        <mesh geometry={g.tire} material={m.tire} />
        <mesh geometry={g.rim} material={m.rim} />
        <mesh geometry={g.spokes} material={m.spokes} />
      </group>
    </group>
  );
}

function Glow({ position, scale, red }: { position: [number, number, number]; scale: [number, number]; red?: boolean }) {
  const m = getMaterials();
  return (
    <Billboard position={position}>
      <mesh scale={[scale[0], scale[1], 1]} material={red ? m.glowRed : m.glowWhite} renderOrder={5}>
        <planeGeometry args={[1, 1]} />
      </mesh>
    </Billboard>
  );
}

/** Vertical DRL strip that grows downward from the headlamp as `rig.drl` rises. */
function Drl({ z, rig }: { z: number; rig: EscaladeRig }) {
  const grow = useRef<THREE.Group>(null!);
  const m = getMaterials();
  useFrame(() => {
    grow.current.scale.y = Math.max(rig.drl, 0.0001);
  });
  return (
    <group ref={grow} position={[2.724, 1.04, z]}>
      <mesh material={m.drl} position={[0, -0.27, 0]}>
        <boxGeometry args={[0.01, 0.54, 0.028]} />
      </mesh>
    </group>
  );
}

export function Escalade({ rig, reflection = false }: { rig: EscaladeRig; reflection?: boolean }) {
  const g = getGeometries();
  const lights = getMaterials();
  const m = surfacesFor(reflection);
  const beams = !reflection;

  return (
    <group>
      <mesh geometry={g.body} material={m.paint} />
      <mesh geometry={g.cabin} material={[m.paint, m.glass]} />
      {/* Side glass and its chrome surround; the left side is the right side mirrored. */}
      {[1, -1].map((s) => (
        <group key={`glass${s}`} scale={[1, 1, s]}>
          <mesh geometry={g.panes} material={m.pane} />
          <mesh geometry={g.chrome} material={m.chrome} position={[0, 0, CABIN_HALF + 0.012]} />
        </group>
      ))}
      <mesh geometry={g.grille} material={m.chrome} />

      {/* Grille backing, lower intake, rockers and mirrors. */}
      <mesh material={m.grilleBack} position={[2.716, 0.78, 0]}>
        <boxGeometry args={[0.01, 0.5, 1.14]} />
      </mesh>
      <mesh material={m.trim} position={[2.712, 0.44, 0]}>
        <boxGeometry args={[0.012, 0.1, 1.5]} />
      </mesh>
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh material={m.trim} position={[0.08, 0.47, s * (HALF_WIDTH + 0.004)]}>
            <boxGeometry args={[1.88, 0.1, 0.01]} />
          </mesh>
          <mesh material={m.paint} position={[1.02, 1.42, s * 1.07]}>
            <boxGeometry args={[0.2, 0.15, 0.16]} />
          </mesh>
          <mesh material={m.chrome} position={[0.78, 1.22, s * (HALF_WIDTH + 0.01)]}>
            <boxGeometry args={[0.2, 0.03, 0.02]} />
          </mesh>
          <mesh material={m.chrome} position={[-0.5, 1.22, s * (HALF_WIDTH + 0.01)]}>
            <boxGeometry args={[0.2, 0.03, 0.02]} />
          </mesh>
        </group>
      ))}

      {/* Wheel wells, so the arches read as deep shadow rather than see-through. */}
      <mesh material={m.trim} position={[AXLE_FRONT, 0.66, 0]}>
        <boxGeometry args={[1.08, 0.6, 1.62]} />
      </mesh>
      <mesh material={m.trim} position={[AXLE_REAR, 0.66, 0]}>
        <boxGeometry args={[1.08, 0.6, 1.62]} />
      </mesh>

      <Wheel x={AXLE_FRONT} side={1} rig={rig} m={m} />
      <Wheel x={AXLE_FRONT} side={-1} rig={rig} m={m} />
      <Wheel x={AXLE_REAR} side={1} rig={rig} m={m} />
      <Wheel x={AXLE_REAR} side={-1} rig={rig} m={m} />

      {/* Light signature: slim headlamps, vertical DRL blades, full-height tail lamps. */}
      {[1, -1].map((s) => (
        <group key={`lights${s}`}>
          <mesh material={lights.lamp} position={[2.724, 1.05, s * 0.76]}>
            <boxGeometry args={[0.01, 0.045, 0.3]} />
          </mesh>
          <Drl z={s * 0.93} rig={rig} />
          <mesh material={lights.tail} position={[-2.712, 1.08, s * 0.95]}>
            <boxGeometry args={[0.012, 0.5, 0.045]} />
          </mesh>
          <mesh material={lights.tail} position={[-2.67, 1.55, s * 0.86]}>
            <boxGeometry args={[0.012, 0.38, 0.04]} />
          </mesh>
          <Glow position={[2.8, 1.03, s * 0.8]} scale={[0.7, 0.5]} />
          <Glow position={[2.8, 0.8, s * 0.93]} scale={[0.32, 0.85]} />
          <Glow position={[-2.76, 1.3, s * 0.93]} scale={[0.34, 1.1]} red />
          {beams && (
            <mesh
              geometry={g.beam}
              material={lights.beam}
              renderOrder={5}
              position={[2.72 + 3, 1.0 - 0.3, s * 0.78]}
              rotation={[0, 0, Math.PI / 2 - 0.1]}
            />
          )}
        </group>
      ))}
    </group>
  );
}
