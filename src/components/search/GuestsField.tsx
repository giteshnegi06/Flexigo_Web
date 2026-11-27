"use client";
// Guest counter in the hero search style: a sand pill that opens plus and minus buttons for adults and children,
// limited to what the chosen home sleeps.
import { Minus, Plus } from "lucide-react";
import { pill, usePopover } from "@/lib/usePopover";

type Props = { adults: number; kids: number; max: number; homeName?: string; onChange: (adults: number, kids: number) => void };

export function GuestsField({ adults, kids, max, homeName, onChange }: Props) {
  const { ref, trigger, open, room, show, hide } = usePopover(330);
  const total = adults + kids;
  const rows = [
    { name: "Adults", note: "Age 13 or above", count: adults, min: 1, set: (n: number) => onChange(n, kids) },
    { name: "Children", note: "Age 2 to 12", count: kids, min: 0, set: (n: number) => onChange(adults, n) },
  ];

  return (
    <div ref={ref} className="relative">
      <button ref={trigger} type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => (open ? hide() : show())} className={pill.field(open)}>
        <span className={pill.label}>Guests</span>
        <span className={pill.value}>
          {total} {total === 1 ? "guest" : "guests"}
          <span className="font-normal text-muted">{kids ? `, ${kids} ${kids === 1 ? "child" : "children"}` : ""}</span>
        </span>
      </button>
      {open && (
        <div role="dialog" aria-label="Guests" style={{ maxHeight: room.max }} className={`${pill.panel(room.up)} p-4`}>
          {rows.map((row) => (
            <div key={row.name} className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-0">
              <span>
                <span className="block font-semibold text-ink">{row.name}</span>
                <span className="text-sm text-muted">{row.note}</span>
              </span>
              <span className="flex items-center gap-3">
                <button type="button" onClick={() => row.set(row.count - 1)} disabled={row.count <= row.min} aria-label={`Fewer ${row.name.toLowerCase()}`} className="grid size-10 place-items-center rounded-full text-forest ring-1 ring-line transition hover:ring-forest disabled:text-line disabled:hover:ring-line">
                  <Minus size={18} aria-hidden />
                </button>
                <span className="w-6 text-center text-lg font-semibold text-ink" aria-live="polite">{row.count}</span>
                <button type="button" onClick={() => row.set(row.count + 1)} disabled={total >= max} aria-label={`More ${row.name.toLowerCase()}`} className="grid size-10 place-items-center rounded-full text-forest ring-1 ring-line transition hover:ring-forest disabled:text-line disabled:hover:ring-line">
                  <Plus size={18} aria-hidden />
                </button>
              </span>
            </div>
          ))}
          <p className="mt-2 text-sm text-muted">{homeName ? `${homeName} sleeps up to ${max}.` : `Sleeps up to ${max}.`} Babies under 2 stay free.</p>
          <button type="button" onClick={hide} className="mt-3 min-h-11 w-full rounded-[var(--radius-control)] bg-forest text-sm font-semibold text-white transition hover:bg-forest-soft">
            Done
          </button>
        </div>
      )}
    </div>
  );
}
