"use client";
// Listing on a location page, laid out like Elivaas: filters on the left (price per night, home type, bedrooms),
// then a heading card, the count with a sort menu, and the home cards. On phones the filters open as a bottom sheet.
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Building2, House, SlidersHorizontal, X } from "lucide-react";
import { inr } from "@/lib/format";
import type { Location, LocationHome, PropertyType } from "@/lib/types";
import { PropertyCard } from "./PropertyCard";
import { Select } from "@/components/ui/Select";

type Sort = "recommended" | "price-asc" | "price-desc" | "guests";
const sorts: { value: Sort; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "guests", label: "Most guests" },
];
const types: { value: PropertyType; label: string; icon: typeof House }[] = [
  { value: "apartment", label: "Apartment", icon: Building2 },
  { value: "villa", label: "Villa", icon: House },
];
const STEP = 500;

type Filters = { min: number; max: number; types: PropertyType[]; bedrooms: number[] };

export function LocationListing({ location, homes }: { location: Omit<Location, "homeCount">; homes: LocationHome[] }) {
  const prices = homes.map((h) => h.nightlyPrice);
  const floor = prices.length ? Math.floor(Math.min(...prices) / STEP) * STEP : 0;
  const ceil = prices.length ? Math.ceil(Math.max(...prices) / STEP) * STEP : 0;
  const bedroomOptions = [...new Set(homes.map((h) => h.bedrooms))].sort((a, b) => a - b);
  const none: Filters = { min: floor, max: ceil, types: [], bedrooms: [] };
  const [filters, setFilters] = useState<Filters>(none);
  const [sort, setSort] = useState<Sort>("recommended");
  const [sheet, setSheet] = useState(false);

  const shown = useMemo(() => {
    const list = homes.filter(
      (h) =>
        h.nightlyPrice >= filters.min &&
        h.nightlyPrice <= filters.max &&
        (!filters.types.length || filters.types.includes(h.propertyType)) &&
        (!filters.bedrooms.length || filters.bedrooms.includes(h.bedrooms)),
    );
    if (sort === "price-asc") return [...list].sort((a, b) => a.nightlyPrice - b.nightlyPrice);
    if (sort === "price-desc") return [...list].sort((a, b) => b.nightlyPrice - a.nightlyPrice);
    if (sort === "guests") return [...list].sort((a, b) => b.maxGuests - a.maxGuests);
    return list;
  }, [homes, filters, sort]);

  const active = filters.min > floor || filters.max < ceil || filters.types.length + filters.bedrooms.length > 0;
  const noun = (n: number) => `${n} ${n === 1 ? "property" : "properties"}`;
  const panel = <FilterPanel filters={filters} setFilters={setFilters} floor={floor} ceil={ceil} bedroomOptions={bedroomOptions} onClear={() => setFilters(none)} active={active} />;

  return (
    <div className="mx-auto max-w-site px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pt-32">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
        <Link href="/" className="hover:text-forest">Home</Link> / <span className="text-forest">{location.name}</span>
      </nav>
      <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-28">{panel}</div>
        </aside>

        <div className="min-w-0">
          <header className="rounded-card border border-line bg-card p-5 sm:p-6">
            <h1 className="text-[1.9rem] sm:text-[2.3rem]">Properties in {location.name}</h1>
            {location.description && <p className="mt-1.5 max-w-3xl text-muted">{location.description}</p>}
          </header>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-lg font-semibold text-ink" aria-live="polite">
              {noun(shown.length)} in {location.name}
            </p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setSheet(true)} className="flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-semibold text-forest lg:hidden">
                <SlidersHorizontal size={16} aria-hidden /> Filters{active ? " (on)" : ""}
              </button>
              <Select label="Sort by" value={sort} options={sorts} onChange={setSort} align="end" />
            </div>
          </div>

          {shown.length ? (
            <ul className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((h, i) => (
                <li key={h.slug} className="flex"><PropertyCard home={h} priority={i < 3} /></li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 rounded-card border border-dashed border-line p-10 text-center">
              <p className="font-semibold text-forest">{homes.length ? "No properties match these filters." : `Properties in ${location.name} are coming soon.`}</p>
              {homes.length > 0 && <button type="button" onClick={() => setFilters(none)} className="mt-3 min-h-11 font-semibold text-forest underline underline-offset-4">Clear all filters</button>}
            </div>
          )}
        </div>
      </div>

      {sheet && <FilterSheet onClose={() => setSheet(false)} count={noun(shown.length)}>{panel}</FilterSheet>}
    </div>
  );
}

function FilterPanel({ filters, setFilters, floor, ceil, bedroomOptions, onClear, active }: { filters: Filters; setFilters: (f: Filters) => void; floor: number; ceil: number; bedroomOptions: number[]; onClear: () => void; active: boolean }) {
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const tile = (on: boolean) => `rounded-xl border transition ${on ? "border-forest bg-forest text-white" : "border-line bg-card text-ink hover:border-forest/50"}`;
  const range = ceil - floor || 1;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-display text-2xl text-forest">Filters</p>
        <button type="button" onClick={onClear} disabled={!active} className="min-h-11 text-sm font-semibold text-pine-dark disabled:text-muted">Clear all</button>
      </div>

      {ceil > floor && (
        <section className="border-b border-line pb-6 pt-4" aria-labelledby="f-price">
          <h2 id="f-price" className="font-sans text-base font-semibold tracking-normal text-ink">Price per night</h2>
          <p className="text-sm text-muted">Before taxes, whole property</p>
          <p className="mt-3 font-semibold text-ink">{inr(filters.min)} to {inr(filters.max)}</p>
          <div className="relative mt-3 h-6">
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-line" />
            <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-forest" style={{ left: `${((filters.min - floor) / range) * 100}%`, right: `${100 - ((filters.max - floor) / range) * 100}%` }} />
            <input type="range" min={floor} max={ceil} step={STEP} value={filters.min} aria-label="Lowest price" onChange={(e) => setFilters({ ...filters, min: Math.min(Number(e.target.value), filters.max) })} className="range-thumb" />
            <input type="range" min={floor} max={ceil} step={STEP} value={filters.max} aria-label="Highest price" onChange={(e) => setFilters({ ...filters, max: Math.max(Number(e.target.value), filters.min) })} className="range-thumb" />
          </div>
        </section>
      )}

      <section className="border-b border-line py-6" aria-labelledby="f-type">
        <h2 id="f-type" className="font-sans text-base font-semibold tracking-normal text-ink">Property type</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {types.map(({ value, label, icon: Icon }) => {
            const on = filters.types.includes(value);
            return (
              <button key={value} type="button" aria-pressed={on} onClick={() => setFilters({ ...filters, types: toggle(filters.types, value) })} className={`${tile(on)} flex flex-col items-center gap-2 px-3 py-4 text-sm font-semibold`}>
                <Icon size={26} strokeWidth={1.6} aria-hidden /> {label}
              </button>
            );
          })}
        </div>
      </section>

      {bedroomOptions.length > 0 && (
        <section className="py-6" aria-labelledby="f-beds">
          <h2 id="f-beds" className="font-sans text-base font-semibold tracking-normal text-ink">Bedrooms</h2>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {bedroomOptions.map((n) => {
              const on = filters.bedrooms.includes(n);
              return (
                <button key={n} type="button" aria-pressed={on} aria-label={`${n} ${n === 1 ? "bedroom" : "bedrooms"}`} onClick={() => setFilters({ ...filters, bedrooms: toggle(filters.bedrooms, n) })} className={`${tile(on)} grid size-12 place-items-center text-base font-semibold`}>
                  {n}
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function FilterSheet({ children, onClose, count }: { children: React.ReactNode; onClose: () => void; count: string }) {
  useEffect(() => {
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", key);
    return () => {
      html.style.overflow = before;
      document.removeEventListener("keydown", key);
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[80] lg:hidden">
      <div className="absolute inset-0 bg-night/55" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" aria-label="Filters" className="absolute inset-x-0 bottom-0 flex max-h-[90svh] flex-col rounded-t-[1.6rem] bg-card shadow-2xl">
        <div className="flex justify-end px-3 pt-3">
          <button type="button" onClick={onClose} aria-label="Close filters" className="grid size-11 place-items-center rounded-full hover:bg-stone"><X size={22} aria-hidden /></button>
        </div>
        <div className="min-h-0 overflow-y-auto overscroll-contain px-5" data-lenis-prevent>{children}</div>
        <div className="border-t border-line px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <button type="button" onClick={onClose} className="min-h-12 w-full rounded-[var(--radius-control)] bg-forest font-semibold text-white">Show {count}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
