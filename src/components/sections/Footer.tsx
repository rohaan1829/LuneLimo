import { contact } from "@/lib/content";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="relative z-10 overflow-hidden bg-ink px-[clamp(1.25rem,6vw,6rem)] pt-[16vh] pb-10 text-moon">
      <div className="grid gap-10 border-t border-moon/15 pt-10 text-[0.9375rem] sm:grid-cols-3">
        <div>
          <h3 className="text-champagne-deep">Bookings</h3>
          <p className="mt-3 leading-relaxed">
            <a href={contact.phoneHref} className="hover:text-champagne">
              {contact.phone}
            </a>
            <br />
            <a href={`mailto:${contact.email}`} className="hover:text-champagne">
              {contact.email}
            </a>
          </p>
        </div>
        <div>
          <h3 className="text-champagne-deep">Hours</h3>
          <p className="mt-3">{contact.hours}</p>
        </div>
        <div>
          <h3 className="text-champagne-deep">Where we drive</h3>
          <p className="mt-3">{contact.area}</p>
        </div>
      </div>

      {/* The brand wordmark, edge to edge. */}
      <Logo variant="wordmark" className="mt-[12vh] w-full text-champagne" aria-hidden />
      <div className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 text-[0.8125rem] text-moon/40">
        <p>© 2026 Lune Limo. Private chauffeur, day and night.</p>
        {/* Plain anchors, not <Link>: a full load keeps the home page's 3D and scroll state out of these pages. */}
        <ul className="flex gap-6">
          <li>
            <a href="/terms" className="transition-colors duration-300 hover:text-moon">
              Terms and conditions
            </a>
          </li>
          <li>
            <a href="/privacy" className="transition-colors duration-300 hover:text-moon">
              Privacy policy
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
