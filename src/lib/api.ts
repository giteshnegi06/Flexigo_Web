// The only file that talks to the backend. Server reads are cached; quotes and enquiries are always live.
import { cacheLife } from "next/cache";
import type { Holiday, HomeCard, HomeDetail, Location, LocationHome, Place, Review, SiteImages, SiteInfo } from "./types";

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

// Photos uploaded in the admin panel are stored as "/api/media/<id>". Add the API address to every such path
// in a response, so pages and next/image get a full address without each page knowing about uploads.
function withMedia<T>(value: T): T {
  if (typeof value === "string") return (value.startsWith("/api/media/") ? API_URL + value : value) as T;
  if (Array.isArray(value)) return value.map(withMedia) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, withMedia(v)])) as T;
  return value;
}

async function read<T>(res: Response): Promise<T> {
  return withMedia((await res.json()) as T);
}

async function get<T>(path: string): Promise<T> {
  const res = await call(path);
  if (!res.ok) throw new Error(`API ${path} failed with ${res.status}`);
  return read<T>(res);
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
  return read<HomeDetail>(res);
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

/** Every website image that is not a home photo, keyed for lookup. Changed from the admin panel. */
export async function getImages(): Promise<SiteImages> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 86400 });
  const rows = await get<{ key: string; url: string; alt: string }[]>("/images");
  return Object.fromEntries(rows.map(({ key, url, alt }) => [key, { url, alt }]));
}

/** Location cards for the home page, with how many homes each has. */
export async function getLocations(): Promise<Location[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 86400 });
  return get<Location[]>("/locations");
}

/** One location and its homes, or null when there is no such location. */
export async function getLocation(slug: string): Promise<{ location: Omit<Location, "homeCount">; homes: LocationHome[] } | null> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 86400 });
  const res = await call(`/locations/${encodeURIComponent(slug)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API /locations/${slug} failed with ${res.status}`);
  return read(res);
}
