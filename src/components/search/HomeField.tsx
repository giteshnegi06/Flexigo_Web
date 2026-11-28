"use client";
// Home picker in the hero search style: a sand pill that opens a list of the homes with a photo,
// how many guests each sleeps and its starting price.
import Image from "next/image";
import { Check, House } from "lucide-react";
import { inr } from "@/lib/format";
import { pill, usePopover } from "@/lib/usePopover";

export type HomeChoice = { slug: string; name: string; maxGuests: number; nightlyPrice: number; coverPhoto?: string };

export function HomeField({ homes, value, onChange }: { homes: HomeChoice[]; value: string; onChange: (slug: string) => void }) {
  const { ref, trigger, open, room, show, hide } = usePopover(360);
  const home = homes.find((h) => h.slug === value);

  return (
    <div ref={ref} className="relative">
      <button ref={trigger} type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => (open ? hide() : show())} className={pill.field(open)}>
        <span className={pill.label}>Property</span>
        <span className={pill.value}>{home?.name ?? "Choose a property"}</span>
      </button>
      {open && (
        <div role="dialog" aria-label="Choose a property" style={{ maxHeight: room.max }} className={pill.panel(room.up)}>
          <ul>
            {homes.map((h) => (
              <li key={h.slug}>
                <button
                  type="button"
                  aria-pressed={h.slug === value}
                  onClick={() => {
                    onChange(h.slug);
                    hide();
                    trigger.current?.focus();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-stone"
                >
                  {h.coverPhoto ? (
                    <Image src={h.coverPhoto} alt="" width={56} height={56} className="size-14 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-chip text-forest"><House size={22} aria-hidden /></span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink">{h.name}</span>
                    <span className="block text-sm text-muted">Up to {h.maxGuests} guests, from {inr(h.nightlyPrice)} a night</span>
                  </span>
                  {h.slug === value && <Check size={20} className="shrink-0 text-forest" aria-hidden />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
