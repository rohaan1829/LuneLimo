"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { clamp } from "@/lib/stage";
import { rideSteps } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

/**
 * The ride as a road. The route is drawn to fit the section, and a top-down Escalade drives it
 * as you scroll, lighting each step as it reaches it.
 */
export function Ride() {
  const wrap = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const track = useRef<SVGPathElement>(null);
  const route = useRef<SVGPathElement>(null);
  const car = useRef<SVGGElement>(null);

  useGSAP(
    () => {
      const w = wrap.current!;
      const path = route.current!;
      const steps = Array.from(w.querySelectorAll<HTMLElement>(".step"));
      let length = 0;
      let stepY: number[] = [];

      const build = () => {
        const W = w.offsetWidth;
        const H = w.offsetHeight;
        const narrow = W < 768;
        const lane = narrow ? 26 : W * 0.25;
        const swing = narrow ? 12 : W * 0.085;
        let d = `M ${lane} 0`;
        steps.forEach((_, i) => {
          const y0 = (H * i) / steps.length;
          const y1 = (H * (i + 1)) / steps.length;
          const x = lane + (i % 2 ? -swing : swing);
          d += ` C ${x} ${y0 + (y1 - y0) * 0.33}, ${x} ${y0 + (y1 - y0) * 0.67}, ${lane} ${y1}`;
        });
        svg.current!.setAttribute("viewBox", `0 0 ${W} ${H}`);
        track.current!.setAttribute("d", d);
        path.setAttribute("d", d);
        length = path.getTotalLength();
        path.style.strokeDasharray = `${length} ${length}`;
        stepY = steps.map((el) => el.offsetTop);
      };

      const place = (p: number) => {
        const at = length * p;
        const a = path.getPointAtLength(Math.max(0, Math.min(at, length - 2)));
        const b = path.getPointAtLength(Math.max(2, Math.min(at + 2, length)));
        const pt = path.getPointAtLength(at);
        const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
        car.current!.setAttribute("transform", `translate(${pt.x} ${pt.y}) rotate(${angle - 90})`);
        path.style.strokeDashoffset = `${length - at}`;
        steps.forEach((el, i) => {
          const k = clamp((pt.y - stepY[i] + 140) / 140);
          el.style.opacity = String(0.2 + 0.8 * k);
        });
      };

      build();
      place(0);
      ScrollTrigger.create({
        trigger: w,
        start: "top 62%",
        end: "bottom 62%",
        onUpdate: (st) => place(st.progress),
        onRefresh: (st) => {
          build();
          place(st.progress);
        },
      });
    },
    { scope: wrap },
  );

  return (
    <section id="ride" className="relative px-[clamp(1.25rem,6vw,6rem)] pt-[22vh] pb-[18vh]" aria-labelledby="ride-title">
      <div className="grid gap-8 md:grid-cols-[1fr_minmax(0,26rem)] md:items-end">
        <h2 id="ride-title" className="font-display text-[clamp(3rem,7vw,7rem)] leading-[0.9] font-light tracking-[-0.02em]">
          How a ride goes
        </h2>
        <p className="max-w-[40ch] text-[1.0625rem] leading-relaxed text-(--fg-dim)">
          Take an early flight. This is everything that happens between booking and the terminal doors.
        </p>
      </div>

      <div ref={wrap} className="relative mt-[14vh]">
        <svg ref={svg} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <defs>
            <linearGradient id="ride-beam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f2f5ff" stopOpacity="0.45" />
              <stop offset="1" stopColor="#f2f5ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path ref={track} fill="none" style={{ stroke: "var(--fg)" }} strokeOpacity="0.16" strokeWidth="1" strokeDasharray="2 8" />
          <path ref={route} fill="none" style={{ stroke: "var(--accent)" }} strokeWidth="1.5" strokeLinecap="round" />
          {/* Top-down Escalade, nose pointing along +y. */}
          <g ref={car}>
            <path d="M -6 23 L -30 130 L 30 130 L 6 23 Z" fill="url(#ride-beam)" />
            <rect x="-11" y="-25" width="22" height="49" rx="5" style={{ fill: "var(--accent)" }} />
            <rect x="-8.5" y="4" width="17" height="10" rx="2" fill="#0a0a0a" fillOpacity="0.8" />
            <rect x="-8.5" y="-21" width="17" height="6" rx="2" fill="#0a0a0a" fillOpacity="0.8" />
            <rect x="-9" y="-12.5" width="18" height="14" rx="2" fill="#0a0a0a" fillOpacity="0.22" />
            <rect x="-9" y="22" width="5" height="1.6" rx="0.8" fill="#f2f5ff" />
            <rect x="4" y="22" width="5" height="1.6" rx="0.8" fill="#f2f5ff" />
          </g>
        </svg>

        <ol className="relative">
          {rideSteps.map((s, i) => (
            <li
              key={s.when}
              className={`step pl-18 opacity-20 md:pl-[46%] ${i === rideSteps.length - 1 ? "min-h-[28vh]" : "min-h-[46vh]"}`}
            >
              <p className="font-display text-[clamp(1.7rem,2.8vw,2.6rem)] leading-none font-light">{s.when}</p>
              <h3 className="mt-4 text-[1.1875rem] font-medium">{s.title}</h3>
              <p className="mt-2 max-w-[42ch] leading-relaxed text-(--fg-dim)">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
