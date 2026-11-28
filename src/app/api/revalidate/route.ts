// Called by the backend after every save in the admin panel, so the website shows the change on the next visit
// instead of after its cache runs out. Needs the same REVALIDATE_SECRET on the website and the backend.
import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { CONTENT_TAG } from "@/lib/api";

function sameSecret(given: string, expected: string) {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) return Response.json({ error: "REVALIDATE_SECRET is not set on the website." }, { status: 503 });
  if (!sameSecret(request.headers.get("x-revalidate-secret") ?? "", expected)) return Response.json({ error: "Not allowed." }, { status: 401 });
  // Expire the data straight away (no stale copy), and every page built from it.
  revalidateTag(CONTENT_TAG, { expire: 0 });
  revalidatePath("/", "layout");
  return Response.json({ ok: true, at: new Date().toISOString() });
}
