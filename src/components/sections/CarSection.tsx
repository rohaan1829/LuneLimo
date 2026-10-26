"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { stage } from "@/lib/stage";
import { carChapters } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

// Where each chapter holds, as a share of the section's scroll. Matches the camera beats in CarAct.
const WINDOWS: [number, number][] = [
  [0.04, 0.2],
  [0.26, 0.44],
  [0.48, 0.66],
  [0.7, 0.86],
];

export function CarSection() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const sec = section.current!;
      ScrollTrigger.create({
        trigger: sec,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (st) => void (stage.car = st.progress),
        onLeaveBack: () => void (stage.car = 0),
        onLeave: () => void (stage.car = 1),
      });
      ScrollTrigger.create({
        trigger: sec,
        start: "top bottom",
        end: "bottom top",
        onToggle: (st) => void (stage.view.car = st.isActive),
      });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: true },
      });
      sec.querySelectorAll<HTMLElement>(".chapter").forEach((el, i) => {
        const [a, b] = WINDOWS[i];
        tl.fromTo(el, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.05 }, a).to(
          el,
          { autoAlpha: 0, y: -40, duration: 0.05 },
          b - 0.05,
        );
      });
      tl.fromTo(".chapter-index", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.03 }, 0.03)
        .to(".chapter-index", { autoAlpha: 0, duration: 0.03 }, 0.86)
        .fromTo(".chapter-bar", { scaleY: 0 }, { scaleY: 1, duration: 0.83, transformOrigin: "50% 0%" }, 0.03)
        .set({}, {}, 1);
    },
    { scope: section },
  );

  return (
    <section ref={section} id="car" className="relative h-[620vh]" aria-labelledby="car-title">
      <h2 id="car-title" className="sr-only">
        The car
      </h2>
      <div className="sticky top-0 h-lvh overflow-hidden">
        {/* A soft pool of shade behind the copy so it reads over the car at any angle. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 70% at 0% 100%, rgb(10 10 10 / 0.85) 0%, rgb(10 10 10 / 0.4) 35%, transparent 65%)",
          }}
        />

        {carChapters.map((c) => (
          <article
            key={c.id}
            className="chapter invisible absolute bottom-[clamp(2.5rem,12vh,8rem)] left-[clamp(1.25rem,6vw,6rem)] max-w-[30rem] pr-6"
          >
            <h3 className="font-display text-[clamp(2.4rem,4.4vw,4.4rem)] leading-[0.95] font-light tracking-[-0.015em] text-moon">
              {c.title}
            </h3>
            <p className="mt-5 max-w-[36ch] text-[1.0625rem] leading-relaxed text-moon/70">{c.body}</p>
            {"specs" in c && (
              <dl className="mt-7 grid grid-cols-[auto_1fr] gap-x-8 gap-y-2.5 border-t border-moon/15 pt-5 text-[0.9375rem]">
                {c.specs.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-champagne-deep">{k}</dt>
                    <dd className="text-moon/85">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </article>
        ))}

        {/* Progress through the four chapters. */}
        <div
          className="chapter-index invisible absolute top-1/2 right-[clamp(1.25rem,4vw,3.5rem)] hidden h-40 w-px -translate-y-1/2 bg-moon/15 md:block"
          aria-hidden
        >
          <div className="chapter-bar absolute inset-0 bg-champagne" />
        </div>
      </div>
    </section>
  );
}
