"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { stage } from "@/lib/stage";

gsap.registerPlugin(ScrollTrigger, useGSAP);

let instance: Lenis | null = null;

export const getLenis = () => instance;

/** Scroll to an anchor, through Lenis when it is running. */
export function scrollToTarget(target: string) {
  if (instance) {
    instance.scrollTo(target, { duration: 1.6 });
    return;
  }
  document.querySelector(target)?.scrollIntoView({ behavior: "auto" });
}

/**
 * Owns the single animation clock for the page.
 *
 * Lenis smooths the scroll, then ScrollTrigger updates in the same tick, and the WebGL stage
 * renders last (it adds itself to the same GSAP ticker). One requestAnimationFrame for
 * everything keeps the 3D scene and the DOM moving in lockstep.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    history.scrollRestoration = "manual";
    // Start at the top, unless the URL points at a section (e.g. /terms#text-messages).
    if (!location.hash) window.scrollTo(0, 0);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    stage.reducedMotion = reduce;
    if (reduce) return;

    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
      autoRaf: false,
    });
    instance = lenis;
    if (stage.locked) lenis.stop();

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf, false, true);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      instance = null;
    };
  }, []);

  return <>{children}</>;
}
