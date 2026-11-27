"use client";
// Check-in and check-out calendar, modelled on the StayVista date picker: two months side by side (one on phones),
// weekends marked in red, holidays in blue with a dot, and the upcoming holidays listed underneath so guests can
// spot long weekends. Booked nights are struck through, and the minimum stay is enforced while choosing check-out.
// Keyboard: arrow keys move by day and week, Page Up and Page Down by month, Home and End to the week's ends.
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDaysIso } from "@/lib/format";
import type { Holiday } from "@/lib/types";

export type DateRange = { checkIn: string | null; checkOut: string | null };
type Month = { y: number; m: number }; // m is 0 to 11

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const monthOf = (day: string): Month => ({ y: Number(day.slice(0, 4)), m: Number(day.slice(5, 7)) - 1 });
const shift = ({ y, m }: Month, n: number): Month => {
  const t = y * 12 + m + n;
  return { y: Math.floor(t / 12), m: ((t % 12) + 12) % 12 };
};
const order = ({ y, m }: Month) => y * 12 + m;
const daysIn = ({ y, m }: Month) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
const weekdayOf = (day: string) => new Date(day + "T00:00:00Z").getUTCDay(); // 0 is Sunday
const fmt = (day: string, o: Intl.DateTimeFormatOptions) => new Date(day + "T00:00:00Z").toLocaleDateString("en-IN", { timeZone: "UTC", ...o });

/** A short planning hint for a holiday, from the day of the week it falls on and any holiday right next to it. */
export function holidayHint(day: string, others?: Set<string>) {
  const w = weekdayOf(day);
  if (w === 1 || w === 5) return "Long weekend";
  // Thursday before a Friday holiday, or Tuesday after a Monday holiday, joins a long weekend too.
  if ((w === 4 && others?.has(addDaysIso(day, 1))) || (w === 2 && others?.has(addDaysIso(day, -1)))) return "Long weekend";
  if (w === 2 || w === 4) return "Take 1 day off";
  if (w === 0 || w === 6) return "Weekend";
  return "Holiday";
}

type Props = {
  today: string;
  value: DateRange;
  onChange: (range: DateRange) => void;
  holidays: Holiday[];
  booked?: Set<string>;
  minNights?: number;
  months?: 1 | 2;
  maxDays?: number;
};

