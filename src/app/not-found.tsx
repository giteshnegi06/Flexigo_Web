import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl px-4 pb-10 pt-32 text-center sm:px-6">
      <p className="font-display text-7xl text-pine">404</p>
      <h1 className="mt-4 text-4xl">This page has wandered off</h1>
      <p className="mt-4 text-lg text-muted">The page you were looking for is not here. Try one of the homes instead.</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <ButtonLink href="/#homes">See the homes</ButtonLink>
        <ButtonLink href="/book" variant="outline">Check availability</ButtonLink>
      </div>
      <ul className="mt-10 space-y-2 text-forest">
        <li><Link className="underline" href="/homes/white-breeze-2bhk">White Breeze 2BHK</Link></li>
        <li><Link className="underline" href="/homes/the-cloud-villa">The Cloud Villa</Link></li>
        <li><Link className="underline" href="/homes/white-breeze-3bhk">White Breeze 3BHK</Link></li>
      </ul>
    </section>
  );
}
