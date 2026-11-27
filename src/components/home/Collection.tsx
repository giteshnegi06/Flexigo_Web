"use client";
// "The FlexiGo collection": an expanding panel gallery, in the style of StayVista's "House of" section.
// Desktop: one wide panel shows details; hovering, focusing or tapping another panel opens it smoothly.
// Phones and tablets: a swipeable row of full cards, so nothing depends on hover.
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";

export type CollectionItem = {
  key: string;
  title: string;
  badge: string;
  points: string[];
  image: string;
  href: string;
  external?: boolean;
};

function PanelLink({ item, children, className, onActivate }: { item: CollectionItem; children: React.ReactNode; className: string; onActivate?: () => void }) {
  const props = { className, onMouseEnter: onActivate, onFocus: onActivate, "aria-label": `${item.title}: ${item.badge}` };
  return item.external ? (
    <a href={item.href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  ) : (
    <Link href={item.href} {...props}>
      {children}
    </Link>
  );
}

function Details({ item, visible }: { item: CollectionItem; visible: boolean }) {
  return (
    <div className={`absolute inset-x-0 bottom-0 p-6 transition-[opacity,transform] duration-500 ease-out ${visible ? "translate-y-0 opacity-100 delay-200" : "pointer-events-none translate-y-4 opacity-0"}`}>
      <span className="inline-flex items-center gap-1.5 rounded-md bg-black/55 px-2.5 py-1 text-xs font-semibold text-pine backdrop-blur-sm">
        <Sparkles size={13} aria-hidden /> {item.badge}
      </span>
      <p className="mt-3 font-display text-3xl text-white">{item.title}</p>
      <ul className="mt-3 space-y-1.5">
        {item.points.map((p) => (
          <li key={p} className="flex items-start gap-2 text-[0.95rem] font-medium text-white/95">
            <span className="mt-0.5 text-pine" aria-hidden>✦</span> {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Collection({ items }: { items: CollectionItem[] }) {
  const [active, setActive] = useState(0);

  return (
    <>
      {/* Desktop: expanding panels */}
      <div className="hidden h-[30rem] gap-3 lg:flex" role="list">
        {items.map((item, i) => {
          const open = i === active;
          return (
            <div key={item.key} role="listitem" className="relative min-w-0 overflow-hidden rounded-card transition-[flex-grow] duration-700 ease-[cubic-bezier(.2,.8,.2,1)]" style={{ flexGrow: open ? 3.2 : 1, flexBasis: 0 }}>
              <PanelLink item={item} onActivate={() => setActive(i)} className="group absolute inset-0 block">
                <Image src={item.image} alt="" fill sizes="(min-width: 1024px) 45vw, 1px" className={`object-cover transition-transform duration-[1.2s] ease-out ${open ? "scale-100" : "scale-110 group-hover:scale-105"}`} />
                <div className={`absolute inset-0 transition-opacity duration-500 ${open ? "bg-gradient-to-t from-black/85 via-black/25 to-transparent" : "bg-gradient-to-t from-black/75 via-black/30 to-black/10"}`} />
                <span className={`absolute right-5 top-5 grid size-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} aria-hidden>
                  <ArrowUpRight size={20} />
                </span>
                <p className={`absolute inset-x-0 bottom-8 px-3 text-center font-display text-2xl leading-tight text-white transition-opacity duration-300 ${open ? "opacity-0" : "opacity-100"}`}>{item.title}</p>
                <Details item={item} visible={open} />
              </PanelLink>
            </div>
          );
        })}
      </div>

      {/* Phones and tablets: swipeable cards, all details visible */}
      <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:hidden" aria-label="The FlexiGo collection">
        {items.map((item) => (
          <li key={item.key} className="relative h-[26rem] w-[82%] shrink-0 snap-start overflow-hidden rounded-card sm:w-[46%]">
            <PanelLink item={item} className="absolute inset-0 block">
              <Image src={item.image} alt="" fill sizes="(min-width: 640px) 46vw, 82vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <Details item={item} visible />
            </PanelLink>
          </li>
        ))}
      </ul>
    </>
  );
}
