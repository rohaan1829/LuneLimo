"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { activeActs, easeOut, mix, range, stage } from "@/lib/stage";

export const CAMERA_Z = 10;
export const FOV = 30;

/** Additive blending that leaves the canvas alpha alone, so glows add light to whatever page colour sits behind. */
const additive = {
  transparent: true,
  depthWrite: false,
  blending: THREE.CustomBlending,
  blendEquation: THREE.AddEquation,
  blendSrc: THREE.OneFactor,
  blendDst: THREE.OneFactor,
  blendSrcAlpha: THREE.ZeroFactor,
  blendDstAlpha: THREE.OneFactor,
} as const;

/* Lunar surface: NASA LROC albedo + LOLA elevation, lit with a Lommel–Seeliger / Lambert mix
   so the full disk reads flat and bright like the real moon, while the terminator shows relief. */
const moonVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalObj;
  void main() {
    vUv = uv;
    vNormalObj = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const moonFragment = /* glsl */ `
  uniform sampler2D uAlbedo;
  uniform sampler2D uHeight;
  uniform vec3 uLight;      // object space, towards the sun
  uniform vec3 uView;       // object space, towards the camera
  uniform vec3 uTint;
  uniform float uBump;
  uniform float uEarthshine;
  uniform float uOpacity;
  uniform vec2 uTexel;
  varying vec2 vUv;
  varying vec3 vNormalObj;

  void main() {
    vec3 n = normalize(vNormalObj);
    vec3 east = normalize(cross(vec3(0.0, 1.0, 0.0), n) + vec3(1e-5));
    vec3 north = cross(n, east);

    float hL = texture2D(uHeight, vUv - vec2(uTexel.x, 0.0)).r;
    float hR = texture2D(uHeight, vUv + vec2(uTexel.x, 0.0)).r;
    float hD = texture2D(uHeight, vUv - vec2(0.0, uTexel.y)).r;
    float hU = texture2D(uHeight, vUv + vec2(0.0, uTexel.y)).r;
    vec3 pn = normalize(n - uBump * ((hR - hL) * east + (hU - hD) * north));

    float mu0 = max(dot(pn, uLight), 0.0);
    float mu = max(dot(pn, uView), 0.0);
    float lommel = 2.0 * mu0 / (mu0 + mu + 1e-4);
    float shade = mix(mu0, lommel, 0.55);
    // Keep bump noise from lighting up the night side.
    float day = smoothstep(-0.06, 0.16, dot(n, uLight));
    shade *= day;

    float albedo = texture2D(uAlbedo, vUv).r;
    albedo = pow(albedo, 1.4) * 1.32; // deepen the maria a touch so the familiar face reads

    vec3 col = albedo * shade * uTint;
    // Earthshine: the faint grey of the unlit disk on a clear night.
    col += albedo * uEarthshine * (1.0 - day) * vec3(0.55, 0.6, 0.7);

    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    float alpha = clamp(lum * 8.0 + uEarthshine * 4.0 * (1.0 - day), 0.0, 1.0);
    gl_FragColor = vec4(col, alpha * uOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const haloFragment = /* glsl */ `
  uniform vec2 uLight2;
  uniform float uStrength;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    vec2 p = (vUv - 0.5) * 5.0;            // plane is 5 moon radii wide
    float d = length(p);
    float outside = smoothstep(0.97, 1.03, d);
    float glow = exp(-max(d - 1.0, 0.0) * 4.2) * outside * (1.0 - smoothstep(1.6, 2.5, d));
    float facing = 0.35 + 0.65 * clamp(dot(normalize(p), uLight2) * 0.5 + 0.5, 0.0, 1.0);
    gl_FragColor = vec4(uColor * glow * facing * uStrength, 0.0);
  }
`;

const passVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const starVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vTwinkle;
  varying vec3 vColor;
  void main() {
    vColor = aColor;
    vTwinkle = 0.6 + 0.4 * sin(uTime * (0.7 + aPhase) + aPhase * 40.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio;
  }
`;

const starFragment = /* glsl */ `
  uniform float uOpacity;
  varying float vTwinkle;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor * a * a * vTwinkle * uOpacity, 0.0);
  }
`;

function makeStars(count: number) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const warm = new THREE.Color("#e6d9bd");
  const cool = new THREE.Color("#dfe6ff");
  // Deterministic scatter so every visit sees the same sky.
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (rand() - 0.5) * 140;
    positions[i * 3 + 1] = (rand() - 0.5) * 80;
    positions[i * 3 + 2] = -60 - rand() * 30;
    const bright = rand();
    sizes[i] = bright > 0.97 ? 3.2 : bright > 0.85 ? 2.2 : 1.4;
    phases[i] = rand();
    const c = rand() > 0.8 ? warm : cool;
    const k = 0.35 + 0.65 * rand();
    colors[i * 3] = c.r * k;
    colors[i * 3 + 1] = c.g * k;
    colors[i * 3 + 2] = c.b * k;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  return geo;
}

// Towards the sun (world space): a waxing gibbous, lit from the upper left.
const L_NIGHT = new THREE.Vector3(-0.5, 0.35, 0.79).normalize();

const MOON_TINT = new THREE.Color("#fff5e6");

const Y_AXIS = new THREE.Vector3(0, 1, 0);
const BASE_SPIN = -Math.PI / 2; // turn the near side (the face we all know) to the camera

const tmpL = new THREE.Vector3();
const tmpV = new THREE.Vector3();
const tmpCam = new THREE.Vector3();

