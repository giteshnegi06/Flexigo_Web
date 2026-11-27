"use client";
// Shared behaviour for the small pop-up panels on the booking card (home list, guest counter):
// opens below its field, or above when there is more room there; closes on a click outside and on Escape.
import { useEffect, useRef, useState } from "react";

export function usePopover(want = 380) {
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [room, setRoom] = useState({ up: false, max: 480 });

  function show() {
    const box = ref.current?.getBoundingClientRect();
    if (box) {
      const below = window.innerHeight - box.bottom - 16;
      const above = box.top - (window.innerWidth >= 1280 ? 80 : 64) - 12;
      const up = below < want && above > below;
      setRoom({ up, max: Math.max(240, up ? above : below) });
    }
    setOpen(true);
  }
  const hide = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  return { ref, trigger, open, room, show, hide, toggle: () => (open ? hide() : show()) };
}

/** Field and panel styles shared with the hero search bar. */
export const pill = {
  field: (open: boolean) =>
    `flex min-h-16 w-full flex-col justify-center rounded-2xl px-4 py-2.5 text-left transition-[background-color,box-shadow] duration-200 ${
      open ? "bg-card shadow-[0_8px_28px_-12px_rgb(28_43_36/0.35)] ring-1 ring-forest/15" : "bg-stone hover:bg-stone-deep"
    }`,
  label: "text-[0.8rem] font-medium text-muted",
  value: "mt-0.5 truncate text-[0.98rem] font-semibold text-ink",
  panel: (up: boolean) =>
    `absolute inset-x-0 z-50 overflow-y-auto overscroll-contain rounded-2xl bg-card p-2 shadow-[0_24px_60px_-20px_rgb(22_32_27/0.45)] ring-1 ring-line ${up ? "bottom-full mb-2" : "top-full mt-2"}`,
};
