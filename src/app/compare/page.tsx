import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { getHomes } from "@/lib/api";
import { guestTypeLabel, inr } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Compare the properties", description: "White Breeze 2BHK, The Cloud Villa and White Breeze 3BHK side by side: guests, bedrooms, views and prices." };

export default async function ComparePage() {
  const homes = await getHomes();
  const rows: { label: string; value: (h: (typeof homes)[number]) => React.ReactNode }[] = [
    { label: "Guests", value: (h) => `Up to ${h.maxGuests}` },
    { label: "Bedrooms", value: (h) => h.bedrooms },
    { label: "Bathrooms", value: (h) => h.bathrooms },
    { label: "View", value: (h) => h.view ?? "-" },
    { label: "Weeknight price", value: (h) => inr(h.nightlyPrice) },
    { label: "Friday and Saturday", value: (h) => inr(h.weekendPrice) },
    { label: "Minimum stay", value: (h) => `${h.minNights} ${h.minNights === 1 ? "night" : "nights"}` },
    { label: "Good for", value: (h) => h.goodFor.map((g) => guestTypeLabel[g]).join(", ") },
  ];
  const allHighlights = [...new Set(homes.flatMap((h) => h.highlights))];

  return (
    <section className="mx-auto max-w-site px-4 pb-10 pt-24 sm:px-6 lg:px-8 lg:pt-32">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pine-dark">Compare</p>
      <h1 className="mt-3 text-[2rem] sm:text-[2.6rem]">The three properties side by side</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">Swipe the table on a phone to see every property.</p>

      <div className="mt-10 overflow-x-auto rounded-card bg-card shadow-soft">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <caption className="sr-only">Comparison of the three properties</caption>
          <thead>
            <tr>
              <th scope="col" className="w-48 p-5 align-bottom text-sm font-semibold text-muted">Property</th>
              {homes.map((h) => (
                <th key={h.slug} scope="col" className="p-5 align-bottom">
                  <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl">
                    <Image src={h.coverPhoto} alt="" fill sizes="240px" className="object-cover" />
                  </div>
                  <Link href={`/homes/${h.slug}`} className="font-display text-xl text-forest hover:underline">{h.name}</Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-line transition-colors hover:bg-stone/60">
                <th scope="row" className="p-5 text-sm font-semibold text-muted">{r.label}</th>
                {homes.map((h) => <td key={h.slug} className="p-5 text-forest">{r.value(h)}</td>)}
              </tr>
            ))}
            {allHighlights.map((item) => (
              <tr key={item} className="border-t border-line transition-colors hover:bg-stone/60">
                <th scope="row" className="p-5 text-sm font-normal text-muted">{item}</th>
                {homes.map((h) => (
                  <td key={h.slug} className="p-5">
                    {h.highlights.includes(item) ? <Check className="text-pine-dark" aria-label="Yes" /> : <Minus className="text-line" aria-label="No" />}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-line">
              <td className="p-5" />
              {homes.map((h) => (
                <td key={h.slug} className="p-5"><ButtonLink href={`/book?home=${h.slug}`} className="w-full">Check dates</ButtonLink></td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
