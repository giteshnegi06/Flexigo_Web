// The only file that talks to the backend. Server reads are cached; quotes and enquiries are always live.
import { cacheLife } from "next/cache";
import type { Holiday, HomeCard, HomeDetail, Place, Review, SiteInfo } from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`);
  if (!res.ok) throw new Error(`API ${path} failed with ${res.status}`);
  return res.json() as Promise<T>;
}

export async function getHomes(): Promise<HomeCard[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 86400 });
  return get<HomeCard[]>("/homes");
}

export async function getHome(slug: string): Promise<HomeDetail | null> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 86400 });
  const res = await fetch(`${API_URL}/api/homes/${encodeURIComponent(slug)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API /homes/${slug} failed with ${res.status}`);
  return res.json() as Promise<HomeDetail>;
}

export async function getReviews(): Promise<Review[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600, expire: 86400 });
  return get<Review[]>("/reviews");
}

export async function getPlaces(): Promise<Place[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600, expire: 86400 });
  return get<Place[]>("/places");
}

export async function getSite(): Promise<SiteInfo> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600, expire: 86400 });
  return get<SiteInfo>("/site");
}

/** Holidays for the date picker, from today for about a year. The browser hides any that have passed. */
export async function getHolidays(): Promise<Holiday[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600, expire: 86400 });
  return get<Holiday[]>("/holidays");
}
