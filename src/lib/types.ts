// Shapes returned by the backend API.
export type GuestType = "family" | "couple" | "workation" | "friends" | "general";

export type HomeCard = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  nightlyPrice: number;
  weekendPrice: number;
  compareAtPrice: number | null;
  minNights: number;
  view: string | null;
  wifiMbps: number | null;
  highlights: string[];
  goodFor: GuestType[];
  coverPhoto: string;
};

export type Photo = { id: number; url: string; alt: string; category: string; width: number | null; height: number | null };
export type Room = { id: number; name: string; description: string };
export type Amenity = { id: number; group: "comfort" | "kitchen" | "work" | "safety" | "outside"; label: string };
export type Review = { id: number; guestName: string; guestType: GuestType; rating: number; body: string; source: string; stayMonth: string };

export type HomeDetail = HomeCard & {
  story: string;
  checkInTime: string;
  checkOutTime: string;
  airbnbUrl: string | null;
  rooms: Room[];
  photos: Photo[];
  amenities: Amenity[];
  reviews: Review[];
};

export type Place = { id: number; name: string; category: string; description: string; minutesByCar: number | null };

export type SiteInfo = {
  hostName: string;
  phone: string;
  email: string;
  whatsappNumber: string;
  taxPercent: number;
  advancePercent: number;
  reviewCount: number;
};

export type Quote = {
  home: { slug: string; name: string };
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  breakdown: { night: string; price: number; label: string }[];
  subtotal: number;
  taxPercent: number;
  taxes: number;
  total: number;
  advancePercent: number;
  advance: number;
};

export type ApiError = { error: string; code?: string; taken?: string[]; maxGuests?: number; minNights?: number };

export type Holiday = { day: string; name: string };