export function MoonAct({ starCount }: { starCount: number }) {
  const group = useRef<THREE.Group>(null!);
  const moon = useRef<THREE.Mesh>(null!);
  const halo = useRef<THREE.Mesh>(null!);
  const stars = useRef<THREE.Points>(null!);

  const [albedo, height] = useTexture(["/textures/moon-albedo.webp", "/textures/moon-height.webp"]);

  const moonMaterial = useMemo(() => {
    albedo.colorSpace = THREE.SRGBColorSpace;
    albedo.anisotropy = 4;
    height.colorSpace = THREE.NoColorSpace;
    return new THREE.ShaderMaterial({
      vertexShader: moonVertex,
      fragmentShader: moonFragment,
      transparent: true,
      uniforms: {
        uAlbedo: { value: albedo },
        uHeight: { value: height },
        uLight: { value: new THREE.Vector3() },
        uView: { value: new THREE.Vector3(0, 0, 1) },
        uTint: { value: MOON_TINT },
        uBump: { value: 3.2 },
        uEarthshine: { value: 0.05 },
        uOpacity: { value: 1 },
        uTexel: { value: new THREE.Vector2(1 / 1440, 1 / 720) },
      },
    });
  }, [albedo, height]);

  const haloMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: passVertex,
        fragmentShader: haloFragment,
        ...additive,
        depthTest: false,
        uniforms: {
          uLight2: { value: new THREE.Vector2(-1, 0.3) },
          uStrength: { value: 0.3 },
          uColor: { value: new THREE.Color("#e9e2d2") },
        },
      }),
    [],
  );

  const starGeometry = useMemo(() => makeStars(starCount), [starCount]);
  const starMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: starVertex,
        fragmentShader: starFragment,
        ...additive,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
          uOpacity: { value: 1 },
        },
      }),
    [],
  );

  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    // The moon only appears at dusk, far down the page. Compile its shaders now, while the
    // preloader is up or the page is idle, so it never costs a frame mid-scroll.
    group.current.visible = true;
    gl.compile(scene, camera);
    group.current.visible = false;
    return () => {
      moonMaterial.dispose();
      haloMaterial.dispose();
      starMaterial.dispose();
      starGeometry.dispose();
    };
  }, [gl, scene, camera, moonMaterial, haloMaterial, starMaterial, starGeometry]);

  useFrame((state) => {
    const acts = activeActs();
    group.current.visible = acts.moon;
    if (!acts.moon) return;

    const { camera, size, clock } = state;
    const cam = camera as THREE.PerspectiveCamera;
    if (!acts.escalade) {
      cam.clearViewOffset();
      cam.position.set(0, 0, CAMERA_Z);
      cam.lookAt(0, 0, 0);
    }

    const vw = size.width;
    const vh = size.height;
    const landscape = vw > vh * 0.9;

    // Moonrise at dusk: small, off to the right, rising as the sky turns dark again.
    const n = stage.night;
    const up = easeOut(range(n, 0.22, 0.45));
    const out = 1 - range(n, 0.36, 0.47);
    const r = Math.min(vw, vh) * (landscape ? 0.1 : 0.14);
    let x = vw * (landscape ? 0.78 : 0.7);
    let y = mix(vh * 0.6, vh * 0.26, up);
    const opacity = range(n, 0.24, 0.4) * out;
    tmpL.copy(L_NIGHT);
    const earthshine = 0.04;
    const haloStrength = 0.3;
    const starOpacity = range(n, 0.26, 0.45) * out;

    // A touch of pointer parallax.
    const free = stage.reducedMotion ? 0 : 1;
    x += stage.pointer.x * 10 * free;
    y += stage.pointer.y * 8 * free;

    // CSS px → world units on the z = 0 plane.
    const unit = (2 * Math.tan((FOV * Math.PI) / 360) * CAMERA_Z) / vh;
    moon.current.position.set((x - vw / 2) * unit, -(y - vh / 2) * unit, 0);
    moon.current.scale.setScalar(r * unit);
    const spin = BASE_SPIN + clock.elapsedTime * 0.004;
    moon.current.rotation.y = spin;

    halo.current.position.copy(moon.current.position).setZ(-0.05);
    halo.current.scale.setScalar(r * unit * 5);

    // Light and view into the moon's own frame.
    const u = moonMaterial.uniforms;
    (u.uLight.value as THREE.Vector3).copy(tmpL).applyAxisAngle(Y_AXIS, -spin);
    tmpCam.copy(cam.position).sub(moon.current.position).normalize();
    (u.uView.value as THREE.Vector3).copy(tmpCam).applyAxisAngle(Y_AXIS, -spin);
    u.uEarthshine.value = earthshine;
    u.uOpacity.value = opacity;

    tmpV.set(tmpL.x, tmpL.y, 0);
    if (tmpV.lengthSq() > 1e-4) tmpV.normalize();
    (haloMaterial.uniforms.uLight2.value as THREE.Vector2).set(tmpV.x, tmpV.y);
    haloMaterial.uniforms.uStrength.value = haloStrength * opacity;

    starMaterial.uniforms.uTime.value = clock.elapsedTime;
    starMaterial.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    starMaterial.uniforms.uOpacity.value = starOpacity;
    stars.current.rotation.set(stage.pointer.y * 0.01, stage.pointer.x * 0.015, 0);
  });

  return (
    <group ref={group}>
      <mesh ref={moon} material={moonMaterial} renderOrder={1}>
        <sphereGeometry args={[1, 128, 64]} />
      </mesh>
      <mesh ref={halo} material={haloMaterial} renderOrder={3}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <points ref={stars} geometry={starGeometry} material={starMaterial} renderOrder={2} />
    </group>
  );
}
