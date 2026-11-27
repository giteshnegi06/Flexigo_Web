"use client";
// Home page hero, laid out like the StayVista hero: a photo slideshow with one simple headline
// in the middle, thin arrows on the sides, and the search card sitting inside the bottom edge of the photo.
// Everything (headline, search and the holiday strip) fits in the first screen, so nobody has to scroll to search.
// The slideshow changes every few seconds, pauses on hover and focus, can be swiped on phones,
// and does not change by itself for visitors who prefer reduced motion.
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { CalendarHeart, ChevronLeft, ChevronRight, PhoneCall } from "lucide-react";
import { whatsappLink } from "@/lib/format";
import { useToday } from "@/lib/useToday";
import { useMediaQuery } from "@/lib/useMediaQuery";
import type { Holiday, SiteImage } from "@/lib/types";
import { holidayHint } from "@/components/search/DateRangeCalendar";
import { SearchBar, type SearchHome } from "./SearchBar";

gsap.registerPlugin(SplitText, useGSAP);

const SLIDE_MS = 6000;

type Props = { homes: SearchHome[]; holidays: Holiday[]; whatsappNumber: string; heroImage?: SiteImage };

export function Hero({ homes, holidays, whatsappNumber, heroImage }: Props) {
  const root = useRef<HTMLElement>(null);
  const touchX = useRef<number | null>(null);
  const today = useToday();
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false); // pointer or keyboard focus is on the photo

  const slides = [
    // The first photo is set in the admin panel (Images), then each home's cover photo.
    ...(heroImage ? [{ src: heroImage.url, alt: heroImage.alt }] : []),
    ...homes.map((h) => ({ src: h.coverPhoto, alt: `${h.name}, Shimla` })),
  ];
  const count = slides.length;
  const go = (step: number) => setIndex((i) => (i + step + count) % count);

  useEffect(() => {
    if (held || reduce || count < 2) return;
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [held, reduce, count, index]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(".hero-title", { type: "lines", mask: "lines" });
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(".hero-stage", { scale: 1.1, duration: 2.4, ease: "power2.out" }, 0)
          .from(split.lines, { yPercent: 110, duration: 1, stagger: 0.12 }, 0.2)
          // clearProps leaves no transform behind, so the search card's popovers position normally
          .from(".hero-fade", { autoAlpha: 0, y: 18, duration: 0.8, stagger: 0.1, clearProps: "transform" }, 0.6);
        return () => split.revert();
      });
    },
    { scope: root },
  );

  const next = today ? holidays.find((h) => h.day >= today) : undefined;
  const nextDate = next && new Date(next.day + "T00:00:00Z").toLocaleDateString("en-IN", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" });
  const nextHint = next && holidayHint(next.day, new Set(holidays.map((h) => h.day)));
  const arrow = "absolute top-[38%] z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full text-white/90 transition hover:bg-white/15 hover:text-white md:top-[40%] lg:top-[44%]";

  return (
    <section ref={root} aria-label="Welcome to FlexiGo Stays" className="relative bg-card pb-4">
      {/* Photo area. Its height leaves room below for the holiday strip, so the whole search is in the first screen. */}
      <div
        className="relative isolate h-[calc(100svh-9.5rem)] max-h-[52rem] min-h-[34rem] overflow-hidden bg-night md:h-[calc(100svh-6rem)] lg:h-[calc(100svh-5.5rem)]"
        onPointerEnter={(e) => e.pointerType === "mouse" && setHeld(true)}
        onPointerLeave={() => setHeld(false)}
        onFocus={() => setHeld(true)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setHeld(false)}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        }}
      >
        <div className="hero-stage absolute inset-0 -z-20">
          {slides.map((s, i) => (
            <div key={s.src} aria-hidden={i !== index} className={`absolute inset-0 transition-opacity duration-[1400ms] ease-out ${i === index ? "opacity-100" : "opacity-0"}`}>
              <Image
                src={s.src}
                alt={i === index ? s.alt : ""}
                fill
                priority={i === 0}
                sizes="100vw"
                className={`object-cover transition-transform ease-out ${i === index ? "scale-[1.06] duration-[8000ms]" : "scale-100 duration-[1400ms]"}`}
              />
            </div>
          ))}
        </div>
        {/* Darker at the top for the menu and at the bottom behind the search card, clear in the middle */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-night/60 via-night/25 to-night/65" />

        <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className={`${arrow} left-1 sm:left-4 lg:left-8`}>
          <ChevronLeft size={34} strokeWidth={1.5} aria-hidden />
        </button>
        <button type="button" onClick={() => go(1)} aria-label="Next photo" className={`${arrow} right-1 sm:right-4 lg:right-8`}>
          <ChevronRight size={34} strokeWidth={1.5} aria-hidden />
        </button>

        {/* One simple headline in the space between the menu and the search card */}
        <div className="absolute inset-x-0 bottom-[13.75rem] top-16 flex flex-col items-center justify-center px-12 text-center md:bottom-[10.5rem] lg:bottom-[6.25rem] xl:top-20">
          <h1 className="hero-title max-w-5xl text-[2.1rem] font-medium leading-[1.1] text-white [text-shadow:0_2px_24px_rgb(0_0_0/0.3)] sm:text-[2.5rem] lg:text-[3.75rem]">
            Wake up above the Shimla valley
          </h1>
        </div>
      </div>

      {/* Search card, sitting inside the bottom edge of the photo */}
      <div className="hero-fade relative z-30 mx-auto -mt-[13.25rem] max-w-site px-3 sm:px-6 md:-mt-[10.125rem] lg:-mt-[5.875rem] lg:px-8">
        <SearchBar homes={homes} holidays={holidays} />

        {/* Holiday strip, like the help note under the StayVista search bar */}
        <div className="mt-3 flex flex-col gap-1.5 rounded-2xl bg-gradient-to-r from-peach to-blush px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
          <p className="flex items-start gap-2.5 text-sm text-ink sm:items-center">
            <CalendarHeart size={18} className="mt-0.5 shrink-0 text-weekend sm:mt-0" aria-hidden />
            <span>
              {next ? (
                <>
                  <strong className="font-semibold">{next.name}</strong> is on {nextDate}
                  {nextHint === "Long weekend" ? ", a long weekend." : "."} Holiday dates book out first.
                </>
              ) : (
                <>Holiday weekends in Shimla book out first. Tell us your dates early.</>
              )}
            </span>
          </p>
          <a
            href={whatsappLink(whatsappNumber, "Hi, please call me back about a stay at FlexiGo Stays.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 pl-7 text-sm font-semibold text-forest underline underline-offset-4 hover:text-forest-soft sm:pl-0"
          >
            <PhoneCall size={16} aria-hidden /> Request a callback
          </a>
        </div>
      </div>
    </section>
  );
}
