import type { Metadata } from "next";
import { ContactDetails, LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { company, smsProgram } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description: "The terms for booking and riding with Lune Limo, including fares, cancellations and text message updates.",
  alternates: { canonical: "/terms" },
};

const governingLaw = company.province
  ? `the laws of the Province of ${company.province}`
  : `the laws of the province in which ${company.legalName} is registered`;

const sections: LegalSection[] = [
  {
    id: "booking",
    title: "Booking a ride",
    body: (
      <>
        <p>
          When you ask for a quote, we reply with a fixed fare for the trip you describe. A booking is confirmed only when we send you a written
          confirmation by email or text. Your confirmation sets out the fare, the pickup time and place, the waiting time included, and the
          cancellation terms for that ride.
        </p>
        <p>
          Please give us accurate details: passenger names, a phone number we can reach you on, pickup and drop-off addresses, flight numbers, and
          how many passengers and bags are travelling. If the trip turns out to be different from the one booked, for example with more
          passengers, extra stops or a new destination, the fare may change.
        </p>
        <p>The person who makes a booking is responsible for paying for it and for making sure their passengers know these terms.</p>
      </>
    ),
  },
  {
    id: "fares",
    title: "Fares and payment",
    body: (
      <>
        <p>
          Your fare is fixed once we confirm it. It covers the vehicle, the chauffeur and the trip described in your confirmation, and your quote
          says whether gratuity, tolls, parking and airport fees are included. Extra charges apply only when the trip changes or something happens
          during it:
        </p>
        <ul>
          <li>waiting beyond the time included in your confirmation</li>
          <li>extra stops, detours or a change of destination you ask for</li>
          <li>extra time on hourly bookings</li>
          <li>tolls, parking and airport fees, where your quote doesn’t already include them</li>
          <li>
            cleaning or repairs after damage caused by a passenger (see <a href="#passengers">Passengers</a>)
          </li>
        </ul>
        <p>
          We’ll tell you how to pay when we confirm your booking. We may keep a card on file to cover the fare and any extra charges. Nothing is
          paid in the car, and you’ll receive an itemized receipt after every ride.
        </p>
      </>
    ),
  },
  {
    id: "cancellations",
    title: "Changes, cancellations and no-shows",
    body: (
      <>
        <p>
          To change a booking, contact us as early as you can. We’ll accommodate changes wherever possible and confirm any change to the fare
          before it applies.
        </p>
        <p>
          You can cancel free of charge up to the deadline in your confirmation. After that, the late cancellation fee in your confirmation
          applies.
        </p>
        <p>
          If no passenger arrives at the pickup by the end of the included waiting time and we can’t reach you by phone or text, we may treat the
          booking as a no-show and charge the full fare.
        </p>
        <p>
          If we have to cancel a ride, for example because severe weather makes the trip unsafe, we’ll tell you as soon as we can and refund
          anything you’ve paid for it.
        </p>
      </>
    ),
  },
  {
    id: "pickups",
    title: "Pickups, waiting and delays",
    body: (
      <>
        <p>
          Your chauffeur will be at the pickup at the confirmed time. Your confirmation says how much waiting time is included; after that, waiting
          is charged at the rate on your quote.
        </p>
        <p>For airport pickups, give us your flight number. We track the flight and plan the pickup around the time it actually lands.</p>
        <p>
          We plan every trip with time to spare, but we can’t control traffic, weather, road closures, accidents, security checks or other events
          outside our control. We aren’t responsible for delays or missed connections they cause, but we’ll keep you informed and do what we
          reasonably can to get you there on time. Please allow enough time for your plans, especially flights.
        </p>
      </>
    ),
  },
  {
    id: "vehicles",
    title: "Vehicles and chauffeurs",
    body: (
      <>
        <p>
          Lune Limo drives black Cadillac Escalades. If the vehicle for your ride becomes unavailable, for example after a breakdown, we may send a
          comparable vehicle or arrange the ride with a licensed partner operator. Where we can, we’ll tell you before the pickup.
        </p>
        <p>
          Our chauffeurs are licensed, and our vehicles insured, as the law requires. Your chauffeur chooses the route, follows any route you ask
          for where it’s safe and legal to do so, and may decline any request that isn’t.
        </p>
      </>
    ),
  },
  {
    id: "passengers",
    title: "Passengers",
    body: (
      <>
        <ul>
          <li>Everyone must wear a seat belt, and we can’t carry more passengers than the vehicle has seats.</li>
          <li>Children must ride in a child safety seat suitable for their age and size, as the law requires. Tell us when you book if you need one.</li>
          <li>No smoking or vaping in the vehicle.</li>
          <li>Alcohol is allowed only where the law permits it, only for passengers of legal drinking age in that province, and at your chauffeur’s discretion.</li>
          <li>Nothing illegal may be carried or used in the vehicle.</li>
          <li>Service animals are always welcome. Tell us when you book if you’d like to bring a pet.</li>
        </ul>
        <p>
          You’re responsible for damage to the vehicle caused by you or your passengers, beyond normal wear. If the vehicle needs cleaning after a
          ride, we’ll charge the cost of cleaning and the time the vehicle is out of service, and show you the charge with photos.
        </p>
        <p>
          Your chauffeur may refuse or end a ride if a passenger is abusive, breaks the law or puts anyone’s safety at risk. The full fare is still
          payable.
        </p>
      </>
    ),
  },
  {
    id: "belongings",
    title: "Luggage and belongings",
    body: (
      <>
        <p>Tell us how many bags you’re bringing so we can make sure they fit. Your chauffeur will load and unload them.</p>
        <p>
          Please check the vehicle before you leave it. If you leave something behind, contact us as soon as you can; we’ll keep it safe for a
          reasonable time and help you get it back. We aren’t responsible for loss of or damage to belongings unless it’s caused by our
          negligence.
        </p>
      </>
    ),
  },
  {
    id: "text-messages",
    title: "Text messages",
    body: (
      <>
        <p>
          <strong>{smsProgram}</strong> is our text message program. If you agree to receive texts, by ticking the box on our booking form or by
          asking us to text you when you book by phone or email, we’ll text the number you give us about your bookings: quotes and confirmations,
          your chauffeur’s name and vehicle, pickup changes, arrival notices, receipts, and replies when you message us.
        </p>
        <ul>
          <li>Message frequency varies with your bookings.</li>
          <li>Message and data rates may apply.</li>
          <li>
            Reply <strong>STOP</strong> at any time to stop receiving texts. We’ll send one message to confirm, and won’t text you again unless you
            opt back in.
          </li>
          <li>
            Reply <strong>HELP</strong> for help, or email <a href={`mailto:${company.email}`}>{company.email}</a>.
          </li>
          <li>Agreeing to texts is not a condition of booking. We can send the same updates by email or phone instead.</li>
          <li>Ride updates don’t include marketing. If we ever offer promotional texts, we’ll ask for your consent to those separately.</li>
          <li>Mobile carriers are not liable for delayed or undelivered messages.</li>
        </ul>
        <p>
          We handle your number as described in our <a href="/privacy#text-messages">privacy policy</a>. We never sell or share your mobile number,
          or your consent to receive texts, with third parties for marketing.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "Our liability",
    body: (
      <>
        <p>We provide every ride with reasonable care and skill. To the extent the law allows:</p>
        <ul>
          <li>we aren’t liable for losses caused by events outside our reasonable control</li>
          <li>we aren’t liable for indirect losses, such as missed flights, meetings, events or business opportunities</li>
          <li>our total liability for any booking is limited to the fare paid for it</li>
        </ul>
        <p>
          Nothing in these terms limits our liability for death or personal injury caused by our negligence, for fraud, or for anything else the
          law doesn’t allow us to limit.
        </p>
      </>
    ),
  },
  {
    id: "website",
    title: "Using this website",
    body: (
      <>
        <p>
          The content of this website, including the Lune Limo name, logo, text, images and 3D scenes, belongs to us or our licensors. You may
          view and share it for personal use, but not copy or reuse it commercially without our permission.
        </p>
        <p>
          A quote requested through the website isn’t a booking until we confirm it. Please don’t misuse the site, for example by submitting false
          requests or interfering with how it works.
        </p>
        <p>
          We work to keep the site accurate and available, but it’s provided as it is, and we can’t guarantee it will always be available or free
          of errors.
        </p>
      </>
    ),
  },
  {
    id: "disputes",
    title: "Governing law and disputes",
    body: (
      <>
        <p>If something goes wrong, contact us first. Most problems can be resolved quickly, and we’ll do our best to put things right.</p>
        <p>
          These terms are governed by {governingLaw} and the federal laws of Canada that apply there. Any dispute we can’t resolve together
          will be handled by the courts of that province, unless the law gives you the right to bring it elsewhere.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <p>
        We may update these terms from time to time and will change the date at the top of this page when we do. The terms that apply to a ride
        are the ones published here when the ride was confirmed.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    body: (
      <>
        <p>For questions about these terms, a booking or a charge:</p>
        <ContactDetails />
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      path="/terms"
      title="Terms and conditions"
      intro={
        <>
          <p>
            These terms are an agreement between you and {company.legalName}
            {company.legalName !== company.brand && <> (“{company.brand}”)</>}, referred to here as “we” and “us”. They apply to every ride you
            book with us, whether by phone, email, text or this website, and to your use of this website.
          </p>
          <p>
            By booking a ride or using the site, you agree to them. Our <a href="/privacy">privacy policy</a> explains how we handle your
            information.
          </p>
        </>
      }
      sections={sections}
    />
  );
}
