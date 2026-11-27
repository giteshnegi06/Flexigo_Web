"use client";
// "Get in touch" popup. It opens a few seconds after someone opens the website, on every visit, and asks for
// a name and phone number so the host can call back. Messages are saved in the database (admin panel > Messages).
// After it is closed it stays closed while the visitor moves around the site; it comes back on their next visit.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { CircleCheck, Loader2, Phone, PhoneCall, X } from "lucide-react";
import { sendContact } from "@/lib/client-api";
import { whatsappLink } from "@/lib/format";
import { useModal } from "@/lib/useModal";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

const DELAY_MS = 8000; // how long after opening the site the popup appears
const RETRY_MS = 5000; // if another popup (like the booking request) is open then, wait and try again

type Props = { hostName: string; phone: string; whatsappNumber: string };

export function GetInTouch(props: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false); // closed once in this visit
  const skip = pathname.startsWith("/book/thank-you");

  useEffect(() => {
    if (done || skip) return;
    let t: number;
    const tryOpen = () => {
      if (document.querySelector('[aria-modal="true"]')) t = window.setTimeout(tryOpen, RETRY_MS);
      else setOpen(true);
    };
    t = window.setTimeout(tryOpen, DELAY_MS);
    return () => window.clearTimeout(t);
  }, [done, skip]);

  if (!open) return null;
  return (
    <ContactDialog
      {...props}
      onClose={() => {
        setOpen(false);
        setDone(true);
      }}
    />
  );
}

function ContactDialog({ hostName, phone, whatsappNumber, onClose }: Props & { onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLInputElement>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<{ name: string; phone: string } | null>(null);
  useModal(box, backdrop, first, onClose);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "").trim();
    const phoneNo = String(f.get("phone") ?? "").trim();
    setSending(true);
    setError(null);
    const res = await sendContact({
      name,
      phone: phoneNo,
      message: String(f.get("message") ?? "").trim() || undefined,
      sourcePage: window.location.pathname,
      website: String(f.get("website") ?? ""),
    });
    setSending(false);
    if (res.ok) setSent({ name, phone: phoneNo });
    else setError(res.error.error);
  }

  const host = hostName || "Our host";
  const label = "text-xs font-semibold uppercase tracking-wider text-muted";
  const input = "mt-1 w-full rounded-[var(--radius-control)] border border-line bg-white px-3 py-2 text-base text-ink outline-none transition-colors focus:border-forest focus:ring-2 focus:ring-forest/10";

  return createPortal(
    <div className="fixed inset-0 z-[85] flex items-end justify-center md:items-center md:p-6">
      <div ref={backdrop} className="absolute inset-0 bg-night/60 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div ref={box} role="dialog" aria-modal="true" aria-labelledby="touch-title" className="relative max-h-[94svh] w-full overflow-y-auto overscroll-contain rounded-t-[1.6rem] bg-card shadow-2xl md:max-w-md md:rounded-card" data-lenis-prevent>
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 grid size-11 place-items-center rounded-full hover:bg-stone">
          <X size={22} aria-hidden />
        </button>

        <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 md:px-7 md:pb-7">
          {sent ? (
            <div className="py-4 text-center">
              <CircleCheck size={48} className="mx-auto text-pine-dark" aria-hidden />
              <p id="touch-title" className="mt-3 font-display text-2xl text-forest">Thank you, {sent.name.split(" ")[0]}</p>
              <p className="mt-2 text-muted">{host} will call you on {sent.phone} soon.</p>
              <Button type="button" onClick={onClose} className="mt-6 w-full">Back to the website</Button>
            </div>
          ) : (
            <>
              <span className="grid size-12 place-items-center rounded-full bg-chip text-forest"><PhoneCall size={22} aria-hidden /></span>
              <p id="touch-title" className="mt-3 pr-10 font-display text-[1.75rem] leading-tight text-forest">Get in touch</p>
              <p className="mt-1 text-muted">Planning a stay in Shimla? Leave your number and {host} will call you back.</p>

              <form onSubmit={submit} className="mt-5 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block"><span className={label}>Your name</span><input ref={first} name="name" required minLength={2} autoComplete="name" className={input} /></label>
                  <label className="block"><span className={label}>Phone</span><input name="phone" type="tel" required autoComplete="tel" placeholder="+91" className={input} /></label>
                </div>
                <label className="block"><span className={label}>Message (optional)</span><textarea name="message" rows={2} className={`${input} resize-none`} placeholder="Dates, number of guests, questions..." /></label>
                <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
                {error && <p className="text-sm text-red-800" role="alert">{error}</p>}
                <Button type="submit" disabled={sending} className="w-full">
                  {sending ? <Loader2 className="animate-spin" size={18} aria-hidden /> : null} Request a call back
                </Button>
              </form>

              <div className="mt-4 flex items-center gap-3 text-sm text-muted">
                <span className="h-px flex-1 bg-line" aria-hidden /> or reach us now <span className="h-px flex-1 bg-line" aria-hidden />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <a href={whatsappLink(whatsappNumber, "Hi, I have a question about FlexiGo Stays.")} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-line text-sm font-semibold text-whatsapp transition hover:bg-stone">
                  <WhatsAppIcon size={18} /> WhatsApp
                </a>
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-line text-sm font-semibold text-forest transition hover:bg-stone">
                  <Phone size={17} aria-hidden /> Call<span className="hidden sm:inline"> {phone}</span>
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
