"use client";
// Lenis smooth scrolling on computers only, kept in sync with GSAP ScrollTrigger.
// Skipped on touch screens and when the visitor prefers reduced motion.
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll() {
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine) and (min-width: 1024px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    // Shared so in-page menus (like the property section menu) can scroll smoothly through Lenis.
    (window as Window & { __lenis?: Lenis }).__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      delete (window as Window & { __lenis?: Lenis }).__lenis;
      lenis.destroy();
    };
  }, []);
  return null;
}
