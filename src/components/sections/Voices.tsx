import { voices } from "@/lib/content";

export function Voices() {
  return (
    <section id="voices" className="relative px-[clamp(1.25rem,6vw,6rem)] py-[18vh]" aria-labelledby="voices-title">
      <h2 id="voices-title" className="sr-only">
        What clients say
      </h2>
      <ul className="grid gap-[14vh]">
        {voices.map((v, i) => (
          <li key={v.who} className={i % 2 ? "md:ml-[30%]" : "md:mr-[22%]"}>
            <figure>
              <blockquote className="font-display text-[clamp(1.9rem,3.6vw,3.5rem)] leading-[1.08] font-light text-moon italic">
                “{v.quote}”
              </blockquote>
              <figcaption className="mt-6 text-[0.9375rem] text-champagne-deep">{v.who}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
