import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FileText, ShieldCheck, Undo2 } from "lucide-react";
import { policies } from "@/components/legal/PolicyLayout";

export const metadata: Metadata = { title: "Policies", description: "Privacy, cancellation and refund, and stay terms for FlexiGo Stays." };

const icons = { privacy: ShieldCheck, cancellation: Undo2, terms: FileText };

// Hub for the three policy pages. Older links such as /policies#privacy still land here and point to the right page.
export default function PoliciesPage() {
  return (
    <div className="mx-auto max-w-site px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pt-32">
      <h1 className="text-[2.2rem] sm:text-[2.8rem]">Policies</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">Everything about booking, cancelling and how we look after your details, in plain words.</p>
      <ul className="mt-10 grid gap-5 md:grid-cols-3">
        {policies.map((p) => {
          const Icon = icons[p.key];
          return (
            <li key={p.key} id={p.key}>
              <Link href={p.href} className="group flex h-full flex-col rounded-3xl border border-line bg-card p-6 transition hover:border-forest hover:shadow-soft">
                <span className="grid size-12 place-items-center rounded-full border border-line text-pine-dark">
                  <Icon size={22} aria-hidden />
                </span>
                <span className="mt-5 flex items-center justify-between gap-2 font-display text-2xl text-forest">
                  {p.title}
                  <ArrowUpRight size={20} className="text-muted transition group-hover:text-forest" aria-hidden />
                </span>
                <span className="mt-2 text-muted">{p.text}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
