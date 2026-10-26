"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";
import { reveal, stage } from "@/lib/stage";
import { getLenis } from "@/components/providers/SmoothScroll";
import { Logo } from "./Logo";

gsap.registerPlugin(DrawSVGPlugin);

const MIN_MS = 1500;
const MAX_MS = 6000;

/**
 * The one orchestrated load moment: the jacket monogram builds itself and its lapel lines draw in,
 * then the curtain lifts and the car's lights come on. Holds until the 3D stage and fonts are in,
 * so the first frame of the hero is the finished one.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const html = document.documentElement;

      const finish = () => {
        stage.locked = false;
        html.style.overflow = "";
        getLenis()?.start();
        ScrollTrigger.refresh();
        reveal();
      };

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el.style.display = "none";
        stage.intro = 1;
        finish();
        return;
      }

      // The layout and the page can hydrate in either order, so cover both: stop Lenis if it
      // already exists, and set the flag SmoothScroll checks when it creates Lenis later.
      stage.locked = true;
      getLenis()?.stop();
      html.style.overflow = "hidden";

      // The mark ships hidden so the finished logo never flashes before it builds itself.
      gsap.set(".preload-mark", { visibility: "visible" });
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from("[data-piece]:not([data-line])", {
          scaleY: 0,
          transformOrigin: "50% 100%",
          duration: 0.9,
          stagger: 0.035,
        })
        .from("[data-line]", { drawSVG: 0, duration: 1.2, ease: "power2.inOut", stagger: 0.08 }, "-=0.55");

      let fontsReady = false;
      document.fonts.ready.then(() => (fontsReady = true));
      const started = performance.now();

      const leave = () =>
        gsap
          .timeline({ onComplete: () => void (el.style.display = "none") })
          .to(".preload-mark", { autoAlpha: 0, y: -16, duration: 0.5, ease: "power2.in" })
          .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.2, ease: "expo.inOut" }, "-=0.15")
          .add(() => {
            finish();
            // Linear here; CarAct eases each step of the ignition itself.
            gsap.to(stage, { intro: 1, duration: 2.6, ease: "none" });
          }, "-=0.75");

      const check = () => {
        const elapsed = performance.now() - started;
        if ((stage.ready && fontsReady && elapsed > MIN_MS) || elapsed > MAX_MS) {
          gsap.ticker.remove(check);
          leave();
        }
      };
      gsap.ticker.add(check);
      return () => gsap.ticker.remove(check);
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] grid place-items-center bg-ink text-champagne"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      aria-hidden
    >
      <Logo variant="mark" className="preload-mark invisible w-28 md:w-36" />
    </div>
  );
}
