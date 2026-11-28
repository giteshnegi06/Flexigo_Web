import type { Metadata } from "next";
import Link from "next/link";
import { getSite } from "@/lib/api";
import { PolicyLayout, type PolicySection } from "@/components/legal/PolicyLayout";

export const metadata: Metadata = {
  title: "Terms of stay",
  description: "Booking, payment, check-in, house rules and other terms for staying at FlexiGo Stays properties in Shimla.",
};

// CONFIRM with the client before launch: quiet hours, smoking, pets and visitors (section 5), and the security deposit (section 6).
export default async function TermsPage() {
  const site = await getSite();
  const sections: PolicySection[] = [
    {
      id: "about",
      title: "About these terms",
      body: (
        <p>
          These terms apply to stays at FlexiGo Stays properties in Shimla booked through this website, on WhatsApp, by phone or by email. By confirming a booking, the guest who books agrees to them
          for everyone in their group. Stays booked on Airbnb follow Airbnb&rsquo;s terms as well as the house rules below.
        </p>
      ),
    },
    {
      id: "booking",
      title: "Booking and payment",
      body: (
        <ul>
          <li>Prices are for the whole property, per night, in Indian rupees. Weekend and holiday nights can cost more.</li>
          <li>Taxes ({site.taxPercent}% at present) are shown separately before you send a request.</li>
          <li>A request is not a booking. The host confirms the dates, and the booking is confirmed when the advance of {site.advancePercent}% is paid.</li>
          <li>The rest of the total is paid at or before check-in.</li>
          <li>
            Cancelling or changing dates is covered by our <Link href="/cancellation-policy">cancellation and refund policy</Link>.
          </li>
        </ul>
      ),
    },
    {
      id: "check-in",
      title: "Check-in and check-out",
      body: (
        <ul>
          <li>Check-in and check-out times are shown on each property&rsquo;s page. Early check-in or late check-out is possible when the property is free; just ask.</li>
          <li>Every adult guest shows a valid government photo ID at check-in. Guests from outside India show a passport and visa.</li>
          <li>The host may refuse entry if ID is not shown, or if more guests arrive than were booked.</li>
        </ul>
      ),
    },
    {
      id: "guests",
      title: "Guests and visitors",
      body: (
        <ul>
          <li>Each property has a maximum number of guests, shown on its page. Only booked guests may stay overnight.</li>
          <li>Day visitors are welcome with the host&rsquo;s permission, within the community&rsquo;s visitor rules.</li>
          <li>Children must be supervised by an adult at all times, especially on balconies, the terrace and stairs.</li>
        </ul>
      ),
    },
    {
      id: "house-rules",
      title: "House rules",
      body: (
        <>
          <p>The properties are in a quiet gated community, and neighbours live next door. Please:</p>
          <ul>
            <li>Keep noise down between 10 pm and 7 am.</li>
            <li>Do not smoke indoors. Balconies and the terrace are fine.</li>
            <li>Ask before bringing pets or planning a party or event.</li>
            <li>Follow the community&rsquo;s rules for parking, the lift and shared spaces.</li>
            <li>Switch off heaters, lights and taps when you go out.</li>
          </ul>
        </>
      ),
    },
    {
      id: "damage",
      title: "Damage and deposit",
      body: (
        <p>
          Please treat the property as you would your own. Guests pay for damage or missing items beyond normal wear and tear. For some stays the host may ask for a refundable security deposit; if
          so, the amount is told to you before you pay the advance, and it is returned after check-out once the property has been checked.
        </p>
      ),
    },
    {
      id: "amenities",
      title: "Amenities and services",
      body: (
        <p>
          We keep Wi-Fi, hot water and power backup running, but we are not responsible for outages caused by the electricity board, the internet provider or the weather. Meals by the cook,
          airport or station pickups and sightseeing are arranged on request and charged separately.
        </p>
      ),
    },
    {
      id: "liability",
      title: "Your belongings and safety",
      body: (
        <p>
          Please keep valuables with you or locked away; we cannot be responsible for loss or damage to guests&rsquo; belongings. Use the balconies, terrace and stairs with care, and follow any
          safety notices in the property.
        </p>
      ),
    },
    {
      id: "privacy",
      title: "Your personal data",
      body: (
        <p>
          How we handle your details is explained in our <Link href="/privacy-policy">privacy policy</Link>.
        </p>
      ),
    },
    {
      id: "law",
      title: "Changes and governing law",
      body: (
        <p>
          We may update these terms; the version on this page when you confirm your booking applies to your stay. These terms are governed by the laws of India, and the courts at Shimla,
          Himachal Pradesh have jurisdiction.
        </p>
      ),
    },
  ];

  return (
    <PolicyLayout
      current="terms"
      title="Terms of stay"
      intro="The simple rules for booking and staying at our properties, so every guest and every neighbour has a good time."
      updated="27 November 2026"
      note="These terms are being finalised with the host. The terms that apply to your stay are stated again when your booking is confirmed."
      sections={sections}
      site={site}
    />
  );
}
