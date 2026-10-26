"use client";

import { useRef, type MouseEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { onReveal, stage } from "@/lib/stage";
import { carChapters } from "@/lib/content";
import { scrollToTarget } from "@/components/providers/SmoothScroll";

gsap.registerPlugin(ScrollTrigger, SplitText);

function go(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  scrollToTarget(e.currentTarget.getAttribute("href")!);
}

// Where each chapter holds, as a share of the section's scroll. Matches the camera beats in CarAct.
const WINDOWS: [number, number][] = [
  [0.26, 0.44],
  [0.48, 0.66],
  [0.7, 0.86],
];

/**
 * The opening section: the car is the hero. Its lights come on as the preloader lifts, then
 * scrolling walks the camera around it, chapter by chapter, until it drives off.
 */
export function CarSection() {
  const section = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);

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
      tl.to(".hero-copy", { autoAlpha: 0, y: -60, duration: 0.07 }, 0.03)
        .to(".scroll-cue", { autoAlpha: 0, duration: 0.03 }, 0.01)
        .fromTo(".chapter-index", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.03 }, 0.2)
        .to(".chapter-index", { autoAlpha: 0, duration: 0.03 }, 0.86)
        .fromTo(".chapter-bar", { scaleY: 0 }, { scaleY: 1, duration: 0.66, transformOrigin: "50% 0%" }, 0.2)
        .set({}, {}, 1);

      // Load-in: hold the headline until the curtain lifts, then raise it line by line while the
      // car's lights come on behind it.
      gsap.set(".hero-reveal", { autoAlpha: 0 });
      const stopReveal = onReveal(() => {
        const split = SplitText.create(title.current, { type: "lines", mask: "lines" });
        gsap.set(title.current, { autoAlpha: 1 });
        if (stage.reducedMotion) {
          gsap.set(".hero-reveal", { autoAlpha: 1 });
          return;
        }
        gsap
          .timeline({ delay: 0.9 })
          .from(split.lines, { yPercent: 110, duration: 1.6, ease: "expo.out", stagger: 0.09 })
          .to(".hero-reveal", { autoAlpha: 1, duration: 1.2, ease: "power2.out", stagger: 0.12 }, 0.6);
      });
      return stopReveal;
    },
    { scope: section },
  );

  return (
    <section ref={section} id="car" className="relative h-[620vh]" aria-label="Lune Limo">
      <div className="sticky top-0 h-lvh overflow-hidden">
        {/* A soft pool of shade behind the copy so it reads over the car at any angle. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 70% at 0% 100%, rgb(10 10 10 / 0.85) 0%, rgb(10 10 10 / 0.4) 35%, transparent 65%)",
          }}
        />

        <div className="hero-copy absolute inset-x-0 bottom-0 px-[clamp(1.25rem,6vw,6rem)] pb-[clamp(3rem,11vh,8rem)]">
          <h1
            ref={title}
            className="invisible max-w-[11ch] font-display text-[clamp(3.6rem,9vw,9rem)] leading-[0.88] font-light tracking-[-0.025em] text-moon"
          >
            We’ll be outside.
          </h1>
          <p className="hero-reveal mt-7 max-w-[32ch] text-[clamp(1.05rem,1.3vw,1.25rem)] leading-relaxed text-moon/75">
            Private chauffeurs in Escalades, Suburbans and Yukons, day and night.
          </p>
          <div className="hero-reveal mt-9 flex flex-wrap gap-3">
            <a href="#book" onClick={go} className="btn btn-solid">
              Book a ride
            </a>
            <a href="#ride" onClick={go} className="btn btn-line">
              How it works
            </a>
          </div>
        </div>

        <div
          className="scroll-cue hero-reveal absolute right-[clamp(1.25rem,6vw,6rem)] bottom-[clamp(3rem,11vh,8rem)] hidden flex-col items-center gap-3 md:flex"
          aria-hidden
        >
          <span className="text-[0.75rem] text-moon/50 [writing-mode:vertical-rl]">Scroll</span>
          <span className="relative h-16 w-px overflow-hidden bg-moon/15">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[cue_2.4s_var(--ease-lune)_infinite] bg-champagne" />
          </span>
        </div>

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

        {/* Progress through the chapters. */}
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
