"use client";

import { useRef, type MouseEvent } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { onReveal } from "@/lib/stage";
import { scrollToTarget } from "@/components/providers/SmoothScroll";
import { Logo } from "./Logo";

const LINKS = [
  ["#car", "The car"],
  ["#ride", "How it works"],
  ["#day", "Services"],
] as const;

function go(e: MouseEvent<HTMLAnchorElement>) {
  const href = e.currentTarget.getAttribute("href");
  if (!href?.startsWith("#")) return;
  e.preventDefault();
  scrollToTarget(href);
}

export function Header() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.set(root.current, { autoAlpha: 0, y: -12 });
      return onReveal(() => {
        gsap.to(root.current, { autoAlpha: 1, y: 0, duration: 1.2, delay: 0.9, ease: "expo.out" });
      });
    },
    { scope: root },
  );

  return (
    <header
      ref={root}
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-[clamp(1.25rem,4vw,3.5rem)] py-5 text-(--fg)"
    >
      {/* A wash of the current sky colour, so copy scrolling underneath never fights the nav. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 bg-linear-to-b from-(--bg) via-(--bg)/70 to-transparent" aria-hidden />
      <a href="#top" onClick={go} className="flex items-center gap-3" aria-label="Lune Limo, back to top">
        <Logo variant="mark" className="h-8 w-auto text-champagne transition-colors duration-500 [[data-sky=day]_&]:text-ink" aria-hidden />
        <Logo variant="wordmark" className="hidden h-[0.8rem] w-auto text-champagne transition-colors duration-500 sm:block [[data-sky=day]_&]:text-ink" aria-hidden />
      </a>
      <nav aria-label="Main" className="flex items-center gap-8">
        <ul className="hidden items-center gap-8 text-[0.875rem] lg:flex">
          {LINKS.map(([href, label]) => (
            <li key={href}>
              <a href={href} onClick={go} className="opacity-70 transition-opacity duration-300 hover:opacity-100">
                {label}
              </a>
            </li>
          ))}
        </ul>
        <a href="#book" onClick={go} className="btn btn-solid h-11 px-5 text-[0.875rem]">
          Book a ride
        </a>
      </nav>
    </header>
  );
}
