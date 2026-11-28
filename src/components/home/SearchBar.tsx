"use client";
// Search card in the style of the StayVista search bar: soft sand fields on a white card, a home picker,
// a two-month date picker with holidays marked, a guest counter, and a dark search button.
// Choosing a home loads its booked nights so they cannot be picked. Sends the guest to /book with everything filled in.
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type Lenis from "lenis";
import { ArrowRight, Check, House, Minus, Plus, Search, X } from "lucide-react";
import { fetchAvailability } from "@/lib/client-api";
import { addDaysIso, inr } from "@/lib/format";
import { useToday } from "@/lib/useToday";
import { useMediaQuery } from "@/lib/useMediaQuery";
import type { Holiday } from "@/lib/types";
import { DateRangeCalendar, type DateRange } from "@/components/search/DateRangeCalendar";

export type SearchHome = { slug: string; name: string; maxGuests: number; nightlyPrice: number; minNights: number; coverPhoto: string };
type Panel = "home" | "dates" | "guests" | null;

const short = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-IN", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" });
const nightsBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

export function SearchBar({ homes, holidays }: { homes: SearchHome[]; holidays: Holiday[] }) {
  const router = useRouter();
  const today = useToday();
  const wide = useMediaQuery("(min-width: 768px)");
  const uid = useId();
  const form = useRef<HTMLFormElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [slug, setSlug] = useState("");
  const [range, setRange] = useState<DateRange>({ checkIn: null, checkOut: null });
  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(0);
  const [bookedBySlug, setBookedBySlug] = useState<Record<string, string[]>>({});
  const [hint, setHint] = useState<string | null>(null);
  const [room, setRoom] = useState({ up: false, max: 640 });

  const home = homes.find((h) => h.slug === slug);
  const cap = home ? home.maxGuests : Math.max(2, ...homes.map((h) => h.maxGuests));
  const minNights = home ? home.minNights : homes.length ? Math.min(...homes.map((h) => h.minNights)) : 1;
  const guests = adults + kids;
  const booked = useMemo(() => new Set(bookedBySlug[slug] ?? []), [bookedBySlug, slug]);
  const nights = range.checkIn && range.checkOut ? nightsBetween(range.checkIn, range.checkOut) : 0;
  const triggerId = (p: Exclude<Panel, null>) => `${uid}-${p}`;

  // Close on a click outside the card (or the phone date sheet) and on Escape, returning focus to the field.
  useEffect(() => {
    if (!panel) return;
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!form.current?.contains(t) && !sheet.current?.contains(t)) setPanel(null);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setPanel(null);
      document.getElementById(triggerId(panel))?.focus();
    };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panel]);

  // If an open panel runs past the bottom of the screen, scroll just enough to show it (keeping the card below the header).
  useEffect(() => {
    if (!panel || (panel === "dates" && !wide)) return;
    const frame = requestAnimationFrame(() => {
      const pop = form.current?.querySelector<HTMLElement>("[role=dialog]");
      const card = form.current?.getBoundingClientRect();
      if (!pop || !card) return;
      const below = pop.getBoundingClientRect().bottom - window.innerHeight + 16;
      const by = Math.min(below, card.top - ((window.innerWidth >= 1280 ? 80 : 64) + 12));
      if (by <= 0) return;
      const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
      if (lenis) lenis.scrollTo(window.scrollY + by, { duration: 0.7 });
      else window.scrollBy({ top: by, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [panel, wide]);

  // The phone date sheet covers the screen, so the page behind it should not scroll.
  useEffect(() => {
    if (panel !== "dates" || wide) return;
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = before;
    };
  }, [panel, wide]);

  // Decide where a panel opens: below the card, or above it when there is more room there.
  // That keeps the whole panel on screen without scrolling the page.
  function place(p: Exclude<Panel, null>) {
    const card = form.current?.getBoundingClientRect();
    if (!card) return;
    const below = window.innerHeight - card.bottom - 16;
    const above = card.top - (window.innerWidth >= 1280 ? 80 : 64) - 12;
    const up = below < (p === "dates" ? 600 : 380) && above > below;
    setRoom({ up, max: Math.max(300, up ? above : below) });
  }
  function open(p: Exclude<Panel, null>) {
    place(p);
    setPanel(p);
  }
  const toggle = (p: Exclude<Panel, null>) => (panel === p ? setPanel(null) : open(p));

  function chooseHome(next: string) {
    setSlug(next);
    setPanel(null);
    const picked = homes.find((h) => h.slug === next);
    if (!picked) return;
    // Keep the group within what this home sleeps.
    if (adults + kids > picked.maxGuests) {
      const k = Math.min(kids, Math.max(0, picked.maxGuests - 1));
      setKids(k);
      setAdults(Math.max(1, picked.maxGuests - k));
    }
    if (range.checkIn && range.checkOut && nightsBetween(range.checkIn, range.checkOut) < picked.minNights) {
      setRange({ checkIn: range.checkIn, checkOut: null });
      setHint(`${picked.name} needs at least ${picked.minNights} nights. Please pick your check-out again.`);
    }
    // Load this home's booked nights for the next year (once), and clear the dates if they are no longer free.
    if (today && !bookedBySlug[next]) {
      fetchAvailability(next, today, addDaysIso(today, 366)).then((r) => {
        if (!r.ok) return;
        setBookedBySlug((all) => ({ ...all, [next]: r.data.booked }));
        setRange((cur) => {
          if (!cur.checkIn) return cur;
          const last = cur.checkOut ?? addDaysIso(cur.checkIn, 1);
          const clash = r.data.booked.some((n) => n >= cur.checkIn! && n < last);
          if (!clash) return cur;
          setHint(`Some of those nights are already booked at ${picked.name}. Please choose new dates.`);
          return { checkIn: null, checkOut: null };
        });
      });
    }
  }

  function changeDates(r: DateRange) {
    setRange(r);
    setHint(null);
    // Like StayVista: once both dates are in, move on to guests.
    if (r.checkIn && r.checkOut)
      window.setTimeout(() => {
        place("guests");
        setPanel((p) => (p === "dates" ? "guests" : p));
      }, 380);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!range.checkIn || !range.checkOut) {
      setHint(range.checkIn ? "Now pick your check-out date." : "Pick your check-in and check-out dates to see prices.");
      open("dates");
      return;
    }
    const q = new URLSearchParams({ in: range.checkIn, out: range.checkOut, guests: String(guests), children: String(kids) });
    if (slug) q.set("home", slug);
    setPanel(null);
    router.push(`/book?${q.toString()}`);
  }

  // Shared field styles: sand pills that turn white and lift while their panel is open.
  const lift = "bg-card shadow-[0_8px_28px_-12px_rgb(28_43_36/0.35)] ring-1 ring-forest/15";
  const rest = "bg-stone hover:bg-stone-deep";
  const field = (open: boolean) => `flex min-h-16 w-full flex-col justify-center rounded-2xl px-4 py-2.5 text-left transition-[background-color,box-shadow] duration-200 ${open ? lift : rest}`;
  const label = "text-[0.8rem] font-medium text-muted";
  const value = (set: boolean) => `mt-0.5 truncate text-[0.98rem] ${set ? "font-semibold text-ink" : "text-muted"}`;
  const popover = `absolute z-50 overflow-y-auto overscroll-contain rounded-2xl bg-card p-2 shadow-[0_24px_60px_-20px_rgb(22_32_27/0.45)] ring-1 ring-line ${room.up ? "bottom-full mb-2" : "top-full mt-2"}`;

  const summary =
    hint ??
    (nights
      ? `${nights} ${nights === 1 ? "night" : "nights"}: ${short(range.checkIn!)} to ${short(range.checkOut!)}`
      : range.checkIn
        ? `Check-in ${short(range.checkIn)}. Now pick your check-out date.`
        : "Pick your check-in date.") + (minNights > 1 && !nights && !hint ? ` Minimum stay ${minNights} nights.` : "");

  const calendar = today ? (
    <DateRangeCalendar
      key={slug || "any"}
      today={today}
      value={range}
      onChange={changeDates}
      holidays={holidays}
      booked={booked}
      minNights={minNights}
      months={wide ? 2 : 1}
    />
  ) : null;

  const footer = (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
      <p className={`text-sm ${hint ? "font-medium text-weekend" : "text-ink"}`} aria-live="polite">{summary}</p>
      <div className="ml-auto flex gap-2">
        <button type="button" onClick={() => { setRange({ checkIn: null, checkOut: null }); setHint(null); }} className="min-h-11 rounded-[var(--radius-control)] px-4 text-sm font-semibold text-forest underline-offset-4 hover:underline">
          Clear dates
        </button>
        <button type="button" onClick={() => (nights ? open("guests") : setPanel(null))} className="min-h-11 rounded-[var(--radius-control)] bg-forest px-6 text-sm font-semibold text-white transition hover:bg-forest-soft">
          Done
        </button>
      </div>
    </div>
  );

  return (
    <form
      ref={form}
      onSubmit={submit}
      aria-label="Search stays"
      className="relative grid grid-cols-2 gap-2 rounded-[1.6rem] bg-card p-2 shadow-[0_24px_60px_-24px_rgb(22_32_27/0.5)] ring-1 ring-black/5 lg:grid-cols-[1.05fr_1.6fr_1fr_auto] lg:p-2.5"
    >
      {/* Home */}
      <div className="relative col-span-2 md:col-span-1">
        <button type="button" id={triggerId("home")} aria-haspopup="dialog" aria-expanded={panel === "home"} onClick={() => toggle("home")} className={field(panel === "home")}>
          <span className={label}>Property</span>
          <span className={value(!!home)}>{home ? home.name : `Any of the ${homes.length} properties`}</span>
        </button>
        {panel === "home" && (
          <div role="dialog" aria-label="Choose a property" style={{ maxHeight: room.max }} className={`${popover} left-0 w-full min-w-[18rem] md:w-[24rem]`}>
            <ul>
              {[{ slug: "", name: `Any of the ${homes.length} properties`, note: "We suggest the best fit for your group", photo: null as string | null }, ...homes.map((h) => ({ slug: h.slug, name: h.name, note: `Up to ${h.maxGuests} guests, from ${inr(h.nightlyPrice)} a night`, photo: h.coverPhoto }))].map((o) => (
                <li key={o.slug || "any"}>
                  <button type="button" onClick={() => chooseHome(o.slug)} aria-pressed={slug === o.slug} className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-stone">
                    {o.photo ? (
                      <Image src={o.photo} alt="" width={56} height={56} className="size-14 shrink-0 rounded-xl object-cover" />
                    ) : (
                      <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-chip text-forest"><House size={22} aria-hidden /></span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink">{o.name}</span>
                      <span className="block text-sm text-muted">{o.note}</span>
                    </span>
                    {slug === o.slug && <Check size={20} className="shrink-0 text-forest" aria-hidden />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Dates: one pill with check-in, an arrow, and check-out */}
      <div className={`col-span-2 grid grid-cols-[1fr_auto_1fr] items-center rounded-2xl md:col-span-1 transition-[background-color,box-shadow] duration-200 ${panel === "dates" ? lift : rest}`}>
        <button type="button" id={triggerId("dates")} aria-haspopup="dialog" aria-expanded={panel === "dates"} onClick={() => toggle("dates")} className="flex min-h-16 flex-col justify-center rounded-2xl px-4 py-2.5 text-left">
          <span className={label}>Check-in</span>
          <span className={value(!!range.checkIn)}>{range.checkIn ? short(range.checkIn) : "Add date"}</span>
        </button>
        <ArrowRight size={18} className="text-ink" aria-hidden />
        <button type="button" aria-haspopup="dialog" aria-expanded={panel === "dates"} onClick={() => open("dates")} className="flex min-h-16 flex-col justify-center rounded-2xl px-4 py-2.5 text-left">
          <span className={label}>Check-out</span>
          <span className={value(!!range.checkOut)}>{range.checkOut ? short(range.checkOut) : "Add date"}</span>
        </button>
      </div>

      {/* Guests */}
      <div className="relative">
        <button type="button" id={triggerId("guests")} aria-haspopup="dialog" aria-expanded={panel === "guests"} onClick={() => toggle("guests")} className={field(panel === "guests")}>
          <span className={label}>Guests</span>
          <span className={value(true)}>
            {guests} {guests === 1 ? "guest" : "guests"}
            <span className="font-normal text-muted">{kids ? `, ${kids} ${kids === 1 ? "child" : "children"}` : ""}</span>
          </span>
        </button>
        {panel === "guests" && (
          <div role="dialog" aria-label="Guests" style={{ maxHeight: room.max }} className={`${popover} left-0 w-full min-w-[18rem] p-4 md:left-auto md:right-0 md:w-[22rem]`}>
            {[
              { name: "Adults", note: "Age 13 or above", count: adults, set: setAdults, min: 1 },
              { name: "Children", note: "Age 2 to 12", count: kids, set: setKids, min: 0 },
            ].map((row) => (
              <div key={row.name} className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-0">
                <span>
                  <span className="block font-semibold text-ink">{row.name}</span>
                  <span className="text-sm text-muted">{row.note}</span>
                </span>
                <span className="flex items-center gap-3">
                  <button type="button" onClick={() => row.set(row.count - 1)} disabled={row.count <= row.min} aria-label={`Fewer ${row.name.toLowerCase()}`} className="grid size-10 place-items-center rounded-full text-forest ring-1 ring-line transition hover:ring-forest disabled:text-line disabled:hover:ring-line">
                    <Minus size={18} aria-hidden />
                  </button>
                  <span className="w-6 text-center text-lg font-semibold text-ink" aria-live="polite">{row.count}</span>
                  <button type="button" onClick={() => row.set(row.count + 1)} disabled={guests >= cap} aria-label={`More ${row.name.toLowerCase()}`} className="grid size-10 place-items-center rounded-full text-forest ring-1 ring-line transition hover:ring-forest disabled:text-line disabled:hover:ring-line">
                    <Plus size={18} aria-hidden />
                  </button>
                </span>
              </div>
            ))}
            <p className="mt-2 text-sm text-muted">
              {home ? `${home.name} sleeps up to ${cap}.` : `Our largest property sleeps up to ${cap}.`} Babies under 2 stay free.
            </p>
            <button type="button" onClick={() => setPanel(null)} className="mt-3 min-h-11 w-full rounded-[var(--radius-control)] bg-forest text-sm font-semibold text-white transition hover:bg-forest-soft">
              Done
            </button>
          </div>
        )}
      </div>

      <button type="submit" className="flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-forest px-5 text-[1.02rem] sm:px-8 font-semibold uppercase tracking-[0.08em] text-white transition-[background-color,transform] duration-300 hover:bg-forest-soft active:scale-[0.98]">
        <Search size={19} aria-hidden /> Search
      </button>

      {/* Date picker: a panel under the card on tablets and computers, a bottom sheet on phones */}
      {panel === "dates" && wide && (
        <div role="dialog" aria-label="Choose your dates" style={{ maxHeight: room.max }} className={`${popover} inset-x-0 mx-auto flex max-w-[52rem] flex-col overflow-hidden! p-0`}>
          {/* On short laptop screens the months scroll inside the panel and the Done button stays in view */}
          <div className="min-h-0 overflow-y-auto overscroll-contain px-5 pb-2 pt-5 sm:px-6 sm:pt-6">{calendar}</div>
          <div className="px-5 pb-4 sm:px-6 sm:pb-5">{footer}</div>
        </div>
      )}
      {panel === "dates" &&
        !wide &&
        createPortal(
          <div className="fixed inset-0 z-[70]">
            <div className="absolute inset-0 bg-night/55" onClick={() => setPanel(null)} aria-hidden />
            <div ref={sheet} role="dialog" aria-modal="true" aria-label="Choose your dates" className="absolute inset-x-0 bottom-0 flex max-h-[92svh] flex-col rounded-t-[1.6rem] bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <p className="font-display text-xl text-forest">Choose your dates</p>
                <button type="button" onClick={() => setPanel(null)} aria-label="Close" className="grid size-11 place-items-center rounded-full hover:bg-stone">
                  <X size={22} aria-hidden />
                </button>
              </div>
              <div className="overflow-y-auto overscroll-contain px-4 pb-2 pt-3">{calendar}</div>
              <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>
            </div>
          </div>,
          document.body,
        )}
    </form>
  );
}
