// The only file that talks to the backend. Server reads are cached; quotes and enquiries are always live.
import { cacheLife } from "next/cache";
import type { Holiday, HomeCard, HomeDetail, Place, Review, SiteInfo } from "./types";

// Trailing slashes are removed, so "https://api.example/" does not produce "//api/..." URLs (Vercel redirects those).
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").trim().replace(/\/+$/, "");

// Pages are built from the API, so a build needs it. Explain the fix instead of failing with "fetch failed".
const HOW_TO_FIX =
  "Set NEXT_PUBLIC_API_URL to the address of the deployed FlexiGo Stays backend (on Vercel: Project Settings > Environment Variables), make sure the backend is running, then build again.";

async function call(path: string): Promise<Response> {
  if (process.env.VERCEL && !process.env.NEXT_PUBLIC_API_URL) {
    throw new Error(`NEXT_PUBLIC_API_URL is not set for this Vercel project. ${HOW_TO_FIX}`);
  }
  try {
    return await fetch(`${API_URL}/api${path}`);
  } catch (cause) {
    throw new Error(`Could not reach the FlexiGo Stays API at ${API_URL}. ${HOW_TO_FIX}`, { cause });
  }
}

async function get<T>(path: string): Promise<T> {
  const res = await call(path);
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
  const res = await call(`/homes/${encodeURIComponent(slug)}`);
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
