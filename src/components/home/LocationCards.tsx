"use client";
// Location cards right under the hero: a tall photo per location with its name and how many properties it has.
// Each card opens that location's page. The row scrolls sideways when there are more cards than fit: swipe on
// phones, and arrow buttons beside the heading on larger screens (they only show when there is more to see).
// Locations, photos and counts all come from the database (admin panel > Locations).
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Location } from "@/lib/types";

export function LocationCards({ locations }: { locations: Location[] }) {
  const row = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const update = () => setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [locations.length]);

  const scroll = (dir: 1 | -1) => {
    const el = row.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  if (!locations.length) return null;
  const arrow = "grid size-11 place-items-center rounded-full border border-line bg-card text-forest transition hover:border-forest disabled:opacity-35 disabled:hover:border-line";

  return (
    <section aria-labelledby="locations-title" className="mx-auto max-w-site px-4 pb-4 pt-10 sm:px-6 lg:px-8 lg:pt-12">
      <div className="flex items-end justify-between gap-4">
        <h2 id="locations-title" className="text-2xl sm:text-3xl">Explore your escape?</h2>
        {!(edges.start && edges.end) && (
          <div className="hidden gap-2 sm:flex">
            <button type="button" onClick={() => scroll(-1)} disabled={edges.start} aria-label="Previous locations" className={arrow}><ChevronLeft size={20} aria-hidden /></button>
            <button type="button" onClick={() => scroll(1)} disabled={edges.end} aria-label="More locations" className={arrow}><ChevronRight size={20} aria-hidden /></button>
          </div>
        )}
      </div>
      <ul ref={row} className="-mx-4 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:-mx-6 sm:gap-4 sm:px-6 lg:mx-0 lg:px-0">
        {locations.map((l, i) => (
          <li key={l.slug} className="w-[42%] shrink-0 snap-start sm:w-[13.5rem]">
            <Link href={`/locations/${l.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-stone outline-offset-4">
              <Image src={l.image} alt={l.imageAlt} fill sizes="(min-width: 640px) 216px, 42vw" priority={i < 4} className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" aria-hidden />
              <span className="absolute inset-x-0 bottom-0 px-3 pb-4 text-center text-white">
                <span className="block font-display text-[1.45rem] leading-tight">{l.name}</span>
                <span className="mt-0.5 block text-sm text-white/85">
                  {l.homeCount ? `${l.homeCount} ${l.homeCount === 1 ? "Property" : "Properties"}` : "Coming soon"}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
