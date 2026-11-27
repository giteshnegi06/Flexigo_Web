"use client";
// Photo grid that opens a full-screen tour grouped by room type. Keyboard: arrows and Escape. Swipe on phones.
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Grid2x2, X } from "lucide-react";
import { gsap } from "gsap";
import type { Photo } from "@/lib/types";

export function PhotoTour({ photos, name }: { photos: Photo[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);

  const show = useCallback((i: number) => {
    setOpen(i);
    dialog.current?.showModal();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce && dialog.current) gsap.fromTo(dialog.current, { autoAlpha: 0, scale: 0.98 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "power2.out" });
  }, []);
  const close = useCallback(() => {
    dialog.current?.close();
    setOpen(null);
  }, []);
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length)), [photos.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open === null) return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  const [first, ...rest] = photos;
  if (!first) return null;
  const current = open === null ? null : photos[open];

  return (
    <>
      <div className="relative grid gap-2 overflow-hidden rounded-card sm:grid-cols-4 sm:grid-rows-2">
        <button onClick={() => show(0)} className="relative aspect-[4/3] sm:col-span-2 sm:row-span-2 sm:aspect-auto sm:min-h-[26rem]" aria-label={`Open photo tour of ${name}`}>
          <Image src={first.url} alt={first.alt} fill priority sizes="(min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 hover:scale-[1.03]" />
        </button>
        {rest.slice(0, 4).map((p, i) => (
          <button key={p.id} onClick={() => show(i + 1)} className="relative hidden aspect-[4/3] overflow-hidden sm:block" aria-label={`Open photo: ${p.alt}`}>
            <Image src={p.url} alt={p.alt} fill sizes="25vw" className="object-cover transition-transform duration-700 hover:scale-[1.05]" />
          </button>
        ))}
        <button onClick={() => show(0)} className="absolute bottom-4 right-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-white/95 px-4 text-sm font-semibold text-forest shadow-soft">
          <Grid2x2 size={16} aria-hidden /> All {photos.length} photos
        </button>
      </div>

      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-forest/95 p-0 text-white backdrop:bg-black/60"
        aria-label={`${name} photo tour`}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {current && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between p-4">
              <p className="text-sm">{(open ?? 0) + 1} / {photos.length} · <span className="capitalize">{current.category}</span></p>
              <button onClick={close} className="grid size-11 place-items-center rounded-full bg-white/10" aria-label="Close photo tour"><X aria-hidden /></button>
            </div>
            <div className="relative flex-1">
              <Image key={current.id} src={current.url} alt={current.alt} fill sizes="100vw" className="object-contain" />
            </div>
            <div className="flex items-center justify-between gap-4 p-4">
              <button onClick={() => step(-1)} className="grid size-12 place-items-center rounded-full bg-white/10" aria-label="Previous photo"><ChevronLeft aria-hidden /></button>
              <p className="text-center text-sm text-white/90">{current.alt}</p>
              <button onClick={() => step(1)} className="grid size-12 place-items-center rounded-full bg-white/10" aria-label="Next photo"><ChevronRight aria-hidden /></button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
