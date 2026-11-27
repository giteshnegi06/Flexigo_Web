"use client";
// Booking card: dates and guests, a live quote from the backend, then an enquiry form.
// Used beside the content on a home's page (sticky on computers) and on the /book page.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { CalendarCheck, Loader2 } from "lucide-react";
import { fetchQuote, sendEnquiry } from "@/lib/client-api";
import { addDaysIso, inr, prettyDate, whatsappLink } from "@/lib/format";
import { useToday } from "@/lib/useToday";
import type { Holiday, Quote } from "@/lib/types";
import { Button } from "../ui/Button";
import { DateRangeField } from "../search/DateRangeField";
import { HomeField } from "../search/HomeField";
import { GuestsField } from "../search/GuestsField";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

type HomeOption = { slug: string; name: string; maxGuests: number; nightlyPrice: number; minNights: number; coverPhoto?: string };

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const current = useRef(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const obj = { v: current.current };
    const tween = gsap.to(obj, {
      v: value,
      duration: reduce ? 0 : 0.6,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = inr(Math.round(obj.v));
      },
    });
    current.current = value;
    return () => {
      tween.kill();
    };
  }, [value]);
  return <span ref={ref}>{inr(value)}</span>;
}

export function BookingPanel({
  homes,
  initialSlug,
  initialIn,
  initialOut,
  initialGuests = 2,
  initialChildren = 0,
  whatsappNumber,
  holidays = [],
  showHomePicker = false,
}: {
  homes: HomeOption[];
  initialSlug?: string;
  initialIn?: string;
  initialOut?: string;
  initialGuests?: number;
  initialChildren?: number;
  whatsappNumber: string;
  holidays?: Holiday[];
  showHomePicker?: boolean;
}) {
  const router = useRouter();
  // Nothing is chosen for the guest: the home comes only from the page or the search, and the dates stay
  // empty until the guest picks them (or brings them from the hero search).
  const [slug, setSlug] = useState(initialSlug && homes.some((h) => h.slug === initialSlug) ? initialSlug : undefined);
  const home = homes.find((h) => h.slug === slug);
  const fromPrice = home?.nightlyPrice ?? Math.min(...homes.map((h) => h.nightlyPrice));
  const maxGuests = home?.maxGuests ?? Math.max(...homes.map((h) => h.maxGuests));
  // Dates are worked out in the browser so a cached page always uses the visitor's today.
  const today = useToday();
  const [pickedIn, setCheckIn] = useState<string | null>(null);
  const [pickedOut, setCheckOut] = useState<string | null>(null);
  const searchIn = today && initialIn && initialIn >= today ? initialIn : "";
  const checkIn = pickedIn ?? searchIn;
  const nightsDefault = Math.max(2, home?.minNights ?? 1);
  const wantedOut = pickedOut ?? (pickedIn ? null : initialOut ?? null);
  const checkOut = !checkIn ? "" : wantedOut && wantedOut > checkIn ? wantedOut : addDaysIso(checkIn, nightsDefault);
  // Adults and children are counted on the card, so the request form does not ask again.
  const [party, setParty] = useState(() => {
    const total = Math.max(1, Math.min(initialGuests, maxGuests || 2));
    const kids = Math.min(Math.max(0, initialChildren), total - 1);
    return { adults: total - kids, kids };
  });
  const guests = party.adults + party.kids;
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"dates" | "details">("dates");
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const homeSlug = home?.slug;
  // Live price once a home and both dates are chosen. A newer choice cancels the answer to an older one.
  useEffect(() => {
    let live = true;
    const t = setTimeout(async () => {
      if (!homeSlug || !checkIn || !checkOut) {
        setQuote(null);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      const res = await fetchQuote({ slug: homeSlug, checkIn, checkOut, guests });
      if (!live) return;
      setLoading(false);
      if (res.ok) setQuote(res.data);
      else {
        setQuote(null);
        setError(res.error.code === "unavailable" ? `Already booked on ${res.error.taken?.map(prettyDate).join(", ")}. Try other dates or another home.` : res.error.error);
      }
    }, 250);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [homeSlug, checkIn, checkOut, guests]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!home) return;
    const f = new FormData(e.currentTarget);
    setSending(true);
    setFormError(null);
    const res = await sendEnquiry({
      slug: home.slug,
      checkIn,
      checkOut,
      guests,
      adults: party.adults,
      children: party.kids,
      name: String(f.get("name") ?? ""),
      email: String(f.get("email") ?? ""),
      phone: String(f.get("phone") ?? ""),
      message: String(f.get("message") ?? "") || undefined,
      sourcePage: window.location.pathname,
      website: String(f.get("website") ?? ""),
    });
    setSending(false);
    if (!res.ok) {
      setFormError(res.error.error);
      return;
    }
    const q = new URLSearchParams({ id: String(res.data.enquiryId), home: home.name, in: checkIn, out: checkOut, total: String(res.data.quote.total) });
    router.push(`/book/thank-you?${q.toString()}`);
  }

  if (!homes.length) return null;
  const label = "text-xs font-semibold uppercase tracking-wider text-muted";
  const input = "mt-1 w-full rounded-[var(--radius-control)] border border-line bg-white px-3 py-2.5 text-base text-ink outline-none transition-colors focus:border-forest focus:ring-2 focus:ring-forest/10";
  const stay = home ? `at ${home.name}` : "with FlexiGo Stays";
  const waText = checkIn && checkOut ? `Hi, I'd like to stay ${stay} from ${prettyDate(checkIn)} to ${prettyDate(checkOut)} for ${guests} guests.` : `Hi, I'd like to stay ${stay}.`;
  const hint = !home && !checkIn ? "Choose a home and your dates to see the total price." : !home ? "Choose a home to see the total price." : "Pick your check-in and check-out dates to see the total price.";

  return (
    <div className="rounded-card border border-line bg-card p-5 shadow-soft sm:p-6" aria-live="polite">
      <p className="text-sm text-muted">From</p>
      <p className="text-2xl font-semibold text-forest">
        {inr(fromPrice)} <span className="text-base font-normal text-muted">/ night</span>
      </p>

      {showHomePicker && (
        <div className="mt-4">
          <HomeField
            homes={homes}
            value={home?.slug ?? ""}
            onChange={(next) => {
              setSlug(next);
              setStep("dates");
              // Keep the group within what the new home sleeps.
              const max = homes.find((h) => h.slug === next)?.maxGuests ?? guests;
              if (guests > max) setParty((p) => ({ adults: Math.max(1, max - Math.min(p.kids, max - 1)), kids: Math.min(p.kids, max - 1) }));
            }}
          />
        </div>
      )}

      {/* Same date picker as the hero search: holidays highlighted, booked nights and minimum stay enforced */}
      <div className="mt-4">
        <DateRangeField
          today={today}
          checkIn={checkIn}
          checkOut={checkOut}
          slug={home?.slug ?? ""}
          minNights={home?.minNights ?? 1}
          holidays={holidays}
          onChange={(i, o) => {
            setCheckIn(i);
            setCheckOut(o);
            setStep("dates");
          }}
        />
      </div>
      <div className="mt-3">
        <GuestsField
          adults={party.adults}
          kids={party.kids}
          max={maxGuests}
          homeName={home?.name}
          onChange={(adults, kids) => {
            setParty({ adults, kids });
            setStep("dates");
          }}
        />
      </div>

      <div className="mt-5 min-h-24 rounded-xl bg-stone p-4">
        {(!home || !checkIn || !checkOut) && <p className="text-sm text-muted">{hint}</p>}
        {loading && !quote && <p className="flex items-center gap-2 text-sm text-muted"><Loader2 className="animate-spin" size={16} aria-hidden /> Checking dates and price</p>}
        {error && <p className="text-sm text-red-800">{error}</p>}
        {quote && !error && (
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-muted">{quote.nights} {quote.nights === 1 ? "night" : "nights"}</dt><dd>{inr(quote.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Taxes ({quote.taxPercent}%)</dt><dd>{inr(quote.taxes)}</dd></div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-semibold text-forest"><dt>Total</dt><dd><AnimatedNumber value={quote.total} /></dd></div>
            <div className="flex justify-between text-xs text-muted"><dt>Advance to confirm ({quote.advancePercent}%)</dt><dd>{inr(quote.advance)}</dd></div>
          </dl>
        )}
      </div>

      {step === "dates" ? (
        <div className="mt-5 flex flex-col gap-3">
          <Button type="button" disabled={!quote || !!error || loading} onClick={() => setStep("details")}>
            <CalendarCheck size={18} aria-hidden /> Request these dates
          </Button>
          <a href={whatsappLink(whatsappNumber, waText)} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-whatsapp">
            <WhatsAppIcon size={17} /> Ask on WhatsApp instead
          </a>
          <p className="text-center text-xs text-muted">You will not be charged now. The host confirms your dates first.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-3" noValidate={false}>
          <label className="block"><span className={label}>Full name</span><input name="name" required minLength={2} autoComplete="name" className={input} /></label>
          <label className="block"><span className={label}>Email</span><input name="email" type="email" required autoComplete="email" className={input} /></label>
          <label className="block"><span className={label}>Phone</span><input name="phone" type="tel" required autoComplete="tel" placeholder="+91" className={input} /></label>
          <label className="block"><span className={label}>Message (optional)</span><textarea name="message" rows={3} className={input} placeholder="Arrival time, meals, pickup..." /></label>
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          {formError && <p className="text-sm text-red-800">{formError}</p>}
          <Button type="submit" disabled={sending} className="w-full">
            {sending ? <Loader2 className="animate-spin" size={18} aria-hidden /> : null} Send request
          </Button>
          <button type="button" onClick={() => setStep("dates")} className="min-h-11 w-full text-sm font-semibold text-forest">Change dates</button>
        </form>
      )}
    </div>
  );
}
