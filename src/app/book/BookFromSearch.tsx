"use client";
// Reads ?home=&in=&out=&guests= from the search bar and opens the booking panel with them.
import { useSearchParams } from "next/navigation";
import { BookingPanel } from "@/components/booking/BookingPanel";
import type { Holiday } from "@/lib/types";

type Option = { slug: string; name: string; maxGuests: number; nightlyPrice: number; minNights: number; coverPhoto?: string };

export function BookFromSearch({ homes, whatsappNumber, holidays }: { homes: Option[]; whatsappNumber: string; holidays: Holiday[] }) {
  const q = useSearchParams();
  const guests = Number(q.get("guests") ?? 2);
  const wanted = q.get("home") ?? undefined;
  // With no home chosen, suggest the smallest home that fits the group.
  const fit = homes.filter((h) => h.maxGuests >= guests).sort((a, b) => a.maxGuests - b.maxGuests)[0];
  return (
    <BookingPanel
      key={q.toString()}
      homes={homes}
      initialSlug={wanted ?? fit?.slug}
      initialIn={q.get("in") ?? undefined}
      initialOut={q.get("out") ?? undefined}
      initialGuests={Number.isFinite(guests) && guests > 0 ? guests : 2}
      initialChildren={Math.max(0, Number(q.get("children") ?? 0) || 0)}
      whatsappNumber={whatsappNumber}
      holidays={holidays}
      showHomePicker
    />
  );
}
