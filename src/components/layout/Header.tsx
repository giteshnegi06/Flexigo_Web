"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { buttonClass } from "../ui/Button";

const links = [
  { href: "/#homes", label: "The homes" },
  { href: "/compare", label: "Compare" },
  { href: "/guide", label: "Shimla guide" },
  { href: "/stays/families", label: "Stay types" },
  { href: "/about", label: "About" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  // On the home page the header sits over the dark hero photo until the visitor scrolls.
  const overHero = pathname === "/" && !scrolled && !open;
  const ink = overHero ? "text-white" : "text-forest";

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300 ${overHero ? "bg-gradient-to-b from-black/35 to-transparent" : "bg-card/95 shadow-[0_1px_0_var(--color-line),0_8px_24px_-18px_rgb(0_0_0/0.25)] backdrop-blur"}`}>
      <div className="mx-auto flex h-16 max-w-site items-center justify-between px-4 sm:px-6 xl:h-20 xl:px-8">
        <Link href="/" className="flex min-h-11 items-center gap-1.5" aria-label="FlexiGo Stays home">
          <span className={`font-display text-2xl font-semibold ${ink}`}>FlexiGo</span>
          <span className={`text-sm font-medium uppercase tracking-[0.2em] ${overHero ? "text-white/80" : "text-pine-dark"}`}>Stays</span>
        </Link>
        <nav className="hidden items-center gap-7 xl:flex" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`relative text-[0.95rem] font-medium ${ink} after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-pine after:transition-transform hover:after:origin-left hover:after:scale-x-100`}>
              {l.label}
            </Link>
          ))}
          <Link href="/book" className={buttonClass(overHero ? "light" : "solid", "min-h-11 px-5")}>
            Check availability
          </Link>
        </nav>
        <button className={`grid size-11 place-items-center rounded-full border xl:hidden ${overHero ? "border-white/30 text-white" : "border-line text-forest"}`} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      <div id="mobile-menu" hidden={!open} className="h-[calc(100dvh-4rem)] overflow-y-auto bg-card px-4 pb-10 xl:hidden">
        <nav className="flex flex-col pt-4" aria-label="Mobile">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="border-b border-line py-4 font-display text-2xl text-forest">
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/book" onClick={() => setOpen(false)} className={buttonClass("solid", "mt-8 w-full")}>
          Check availability
        </Link>
      </div>
    </header>
  );
}
