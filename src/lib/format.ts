export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function prettyDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function addDaysIso(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) + days * 86_400_000).toISOString().slice(0, 10);
}

export function todayIso() {
  return new Date(Date.now() + 5.5 * 3_600_000).toISOString().slice(0, 10);
}

/** "13:00" -> "1:00 pm" */
export function prettyTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  if (!Number.isFinite(h)) return hhmm;
  return `${h % 12 || 12}:${String(m ?? 0).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}

export const guestTypeLabel: Record<string, string> = {
  family: "Families",
  couple: "Couples",
  workation: "Workation",
  friends: "Friends and groups",
  general: "Guests",
};

export function whatsappLink(number: string, text: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
