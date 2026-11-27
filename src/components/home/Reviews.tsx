"use client";
// Reviews with a filter by guest type. Each review shows its source.
import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import type { Review } from "@/lib/types";
import { guestTypeLabel } from "@/lib/format";

const filters = ["all", "family", "friends", "general"] as const;

export function Reviews({ reviews, limit = 6 }: { reviews: Review[]; limit?: number }) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [showAll, setShowAll] = useState(false);
  const available = filters.filter((f) => f === "all" || reviews.some((r) => r.guestType === f));
  const list = useMemo(() => reviews.filter((r) => filter === "all" || r.guestType === filter), [reviews, filter]);
  const shown = showAll ? list : list.slice(0, limit);

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter reviews">
        {available.map((f) => (
          <button
            key={f}
            aria-pressed={filter === f}
            onClick={() => {
              setFilter(f);
              setShowAll(false);
            }}
            className={`min-h-11 rounded-full border px-4 text-sm font-medium transition-colors ${filter === f ? "border-forest bg-forest text-white" : "border-line bg-card text-forest hover:border-forest"}`}
          >
            {f === "all" ? "All reviews" : f === "general" ? "Other guests" : guestTypeLabel[f]}
          </button>
        ))}
      </div>
      <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((r) => (
          <li key={r.id} className="flex flex-col rounded-card border border-line bg-card p-6 transition-shadow duration-300 hover:shadow-soft">
            <div className="flex gap-0.5 text-pine" aria-label={`${r.rating} out of 5 stars`}>
              {Array.from({ length: r.rating }, (_, i) => (
                <Star key={i} size={16} fill="currentColor" aria-hidden />
              ))}
            </div>
            <blockquote className="mt-3 flex-1 text-ink">“{r.body}”</blockquote>
            <p className="mt-4 text-sm font-semibold text-forest">{r.guestName}</p>
            <p className="text-xs text-muted">
              {r.stayMonth} · via {r.source}
            </p>
          </li>
        ))}
      </ul>
      {list.length > limit && (
        <button onClick={() => setShowAll((v) => !v)} className="mt-6 min-h-11 text-sm font-semibold text-pine-dark underline underline-offset-4">
          {showAll ? "Show fewer reviews" : `Show all ${list.length} reviews`}
        </button>
      )}
    </div>
  );
}
