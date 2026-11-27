"use client";
// Sticky in-page menu for a home's page, like the section tabs on StayVista property pages.
// The underline slides to the section being read; tapping a tab scrolls smoothly to it.
import { useCallback, useEffect, useRef, useState } from "react";
import type Lenis from "lenis";

export type NavItem = { id: string; label: string };

function headerOffset() {
  return (window.innerWidth >= 1280 ? 80 : 64) + 56; // site header + this menu
}

export function SectionNav({ items, className = "" }: { items: NavItem[]; className?: string }) {
  const [active, setActive] = useState(items[0]?.id);
  const [bar, setBar] = useState({ left: 0, width: 0 });
  const list = useRef<HTMLDivElement>(null);
  const tabs = useRef<Record<string, HTMLButtonElement | null>>({});
  const locked = useRef(false);
  const unlockTimer = useRef<number | undefined>(undefined);

  // Scroll spy: the active section is the last one whose top has passed under the menu.
  useEffect(() => {
    const onScroll = () => {
      if (locked.current) return;
      const line = headerOffset() + 24;
      let current = items[0]?.id;
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= line) current = it.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  // Move the underline and keep the active tab visible in the scrollable row on phones.
  const place = useCallback(() => {
    const tab = active ? tabs.current[active] : null;
    if (!tab || !list.current) return;
    setBar({ left: tab.offsetLeft + 16, width: tab.offsetWidth - 32 }); // underline the label, not the padding
    const row = list.current;
    const target = tab.offsetLeft - row.clientWidth / 2 + tab.offsetWidth / 2;
    row.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [active]);
  useEffect(() => {
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [place]);

  function go(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    setActive(id);
    // Pause the scroll spy while the page glides to the section, so the underline does not flicker.
    locked.current = true;
    window.clearTimeout(unlockTimer.current);
    unlockTimer.current = window.setTimeout(() => (locked.current = false), 950);
    const y = el.getBoundingClientRect().top + window.scrollY - headerOffset() - 12;
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    if (lenis) lenis.scrollTo(y, { duration: 0.9 });
    else window.scrollTo({ top: y, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  return (
    <nav aria-label="Sections of this page" className={`sticky top-16 z-30 -mx-4 border-b border-line bg-card/95 backdrop-blur sm:-mx-6 lg:-mx-8 xl:top-20 ${className}`}>
      <div ref={list} className="relative flex overflow-x-auto px-4 [scrollbar-width:none] sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden">
        {items.map((it) => (
          <button
            key={it.id}
            ref={(el) => {
              tabs.current[it.id] = el;
            }}
            onClick={() => go(it.id)}
            aria-current={active === it.id ? "true" : undefined}
            className={`h-14 shrink-0 whitespace-nowrap px-4 text-[0.95rem] transition-colors duration-200 ${active === it.id ? "font-semibold text-ink" : "font-medium text-muted hover:text-ink"}`}
          >
            {it.label}
          </button>
        ))}
        <span aria-hidden className="absolute bottom-0 h-0.5 rounded-full bg-forest transition-[left,width] duration-300 ease-out" style={{ left: bar.left, width: bar.width }} />
      </div>
    </nav>
  );
}
