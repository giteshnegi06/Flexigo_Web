import type { Metadata } from "next";
import Image from "next/image";
import { Car, MapPin, Train } from "lucide-react";
import { getImages, getPlaces } from "@/lib/api";
import { seasons } from "@/lib/content";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Shimla guide", description: "Places to see, walks, day trips and seasons near the FlexiGo Stays homes in Shimla." };

const categoryLabel: Record<string, string> = { sight: "Sights", walk: "Walks", "day-trip": "Day trips", cafe: "Cafes", essentials: "Essentials" };

export default async function GuidePage() {
  const [places, images] = await Promise.all([getPlaces(), getImages()]);
  const groups = Object.entries(
    places.reduce<Record<string, typeof places>>((acc, p) => {
      (acc[p.category] ??= []).push(p);
      return acc;
    }, {}),
  );
  return (
    <div className="mx-auto max-w-site px-4 pb-10 pt-24 sm:px-6 lg:px-8 lg:pt-32">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pine-dark">Shimla guide</p>
      <h1 className="mt-3 max-w-3xl text-[2rem] sm:text-[2.6rem]">Plan your days, then come home to quiet</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">Our favourite places around Shimla. The host and the Flexigo Holidays team can arrange cabs and day trips.</p>

      {groups.map(([cat, list]) => (
        <section key={cat} className="mt-14" aria-labelledby={`cat-${cat}`}>
          <h2 id={`cat-${cat}`} className="text-3xl">{categoryLabel[cat] ?? cat}</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <li key={p.id} data-reveal className="rounded-card border border-line bg-card p-6 transition-shadow duration-300 hover:shadow-soft">
                <p className="flex items-center gap-2 text-lg font-semibold text-forest"><MapPin size={18} className="text-pine-dark" aria-hidden /> {p.name}</p>
                <p className="mt-2 text-muted">{p.description}</p>
                {p.minutesByCar && <p className="mt-3 flex items-center gap-2 text-sm text-forest"><Car size={16} aria-hidden /> About {p.minutesByCar} min by car</p>}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="mt-16" aria-labelledby="getting-here">
        <h2 id="getting-here" className="text-3xl">Getting here</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          <li className="flex gap-3 rounded-card border border-line bg-card p-6 transition-shadow duration-300 hover:shadow-soft"><Car className="shrink-0 text-pine-dark" aria-hidden /> <span><strong className="text-forest">By road.</strong> <span className="text-muted">Shimla is on the Chandigarh to Shimla highway. Exact directions are shared after booking.</span></span></li>
          <li className="flex gap-3 rounded-card border border-line bg-card p-6 transition-shadow duration-300 hover:shadow-soft"><Train className="shrink-0 text-pine-dark" aria-hidden /> <span><strong className="text-forest">By rail.</strong> <span className="text-muted">Take the Kalka to Shimla toy train for the scenic route. A pickup can be arranged on request.</span></span></li>
        </ul>
      </section>

      <section className="mt-16" aria-labelledby="seasons">
        <h2 id="seasons" className="text-3xl">When to come</h2>
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {seasons.map((s) => (
            <li key={s.name} data-reveal className="overflow-hidden rounded-card bg-card shadow-soft">
              <div className="relative aspect-[4/3] bg-stone">{images[s.image] && <Image src={images[s.image].url} alt={images[s.image].alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />}</div>
              <div className="p-5"><h3 className="text-2xl">{s.name}</h3><p className="text-sm font-semibold text-pine-dark">{s.months} · {s.temp}</p><p className="mt-2 text-muted">{s.text}</p></div>
            </li>
          ))}
        </ul>
      </section>
      <div className="mt-14"><ButtonLink href="/book">Check availability</ButtonLink></div>
    </div>
  );
}
