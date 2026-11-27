"use client";
import { useSearchParams } from "next/navigation";
import { inr, prettyDate } from "@/lib/format";

export function ThankYouDetails() {
  const q = useSearchParams();
  const id = q.get("id");
  const home = q.get("home");
  const checkIn = q.get("in");
  const checkOut = q.get("out");
  const total = Number(q.get("total"));
  if (!id || !home || !checkIn || !checkOut) return null;
  return (
    <div className="mx-auto mt-8 max-w-md rounded-card bg-card p-6 text-left shadow-soft">
      <p className="text-sm text-muted">Request number {id}</p>
      <p className="mt-1 text-xl font-semibold text-forest">{home}</p>
      <p className="text-muted">{prettyDate(checkIn)} to {prettyDate(checkOut)}</p>
      {Number.isFinite(total) && total > 0 && <p className="mt-3 text-forest">Quoted total: <strong>{inr(total)}</strong></p>}
    </div>
  );
}
