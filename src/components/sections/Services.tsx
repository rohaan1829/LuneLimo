"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { stage } from "@/lib/stage";
import { dayServices, nightServices } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

const INK = "#0a0a0a";
const CHAMPAGNE = "#c5b79b";

function ServiceList({ items }: { items: readonly (readonly [string, string])[] }) {
  return (
    <ul className="mt-[10vh] border-b border-(--fg)/15">
      {items.map(([name, line]) => (
        <li
          key={name}
          className="grid gap-3 border-t border-(--fg)/15 py-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-baseline md:gap-12 md:py-10"
        >
          <h3 className="font-display text-[clamp(2rem,3.8vw,3.6rem)] leading-none font-light tracking-[-0.01em]">{name}</h3>
          <p className="max-w-[44ch] text-[1.0625rem] leading-relaxed text-(--fg-dim)">{line}</p>
        </li>
      ))}
    </ul>
  );
}

/**
 * By day / by night. The page's sky turns to champagne for the day list and back to ink for
 * the night list, and the moon rises again as it does.
 */
export function Services() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const html = document.documentElement;

      // Dawn, at the end of the ride.
      gsap.fromTo(
        html,
        { "--bg": INK },
        {
          "--bg": CHAMPAGNE,
          ease: "none",
          scrollTrigger: { trigger: "#day", start: "top 120%", end: "top 35%", scrub: true },
        },
      );
      // Dusk, between the two lists.
      gsap.fromTo(
        html,
        { "--bg": CHAMPAGNE },
        {
          "--bg": INK,
          ease: "none",
          immediateRender: false,
          scrollTrigger: { trigger: "#night", start: "top 90%", end: "top 25%", scrub: true },
        },
      );
      // Text flips colour as the sky passes its midpoint.
      ScrollTrigger.create({
        trigger: "#day",
        start: "top 78%",
        endTrigger: "#night",
        end: "top 58%",
        onToggle: (st) => {
          if (st.isActive) html.dataset.sky = "day";
          else delete html.dataset.sky;
        },
      });

      ScrollTrigger.create({
        trigger: "#night",
        start: "top bottom",
        end: "bottom top",
        onUpdate: (st) => void (stage.night = st.progress),
        onToggle: (st) => void (stage.view.night = st.isActive),
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <section id="day" className="relative px-[clamp(1.25rem,6vw,6rem)] pt-[26vh] pb-[20vh]" aria-labelledby="day-title">
        <div className="grid gap-6 md:grid-cols-[1fr_minmax(0,24rem)] md:items-end">
          <h2 id="day-title" className="font-display text-[clamp(4.5rem,15vw,15rem)] leading-[0.8] font-light tracking-[-0.03em]">
            By day
          </h2>
          <p className="max-w-[36ch] pb-[1.2vw] text-[1.0625rem] leading-relaxed text-(--fg-dim)">
            Flights, meetings and the occasional wedding. Booked ahead, or the same morning.
          </p>
        </div>
        <ServiceList items={dayServices} />
      </section>

      <section id="night" className="relative px-[clamp(1.25rem,6vw,6rem)] pt-[34vh] pb-[24vh]" aria-labelledby="night-title">
        <div className="grid gap-6 md:grid-cols-[1fr_minmax(0,24rem)] md:items-end">
          <h2 id="night-title" className="font-display text-[clamp(4.5rem,15vw,15rem)] leading-[0.8] font-light tracking-[-0.03em]">
            By night
          </h2>
          <p className="max-w-[36ch] pb-[1.2vw] text-[1.0625rem] leading-relaxed text-(--fg-dim)">
            Dinners, galas and flights that land after midnight. We stay up so you don’t have to plan around us.
          </p>
        </div>
        <ServiceList items={nightServices} />
      </section>
    </div>
  );
}