export function DateRangeCalendar({ today, value, onChange, holidays, booked, minNights = 1, months = 2, maxDays = 365 }: Props) {
  const lastDay = addDaysIso(today, maxDays);
  const [view, setView] = useState<Month>(() => monthOf(value.checkIn && value.checkIn >= today ? value.checkIn : today));
  const [hover, setHover] = useState<string | null>(null);
  const [focusDay, setFocusDay] = useState(value.checkIn ?? today);
  const [flash, setFlash] = useState<string | null>(null);
  const moveFocus = useRef(false);
  const root = useRef<HTMLDivElement>(null);

  const holidayName = useMemo(() => new Map(holidays.map((h) => [h.day, h.name])), [holidays]);
  const holidayDays = useMemo(() => new Set(holidays.map((h) => h.day)), [holidays]);
  const { checkIn, checkOut } = value;
  const choosingOut = !!checkIn && !checkOut;
  const minOut = checkIn ? addDaysIso(checkIn, Math.max(1, minNights)) : null;

  // The first booked night on or after check-in. A stay can end on that date but not run past it.
  const stopAt = useMemo(() => {
    if (!choosingOut || !booked) return null;
    let first: string | null = null;
    for (const n of booked) if (n >= checkIn && (!first || n < first)) first = n;
    return first;
  }, [choosingOut, booked, checkIn]);

  const isCheckOutCandidate = (d: string) => choosingOut && d > checkIn && !(stopAt && d > stopAt);
  const isDisabled = (d: string) => {
    if (d < today || d > lastDay) return true;
    if (isCheckOutCandidate(d)) return d < minOut!;
    return booked?.has(d) ?? false;
  };

  function pick(d: string) {
    if (isDisabled(d)) return;
    setFocusDay(d);
    if (isCheckOutCandidate(d)) onChange({ checkIn, checkOut: d });
    else onChange({ checkIn: d, checkOut: null });
  }

  // While choosing check-out, hovering previews the stay.
  const end = checkOut ?? (choosingOut && hover && isCheckOutCandidate(hover) && !isDisabled(hover) ? hover : null);

  const first = view;
  const visibleMonths = Array.from({ length: months }, (_, i) => shift(first, i));
  const visibleStart = iso(first.y, first.m, 1);
  const lastMonth = visibleMonths[visibleMonths.length - 1];
  const visibleEnd = iso(lastMonth.y, lastMonth.m, daysIn(lastMonth));
  const canPrev = order(first) > order(monthOf(today));
  const canNext = order(lastMonth) < order(monthOf(lastDay));
  const tabDay = focusDay >= visibleStart && focusDay <= visibleEnd ? focusDay : visibleStart < today ? today : visibleStart;

  function showMonthOf(day: string) {
    const target = monthOf(day);
    if (order(target) < order(first)) setView(target);
    else if (order(target) > order(lastMonth)) setView(shift(target, -(months - 1)));
  }

  function onKey(e: React.KeyboardEvent, d: string) {
    let next: string | null = null;
    const step = ({ ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 } as Record<string, number>)[e.key];
    const fromMonday = (weekdayOf(d) + 6) % 7;
    if (step) next = addDaysIso(d, step);
    else if (e.key === "Home") next = addDaysIso(d, -fromMonday);
    else if (e.key === "End") next = addDaysIso(d, 6 - fromMonday);
    else if (e.key === "PageUp" || e.key === "PageDown") {
      const target = shift(monthOf(d), e.key === "PageUp" ? -1 : 1);
      next = iso(target.y, target.m, Math.min(Number(d.slice(8, 10)), daysIn(target)));
    }
    if (!next) return;
    e.preventDefault();
    if (next < today) next = today;
    if (next > lastDay) next = lastDay;
    moveFocus.current = true;
    setFocusDay(next);
    showMonthOf(next);
  }

  // Move keyboard focus after the grid re-renders (the target day may be in a month that just came into view).
  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    root.current?.querySelector<HTMLButtonElement>(`[data-day="${focusDay}"]`)?.focus();
  }, [focusDay, view]);

  // Upcoming holidays from the first month in view: the ones you can see, then the next few after them.
  const listFrom = visibleStart > today ? visibleStart : today;
  const upcoming = holidays.filter((h) => h.day >= listFrom).slice(0, months === 2 ? 4 : 3);

  function jumpTo(day: string) {
    showMonthOf(day);
    setFlash(day);
    window.setTimeout(() => setFlash((f) => (f === day ? null : f)), 1800);
  }

  return (
    <div ref={root} onMouseLeave={() => setHover(null)}>
      <div className={`grid gap-x-10 gap-y-6 ${months === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
        {visibleMonths.map((mon, mi) => {
          const count = daysIn(mon);
          const offset = (new Date(Date.UTC(mon.y, mon.m, 1)).getUTCDay() + 6) % 7;
          const title = new Date(Date.UTC(mon.y, mon.m, 1)).toLocaleDateString("en-IN", { month: "short", year: "numeric", timeZone: "UTC" });
          return (
            <div key={`${mon.y}-${mon.m}`} role="group" aria-label={new Date(Date.UTC(mon.y, mon.m, 1)).toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" })}>
              <div className="mb-3 flex h-11 items-center justify-between border-b border-line pb-2">
                {mi === 0 ? (
                  <button type="button" onClick={() => setView(shift(first, -1))} disabled={!canPrev} aria-label="Previous month" className="grid size-10 place-items-center rounded-full text-ink transition hover:bg-stone disabled:pointer-events-none disabled:text-line">
                    <ChevronLeft size={20} aria-hidden />
                  </button>
                ) : (
                  <span className="size-10" aria-hidden />
                )}
                <p className="text-lg font-semibold text-ink" aria-live={mi === 0 ? "polite" : undefined}>{title}</p>
                {mi === months - 1 ? (
                  <button type="button" onClick={() => setView(shift(first, 1))} disabled={!canNext} aria-label="Next month" className="grid size-10 place-items-center rounded-full text-ink transition hover:bg-stone disabled:pointer-events-none disabled:text-line">
                    <ChevronRight size={20} aria-hidden />
                  </button>
                ) : (
                  <span className="size-10" aria-hidden />
                )}
              </div>
              <div className="grid grid-cols-7 text-center text-[0.8rem] font-medium" aria-hidden>
                {WEEK.map((w, i) => (
                  <span key={w} className={`pb-2 ${i >= 5 ? "text-weekend" : "text-ink"}`}>{w}</span>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: offset }, (_, i) => <span key={"pad" + i} aria-hidden />)}
                {Array.from({ length: count }, (_, i) => {
                  const d = iso(mon.y, mon.m, i + 1);
                  const off = isDisabled(d);
                  const isBooked = !!booked?.has(d) && d >= today;
                  const holiday = holidayName.get(d);
                  const start = d === checkIn;
                  const finish = d === end;
                  const inside = !!checkIn && !!end && d > checkIn && d < end;
                  const edge = start || finish;
                  const band = inside || (start && !!end && end !== checkIn) || (finish && !!checkIn);
                  const label = [
                    fmt(d, { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
                    holiday && `${holiday}, holiday`,
                    isBooked && "booked",
                    start && "your check-in",
                    d === checkOut && "your check-out",
                    d === today && "today",
                  ]
                    .filter(Boolean)
                    .join(", ");
                  return (
                    <div key={d} className="cal-cell relative flex h-11 items-center justify-center sm:h-12" onMouseEnter={() => setHover(d)}>
                      {band && <span aria-hidden className={`absolute inset-y-1 bg-stone-deep ${start ? "left-1/2 right-0" : finish ? "left-0 right-1/2" : "inset-x-0"}`} />}
                      <button
                        type="button"
                        data-day={d}
                        tabIndex={d === tabDay ? 0 : -1}
                        disabled={off}
                        aria-label={label}
                        aria-pressed={edge}
                        title={holiday}
                        onClick={() => pick(d)}
                        onKeyDown={(e) => onKey(e, d)}
                        onFocus={() => setHover(d)}
                        className={`relative z-10 grid size-10 place-items-center rounded-full text-[0.95rem] transition-[background-color,color,box-shadow] duration-150 sm:size-11 ${
                          edge
                            ? "bg-forest font-semibold text-white"
                            : off
                              ? `cursor-not-allowed text-muted/45 ${isBooked ? "line-through" : ""}`
                              : holiday
                                ? "font-semibold text-holiday hover:ring-1 hover:ring-holiday"
                                : "font-medium text-ink hover:ring-1 hover:ring-forest"
                        } ${flash === d ? "animate-pulse ring-2 ring-holiday" : ""}`}
                      >
                        <span className={d === today ? "border-b-2 border-current leading-none" : undefined}>{i + 1}</span>
                        {holiday && <span aria-hidden className={`absolute bottom-1.5 size-1 rounded-full ${edge ? "bg-white" : off ? "bg-holiday/40" : "bg-holiday"}`} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Upcoming holidays</p>
        {upcoming.length ? (
          <ul className="-mx-1 mt-2 flex snap-x gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {upcoming.map((h) => (
              <li key={h.day} className="snap-start">
                <button
                  type="button"
                  onClick={() => jumpTo(h.day)}
                  className="flex min-w-[9.5rem] flex-col items-start rounded-xl bg-holiday-tint px-3 py-2 text-left ring-1 ring-transparent transition hover:ring-holiday/40"
                  aria-label={`${h.name}, ${fmt(h.day, { weekday: "long", day: "numeric", month: "long" })}. ${holidayHint(h.day, holidayDays)}. Show in calendar`}
                >
                  <span className="text-[0.72rem] font-semibold text-holiday">{holidayHint(h.day, holidayDays)}</span>
                  <span className="text-sm font-semibold text-ink">{fmt(h.day, { weekday: "short", day: "numeric", month: "short" })}</span>
                  <span className="text-xs text-muted">{h.name}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">No holidays in these months.</p>
        )}
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted" aria-hidden>
          <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-holiday" /> Holiday</span>
          <span><span className="line-through">12</span> Booked</span>
          <span><span className="border-b-2 border-current">8</span> Today</span>
        </p>
      </div>
    </div>
  );
}
