/**
 * Shared, mutable scroll state for the WebGL stage.
 *
 * Sections write progress here from ScrollTrigger callbacks; the 3D scene reads it inside
 * useFrame. Nothing here is React state, so scrolling never causes a re-render.
 */
export const stage = {
  /** Assets the hero needs (moon textures) have loaded. */
  ready: false,
  /** The car's lights coming on at page load, tweened 0 → 1 once the preloader lifts. */
  intro: 0,
  /** Progress through the pinned sections, 0 → 1. */
  car: 0,
  night: 0,
  book: 0,
  /** Whether each section is anywhere on screen. */
  view: { car: true, night: false, book: false },
  /** Pointer position, -1 → 1 on both axes. */
  pointer: { x: 0, y: 0 },
  reducedMotion: false,
  /** Scroll is held while the preloader is up. Only the home page has one; it sets this on mount. */
  locked: false,
};

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/** Where `v` sits between `a` and `b`, clamped to 0 → 1. */
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export const easeIn = (t: number) => t * t * t;

/** Which act of the 3D stage has something to show right now. */
export function activeActs() {
  const { view, car } = stage;
  const moon = view.night;
  // The car is the hero, so it is on stage from the first frame until it has driven off.
  const escalade = (view.car && car < 1) || view.book;
  return { moon, escalade };
}

type ReadyListener = () => void;
const readyListeners = new Set<ReadyListener>();
let revealed = false;

/** Fires once, when the preloader has lifted and the intro can play. */
export function onReveal(fn: ReadyListener) {
  if (revealed) {
    fn();
    return () => {};
  }
  readyListeners.add(fn);
  return () => readyListeners.delete(fn);
}

export function reveal() {
  if (revealed) return;
  revealed = true;
  readyListeners.forEach((fn) => fn());
  readyListeners.clear();
}
