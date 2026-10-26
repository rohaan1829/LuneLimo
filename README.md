# Lune Limo

Pitch site for Lune Limo, a private chauffeur service running a fleet of black Cadillac Escalades.

The page plays as one night drive. A real moon (NASA lunar maps, custom shader) changes phase as you scroll, then settles full behind the logo, which builds in front of it as a silhouette and turns champagne as the moon goes out; an Escalade comes out of the dark lights-first; a top-down car drives the "how a ride goes" road into dawn; the sky turns champagne for the day services and back to night for the evening ones. A small clock in the corner runs through 24 hours over one scroll.

## Run it

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # static prerender
```

## Stack

- Next.js 16 (App Router, Turbopack), React 19, Tailwind 4
- three.js + @react-three/fiber + drei for the WebGL stage
- GSAP ScrollTrigger + SplitText for scroll choreography, Lenis for smooth scroll

## How the smoothness works

- **One clock.** Lenis, ScrollTrigger and the WebGL render all run off the GSAP ticker, in that order, in a single `requestAnimationFrame`. The 3D scene and the DOM always draw the same scroll position. See `SmoothScroll.tsx` and `Driver` in `Stage.tsx`.
- **No React work while scrolling.** Sections write progress into a plain object (`src/lib/stage.ts`); the scene reads it in `useFrame`. Scrolling never triggers a re-render.
- **One fixed canvas.** The moon and the car are acts on the same stage. When neither has anything on screen the canvas fades out and rendering stops entirely.
- **Sticky, not pinned.** Long sections use `position: sticky` rather than ScrollTrigger pin-spacers, so nothing is re-parented mid-scroll.
- **Lazy 3D.** three.js ships in its own chunk (`StageLoader.tsx`), behind the preloader; the HTML is fully static and prerendered.
- **Adaptive quality.** DPR is capped (1.75 desktop, 1.5 mobile) and drops further if `PerformanceMonitor` sees frame drops; mobile skips the wet-road reflection and halves the stars.
- **Reduced motion.** No smooth scroll, no preloader, no intro animation; content and scenes still respond to scroll position.

## Where things live

| Path | What |
| --- | --- |
| `src/lib/content.ts` | All copy and contact details. Anything marked `CONFIRM` needs checking with the client. |
| `src/lib/stage.ts` | Shared scroll state and easing helpers. |
| `src/components/stage/MoonAct.tsx` | Moon shader, phases, logo docking, stars. |
| `src/components/ui/Logo.tsx` | The A5S lockup. Mark geometry from the brand SVG; wordmark outlined from the print PNG. |
| `src/components/stage/CarAct.tsx` | Car camera path, lighting, wet ground. |
| `src/components/stage/Escalade.tsx` | Stand-in Escalade model and its light rig. |
| `src/components/sections/*` | Page sections; each owns its ScrollTriggers. |
| `src/app/terms`, `src/app/privacy` | Terms and conditions, privacy policy. Static, no 3D. |
| `src/lib/legal.ts` | Legal name, province, address and "last updated" date used by both legal pages. |
| `public/textures/` | NASA LROC albedo and LOLA elevation maps (public domain). |

## Open items for the client

1. **The car.** `Escalade.tsx` is a hand-built stand-in from real Escalade dimensions, tuned for night lighting. For the final site, replace it with a licensed, Draco-compressed GLB of the current Escalade, or footage of the client's own cars. The camera path and light timings in `CarAct.tsx` stay as they are.
2. **Brand book.** Colours (`#C5B79B` champagne, `#0A0A0A`) and type (Cormorant Garamond, Inter) are taken from the logo files. Check them against the brand book.
3. **Copy.** Phone, email, service area, vehicle specs, the ride timeline and testimonials in `content.ts` are working copy.
4. **Bookings.** `src/app/actions.ts` validates the quote form and logs it. Connect it to the client's inbox or dispatch system.
5. **Legal pages.** `/terms` and `/privacy` were drafted for toll-free number verification and include the text-message terms carriers check for. They're written for a Canadian business (PIPEDA, provincial law). Fill in the legal name, province and address in `src/lib/legal.ts` (the name must match the verification application), and have a lawyer review both pages before launch. The booking form has an optional, unticked text-message opt-in; the consent is logged with each request in `src/app/actions.ts` and should be stored once bookings are connected.
