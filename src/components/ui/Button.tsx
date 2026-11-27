// Buttons: 48 px tall, 10 px corners, semibold label (the proportions StayVista and SaffronStays use).
// The soft colour sweep on hover is adapted from the "fill on hover" buttons on Uiverse (MIT), restyled with our tokens.
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "solid" | "outline" | "light" | "whatsapp";

const base =
  "group relative isolate inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-[var(--radius-control)] px-6 text-[0.95rem] font-semibold tracking-[0.01em] transition-[color,background-color,border-color,box-shadow,transform] duration-300 ease-out active:scale-[0.98] before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:transition-transform before:duration-500 before:ease-[cubic-bezier(.2,.8,.2,1)] hover:before:scale-x-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

const variants: Record<Variant, string> = {
  solid: "bg-forest text-white shadow-[0_6px_16px_-8px_rgb(28_43_36/0.6)] before:bg-forest-soft",
  outline: "border border-line bg-card text-forest before:bg-stone hover:border-forest/40",
  light: "bg-card text-forest before:bg-stone",
  whatsapp: "border border-whatsapp/40 bg-card text-whatsapp before:bg-whatsapp hover:text-white",
};

export function buttonClass(variant: Variant = "solid", extra = "") {
  return `${base} ${variants[variant]} ${extra}`;
}

export function ButtonLink({ href, variant = "solid", className = "", children, ...rest }: { href: string; variant?: Variant; className?: string; children: ReactNode } & Omit<ComponentProps<typeof Link>, "href" | "className">) {
  const external = href.startsWith("http");
  if (external)
    return (
      <a href={href} className={buttonClass(variant, className)} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  return (
    <Link href={href} className={buttonClass(variant, className)} {...rest}>
      {children}
    </Link>
  );
}

export function Button({ variant = "solid", className = "", ...rest }: { variant?: Variant } & ComponentProps<"button">) {
  return <button className={buttonClass(variant, className)} {...rest} />;
}
