import type { ReactNode } from "react";

export function SectionHeading({ eyebrow, title, children, id }: { eyebrow: string; title: string; children?: ReactNode; id?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine-dark">{eyebrow}</p>
      <h2 id={id} data-reveal className="mt-2.5 text-[1.9rem] sm:text-[2.4rem]">
        {title}
      </h2>
      {children && (
        <p data-reveal className="mt-3 text-base text-muted sm:text-lg">
          {children}
        </p>
      )}
    </div>
  );
}
