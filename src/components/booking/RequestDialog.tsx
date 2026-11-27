"use client";
// Popup that opens from "Request these dates": a summary of the stay (home, dates, guests, price) and the
// guest's contact details. A bottom sheet on phones; on larger screens a wide window with the summary beside the form.
// Escape, the close button or a click on the backdrop closes it; Tab stays inside while it is open.
import { useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { CalendarDays, House, Loader2, Users, X } from "lucide-react";
import { inr } from "@/lib/format";
import { useModal } from "@/lib/useModal";
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
  useModal(box, backdrop, first, onClose);

  const label = "text-xs font-semibold uppercase tracking-wider text-muted";
  const input = "mt-1 w-full rounded-[var(--radius-control)] border border-line bg-white px-3 py-2 text-base text-ink outline-none transition-colors focus:border-forest focus:ring-2 focus:ring-forest/10";
  const guests = `${adults} ${adults === 1 ? "adult" : "adults"}${kids ? `, ${kids} ${kids === 1 ? "child" : "children"}` : ""}`;

  // On tablets and computers the summary sits beside the form, so the whole popup fits on screen without scrolling.
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center md:items-center md:p-6">
      <div ref={backdrop} className="absolute inset-0 bg-night/60 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-title"
        className="relative flex max-h-[94svh] w-full flex-col overflow-hidden rounded-t-[1.6rem] bg-card shadow-2xl md:max-h-[calc(100svh-3rem)] md:max-w-[52rem] md:flex-row md:rounded-card"
      >
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-10 grid size-11 place-items-center rounded-full bg-card/90 text-ink hover:bg-stone">
          <X size={22} aria-hidden />
        </button>

        {/* What is being requested */}
        <aside className="shrink-0 border-b border-line bg-stone md:flex md:w-[19rem] md:flex-col md:border-b-0 md:border-r">
          <div className="relative hidden aspect-[4/3] md:block">
            {coverPhoto ? (
              <Image src={coverPhoto} alt="" fill sizes="304px" className="object-cover" />
            ) : (
              <span className="grid size-full place-items-center bg-chip text-forest"><House size={36} aria-hidden /></span>
            )}
          </div>
          <div className="flex items-center gap-3 p-4 pr-14 md:block md:p-5">
            {coverPhoto ? (
              <Image src={coverPhoto} alt="" width={56} height={56} className="size-14 shrink-0 rounded-xl object-cover md:hidden" />
            ) : (
              <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-chip text-forest md:hidden"><House size={22} aria-hidden /></span>
            )}
            <div className="min-w-0 text-sm">
              <p className="truncate text-base font-semibold text-ink md:text-lg">{homeName}</p>
              <p className="mt-1 flex items-center gap-1.5 text-muted"><CalendarDays size={15} className="shrink-0" aria-hidden /> {nice(checkIn)} to {nice(checkOut)}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-muted"><Users size={15} className="shrink-0" aria-hidden /> {quote.nights} {quote.nights === 1 ? "night" : "nights"}, {guests}</p>
            </div>
          </div>
          <dl className="mx-4 mb-4 space-y-1 border-t border-line pt-3 text-sm md:mx-5 md:mb-5 md:mt-auto">
            <div className="flex justify-between font-semibold text-forest"><dt>Total (incl. {quote.taxPercent}% taxes)</dt><dd>{inr(quote.total)}</dd></div>
            <div className="flex justify-between text-xs text-muted"><dt>Advance to confirm ({quote.advancePercent}%)</dt><dd>{inr(quote.advance)}</dd></div>
          </dl>
        </aside>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5 md:px-7 md:pb-6 md:pt-6" data-lenis-prevent>
          <p id="request-title" className="pr-10 font-display text-2xl text-forest md:text-[1.75rem]">Request your stay</p>
          <p className="text-sm text-muted">The host confirms your dates before you pay anything.</p>

          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <label className="block"><span className={label}>Full name</span><input ref={first} name="name" required minLength={2} autoComplete="name" className={input} /></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block"><span className={label}>Email</span><input name="email" type="email" required autoComplete="email" className={input} /></label>
              <label className="block"><span className={label}>Phone</span><input name="phone" type="tel" required autoComplete="tel" placeholder="+91" className={input} /></label>
            </div>
            <label className="block"><span className={label}>Message (optional)</span><textarea name="message" rows={2} className={`${input} resize-none`} placeholder="Arrival time, meals, pickup..." /></label>
            <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            {error && <p className="text-sm text-red-800" role="alert">{error}</p>}
            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center">
              <button type="button" onClick={onClose} className="min-h-11 rounded-[var(--radius-control)] px-4 text-sm font-semibold text-forest hover:bg-stone">Change dates</button>
              <Button type="submit" disabled={sending} className="sm:flex-1">
                {sending ? <Loader2 className="animate-spin" size={18} aria-hidden /> : null} Send request
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
