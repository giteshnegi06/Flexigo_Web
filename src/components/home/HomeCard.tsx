// Home card in the flat style of SaffronStays and StayVista: a rounded photo, then name, place, facts and price on white.
// No box or heavy shadow; the photo zooms gently and a soft shadow appears on hover.
import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, Users } from "lucide-react";
import type { HomeCard as Home } from "@/lib/types";
import { inr } from "@/lib/format";

export function HomeCard({ home, priority = false }: { home: Home; priority?: boolean }) {
  const discounted = home.compareAtPrice && home.compareAtPrice > home.nightlyPrice;
  return (
    <Link href={`/homes/${home.slug}`} data-reveal className="group flex flex-col rounded-card outline-offset-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-stone transition-shadow duration-500 group-hover:shadow-soft">
        <Image src={home.coverPhoto} alt={`${home.name}: ${home.tagline}`} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" priority={priority} className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]" />
        {discounted && <span className="absolute left-3 top-3 rounded-md bg-card/95 px-2.5 py-1 text-xs font-semibold text-forest shadow-sm">Save {inr(home.compareAtPrice! - home.nightlyPrice)} a night</span>}
      </div>
      <div className="flex flex-1 flex-col pt-4">
        <h3 className="font-sans text-xl font-semibold tracking-normal text-ink">{home.name}</h3>
        <p className="mt-0.5 text-[0.95rem] text-muted">{[home.area, home.locationName ?? "Shimla"].filter(Boolean).join(", ")}</p>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted">
          <li className="flex items-center gap-1.5"><Users size={15} aria-hidden /> Up to {home.maxGuests} guests</li>
          <li className="flex items-center gap-1.5"><BedDouble size={15} aria-hidden /> {home.bedrooms} rooms</li>
          <li className="flex items-center gap-1.5"><Bath size={15} aria-hidden /> {home.bathrooms} baths</li>
        </ul>
        <div className="mt-4 flex flex-1 items-end justify-between border-t border-line pt-3.5">
          <p className="leading-tight">
            <span className="text-xl font-semibold text-ink">{inr(home.nightlyPrice)}</span>
            <span className="text-sm text-muted"> / night</span>
            {discounted && <span className="ml-2 text-sm text-muted line-through">{inr(home.compareAtPrice!)}</span>}
            <span className="block pt-0.5 text-xs text-muted">+ taxes, whole home</span>
          </p>
          <span className="rounded-[var(--radius-control)] border border-line px-3.5 py-2 text-sm font-semibold text-forest transition-colors duration-300 group-hover:border-forest group-hover:bg-forest group-hover:text-white">View</span>
        </div>
      </div>
    </Link>
  );
}
