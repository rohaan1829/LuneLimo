"use client";

import { useRef, type MouseEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { onReveal, stage } from "@/lib/stage";
import { scrollToTarget } from "@/components/providers/SmoothScroll";
import { LOGO_MOON, LOGO_VIEWBOX, Logo } from "@/components/ui/Logo";

gsap.registerPlugin(ScrollTrigger, SplitText);

function go(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  scrollToTarget(e.currentTarget.getAttribute("href")!);
}

/**
 * Hero → moon phases → logo. The moon itself lives in the WebGL stage; this section supplies the
 * scroll length, the words, and the exact circle on screen the full moon fills behind the logo.
 */
export function Intro() {
  const section = useRef<HTMLElement>(null);
  const sticky = useRef<HTMLDivElement>(null);
  const logo = useRef<SVGSVGElement>(null);
  const title = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const sec = section.current!;

      const measure = () => {
        if (!logo.current || !sticky.current) return;
        const a = logo.current.getBoundingClientRect();
        const b = sticky.current.getBoundingClientRect();
        const s = a.width / LOGO_VIEWBOX.width;
        stage.dock.x = a.left - b.left + LOGO_MOON.cx * s;
        stage.dock.y = a.top - b.top + LOGO_MOON.cy * s;
        stage.dock.r = LOGO_MOON.r * s;
      };
      measure();
      ScrollTrigger.addEventListener("refresh", measure);

      ScrollTrigger.create({
        trigger: sec,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (st) => void (stage.hero = st.progress),
      });
      ScrollTrigger.create({
        trigger: sec,
        start: "top bottom",
        end: "bottom top",
        onToggle: (st) => void (stage.view.intro = st.isActive),
      });

      // The words, scrubbed against the same progress the moon reads.
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: true },
        })
        .to(".hero-copy", { autoAlpha: 0, y: -80, duration: 0.1 }, 0.04)
        .to(".scroll-cue", { autoAlpha: 0, duration: 0.04 }, 0.02)
        .fromTo(".beat-1", { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.2)
        .to(".beat-1", { autoAlpha: 0, y: -50, duration: 0.08 }, 0.38)
        .fromTo(".beat-2", { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.44)
        .to(".beat-2", { autoAlpha: 0, y: -50, duration: 0.08 }, 0.6)
        // The logo builds in black against the full moon, then takes its light as the moon goes out.
        .fromTo(
          ".dock [data-piece]",
          { autoAlpha: 0, yPercent: 24 },
          { autoAlpha: 1, yPercent: 0, duration: 0.05, stagger: 0.004 },
          0.72,
        )
        .fromTo(".dock [data-logo='words']", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.06 }, 0.8)
        .fromTo(".dock svg", { color: "#0a0a0a" }, { color: "#c5b79b", duration: 0.045 }, 0.925)
        .set({}, {}, 1);

      // Load-in: hold the headline until the curtain lifts, then raise it line by line.
      gsap.set(".hero-reveal", { autoAlpha: 0 });
      const stopReveal = onReveal(() => {
        const split = SplitText.create(title.current, { type: "lines", mask: "lines" });
        gsap.set(title.current, { autoAlpha: 1 });
        if (stage.reducedMotion) {
          gsap.set(".hero-reveal", { autoAlpha: 1 });
          return;
        }
        gsap
          .timeline({ delay: 0.55 })
          .from(split.lines, { yPercent: 110, duration: 1.6, ease: "expo.out", stagger: 0.09 })
          .to(".hero-reveal", { autoAlpha: 1, duration: 1.2, ease: "power2.out", stagger: 0.12 }, 0.6);
      });

      return () => {
        stopReveal();
        ScrollTrigger.removeEventListener("refresh", measure);
      };
    },
    { scope: section },
  );

  return (
    <section ref={section} id="top" className="relative h-[360vh]" aria-label="Lune Limo">
      <div ref={sticky} className="sticky top-0 h-lvh overflow-hidden">
        <div className="hero-copy absolute inset-x-0 bottom-0 px-[clamp(1.25rem,6vw,6rem)] pb-[clamp(3rem,11vh,8rem)]">
          <h1
            ref={title}
            className="invisible font-display text-[clamp(3.6rem,10.5vw,10.5rem)] leading-[0.88] font-light tracking-[-0.025em] text-moon"
          >
            We’ll be outside.
          </h1>
          <p className="hero-reveal mt-7 max-w-[30ch] text-[clamp(1.05rem,1.3vw,1.25rem)] leading-relaxed text-moon/75">
            Private chauffeurs in black Cadillac Escalades, day and night.
          </p>
          <div className="hero-reveal mt-9 flex flex-wrap gap-3">
            <a href="#book" onClick={go} className="btn btn-solid">
              Book a ride
            </a>
            <a href="#car" onClick={go} className="btn btn-line">
              See the car
            </a>
          </div>
        </div>

        <div className="scroll-cue hero-reveal absolute right-[clamp(1.25rem,6vw,6rem)] bottom-[clamp(3rem,11vh,8rem)] hidden flex-col items-center gap-3 md:flex" aria-hidden>
          <span className="text-[0.75rem] text-moon/50 [writing-mode:vertical-rl]">Scroll</span>
          <span className="relative h-16 w-px overflow-hidden bg-moon/15">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[cue_2.4s_var(--ease-lune)_infinite] bg-champagne" />
          </span>
        </div>

        <p className="beat-1 invisible absolute inset-x-0 bottom-[14vh] px-6 text-center font-display text-[clamp(2.2rem,5vw,4.6rem)] leading-none font-light text-moon">
          Early flights, late dinners.
        </p>
        <p className="beat-2 invisible absolute inset-x-0 bottom-[14vh] px-6 text-center font-display text-[clamp(2.2rem,5vw,4.6rem)] leading-none font-light text-moon">
          The same standard at any hour.
        </p>

        <div className="dock absolute inset-0 grid place-items-center">
          {/* Lifted by the moon circle's offset below the lockup's centre ((191 - 135) / 400 of the width), so the moon sits mid-screen. */}
          <Logo ref={logo} className="w-[min(34rem,82vw)] -translate-y-[calc(min(34rem,82vw)*0.14)] text-champagne" />
        </div>
      </div>
    </section>
  );
}
