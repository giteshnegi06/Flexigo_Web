"use client";
// Home card on a location page: a photo slider (arrows on hover, swipe on phones, dots), then the name, place,
// guests, bedrooms and bathrooms, a few amenity chips and the price.
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, CookingPot, Flame, Mountain, SquareParking, Trees, Tv, Wifi, Zap, type LucideIcon } from "lucide-react";
import { inr } from "@/lib/format";
import type { LocationHome } from "@/lib/types";

// Amenity chips, in order of how much guests care. A home shows the first three it has.
const chipRules: [RegExp, string, LucideIcon][] = [
  [/parking/i, "Parking", SquareParking],
  [/wi-?fi/i, "Wi-Fi", Wifi],
  [/balcony|view/i, "Balcony", Mountain],
  [/garden|terrace|gazebo/i, "Garden", Trees],
  [/heater|fireplace/i, "Heaters", Flame],
  [/power backup/i, "Power backup", Zap],
  [/kitchen|cookware|induction/i, "Kitchen", CookingPot],
  [/tv|ott/i, "Smart TV", Tv],
];

export function chipsFor(home: Pick<LocationHome, "amenities" | "highlights">) {
  const text = [...home.amenities, ...home.highlights];
  return chipRules.filter(([re]) => text.some((t) => re.test(t))).slice(0, 3);
}

export function PropertyCard({ home, priority = false }: { home: LocationHome; priority?: boolean }) {
  // The cover opens the slider, then the rest of the gallery in its order.
  const photos = [{ url: home.coverPhoto, alt: home.name }, ...home.photos.filter((p) => p.url !== home.coverPhoto)];
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const go = (step: number) => setIndex((i) => (i + step + photos.length) % photos.length);
  const discounted = home.compareAtPrice && home.compareAtPrice > home.nightlyPrice;
  const place = [home.area, home.locationName].filter(Boolean).join(", ");
  const arrow = "absolute top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow transition-opacity hover:bg-white focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100";

  return (
    <article className="group flex w-full flex-col overflow-hidden rounded-card border border-line bg-card transition-shadow duration-300 hover:shadow-soft">
      <div
        className="relative aspect-[4/3] overflow-hidden bg-stone"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        <Link href={`/homes/${home.slug}`} tabIndex={-1} aria-hidden className="absolute inset-0">
          {photos.map((p, i) => (
            <Image
              key={p.url + i}
              src={p.url}
              alt={i === index ? p.alt : ""}
              fill
              sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
              priority={priority && i === 0}
              className={`object-cover transition-opacity duration-500 ${i === index ? "opacity-100" : "opacity-0"}`}
            />
          ))}
        </Link>
        {discounted && <span className="absolute left-3 top-3 rounded-full bg-card/95 px-3 py-1 text-xs font-semibold text-forest shadow-sm">Save {inr(home.compareAtPrice! - home.nightlyPrice)} a night</span>}
        <span className="absolute right-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-xs font-medium capitalize text-white backdrop-blur-sm">{home.propertyType}</span>
        {photos.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label={`Previous photo of ${home.name}`} className={`${arrow} left-3`}><ChevronLeft size={18} aria-hidden /></button>
            <button type="button" onClick={() => go(1)} aria-label={`Next photo of ${home.name}`} className={`${arrow} right-3`}><ChevronRight size={18} aria-hidden /></button>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5" aria-hidden>
              {photos.map((p, i) => <span key={p.url + i} className={`size-1.5 rounded-full transition-all ${i === index ? "w-4 bg-white" : "bg-white/60"}`} />)}
            </div>
          </>
        )}
      </div>

      <Link href={`/homes/${home.slug}`} className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="truncate font-display text-[1.35rem] leading-snug text-forest">{home.name}</h3>
        {place && <p className="text-sm text-muted">{place}</p>}
        <p className="mt-2 text-sm text-ink">
          {home.maxGuests} guests · {home.bedrooms} {home.bedrooms === 1 ? "bedroom" : "bedrooms"} · {home.bathrooms} {home.bathrooms === 1 ? "bathroom" : "bathrooms"}
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {chipsFor(home).map(([, label, Icon]) => (
            <li key={label} className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink"><Icon size={14} aria-hidden /> {label}</li>
          ))}
        </ul>
        <p className="mt-auto pt-4">
          {discounted && <span className="mr-2 text-sm text-muted line-through">{inr(home.compareAtPrice!)}</span>}
          <span className="text-xl font-semibold text-ink">{inr(home.nightlyPrice)}</span>
          <span className="text-sm text-muted"> / night + taxes</span>
        </p>
      </Link>
    </article>
  );
}
