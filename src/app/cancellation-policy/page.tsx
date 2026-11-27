import type { Metadata } from "next";
import Link from "next/link";
import { getSite } from "@/lib/api";
import { PolicyLayout, type PolicySection } from "@/components/legal/PolicyLayout";

export const metadata: Metadata = {
  title: "Cancellation and refunds",
  description: "How to change or cancel a FlexiGo Stays booking in Shimla, how much of your advance is refunded, and how long refunds take.",
};

// CONFIRM with the client before launch: the refund tiers (section 3), the free date change (section 4)
// and the refund timeline (section 7). These are typical terms for holiday homes in India, not yet approved.
export default async function CancellationPolicyPage() {
  const site = await getSite();
  const tiers = [
    { when: "15 days or more before check-in", refund: "Full advance refunded" },
    { when: "7 to 14 days before check-in", refund: "50% of the advance refunded" },
    { when: "Less than 7 days before check-in, or no-show", refund: "Advance not refunded" },
  ];
  const sections: PolicySection[] = [
    {
      id: "confirming",
      title: "When a booking is confirmed",
      body: (
        <p>
          Sending a request on this website does not book the home. The host first confirms your dates, then your booking is confirmed once you pay the advance of {site.advancePercent}% of the
          total. The rest is paid at or before check-in. Until the advance is paid, the dates are not held for you.
        </p>
      ),
    },
    {
      id: "how-to-cancel",
      title: "How to cancel",
      body: (
        <p>
          Message us on WhatsApp or email <a href={`mailto:${site.email}`}>{site.email}</a> with your name and dates. The time your message reaches us is the time we use to work out your refund,
          and we will reply to confirm the cancellation.
        </p>
      ),
    },
    {
      id: "refunds",
      title: "Refunds when you cancel",
      body: (
        <>
          <div className="overflow-hidden rounded-2xl border border-line">
            <table className="w-full text-left text-sm sm:text-base">
              <caption className="sr-only">Refund of the advance by how early you cancel</caption>
              <thead className="bg-stone text-forest">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">When you cancel</th>
                  <th scope="col" className="px-4 py-3 font-semibold">What you get back</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {tiers.map((t) => (
                  <tr key={t.when}>
                    <td className="px-4 py-3">{t.when}</td>
                    <td className="px-4 py-3 font-medium">{t.refund}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>If any payment-gateway or bank charges apply to the refund, they are deducted from it. Any balance you paid in advance of the stay is always refunded in full.</p>
        </>
      ),
    },
    {
      id: "changing-dates",
      title: "Changing your dates instead",
      body: (
        <p>
          If you tell us at least 7 days before check-in, you can move your stay once, at no charge, to other dates within 6 months, as long as the home is free. If the new dates cost more,
          for example over a holiday weekend, you pay the difference.
        </p>
      ),
    },
    {
      id: "early-departure",
      title: "Leaving early",
      body: <p>Nights you do not use after check-in are not refunded.</p>,
    },
    {
      id: "our-side",
      title: "If we have to cancel",
      body: (
        <>
          <p>If we ever cannot host you, for example because of a serious problem at the home, we will offer you another FlexiGo home for the same dates if one is free, or refund everything you paid.</p>
          <p>
            Shimla&rsquo;s roads sometimes close for snow or landslides. If an official road closure or travel ban stops you reaching the home, tell us as soon as you can and we will move your dates
            at no charge.
          </p>
        </>
      ),
    },
    {
      id: "timeline",
      title: "How long refunds take",
      body: <p>We send refunds within 7 working days of confirming the cancellation, to the account you paid from. Your bank may take a few more days to show it.</p>,
    },
    {
      id: "other-platforms",
      title: "Bookings made on Airbnb",
      body: (
        <p>
          If you booked through Airbnb, Airbnb&rsquo;s cancellation policy for that listing applies instead, and refunds are handled by Airbnb. For everything else about your stay, see our{" "}
          <Link href="/terms">terms of stay</Link>.
        </p>
      ),
    },
  ];

  return (
    <PolicyLayout
      current="cancellation"
      title="Cancellation and refunds"
      intro="Plans change. Here is how to cancel or move a stay, and how much of your advance comes back."
      updated="27 November 2026"
      note="These terms are being finalised with the host. The terms that apply to your stay are stated again when your booking is confirmed."
      sections={sections}
      site={site}
    />
  );
}
