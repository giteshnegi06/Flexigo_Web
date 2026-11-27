import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, ShieldCheck, Wifi, Zap } from "lucide-react";
import { getHolidays, getHomes, getImages, getPlaces, getReviews, getSite } from "@/lib/api";
import { faqs, seasons, stayTypes } from "@/lib/content";
import { Collection } from "@/components/home/Collection";
import { whatsappLink } from "@/lib/format";
import { Hero } from "@/components/home/Hero";
import { HomeCard } from "@/components/home/HomeCard";
import { DayStory } from "@/components/home/DayStory";
import { TestimonialsSection } from "@/components/ui/testimonials-6";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { IconCircle } from "@/components/ui/IconCircle";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

const reviewRole: Record<string, string> = { family: "Family stay", couple: "Couple's stay", workation: "Workation", friends: "Trip with friends", general: "Guest" };

export default async function HomePage() {
  const [homes, reviews, site, places, holidays, images] = await Promise.all([getHomes(), getReviews(), getSite(), getPlaces(), getHolidays(), getImages()]);

  return (
    <>
      <Hero
        homes={homes.map(({ slug, name, maxGuests, nightlyPrice, minNights, coverPhoto }) => ({ slug, name, maxGuests, nightlyPrice, minNights, coverPhoto }))}
        holidays={holidays}
        whatsappNumber={site.whatsappNumber}
        heroImage={images.hero}
      />

      <section aria-label="Why guests choose us" className="border-b border-line bg-stone">
        <ul className="mx-auto grid max-w-site grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { icon: ShieldCheck, t: "Gated community", d: "Reception, lift and parking" },
            { icon: Zap, t: "Power backup", d: "Heaters and Wi-Fi stay on" },
            { icon: Wifi, t: "Workation ready", d: "Desks and fast Wi-Fi" },
            { icon: WhatsAppIcon, t: `Host ${site.hostName || "nearby"}`, d: "Quick replies on WhatsApp" },
          ].map(({ icon: Icon, t, d }) => (
            <li key={t} data-reveal className="flex items-start gap-3">
              <IconCircle icon={Icon} size={44} />
              <span>
                <span className="block font-semibold text-forest">{t}</span>
                <span className="text-sm text-muted">{d}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-site px-4 pt-20 sm:px-6 lg:px-8 lg:pt-28" aria-labelledby="collection-title">
        <SectionHeading eyebrow="The FlexiGo collection" title="Three homes, one host, all of Shimla" id="collection-title">
          Browse each home, then plan your days with our Shimla guide and the Flexigo Holidays team.
        </SectionHeading>
        <div className="mt-10">
          <Collection
            items={[
              ...homes.map((h) => ({
                key: h.slug,
                title: h.name,
                badge: `Up to ${h.maxGuests} guests · ${h.bedrooms} bedrooms`,
                badgeIcon: "guests" as const,
                points: h.highlights.slice(0, 4),
                image: h.coverPhoto,
                href: `/homes/${h.slug}`,
              })),
              {
                key: "guide",
                title: "Shimla guide",
                badge: "Plan your days",
                badgeIcon: "guide",
                points: places.slice(0, 4).map((p) => p.name),
                image: images["collection-guide"]?.url ?? homes[0]?.coverPhoto ?? "",
                href: "/guide",
              },
              {
                key: "trips",
                title: "Trips and cabs",
                badge: "By Flexigo Holidays",
                badgeIcon: "trips",
                points: ["Day trips to Kufri and Mashobra", "Station and airport pickups", "Himachal, Kashmir and Ladakh tours", "Planned by a local team"],
                image: images["collection-trips"]?.url ?? homes[0]?.coverPhoto ?? "",
                href: "https://www.flexigoholidays.com/",
                external: true,
              },
            ]}
          />
        </div>
      </section>

      <section id="homes" className="mx-auto max-w-site scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-28" aria-labelledby="homes-title">
        <SectionHeading eyebrow="Homes" title="Choose your home and see prices" id="homes-title">
          Each home is fully equipped and looked after by a team that stays close by.
        </SectionHeading>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {homes.map((h, i) => (
            <HomeCard key={h.slug} home={h} priority={i === 0} />
          ))}
        </div>
        <div className="mt-8">
          <Link href="/compare" className="text-sm font-semibold text-pine-dark underline underline-offset-4">Compare the three homes side by side</Link>
        </div>
      </section>

      <DayStory images={images} />

      <section className="bg-forest py-20 text-[#c9d2cc] lg:py-28" aria-labelledby="types-title">
        <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pine">Good for</p>
          <h2 id="types-title" data-reveal className="mt-3 max-w-2xl text-4xl text-white sm:text-5xl">A home that fits how you travel</h2>
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stayTypes.map((s) => (
              <li key={s.type} data-reveal>
                <Link href={`/stays/${s.slug}`} className="group flex h-full flex-col rounded-card border border-white/15 p-6 transition-colors hover:bg-white/5">
                  <h3 className="text-2xl text-white">{s.title}</h3>
                  <p className="mt-3 flex-1 text-[#c9d2cc]">{s.text}</p>
                  <span className="mt-6 text-sm font-semibold text-pine group-hover:underline">See matching homes</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28" aria-labelledby="reviews-title">
        <TestimonialsSection
          titleId="reviews-title"
          eyebrow="Guest reviews"
          title="What guests say about their stay"
          description={`${reviews.length} five-star reviews, shared by guests on Airbnb.`}
          testimonials={reviews.map((r) => ({
            quote: r.body,
            name: r.guestName,
            role: reviewRole[r.guestType] ?? "Guest",
            company: `${r.stayMonth} on ${r.source}`,
            rating: r.rating,
          }))}
        />
      </section>

      <section className="mx-auto max-w-site px-4 sm:px-6 lg:px-8" aria-labelledby="around-title">
        <div className="grid gap-10 rounded-[2rem] bg-card p-6 shadow-soft sm:p-10 lg:grid-cols-[1fr_1.2fr] lg:p-14">
          <div>
            <SectionHeading eyebrow="Around you" title="Quiet hills, Shimla within reach" id="around-title">
              Guests reach Mall Road and the Ridge in about 25 to 30 minutes by car, then come home to silence.
            </SectionHeading>
            <ButtonLink href="/guide" variant="outline" className="mt-8">Open the Shimla guide</ButtonLink>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {places.slice(0, 6).map((p) => (
              <li key={p.id} data-reveal className="rounded-2xl border border-line p-4">
                <p className="flex items-center gap-2 font-semibold text-forest"><MapPin size={16} className="text-pine-dark" aria-hidden /> {p.name}</p>
                <p className="mt-1 text-sm text-muted">{p.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-site px-4 py-20 sm:px-6 lg:px-8 lg:py-28" aria-labelledby="seasons-title">
        <SectionHeading eyebrow="Seasons" title="Shimla in every season" id="seasons-title">
          Typical temperatures, so you know what to pack.
        </SectionHeading>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {seasons.map((s) => (
            <li key={s.name} data-reveal className="overflow-hidden rounded-card bg-card shadow-soft">
              <div className="relative aspect-[4/3] bg-stone">
                {images[s.image] && <Image src={images[s.image].url} alt={images[s.image].alt} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />}
              </div>
              <div className="p-5">
                <h3 className="text-2xl">{s.name}</h3>
                <p className="text-sm font-semibold text-pine-dark">{s.months} · {s.temp}</p>
                <p className="mt-2 text-muted">{s.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-site px-4 sm:px-6 lg:px-8" aria-labelledby="faq-title">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading eyebrow="Good to know" title="Questions guests ask" id="faq-title" />
          <div className="divide-y divide-line border-y border-line">
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
      </section>

      <section className="mx-auto mt-20 max-w-site px-4 sm:px-6 lg:mt-28 lg:px-8" aria-labelledby="host-title">
        <div className="flex flex-col items-start gap-6 rounded-[2rem] bg-pine/15 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 id="host-title" className="text-3xl sm:text-4xl">Questions before you book?</h2>
            <p className="mt-3 max-w-xl text-lg text-muted">Message {site.hostName || "the host"} on WhatsApp or call. Guests often mention how quickly the host replies.</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <ButtonLink href={whatsappLink(site.whatsappNumber, "Hi, I'd like to know more about FlexiGo Stays.")} variant="whatsapp"><WhatsAppIcon size={18} /> WhatsApp</ButtonLink>
            <ButtonLink href={`tel:${site.phone.replace(/\s/g, "")}`} variant="outline"><Phone size={18} aria-hidden /> Call</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
