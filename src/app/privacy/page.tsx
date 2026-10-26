import type { Metadata } from "next";
import { ContactDetails, LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { company } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What personal information Lune Limo collects, how we use it, who we share it with, and the choices you have.",
  alternates: { canonical: "/privacy" },
};

const sections: LegalSection[] = [
  {
    id: "collect",
    title: "What we collect",
    body: (
      <>
        <h3>Information you give us</h3>
        <ul>
          <li>Contact details: your name, phone number and email address.</li>
          <li>
            Trip details: pickup and drop-off addresses, dates and times, flight numbers, the number of passengers and bags, and passenger names if
            you book for someone else.
          </li>
          <li>Requests and preferences, such as a child seat, the cabin temperature, or accessibility needs you choose to tell us about.</li>
          <li>Billing details needed to charge for your rides. Card payments are handled by our payment processor.</li>
          <li>Messages: the emails, texts, calls and form requests you send us.</li>
        </ul>
        <h3>Information from your rides</h3>
        <p>Trip records: when and where you were picked up and dropped off, the route, waiting time, any extras, and what you were charged.</p>
        <h3>Information from this website</h3>
        <p>
          When you visit, our hosting provider automatically logs technical information such as your IP address, browser type, the pages you
          request and when. We use it only to keep the site secure and working.
        </p>
        <p>
          This website doesn’t use analytics, advertising or tracking cookies. If that changes, we’ll update this policy before it does.
        </p>
      </>
    ),
  },
  {
    id: "use",
    title: "How we use it",
    body: (
      <ul>
        <li>To quote, book and provide your rides, including giving your chauffeur the pickup details.</li>
        <li>To keep you updated with confirmations, chauffeur details, pickup changes and receipts, by email, phone or text.</li>
        <li>To track your flight and plan the pickup around the time it actually lands.</li>
        <li>To bill you and keep accounting records.</li>
        <li>To answer questions, return lost property and resolve complaints.</li>
        <li>To keep passengers, chauffeurs and vehicles safe, prevent fraud, and meet our legal obligations.</li>
        <li>To improve our service, for example by reviewing feedback on how a trip went.</li>
        <li>To send you news or offers by email, only if you’ve agreed to it. Every one includes a link to unsubscribe.</li>
      </ul>
    ),
  },
  {
    id: "text-messages",
    title: "Text messages",
    body: (
      <>
        <p>
          If you agree to receive texts, we use your mobile number to send ride updates as described in the{" "}
          <a href="/terms#text-messages">text message terms</a>. You can stop them at any time by replying STOP, or reply HELP for help.
        </p>
        <p>
          <strong>
            No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. We do not sell or share
            your mobile number, or your consent to receive text messages, with anyone for their marketing.
          </strong>
        </p>
      </>
    ),
  },
  {
    id: "share",
    title: "Who we share it with",
    body: (
      <>
        <p>We share personal information only as needed to provide your rides and run our business:</p>
        <ul>
          <li>
            Partner operators: if a licensed partner carries out your ride (see <a href="/terms#vehicles">Vehicles and chauffeurs</a>), we give
            them the trip details and passenger name they need.
          </li>
          <li>
            Service providers who work for us, such as website hosting, email and text message delivery, booking and dispatch software, payment
            processing and accounting. They may use your information only to provide those services to us.
          </li>
          <li>Authorities or others, when the law requires it or when it’s needed to protect someone’s safety or our legal rights.</li>
          <li>A buyer or successor, if our business is sold or merged, who must protect your information as this policy does.</li>
        </ul>
        <p>
          Some of these service providers are outside Canada, including in the United States, so your information may be stored or processed
          there and may be accessible to authorities under the laws of those countries.
        </p>
        <p>We do not sell your personal information or share it for targeted advertising.</p>
        <p>
          All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third
          parties.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <p>
        We keep booking and billing records for as long as we need them to provide our service and to meet tax, accounting and legal requirements.
        Website logs are kept for a short time. When we no longer need information, we delete it or make it anonymous.
      </p>
    ),
  },
  {
    id: "security",
    title: "How we protect it",
    body: (
      <p>
        We protect your information with safeguards suited to how sensitive it is, including encrypted connections to this website, access
        limited to the staff and chauffeurs who need it, and service providers held to the same standard. No system is completely secure. If a
        breach creates a real risk of significant harm to you, we’ll tell you and the Privacy Commissioner of Canada, as the law requires. If you
        think your information has been exposed, contact us straight away.
      </p>
    ),
  },
  {
    id: "rights",
    title: "Your choices and rights",
    body: (
      <>
        <p>
          We collect, use and share your information with your consent, which you give when you book or contact us, except where the law allows
          otherwise. You can ask us to:
        </p>
        <ul>
          <li>tell you what personal information we hold about you, how we’ve used it and who we’ve shared it with, and give you a copy</li>
          <li>correct anything that’s wrong</li>
          <li>
            withdraw your consent or delete your information, unless we need to keep it for legal or accounting reasons. Without the details a ride
            needs, we may not be able to provide it.
          </li>
        </ul>
        <p>
          You can stop texts at any time by replying STOP, and unsubscribe from emails with the link in any of them. If you live in Quebec, you
          have further rights under Quebec’s privacy law, including receiving your information in a commonly used format.
        </p>
        <p>
          To make a request, email <a href={`mailto:${company.email}`}>{company.email}</a>. We may need to confirm your identity first, and we’ll
          respond within 30 days. If you’re not satisfied with our answer, you can complain to the{" "}
          <a href="https://www.priv.gc.ca">Office of the Privacy Commissioner of Canada</a> or your provincial privacy commissioner.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p>
        Rides are booked by adults. Children can travel with us when an adult books for them, but we don’t knowingly collect personal information
        online from children under 13. If you think a child has sent us their information, contact us and we’ll delete it.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        If we change how we handle personal information, we’ll update this policy and the date at the top of this page. If a change is
        significant, we’ll make it clear here before it takes effect.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    body: (
      <>
        <p>
          The person responsible for privacy at {company.brand} can be reached here, for questions about this policy or your information:
        </p>
        <ContactDetails />
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      path="/privacy"
      title="Privacy policy"
      intro={
        <>
          <p>
            This policy explains what personal information {company.legalName}
            {company.legalName !== company.brand && <> (“{company.brand}”)</>} collects when you book a ride, use this website or contact us,
            how we use it, and the choices you have.
          </p>
          <p>
            In short: we collect what we need to get you where you’re going, we don’t sell it, and we never share your phone number or your
            consent to receive texts for marketing.
          </p>
        </>
      }
      sections={sections}
    />
  );
}
