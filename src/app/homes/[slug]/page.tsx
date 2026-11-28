import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Bath, BedDouble, Clock, MapPin, SquareParking, Users, Wifi } from "lucide-react";
import { IconCircle, iconFor } from "@/components/ui/IconCircle";
import { getHolidays, getHome, getHomes, getSite } from "@/lib/api";
import { inr, prettyTime } from "@/lib/format";
import { PhotoTour } from "@/components/home/PhotoTour";
import { BookingPanel } from "@/components/booking/BookingPanel";
import { Reviews } from "@/components/home/Reviews";
import { HomeCard } from "@/components/home/HomeCard";
import { SectionNav } from "@/components/home/SectionNav";
import { LocationMap } from "@/components/home/LocationMap";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "highlights", label: "Highlights" },
  { id: "story", label: "A day here" },
  { id: "rooms", label: "Rooms" },
  { id: "amenities", label: "Amenities" },
  { id: "rules", label: "House rules" },
  { id: "location", label: "Location" },
  { id: "home-reviews", label: "Reviews" },
  { id: "others", label: "Other properties" },
];

export async function generateStaticParams() {
  const homes = await getHomes();
  return homes.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: PageProps<"/homes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const home = await getHome(slug);
  if (!home) return { title: "Home not found" };
  return {
    title: `${home.name}, ${home.location?.name ?? "Shimla"}`,
    description: `${home.tagline}. Up to ${home.maxGuests} guests, ${home.bedrooms} bedrooms. From ${inr(home.nightlyPrice)} a night.`,
    openGraph: { images: [{ url: home.coverPhoto }] },
  };
}

const groupLabel: Record<string, string> = { comfort: "Comfort", kitchen: "Kitchen", work: "Work", safety: "Safety", outside: "Outside" };

