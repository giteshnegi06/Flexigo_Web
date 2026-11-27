"use client";
// "A day here": on large screens the photo stays pinned while the text moves from sunrise to night,
// and the photo cross-fades with each step (GSAP ScrollTrigger). On phones it is a simple list.
import Image from "next/image";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { dayStory } from "@/lib/content";
import type { SiteImages } from "@/lib/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function DayStory({ images }: { images: SiteImages }) {
  const root = useRef<HTMLElement>(null);
  // Photos come from the database by key. A missing one leaves a plain panel, so steps and photos stay in line.
  const steps = dayStory.map((s) => ({ ...s, photo: images[s.image] }));

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const photos = gsap.utils.toArray<HTMLElement>(".story-photo");
        const steps = gsap.utils.toArray<HTMLElement>(".story-step");
        gsap.set(photos.slice(1), { autoAlpha: 0 });
        steps.forEach((step, i) => {
          ScrollTrigger.create({
            trigger: step,
            start: "top 60%",
            end: "bottom 60%",
            onToggle: (self) => {
              if (!self.isActive) return;
              gsap.to(photos, { autoAlpha: (j: number) => (j === i ? 1 : 0), duration: 0.7, ease: "power2.out", overwrite: true });
              gsap.to(steps, { opacity: (j: number) => (j === i ? 1 : 0.35), duration: 0.4, overwrite: true });
            },
          });
        });
        ScrollTrigger.create({ trigger: ".story-media", start: "top 96px", endTrigger: ".story-steps", end: "bottom 70%", pin: true });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="mx-auto max-w-site px-4 py-20 sm:px-6 lg:px-8 lg:py-28" aria-labelledby="day-title">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pine-dark">A day here</p>
      <h2 id="day-title" data-reveal className="mt-3 max-w-2xl text-4xl sm:text-5xl">From sunrise chai to quiet, warm nights</h2>
      <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="story-media relative hidden aspect-[4/5] overflow-hidden rounded-card lg:block">
          {steps.map((s, i) =>
            s.photo ? (
              <Image key={s.time} src={s.photo.url} alt={s.photo.alt} fill sizes="50vw" className="story-photo object-cover" priority={i === 0} />
            ) : (
              <div key={s.time} className="story-photo absolute inset-0 bg-stone" aria-hidden />
            ),
          )}
        </div>
        <ol className="story-steps flex flex-col gap-10 lg:gap-[30vh] lg:py-[12vh]">
          {steps.map((s) => (
            <li key={s.time} className="story-step">
              {s.photo && (
                <div className="relative mb-5 aspect-[16/10] overflow-hidden rounded-card lg:hidden">
                  <Image src={s.photo.url} alt={s.photo.alt} fill sizes="100vw" className="object-cover" />
                </div>
              )}
              <p className="font-display text-5xl text-pine">{s.time}</p>
              <h3 className="mt-2 text-3xl">{s.title}</h3>
              <p className="mt-3 max-w-md text-lg text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
