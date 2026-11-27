import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getHomes, getReviews } from "@/lib/api";
import { stayTypes } from "@/lib/content";
import { HomeCard } from "@/components/home/HomeCard";
import { Reviews } from "@/components/home/Reviews";

export function generateStaticParams() {
  return stayTypes.map((s) => ({ type: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/stays/[type]">): Promise<Metadata> {
  const { type } = await params;
  const s = stayTypes.find((x) => x.slug === type);
  return s ? { title: `Shimla stays for ${s.title.toLowerCase()}`, description: s.text } : { title: "Stay types" };
}

async function StayTypeContent({ params }: { params: PageProps<"/stays/[type]">["params"] }) {
  const { type } = await params;
  const s = stayTypes.find((x) => x.slug === type);
  if (!s) notFound();
  const [homes, reviews] = await Promise.all([getHomes(), getReviews()]);
  const matching = homes.filter((h) => h.goodFor.includes(s.type));
  const related = reviews.filter((r) => r.guestType === s.type);
  return (
    <div className="mx-auto max-w-site px-4 pb-10 pt-24 sm:px-6 lg:px-8 lg:pt-32">
      <nav aria-label="Stay types" className="flex flex-wrap gap-2">
        {stayTypes.map((x) => (
          <Link key={x.slug} href={`/stays/${x.slug}`} aria-current={x.slug === s.slug ? "page" : undefined} className={`min-h-11 content-center rounded-full border px-4 text-sm font-medium ${x.slug === s.slug ? "border-forest bg-forest text-white" : "border-line bg-card text-forest"}`}>
            {x.title}
          </Link>
        ))}
      </nav>
      <h1 className="mt-8 text-[2rem] sm:text-[2.6rem]">Shimla stays for {s.title.toLowerCase()}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">{s.text}</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {matching.map((h) => <HomeCard key={h.slug} home={h} />)}
      </div>
      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="type-reviews">
          <h2 id="type-reviews" className="text-3xl">What {s.title.toLowerCase()} said</h2>
          <div className="mt-6"><Reviews reviews={related} /></div>
        </section>
      )}
    </div>
  );
}

export default function StayTypePage(props: PageProps<"/stays/[type]">) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-site px-4 pt-28 text-muted">Loading...</div>}>
      <StayTypeContent params={props.params} />
    </Suspense>
  );
}
