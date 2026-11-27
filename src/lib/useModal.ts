"use client";
// Shared behaviour for the website's popups (request a stay, get in touch): the page behind stays still
// (Lenis smooth scrolling too), the popup animates in, focus moves inside and comes back on close,
// Escape closes it and Tab cannot leave it.
import { useEffect, useRef, type RefObject } from "react";
import type Lenis from "lenis";
import { gsap } from "gsap";

export function useModal(box: RefObject<HTMLElement | null>, backdrop: RefObject<HTMLElement | null>, first: RefObject<HTMLElement | null>, onClose: () => void) {
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const overflow = html.style.overflow;
    html.style.overflow = "hidden";
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    lenis?.stop();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phone = !window.matchMedia("(min-width: 768px)").matches;
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
  }, [box, backdrop, first]);
}
