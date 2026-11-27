import type { Metadata } from "next";
import { Suspense } from "react";
import { getHolidays, getHomes, getSite } from "@/lib/api";
import { BookFromSearch } from "./BookFromSearch";

export const metadata: Metadata = { title: "Check availability", description: "See live prices for the three FlexiGo Stays homes and request your dates." };

async function BookContent() {
  const [homes, site, holidays] = await Promise.all([getHomes(), getSite(), getHolidays()]);
  const options = homes.map(({ slug, name, maxGuests, nightlyPrice, minNights, coverPhoto }) => ({ slug, name, maxGuests, nightlyPrice, minNights, coverPhoto }));
  return (
    <Suspense fallback={<p className="text-muted">Loading the booking form...</p>}>
      <BookFromSearch homes={options} whatsappNumber={site.whatsappNumber} holidays={holidays} />
    </Suspense>
  );
}

export default function BookPage() {
  return (
    <section className="mx-auto grid max-w-site gap-12 px-4 pb-10 pt-24 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8 lg:pt-32">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pine-dark">Book direct</p>
        <h1 className="mt-3 text-[2rem] sm:text-[2.6rem]">Choose your dates</h1>
        <p className="mt-4 max-w-xl text-lg text-muted">Pick a home, your dates and the number of guests to see the full price at once. Send a request and the host confirms the dates with you; nothing is charged until then.</p>
        <ol className="mt-10 space-y-6">
          {[
            ["1", "See the total", "Nightly prices, taxes and the advance are shown before you share any details."],
            ["2", "Send a request", "Your name and phone, so the host can confirm the dates with you."],
            ["3", "Confirm with an advance", "Pay the advance shown, and the dates are yours."],
          ].map(([n, t, d]) => (
            <li key={n} className="flex gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-forest font-semibold text-white">{n}</span>
              <span>
                <span className="block text-lg font-semibold text-forest">{t}</span>
                <span className="text-muted">{d}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <Suspense fallback={<p className="text-muted">Loading the booking form...</p>}>
        <BookContent />
      </Suspense>
    </section>
  );
}
