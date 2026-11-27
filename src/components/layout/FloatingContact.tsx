"use client";
// Floating WhatsApp and call buttons (bottom right), like Elivaas. They appear after the visitor scrolls a little,
// and sit above the bottom booking bar on home pages on phones.
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { whatsappLink } from "@/lib/format";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export function FloatingContact({ whatsappNumber, phone }: { whatsappNumber: string; phone: string }) {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  // The booking page has its own WhatsApp link in the card, and the buttons would cover the price there.
  if (pathname.startsWith("/book")) return null;
  const raised = pathname.startsWith("/homes/") ? "bottom-24 lg:bottom-6" : "bottom-5 sm:bottom-6";
  const base = "grid size-14 place-items-center rounded-full shadow-[0_10px_30px_-10px_rgb(0_0_0/0.45)] transition-transform duration-300 hover:scale-105 active:scale-95";

  return (
    <div className={`fixed right-4 z-40 flex flex-col gap-3 transition-[opacity,transform] duration-500 sm:right-6 ${raised} ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}>
      <a href={whatsappLink(whatsappNumber, "Hi, I have a question about FlexiGo Stays.")} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" tabIndex={show ? 0 : -1} className={`${base} bg-whatsapp text-white`}>
        <WhatsAppIcon size={28} />
      </a>
      <a href={`tel:${phone.replace(/\s/g, "")}`} aria-label={`Call ${phone}`} tabIndex={show ? 0 : -1} className={`${base} bg-forest text-white`}>
        <Phone size={24} aria-hidden />
      </a>
    </div>
  );
}
