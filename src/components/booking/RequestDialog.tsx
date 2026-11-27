"use client";
// Popup that opens from "Request these dates": a summary of the stay (home, dates, guests, price) and the
// guest's contact details. A bottom sheet on phones, a centred window on larger screens.
// Escape, the close button or a click on the backdrop closes it; Tab stays inside while it is open.
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type Lenis from "lenis";
import { gsap } from "gsap";
import { CalendarDays, House, Loader2, Users, X } from "lucide-react";
import { inr } from "@/lib/format";
import type { Quote } from "@/lib/types";
import { Button } from "../ui/Button";

type Props = {
  homeName: string;
  coverPhoto?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  kids: number;
  quote: Quote;
  sending: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

const nice = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-IN", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" });

export function RequestDialog({ homeName, coverPhoto, checkIn, checkOut, adults, kids, quote, sending, error, onSubmit, onClose }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLInputElement>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);

  useEffect(() => {
    // Keep the page behind still (including Lenis smooth scrolling) and remember where focus was.
    const before = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const overflow = html.style.overflow;
    html.style.overflow = "hidden";
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    lenis?.stop();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phone = !window.matchMedia("(min-width: 640px)").matches;
    if (!reduce && box.current && backdrop.current) {
      gsap.fromTo(backdrop.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
      gsap.fromTo(box.current, phone ? { y: 60, opacity: 0 } : { y: 18, scale: 0.97, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.35, ease: "power3.out" });
    }
    first.current?.focus({ preventScroll: true });

    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close.current();
        return;
      }
      if (e.key !== "Tab" || !box.current) return;
      const items = [...box.current.querySelectorAll<HTMLElement>("button, input, textarea, a[href]")].filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
      if (!items.length) return;
      const a = items[0];
      const z = items[items.length - 1];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      html.style.overflow = overflow;
      lenis?.start();
      before?.focus({ preventScroll: true });
    };
  }, []);

  const label = "text-xs font-semibold uppercase tracking-wider text-muted";
  const input = "mt-1 w-full rounded-[var(--radius-control)] border border-line bg-white px-3 py-2.5 text-base text-ink outline-none transition-colors focus:border-forest focus:ring-2 focus:ring-forest/10";
  const guests = `${adults} ${adults === 1 ? "adult" : "adults"}${kids ? `, ${kids} ${kids === 1 ? "child" : "children"}` : ""}`;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
      <div ref={backdrop} className="absolute inset-0 bg-night/60 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-title"
        className="relative flex max-h-[94svh] w-full flex-col rounded-t-[1.6rem] bg-card shadow-2xl sm:max-h-[90svh] sm:max-w-xl sm:rounded-card"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
          <div>
            <p id="request-title" className="font-display text-2xl text-forest">Request your stay</p>
            <p className="text-sm text-muted">The host confirms your dates before you pay anything.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-stone">
            <X size={22} aria-hidden />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 sm:px-6" data-lenis-prevent>
          {/* What is being requested */}
          <div className="rounded-xl bg-stone p-4">
            <div className="flex items-center gap-3">
              {coverPhoto ? (
                <Image src={coverPhoto} alt="" width={64} height={64} className="size-16 shrink-0 rounded-xl object-cover" />
              ) : (
                <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-chip text-forest"><House size={24} aria-hidden /></span>
              )}
              <div className="min-w-0 text-sm">
                <p className="truncate text-base font-semibold text-ink">{homeName}</p>
                <p className="mt-1 flex items-center gap-1.5 text-muted"><CalendarDays size={15} aria-hidden /> {nice(checkIn)} to {nice(checkOut)}, {quote.nights} {quote.nights === 1 ? "night" : "nights"}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-muted"><Users size={15} aria-hidden /> {guests}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-1 border-t border-line pt-3 text-sm">
              <div className="flex justify-between font-semibold text-forest"><dt>Total (incl. {quote.taxPercent}% taxes)</dt><dd>{inr(quote.total)}</dd></div>
              <div className="flex justify-between text-xs text-muted"><dt>Advance to confirm ({quote.advancePercent}%)</dt><dd>{inr(quote.advance)}</dd></div>
            </dl>
          </div>

          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <label className="block"><span className={label}>Full name</span><input ref={first} name="name" required minLength={2} autoComplete="name" className={input} /></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block"><span className={label}>Email</span><input name="email" type="email" required autoComplete="email" className={input} /></label>
              <label className="block"><span className={label}>Phone</span><input name="phone" type="tel" required autoComplete="tel" placeholder="+91" className={input} /></label>
            </div>
            <label className="block"><span className={label}>Message (optional)</span><textarea name="message" rows={3} className={input} placeholder="Arrival time, meals, pickup..." /></label>
            <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            {error && <p className="text-sm text-red-800" role="alert">{error}</p>}
            <Button type="submit" disabled={sending} className="w-full">
              {sending ? <Loader2 className="animate-spin" size={18} aria-hidden /> : null} Send request
            </Button>
            <button type="button" onClick={onClose} className="min-h-11 w-full text-sm font-semibold text-forest">Change dates</button>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
