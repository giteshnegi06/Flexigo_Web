// Footer in the style of the Elivaas footer: dark background, grouped link columns with bold white headings,
// a large faded wordmark behind the bottom row, and floating WhatsApp and call buttons.
import Link from "next/link";
import { getHomes, getPlaces, getSite } from "@/lib/api";
import { stayTypes } from "@/lib/content";
import { whatsappLink } from "@/lib/format";
import { FloatingContact } from "./FloatingContact";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

const linkClass = "text-[0.95rem] text-[#c9d2cc] transition-colors duration-200 hover:text-white";

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[0.95rem] font-semibold text-white">{title}</p>
      <ul className="mt-4 space-y-3">{children}</ul>
    </div>
  );
}

export async function Footer() {
  const [site, homes, places] = await Promise.all([getSite().catch(() => null), getHomes().catch(() => []), getPlaces().catch(() => [])]);
  return (
    <>
      <footer className="relative mt-24 overflow-hidden bg-night text-[#c9d2cc]">
        <div className="relative z-10 mx-auto grid max-w-site gap-x-8 gap-y-10 px-4 pb-10 pt-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
          <Column title="Homes in Shimla">
            {homes.map((h) => (
              <li key={h.slug}><Link className={linkClass} href={`/homes/${h.slug}`}>{h.name}</Link></li>
            ))}
            <li><Link className={linkClass} href="/compare">Compare the homes</Link></li>
          </Column>
          <Column title="Stays for">
            {stayTypes.map((s) => (
              <li key={s.slug}><Link className={linkClass} href={`/stays/${s.slug}`}>{s.title}</Link></li>
            ))}
          </Column>
          <Column title="Around Shimla">
            {places.slice(0, 5).map((p) => (
              <li key={p.id}><Link className={linkClass} href="/guide">{p.name}</Link></li>
            ))}
          </Column>
          <Column title="FlexiGo Stays">
            <li><Link className={linkClass} href="/about">About your host</Link></li>
            <li><Link className={linkClass} href="/book">Check availability</Link></li>
            <li><Link className={linkClass} href="/guide">Shimla guide</Link></li>
            <li><a className={linkClass} href="https://www.flexigoholidays.com/" target="_blank" rel="noopener noreferrer">Flexigo Holidays trips</a></li>
          </Column>
          <Column title="Talk to us">
            {site ? (
              <>
                <li><a className={linkClass} href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a></li>
                <li><a className={linkClass} href={whatsappLink(site.whatsappNumber, "Hi, I have a question about FlexiGo Stays.")} target="_blank" rel="noopener noreferrer"><span className="inline-flex items-center gap-2"><WhatsAppIcon size={16} /> WhatsApp the host</span></a></li>
                <li><a className={`${linkClass} break-all`} href={`mailto:${site.email}`}>{site.email}</a></li>
              </>
            ) : (
              <li className="text-[0.95rem]">Contact details are loading.</li>
            )}
          </Column>
        </div>

        <div className="relative z-10 mx-auto flex max-w-site flex-col gap-3 border-t border-white/10 px-4 pb-8 pt-6 text-sm sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p> © FlexiGo Stays. All rights reserved.</p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2">
            <Link className={linkClass} href="/privacy-policy">Privacy policy</Link>
            <Link className={linkClass} href="/cancellation-policy">Cancellation and refunds</Link>
            <Link className={linkClass} href="/terms">Terms</Link>
          </nav>
        </div>

        {/* Large faded wordmark behind the bottom row */}
        <p aria-hidden className="pointer-events-none absolute -bottom-[0.18em] left-1/2 z-0 -translate-x-1/2 select-none whitespace-nowrap font-display text-[26vw] font-semibold leading-none text-white/[0.045] lg:text-[17rem]">
          FlexiGo
        </p>
      </footer>
      {site && <FloatingContact whatsappNumber={site.whatsappNumber} phone={site.phone} />}
    </>
  );
}