async function HomeContent({ params }: { params: PageProps<"/homes/[slug]">["params"] }) {
  const { slug } = await params;
  const [home, homes, site, holidays] = await Promise.all([getHome(slug), getHomes(), getSite(), getHolidays()]);
  if (!home) notFound();
  const others = homes.filter((h) => h.slug !== home.slug);
  const town = home.location?.name ?? "Shimla";
  const inShimla = (home.location?.slug ?? "shimla") === "shimla";
  const placeLine = [home.area, town].filter(Boolean).join(", ") + (inShimla ? ", about 25 to 30 min from Mall Road" : "");
  const groups = Object.entries(
    home.amenities.reduce<Record<string, string[]>>((acc, a) => {
      (acc[a.group] ??= []).push(a.label);
      return acc;
    }, {}),
  );
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Accommodation",
    name: home.name,
    description: home.summary,
    image: home.photos.map((p) => p.url),
    numberOfRooms: home.bedrooms,
    occupancy: { "@type": "QuantitativeValue", maxValue: home.maxGuests },
    address: { "@type": "PostalAddress", addressLocality: home.location?.name ?? "Shimla", addressRegion: "Himachal Pradesh", addressCountry: "IN" },
  };

  return (
    <article className="mx-auto max-w-site px-4 pb-28 pt-20 sm:px-6 lg:px-8 lg:pb-10 lg:pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
        {/* "Home / Properties / ..." read as the same word twice, so the trail starts at the list of homes. */}
        <Link href="/#homes" className="hover:text-forest">Properties</Link> / <span className="text-forest">{home.name}</span>
      </nav>
      <PhotoTour photos={home.photos} name={home.name} />

      {/* Direct child of the article so it stays pinned for the whole page */}
      <SectionNav items={sections} className="mt-6" />

      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div>
          <h1 id="overview" className="text-[2rem] sm:text-[2.6rem]">{home.name}</h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-muted"><MapPin size={16} aria-hidden /> {placeLine}</p>
          <p className="mt-4 text-lg text-ink">{home.tagline}</p>
          {/* Fact chips: tinted background with a fine border, like StayVista */}
          <ul className="mt-5 flex flex-wrap gap-2.5 border-b border-line pb-6">
            {[
              { icon: Users, text: `Up to ${home.maxGuests} guests` },
              { icon: BedDouble, text: `${home.bedrooms} bedrooms` },
              { icon: Bath, text: `${home.bathrooms} bathrooms` },
              { icon: SquareParking, text: "Free parking" },
              { icon: Wifi, text: home.wifiMbps ? `Wi-Fi, ${home.wifiMbps} Mbps` : "Wi-Fi" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2 rounded-lg border border-forest/15 bg-chip px-3 py-2 text-sm font-medium text-forest">
                <Icon size={17} aria-hidden /> {text}
              </li>
            ))}
          </ul>

          <section className="mt-10" aria-labelledby="highlights">
            <h2 id="highlights" className="text-3xl">Why guests love it</h2>
            <p className="mt-4 text-lg text-ink">{home.summary}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {home.highlights.map((h) => (
                <li key={h} data-reveal className="flex items-center gap-3 rounded-xl border border-line bg-card p-3.5"><IconCircle icon={iconFor(h)} size={40} /> <span className="text-ink">{h}</span></li>
              ))}
            </ul>
          </section>

          <section className="mt-14" aria-labelledby="story">
            <h2 id="story" className="text-3xl">A day at {home.name}</h2>
            <p className="mt-4 max-w-2xl text-lg text-muted">{home.story}</p>
          </section>

          <section className="mt-14" aria-labelledby="rooms">
            <h2 id="rooms" className="text-3xl">The rooms</h2>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {home.rooms.map((r) => (
                <li key={r.id} data-reveal className="grid gap-1 py-5 sm:grid-cols-[180px_1fr] sm:gap-6">
                  <h3 className="font-sans text-lg font-semibold">{r.name}</h3>
                  <p className="text-muted">{r.description}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-14" aria-labelledby="amenities">
            <h2 id="amenities" className="text-3xl">What the property has</h2>
            <div className="mt-6 grid gap-8 sm:grid-cols-2">
              {groups.map(([g, items]) => (
                <div key={g}>
                  <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-pine-dark">{groupLabel[g] ?? g}</h3>
                  <ul className="mt-3 space-y-2.5">
                    {items.map((i) => (
                      <li key={i} className="flex items-center gap-3 text-ink"><IconCircle icon={iconFor(i)} size={36} /> {i}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-14" aria-labelledby="rules">
            <h2 id="rules" className="text-3xl">House rules and times</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              <li className="flex items-center gap-3 rounded-xl border border-line bg-card p-3.5"><IconCircle icon={Clock} size={36} /> Check-in from {prettyTime(home.checkInTime)}</li>
              <li className="flex items-center gap-3 rounded-xl border border-line bg-card p-3.5"><IconCircle icon={Clock} size={36} /> Check-out by {prettyTime(home.checkOutTime)}</li>
            </ul>
            <p className="mt-4 text-sm text-muted">See the <Link href="/cancellation-policy" className="underline">cancellation and refund policy</Link> and the <Link href="/terms" className="underline">terms of stay</Link>.</p>
          </section>

          {home.mapLat != null && home.mapLng != null && (
            <section className="mt-14" aria-labelledby="location">
              <h2 id="location" className="text-3xl">Location</h2>
              <LocationMap name={home.name} town={town} inShimla={inShimla} lat={home.mapLat} lng={home.mapLng} exact={home.mapExact} />
            </section>
          )}

          <section className="mt-14" aria-labelledby="home-reviews">
            <h2 id="home-reviews" className="text-3xl">Guest reviews</h2>
            <div className="mt-6"><Reviews reviews={home.reviews} limit={4} /></div>
          </section>
        </div>

        <aside id="book" className="scroll-mt-40 lg:sticky lg:top-36 lg:self-start xl:top-40" aria-label="Book this property">
          <BookingPanel
            homes={[{ slug: home.slug, name: home.name, maxGuests: home.maxGuests, nightlyPrice: home.nightlyPrice, minNights: home.minNights, coverPhoto: home.coverPhoto }]}
            initialSlug={home.slug}
            whatsappNumber={site.whatsappNumber}
            holidays={holidays}
          />
          {home.airbnbUrl && (
            <p className="mt-3 text-center text-sm text-muted">
              Prefer Airbnb? <a href={home.airbnbUrl} target="_blank" rel="noopener noreferrer" className="underline">This property is also listed there</a>.
            </p>
          )}
        </aside>
      </div>

      <section className="mt-20" aria-labelledby="others">
        <h2 id="others" className="text-3xl">The other properties</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {others.map((h) => <HomeCard key={h.slug} home={h} />)}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-line bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
        <p className="text-forest"><span className="text-lg font-semibold">{inr(home.nightlyPrice)}</span> <span className="text-sm text-muted">/ night</span></p>
        <a href="#book" className="inline-flex min-h-12 items-center rounded-[var(--radius-control)] bg-forest px-6 font-semibold text-white">Check dates</a>
      </div>
    </article>
  );
}

export default function HomePage(props: PageProps<"/homes/[slug]">) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-site px-4 pt-28 text-muted">Loading the property...</div>}>
      <HomeContent params={props.params} />
    </Suspense>
  );
}
