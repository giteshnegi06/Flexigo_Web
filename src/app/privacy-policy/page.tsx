import type { Metadata } from "next";
import Link from "next/link";
import { getSite } from "@/lib/api";
import { PolicyLayout, type PolicySection } from "@/components/legal/PolicyLayout";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What FlexiGo Stays collects when you ask about a stay, why we use it, who sees it, and your rights under India's data protection law.",
};

// Written from what the website actually does: the request form, the database, host emails and WhatsApp links.
// CONFIRM with the client: how long enquiries and stay records are kept (section 5) and the grievance contact (section 8).
export default async function PrivacyPolicyPage() {
  const site = await getSite();
  const sections: PolicySection[] = [
    {
      id: "who-we-are",
      title: "Who we are",
      body: (
        <p>
          FlexiGo Stays runs three holiday homes in Shimla, Himachal Pradesh, and is part of Flexigo Holidays. In this policy, &ldquo;we&rdquo; means FlexiGo Stays. This policy explains how we
          handle personal data you share through this website, on WhatsApp, by phone or email, and when you stay with us.
        </p>
      ),
    },
    {
      id: "what-we-collect",
      title: "What we collect",
      body: (
        <>
          <p>We only collect what we need to answer you and look after your stay:</p>
          <ul>
            <li><strong>When you request dates:</strong> your name, email, phone number, the home, your dates, the number of adults and children, and any message you add.</li>
            <li><strong>When you message or call us:</strong> your number and what you tell us.</li>
            <li><strong>When you check in:</strong> a government photo ID for each adult guest, as the law requires for guest registers. Guests from outside India also share passport and visa details.</li>
            <li><strong>When you use the website:</strong> our server sees your IP address and browser type, briefly, to protect the booking form from spam and abuse.</li>
          </ul>
          <p>We do not use advertising or tracking cookies, and we do not build profiles of visitors.</p>
        </>
      ),
    },
    {
      id: "how-we-use-it",
      title: "How we use it",
      body: (
        <ul>
          <li>To check availability, send you a price and confirm your booking.</li>
          <li>To contact you about your stay: directions, check-in, and anything you ask for.</li>
          <li>To keep the guest records the law requires, and to report foreign guests to the authorities (Form C) where needed.</li>
          <li>To keep the website and our guests safe from fraud and misuse.</li>
        </ul>
      ),
    },
    {
      id: "who-sees-it",
      title: "Who sees your data",
      body: (
        <>
          <p>We never sell your personal data or share it for marketing. It is seen only by:</p>
          <ul>
            <li>The host and the FlexiGo team who manage your booking.</li>
            <li>Service providers that run the website for us: the cloud database that stores requests, and the email service that tells the host about a new request. They may only use it to provide that service.</li>
            <li>WhatsApp (Meta), only if you choose to message us there.</li>
            <li>Police or other authorities, only when the law requires it.</li>
          </ul>
        </>
      ),
    },
    {
      id: "how-long",
      title: "How long we keep it",
      body: (
        <ul>
          <li>Requests that do not turn into a stay are deleted within 12 months.</li>
          <li>Booking and guest-register records are kept for as long as the law requires, then deleted.</li>
          <li>Security logs are kept for a few weeks at most.</li>
        </ul>
      ),
    },
    {
      id: "security",
      title: "Keeping it safe",
      body: (
        <p>
          The website uses an encrypted connection (HTTPS). Requests are stored in a password-protected database that only the host and the FlexiGo team can open, and the admin area needs a
          password. No system is perfectly secure, but if we ever learn of a breach that affects you, we will tell you and the authorities as the law requires.
        </p>
      ),
    },
    {
      id: "your-rights",
      title: "Your rights",
      body: (
        <>
          <p>Under India&rsquo;s Digital Personal Data Protection Act, 2023, you can ask us to:</p>
          <ul>
            <li>Tell you what personal data we hold about you and how we use it.</li>
            <li>Correct or update it.</li>
            <li>Delete it, unless the law requires us to keep it.</li>
            <li>Stop using it, where you gave consent. This does not affect anything we already did.</li>
            <li>Name someone to act for you if you are unable to.</li>
          </ul>
          <p>
            Write to <a href={`mailto:${site.email}`}>{site.email}</a> from the email or phone you used with us. We reply within 7 days.
          </p>
        </>
      ),
    },
    {
      id: "complaints",
      title: "Complaints",
      body: (
        <p>
          If you are unhappy with how we handled your data, write to our grievance contact, {site.hostName || "the host"}, at <a href={`mailto:${site.email}`}>{site.email}</a>. If we cannot resolve it,
          you can complain to the Data Protection Board of India.
        </p>
      ),
    },
    {
      id: "children",
      title: "Children",
      body: <p>Bookings must be made by an adult. We only hold details of children as part of a booking made by their parent or guardian.</p>,
    },
    {
      id: "changes",
      title: "Changes to this policy",
      body: (
        <p>
          We will update this page if the way we handle data changes, and change the date at the top. For booking rules, see our <Link href="/terms">terms of stay</Link>.
        </p>
      ),
    },
  ];

  return (
    <PolicyLayout
      current="privacy"
      title="Privacy policy"
      intro="We ask only for what we need to answer you and host your stay, and we never sell it. Here is exactly what we collect and why."
      updated="27 November 2026"
      sections={sections}
      site={site}
    />
  );
}
