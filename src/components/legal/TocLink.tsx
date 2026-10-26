"use client";

import type { MouseEvent, ReactNode } from "react";
import { scrollToTarget } from "@/components/providers/SmoothScroll";

/** Contents link: glides through Lenis instead of jumping, and keeps the URL shareable. */
export function TocLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToTarget(href);
    history.replaceState(null, "", href);
  };
  return (
    <a href={href} onClick={go} className={className}>
      {children}
    </a>
  );
}
