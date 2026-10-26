import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { Footer } from "@/components/sections/Footer";
import { company } from "@/lib/legal";
import { TocLink } from "./TocLink";

export type LegalSection = { id: string; title: string; body: ReactNode };

const DOCS = [
  ["/terms", "Terms"],
  ["/privacy", "Privacy"],
] as const;

/**
 * Shared frame for the terms and the privacy policy: plain, static and fast, with none of the
 * home page's 3D. Links back to the site are plain anchors so the home page always loads fresh.
 */
export function LegalPage({
  path,
  title,
  intro,
  sections,
}: {
  path: (typeof DOCS)[number][0];
  title: string;
  intro: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <>
      <header className="flex items-center justify-between px-[clamp(1.25rem,4vw,3.5rem)] py-5">
        {/* A full load on purpose: the home page's preloader and scroll lock expect a fresh start. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" className="flex items-center gap-3" aria-label="Lune Limo home">
          <Logo variant="mark" className="h-8 w-auto text-champagne" aria-hidden />
          <Logo variant="wordmark" className="hidden h-[0.8rem] w-auto text-champagne sm:block" aria-hidden />
        </a>
        <nav aria-label="Legal">
          <ul className="flex items-center gap-7 text-[0.875rem]">
            {DOCS.map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  aria-current={href === path ? "page" : undefined}
                  className="opacity-60 transition-opacity duration-300 hover:opacity-100 aria-[current=page]:opacity-100"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="px-[clamp(1.25rem,6vw,6rem)] pt-[clamp(4rem,12vh,9rem)]">
        <div className="mx-auto max-w-[76rem]">
          <h1 className="font-display text-[clamp(3rem,7vw,6.5rem)] leading-[0.92] font-light tracking-[-0.02em] text-moon">
            {title}
          </h1>
          <p className="mt-6 text-[0.9375rem] text-moon/50">Last updated {company.updated}</p>

          <div className="mt-[clamp(3rem,9vh,6rem)] grid gap-12 border-t border-moon/15 pt-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-20">
            <nav aria-label="Contents" className="lg:sticky lg:top-10 lg:self-start">
              <h2 className="text-[0.8125rem] text-champagne-deep">Contents</h2>
              <ol className="mt-4 grid gap-2.5 text-[0.875rem] leading-snug">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <TocLink href={`#${s.id}`} className="flex gap-3 text-moon/55 transition-colors duration-300 hover:text-moon">
                      <span className="w-5 shrink-0 text-champagne-deep tabular-nums">{i + 1}</span>
                      {s.title}
                    </TocLink>
                  </li>
                ))}
              </ol>
            </nav>

            <article className="legal max-w-[68ch]">
              <div className="legal-intro text-[clamp(1.125rem,1.4vw,1.3rem)] leading-relaxed text-moon">{intro}</div>
              {sections.map((s, i) => (
                <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`}>
                  <h2 id={`${s.id}-title`}>
                    <span className="legal-num">{i + 1}</span>
                    {s.title}
                  </h2>
                  {s.body}
                </section>
              ))}
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

/** The contact block both documents end with. */
export function ContactDetails() {
  return (
    <p>
      {company.legalName}
      <br />
      {company.address && (
        <>
          {company.address}
          <br />
        </>
      )}
      <a href={`mailto:${company.email}`}>{company.email}</a>
    </p>
  );
}
