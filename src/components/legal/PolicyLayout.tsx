// Shared layout for the policy pages: title, last-updated date, an "On this page" menu (sticky on computers),
// numbered sections, a contact box and links to the other policies.
import Link from "next/link";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { whatsappLink } from "@/lib/format";
import type { SiteInfo } from "@/lib/types";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export type PolicySection = { id: string; title: string; body: React.ReactNode };
export type PolicyKey = "privacy" | "cancellation" | "terms";

export const policies: { key: PolicyKey; href: string; title: string; text: string }[] = [
  { key: "privacy", href: "/privacy-policy", title: "Privacy policy", text: "What we collect when you contact us, why, and your rights." },
  { key: "cancellation", href: "/cancellation-policy", title: "Cancellation and refunds", text: "Changing or cancelling a stay, and how refunds work." },
  { key: "terms", href: "/terms", title: "Terms of stay", text: "Booking, payment, check-in and the house rules." },
];

type Props = {
  current: PolicyKey;
  title: string;
  intro: string;
  updated: string;
  note?: string;
  sections: PolicySection[];
  site: SiteInfo;
};

export function PolicyLayout({ current, title, intro, updated, note, sections, site }: Props) {
  return (
    <div className="mx-auto max-w-site px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pt-32">
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted">
        <Link href="/" className="hover:text-forest">Home</Link> / <Link href="/policies" className="hover:text-forest">Policies</Link> / <span className="text-forest">{title}</span>
      </nav>
      <header className="max-w-3xl">
        <h1 className="text-[2.2rem] sm:text-[2.8rem]">{title}</h1>
        <p className="mt-4 text-lg text-muted">{intro}</p>
        <p className="mt-3 text-sm text-muted">Last updated {updated}</p>
        {note && <p className="mt-5 rounded-2xl bg-peach px-4 py-3 text-sm text-ink">{note}</p>}
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[15rem_1fr]">
        <aside className="hidden lg:block">
          <nav aria-label="On this page" className="sticky top-28">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">On this page</p>
            <ol className="mt-3 space-y-1 border-l border-line">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm text-muted transition hover:border-forest hover:text-forest">
                    {i + 1}. {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="max-w-3xl">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-28 border-b border-line py-8 first:pt-0 last:border-0">
              <h2 id={`${s.id}-title`} className="text-2xl sm:text-[1.75rem]">
                <span className="mr-2 text-pine-dark">{i + 1}.</span>
                {s.title}
              </h2>
              <div className="policy-body mt-4 space-y-3 text-ink">{s.body}</div>
            </section>
          ))}

          <section aria-labelledby="contact-title" className="mt-6 rounded-3xl bg-stone p-6 sm:p-8">
            <h2 id="contact-title" className="text-2xl">Questions about this policy</h2>
            <p className="mt-2 text-muted">Write to us or message {site.hostName || "the host"}. We reply within a day, usually much sooner.</p>
            <ul className="mt-5 flex flex-wrap gap-3">
              <li>
                <a href={`mailto:${site.email}`} className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] border border-line bg-card px-4 text-sm font-semibold text-forest transition hover:border-forest">
                  <Mail size={17} aria-hidden /> {site.email}
                </a>
              </li>
              <li>
                <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] border border-line bg-card px-4 text-sm font-semibold text-forest transition hover:border-forest">
                  <Phone size={17} aria-hidden /> {site.phone}
                </a>
              </li>
              <li>
                <a href={whatsappLink(site.whatsappNumber, `Hi, I have a question about your ${title.toLowerCase()}.`)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] border border-line bg-card px-4 text-sm font-semibold text-whatsapp transition hover:border-whatsapp">
                  <WhatsAppIcon size={17} /> WhatsApp
                </a>
              </li>
            </ul>
          </section>

          <nav aria-label="Other policies" className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Other policies</p>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {policies
                .filter((p) => p.key !== current)
                .map((p) => (
                  <li key={p.key}>
                    <Link href={p.href} className="group flex h-full items-start justify-between gap-3 rounded-2xl border border-line bg-card p-5 transition hover:border-forest">
                      <span>
                        <span className="block font-semibold text-forest">{p.title}</span>
                        <span className="mt-1 block text-sm text-muted">{p.text}</span>
                      </span>
                      <ArrowUpRight size={18} className="shrink-0 text-muted transition group-hover:text-forest" aria-hidden />
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
