import type { Metadata } from "next";
import { Suspense } from "react";
import { ThankYouDetails } from "./ThankYouDetails";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Request sent", robots: { index: false } };

export default function ThankYouPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 pb-10 pt-28 text-center sm:px-6 lg:pt-36">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pine-dark">Request sent</p>
      <h1 className="mt-3 text-[2rem] sm:text-[2.6rem]">Thank you, we have your dates</h1>
      <Suspense fallback={null}>
        <ThankYouDetails />
      </Suspense>
      <p className="mt-6 text-lg text-muted">The host will call or WhatsApp you to confirm and share the advance payment details. While you wait, plan your days in Shimla.</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <ButtonLink href="/guide">Open the Shimla guide</ButtonLink>
        <ButtonLink href="/" variant="outline">Back to the properties</ButtonLink>
      </div>
    </section>
  );
}
