"use client";
// Check-in → check-out field with the same look and calendar as the hero search bar (holidays in blue,
// upcoming holidays listed, booked nights struck through, minimum stay enforced).
// Used in the booking card. On computers the calendar opens beside the card with two months, on tablets with one,
// and on phones as a bottom sheet. Picking happens in a draft: the card's dates change only once both are chosen.
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, X } from "lucide-react";
import { fetchAvailability } from "@/lib/client-api";
import { addDaysIso } from "@/lib/format";
import { useMediaQuery } from "@/lib/useMediaQuery";
import type { Holiday } from "@/lib/types";
import { DateRangeCalendar, type DateRange } from "./DateRangeCalendar";

type Props = {
  today: string;
  checkIn: string;
  checkOut: string;
  slug: string;
  minNights: number;
  holidays: Holiday[];
  onChange: (checkIn: string, checkOut: string) => void;
};

const short = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-IN", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" });
const nightsBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

export function DateRangeField({ today, checkIn, checkOut, slug, minNights, holidays, onChange }: Props) {
  const wide = useMediaQuery("(min-width: 768px)");
  const large = useMediaQuery("(min-width: 1024px)");
  const wrap = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange>({ checkIn: null, checkOut: null });
  const [room, setRoom] = useState({ up: false, max: 640 });
  const [bookedBySlug, setBookedBySlug] = useState<Record<string, string[]>>({});
  const booked = useMemo(() => new Set(bookedBySlug[slug] ?? []), [bookedBySlug, slug]);

  function show() {
    const box = wrap.current?.getBoundingClientRect();
    if (box) {
      const below = window.innerHeight - box.bottom - 16;
      const above = box.top - (window.innerWidth >= 1280 ? 80 : 64) - 12;
      const up = below < 600 && above > below;
      setRoom({ up, max: Math.max(320, up ? above : below) });
    }
    setDraft({ checkIn: checkIn || null, checkOut: checkOut || null });
    setOpen(true);
  }
  const close = () => setOpen(false);

  // This home's booked nights for the next year, loaded the first time the calendar opens.
  useEffect(() => {
    if (!open || !today || !slug || bookedBySlug[slug]) return;
    let live = true;
    fetchAvailability(slug, today, addDaysIso(today, 366)).then((r) => {
      if (live && r.ok) setBookedBySlug((all) => ({ ...all, [slug]: r.data.booked }));
    });
    return () => {
      live = false;
    };
  }, [open, today, slug, bookedBySlug]);

  // Close on a click outside, and on Escape (focus goes back to the field).
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!wrap.current?.contains(t) && !sheet.current?.contains(t)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  // The phone sheet covers the screen, so the page behind it should not scroll.
  useEffect(() => {
    if (!open || wide) return;
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = before;
    };
  }, [open, wide]);

  function pick(r: DateRange) {
    setDraft(r);
    if (r.checkIn && r.checkOut) {
      onChange(r.checkIn, r.checkOut);
      window.setTimeout(close, 380); // let the guest see the range before the calendar closes
    }
  }

  const nights = draft.checkIn && draft.checkOut ? nightsBetween(draft.checkIn, draft.checkOut) : 0;
  const summary =
    (nights
      ? `${nights} ${nights === 1 ? "night" : "nights"}: ${short(draft.checkIn!)} to ${short(draft.checkOut!)}`
      : draft.checkIn
        ? `Check-in ${short(draft.checkIn)}. Now pick your check-out date.`
        : "Pick your check-in date.") + (minNights > 1 && !nights ? ` Minimum stay ${minNights} nights.` : "");

  const calendar = today ? (
    <DateRangeCalendar key={slug} today={today} value={draft} onChange={pick} holidays={holidays} booked={booked} minNights={minNights} months={large ? 2 : 1} />
  ) : null;

  const footer = (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
      <p className="text-sm text-ink" aria-live="polite">{summary}</p>
      <div className="ml-auto flex gap-2">
        <button type="button" onClick={() => setDraft({ checkIn: null, checkOut: null })} className="min-h-11 rounded-[var(--radius-control)] px-4 text-sm font-semibold text-forest underline-offset-4 hover:underline">
          Clear dates
        </button>
        <button type="button" onClick={close} className="min-h-11 rounded-[var(--radius-control)] bg-forest px-6 text-sm font-semibold text-white transition hover:bg-forest-soft">
          Done
        </button>
      </div>
    </div>
  );

  const label = "text-[0.8rem] font-medium text-muted";
  const value = "mt-0.5 truncate text-[0.98rem] font-semibold text-ink";

  return (
    <div ref={wrap} className="relative">
      <div
        className={`grid grid-cols-[1fr_auto_1fr] items-center rounded-2xl transition-[background-color,box-shadow] duration-200 ${
          open ? "bg-card shadow-[0_8px_28px_-12px_rgb(28_43_36/0.35)] ring-1 ring-forest/15" : "bg-stone hover:bg-stone-deep"
        }`}
      >
        <button ref={trigger} type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => (open ? close() : show())} className="flex min-h-16 min-w-0 flex-col justify-center rounded-2xl px-4 py-2.5 text-left">
          <span className={label}>Check-in</span>
          <span className={value}>{checkIn ? short(checkIn) : "Add date"}</span>
        </button>
        <ArrowRight size={18} className="text-ink" aria-hidden />
        <button type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => (open ? close() : show())} className="flex min-h-16 min-w-0 flex-col justify-center rounded-2xl px-4 py-2.5 text-left">
          <span className={label}>Check-out</span>
          <span className={value}>{checkOut ? short(checkOut) : "Add date"}</span>
        </button>
      </div>

      {open && wide && (
        <div
          role="dialog"
          aria-label="Choose your dates"
          style={{ maxHeight: room.max }}
          className={`absolute z-50 flex flex-col overflow-hidden rounded-2xl bg-card shadow-[0_24px_60px_-20px_rgb(22_32_27/0.45)] ring-1 ring-line ${room.up ? "bottom-full mb-2" : "top-full mt-2"} ${
            large ? "right-0 w-[min(46rem,calc(100vw-2rem))]" : "inset-x-0"
          }`}
        >
          <div className="min-h-0 overflow-y-auto overscroll-contain px-5 pb-2 pt-5 sm:px-6">{calendar}</div>
          <div className="px-5 pb-4 sm:px-6">{footer}</div>
        </div>
      )}
      {open &&
        !wide &&
        createPortal(
          <div className="fixed inset-0 z-[70]">
            <div className="absolute inset-0 bg-night/55" onClick={close} aria-hidden />
            <div ref={sheet} role="dialog" aria-modal="true" aria-label="Choose your dates" className="absolute inset-x-0 bottom-0 flex max-h-[92svh] flex-col rounded-t-[1.6rem] bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <p className="font-display text-xl text-forest">Choose your dates</p>
                <button type="button" onClick={close} aria-label="Close" className="grid size-11 place-items-center rounded-full hover:bg-stone">
                  <X size={22} aria-hidden />
                </button>
              </div>
              <div className="min-h-0 overflow-y-auto overscroll-contain px-4 pb-2 pt-3">{calendar}</div>
              <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
