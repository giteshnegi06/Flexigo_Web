"use client";
// Endless scrolling row or column, with the same props as the motion-primitives InfiniteSlider used by 21st.dev
// components (direction, speed, speedOnHover, gap, reverse). Built on GSAP, which the site already loads.
// The children are drawn twice and the track moves by exactly one copy, so the loop has no visible seam.
// Hovering eases to speedOnHover; `paused` stops it; visitors who prefer reduced motion see it standing still.
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

type Props = {
  children: React.ReactNode;
  gap?: number;
  /** pixels per second */
  speed?: number;
  /** pixels per second while hovered */
  speedOnHover?: number;
  direction?: "horizontal" | "vertical";
  reverse?: boolean;
  paused?: boolean;
  className?: string;
};

export function InfiniteSlider({ children, gap = 24, speed = 40, speedOnHover, direction = "horizontal", reverse = false, paused = false, className }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const pausedRef = useRef(paused);
  const vertical = direction === "vertical";

  useGSAP(
    () => {
      const el = track.current;
      const copy = el?.firstElementChild as HTMLElement | null;
      if (!el || !copy) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const axis = vertical ? "y" : "x";
        let built = 0;
        const build = () => {
          const size = vertical ? copy.offsetHeight : copy.offsetWidth;
          if (!size || size === built) return; // hidden (display none) or unchanged
          built = size;
          const progress = tween.current?.progress() ?? 0;
          tween.current?.kill();
          const distance = size + gap;
          gsap.set(el, { [axis]: reverse ? -distance : 0 });
          tween.current = gsap.to(el, { [axis]: reverse ? 0 : -distance, duration: distance / speed, ease: "none", repeat: -1 }).progress(progress);
          if (pausedRef.current) tween.current.pause();
        };
        build();
        const observer = new ResizeObserver(build);
        observer.observe(copy);
        return () => {
          observer.disconnect();
          tween.current?.kill();
          tween.current = null;
          gsap.set(el, { clearProps: "transform" });
        };
      });
    },
    { scope: root, dependencies: [gap, speed, vertical, reverse] },
  );

  useEffect(() => {
    pausedRef.current = paused;
    if (paused) tween.current?.pause();
    else tween.current?.resume();
  }, [paused]);

  const ease = (to: number) => tween.current && gsap.to(tween.current, { timeScale: to, duration: 0.5, ease: "power2.out", overwrite: true });

  return (
    <div
      ref={root}
      className={cn("overflow-hidden", className)}
      onPointerEnter={() => speedOnHover && ease(speedOnHover / speed)}
      onPointerLeave={() => speedOnHover && ease(1)}
    >
      <div ref={track} className={cn("flex w-max will-change-transform", vertical && "w-full flex-col")} style={{ gap }}>
        <div className={cn("flex", vertical && "flex-col")} style={{ gap }}>
          {children}
        </div>
        {/* Second copy for the seamless loop: hidden from screen readers and keyboard */}
        <div className={cn("flex", vertical && "flex-col")} style={{ gap }} aria-hidden inert>
          {children}
        </div>
      </div>
    </div>
  );
}

export default InfiniteSlider;
