"use client";
// The site's dropdown, used instead of the browser's own <select> so it matches the rest of the design:
// a rounded pill that opens a card of options, the chosen one ticked. Works with the keyboard like a native
// select: arrows (or Home/End) move, Enter or Space picks, Escape closes, typing a letter jumps to an option.
import { useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { usePopover } from "@/lib/usePopover";

export type SelectOption<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  /** Shown before the value inside the pill, like "Sort by". Also the accessible name. */
  label: string;
  align?: "start" | "end";
  className?: string;
};

export function Select<T extends string>({ value, options, onChange, label, align = "start", className = "" }: Props<T>) {
  const { ref, open, room, show, hide } = usePopover(options.length * 48 + 16);
  // A select-only combobox (WAI-ARIA pattern): focus stays here while arrows move through the options.
  const box = useRef<HTMLDivElement>(null);
  const id = useId();
  const current = Math.max(0, options.findIndex((o) => o.value === value));
  const [active, setActive] = useState(current);

  function openList() {
    setActive(current);
    show();
    box.current?.focus(); // keys must reach the list even when it was opened by a tap or click
  }
  function pick(i: number) {
    onChange(options[i].value);
    hide();
    box.current?.focus();
  }

  function onKey(e: React.KeyboardEvent) {
    const last = options.length - 1;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === "ArrowDown") setActive((i) => Math.min(last, i + 1));
    else if (e.key === "ArrowUp") setActive((i) => Math.max(0, i - 1));
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(last);
    else if (e.key === "Enter" || e.key === " ") pick(active);
    else if (e.key === "Escape") hide();
    else if (e.key === "Tab") return hide();
    else if (e.key.length === 1) {
      const from = (active + 1) % options.length;
      const order = [...options.slice(from), ...options.slice(0, from)];
      const hit = order.find((o) => o.label.toLowerCase().startsWith(e.key.toLowerCase()));
      if (hit) setActive(options.indexOf(hit));
      return;
    } else return;
    e.preventDefault();
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div
        ref={box}
        role="combobox"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        aria-label={`${label}: ${options[current]?.label}`}
        onClick={() => (open ? hide() : openList())}
        onKeyDown={onKey}
        className={`flex min-h-11 w-full cursor-pointer select-none items-center gap-2 rounded-full border bg-card pl-4 pr-3 text-sm outline-none transition-[border-color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-forest/30 ${
          open ? "border-forest/40 shadow-[0_8px_24px_-14px_rgb(28_43_36/0.45)]" : "border-line hover:border-forest/30"
        }`}
      >
        <span className="text-muted">{label}</span>
        <span className="font-semibold text-ink">{options[current]?.label}</span>
        <ChevronDown size={16} aria-hidden className={`ml-auto text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <ul
          id={`${id}-list`}
          role="listbox"
          aria-label={label}
          style={{ maxHeight: room.max }}
          className={`pop-in absolute z-50 min-w-full overflow-y-auto overscroll-contain rounded-2xl bg-card p-1.5 shadow-[0_24px_60px_-20px_rgb(22_32_27/0.45)] ring-1 ring-line sm:min-w-[15rem] ${
            room.up ? "bottom-full mb-2 origin-bottom" : "top-full mt-2 origin-top"
          } ${align === "end" ? "right-0" : "left-0"}`}
        >
          {options.map((o, i) => {
            const selected = i === current;
            return (
              <li
                key={o.value}
                id={`${id}-${i}`}
                role="option"
                aria-selected={selected}
                onPointerMove={() => setActive(i)}
                onClick={() => pick(i)}
                className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl px-3 text-[0.95rem] transition-colors ${
                  i === active ? "bg-stone" : ""
                } ${selected ? "font-semibold text-forest" : "text-ink"}`}
              >
                {o.label}
                {selected && <Check size={17} aria-hidden className="shrink-0 text-forest" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
