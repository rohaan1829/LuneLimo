"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { mix, onReveal } from "@/lib/stage";

gsap.registerPlugin(ScrollTrigger);

const t = (h: number, m = 0) => h * 60 + m;

/* One scroll is one day. Each section owns a stretch of the clock, so the time you see always
   matches the scene: the car at midnight, the airport run at dawn, the day list in daylight. */
const SPANS: [string, number, number][] = [
  ["#car", t(21), t(26)],
  ["#ride", t(28), t(30, 30)],
  ["#day", t(31), t(41)],
  ["#night", t(41, 30), t(44)],
  ["#voices", t(44), t(44, 30)],
  ["#book", t(44, 30), t(44, 59)],
];

const format = (mins: number) => {
  const m = Math.round(mins) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

const isDaytime = (mins: number) => {
  const m = Math.round(mins) % 1440;
  return m >= t(6, 30) && m < t(18, 30);
};

export function ScrollClock() {
  const root = useRef<HTMLDivElement>(null);
  const time = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      let shown = "";
      let day: boolean | null = null;
      const set = (mins: number) => {
        const text = format(mins);
        if (text !== shown) {
          shown = text;
          time.current!.textContent = text;
        }
        const d = isDaytime(mins);
        if (d !== day) {
          day = d;
          root.current!.dataset.phase = d ? "day" : "night";
        }
      };
      set(SPANS[0][1]);

      SPANS.forEach(([selector, from, to]) => {
        // Resolve outside this component's scope: the sections live elsewhere on the page.
        const trigger = document.querySelector(selector);
        if (!trigger) return;
        ScrollTrigger.create({
          trigger,
          start: "top center",
          end: "bottom center",
          onUpdate: (st) => set(mix(from, to, st.progress)),
        });
      });

      gsap.set(root.current, { autoAlpha: 0 });
      return onReveal(() => gsap.to(root.current, { autoAlpha: 1, duration: 1, delay: 1.4 }));
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      data-phase="night"
      className="group fixed right-[clamp(1.25rem,4vw,3.5rem)] bottom-6 z-40 hidden items-center gap-2.5 text-[0.8125rem] text-(--fg) tabular-nums md:flex"
      aria-hidden
    >
      {/* Crescent by night, full disc by day. */}
      <svg viewBox="0 0 16 16" className="size-3.5">
        <circle cx="8" cy="8" r="6.5" fill="currentColor" className="opacity-0 transition-opacity duration-500 group-data-[phase=day]:opacity-100" />
        <path
          d="M10.5 2.1a6.5 6.5 0 1 0 3.4 9.4A5.2 5.2 0 0 1 10.5 2.1Z"
          fill="currentColor"
          className="transition-opacity duration-500 group-data-[phase=day]:opacity-0"
        />
      </svg>
      <span ref={time} className="opacity-70">
        21:00
      </span>
    </div>
  );
}
