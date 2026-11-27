// Browser-side calls to the backend: availability, quotes and enquiries. Never cached.
import type { ApiError, Quote } from "./types";

// Trailing slashes are removed, so "https://api.example/" does not produce "//api/..." URLs. Vercel redirects those,
// and browsers refuse redirects on CORS checks, which would break live prices and booking requests.
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").trim().replace(/\/+$/, "");

async function send<T>(path: string, init?: RequestInit): Promise<{ ok: true; data: T } | { ok: false; error: ApiError }> {
  try {
    const res = await fetch(`${API_URL}/api${path}`, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
    const body = await res.json().catch(() => ({ error: "Unexpected reply from the server." }));
    return res.ok ? { ok: true, data: body as T } : { ok: false, error: body as ApiError };
  } catch {
    return { ok: false, error: { error: "We could not reach the booking server. Please check your connection and try again." } };
  }
}

export function fetchQuote(input: { slug: string; checkIn: string; checkOut: string; guests: number }) {
  return send<Quote>("/quote", { method: "POST", body: JSON.stringify(input) });
}

export function fetchAvailability(slug: string, from: string, to: string) {
  return send<{ booked: string[]; minNights: number; today: string }>(`/homes/${slug}/availability?from=${from}&to=${to}`);
}

export type EnquiryInput = {
  slug: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  adults: number;
  children: number;
  name: string;
  email: string;
  phone: string;
  message?: string;
  sourcePage?: string;
  website?: string;
};

export function sendEnquiry(input: EnquiryInput) {
  return send<{ ok: true; enquiryId: number; quote: Quote }>("/enquiries", { method: "POST", body: JSON.stringify(input) });
}

export function sendContact(input: { name: string; phone: string; message?: string; sourcePage?: string; website?: string }) {
  return send<{ ok: true; id: number }>("/contact", { method: "POST", body: JSON.stringify(input) });
}
