import type { Metadata } from "next";
import { getReviews, getSite } from "@/lib/api";
import { faqs } from "@/lib/content";
import { whatsappLink } from "@/lib/format";
import { Reviews } from "@/components/home/Reviews";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export const metadata: Metadata = { title: "About your host", description: "FlexiGo Stays is run by the Flexigo Holidays team in Shimla. Meet the host, read reviews and FAQs." };

export default async function AboutPage() {
  const [site, reviews] = await Promise.all([getSite(), getReviews()]);
  return (
    <div className="mx-auto max-w-site px-4 pb-10 pt-24 sm:px-6 lg:px-8 lg:pt-32">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pine-dark">About</p>
          <h1 className="mt-3 text-[2rem] sm:text-[2.6rem]">Hosted by people who live in these hills</h1>
          <p className="mt-5 text-lg text-muted">
            FlexiGo Stays is run by the Flexigo Holidays team, who have planned trips across Himachal for more than ten years. {site.hostName ? `${site.hostName} and the team` : "The team"} look after the three properties and stay close by, so help is never far away.
          </p>
          <p className="mt-4 text-lg text-muted">Need a cab, a day trip or a home-cooked meal? Ask, and we will arrange it with trusted local partners.</p>
          <ButtonLink href={whatsappLink(site.whatsappNumber, "Hi, I have a question about FlexiGo Stays.")} variant="whatsapp" className="mt-8"><WhatsAppIcon size={18} /> Message the host</ButtonLink>
        </div>
        <div className="divide-y divide-line self-start border-y border-line">
          {faqs.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-forest">
                {f.q}
                <span className="text-2xl text-pine transition-transform group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="mt-3 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
      <section className="mt-20" aria-labelledby="about-reviews">
        <h2 id="about-reviews" className="text-3xl sm:text-4xl">Guest reviews</h2>
        <div className="mt-6"><Reviews reviews={reviews} /></div>
      </section>
    </div>
  );
}
