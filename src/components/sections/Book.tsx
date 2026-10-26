"use client";

import { useActionState, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { requestQuote, type QuoteState } from "@/app/actions";
import { stage } from "@/lib/stage";
import { contact } from "@/lib/content";
import { company } from "@/lib/legal";

const initial: QuoteState = { status: "idle" };

type FieldProps = {
  name: string;
  label: string;
  state: QuoteState;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

function Field({ name, label, state, className, ...input }: FieldProps) {
  const invalid = state.status === "error" && state.missing.includes(name);
  const value = state.status === "error" ? state.values[name] : undefined;
  return (
    <div className={`field ${className ?? ""}`}>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} defaultValue={value} aria-invalid={invalid || undefined} {...input} />
    </div>
  );
}

export function Book() {
  const section = useRef<HTMLElement>(null);
  const [state, action, pending] = useActionState(requestQuote, initial);

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: section.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (st) => void (stage.book = st.progress),
        onToggle: (st) => void (stage.view.book = st.isActive),
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} id="book" className="relative px-[clamp(1.25rem,6vw,6rem)] py-[20vh]" aria-labelledby="book-title">
      <div className="max-w-[34rem] rounded-[1.5rem] bg-ink/70 p-6 backdrop-blur-md md:bg-transparent md:p-0 md:backdrop-blur-none">
        <h2 id="book-title" className="font-display text-[clamp(2.8rem,5.4vw,5.2rem)] leading-[0.92] font-light tracking-[-0.02em] text-moon">
          Where are we taking you?
        </h2>
        <p className="mt-5 max-w-[38ch] leading-relaxed text-moon/70">
          Tell us the trip and we’ll reply with a fixed fare. No account needed.
        </p>

        {state.status === "sent" ? (
          <div className="mt-12 border-t border-champagne/40 pt-8" role="status">
            <p className="font-display text-[2.2rem] leading-tight text-moon">Request sent.</p>
            <p className="mt-3 max-w-[38ch] leading-relaxed text-moon/70">
              Thanks, {state.name}. We’ll confirm your fare and your chauffeur’s details shortly.
            </p>
          </div>
        ) : (
          <form action={action} className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8" noValidate>
            <Field name="pickup" label="Pickup" placeholder="Address, hotel or airport" autoComplete="street-address" state={state} className="col-span-2" />
            <Field name="dropoff" label="Destination" placeholder="Address, hotel or airport" state={state} className="col-span-2" />
            <Field name="date" label="Date" type="date" state={state} />
            <Field name="time" label="Time" type="time" state={state} />
            <div className="field">
              <label htmlFor="passengers">Passengers</label>
              <select id="passengers" name="passengers" defaultValue="1">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n} className="bg-ink">
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <Field name="name" label="Your name" autoComplete="name" state={state} />
            <Field name="contact" label="Phone or email" autoComplete="email" state={state} className="col-span-2" />

            {/* Wording follows carrier rules for toll-free text verification. Keep it in step with /terms#text-messages. */}
            <div className="check col-span-2">
              <input
                id="smsConsent"
                name="smsConsent"
                type="checkbox"
                value="yes"
                defaultChecked={state.status === "error" && state.values.smsConsent === "yes"}
              />
              <label htmlFor="smsConsent">
                Text me about this booking: confirmations, chauffeur details and pickup updates from {company.brand}. Message frequency varies.
                Message and data rates may apply. Reply STOP to opt out, HELP for help. Not required to book. See our{" "}
                <a href="/terms#text-messages">terms</a> and <a href="/privacy">privacy policy</a>.
              </label>
            </div>

            {state.status === "error" && (
              <p className="col-span-2 -mt-2 text-[0.9375rem] text-[#e3a493]" role="alert">
                {state.message}
              </p>
            )}

            <div className="col-span-2 flex flex-wrap items-center gap-x-8 gap-y-4 pt-2">
              <button type="submit" className="btn btn-solid" disabled={pending}>
                {pending ? "Sending request…" : "Request a quote"}
              </button>
              <p className="text-[0.9375rem] text-moon/60">
                Or call{" "}
                <a href={contact.phoneHref} className="text-moon underline decoration-champagne/50 underline-offset-4">
                  {contact.phone}
                </a>
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
