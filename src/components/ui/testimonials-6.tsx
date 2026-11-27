"use client";
// Moving review cards (21st.dev "testimonials-6"): columns of cards that drift upward at different speeds,
// fading out at the top and bottom, and slowing down under the mouse.
// Adapted for FlexiGo: real guest reviews come in as props (no sample quotes), avatars show initials,
// colours use the site palette, the number of columns follows the screen width so no review is hidden on phones,
// there is a pause button (moving content must be stoppable), and visitors who prefer reduced motion get a still grid.
import { useState } from "react";
import { Pause, Play, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company?: string;
  image?: string;
  rating?: number;
};

type Props = {
  testimonials: Testimonial[];
  eyebrow?: string;
  title: string;
  description?: string;
  titleId?: string;
};

const speeds = [
  { speed: 30, speedOnHover: 12 },
  { speed: 44, speedOnHover: 18 },
  { speed: 36, speedOnHover: 14 },
];

export function TestimonialsSection({ testimonials, eyebrow = "Testimonials", title, description, titleId }: Props) {
  const [paused, setPaused] = useState(false);
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const md = useMediaQuery("(min-width: 768px)");
  const lg = useMediaQuery("(min-width: 1024px)");
  const count = lg ? 3 : md ? 2 : 1;
  // Deal the cards into columns in turn, so each column gets a mix of short and long reviews.
  const columns = Array.from({ length: count }, (_, c) => testimonials.filter((_, i) => i % count === c));

  return (
    <div className="relative">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
        <span className="rounded-full border border-line bg-card px-4 py-1 text-sm font-medium text-forest">{eyebrow}</span>
        <h2 id={titleId} className="text-3xl sm:text-4xl lg:text-[2.75rem]">{title}</h2>
        {description && <p className="text-muted">{description}</p>}
      </div>

      {reduce ? (
        <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <li key={t.name + t.quote.slice(0, 20)}>
              <TestimonialsCard testimonial={t} className="max-w-none" />
            </li>
          ))}
        </ul>
      ) : (
        <>
          <div
            className={cn(
              "mt-10 flex max-h-160 justify-center gap-6 overflow-hidden",
              "mask-[linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]",
            )}
          >
            {columns.map((col, c) => (
              <InfiniteSlider key={`${count}-${c}`} direction="vertical" gap={24} paused={paused} {...speeds[c]} className="w-full max-w-sm md:max-w-xs">
                {col.map((t) => (
                  <TestimonialsCard key={t.name + t.quote.slice(0, 20)} testimonial={t} />
                ))}
              </InfiniteSlider>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-5 text-sm font-semibold text-forest transition hover:border-forest"
            >
              {paused ? <Play size={16} aria-hidden /> : <Pause size={16} aria-hidden />}
              {paused ? "Play reviews" : "Pause reviews"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function TestimonialsCard({ testimonial, className, ...props }: React.ComponentProps<"figure"> & { testimonial: Testimonial }) {
  const { quote, image, name, role, company, rating } = testimonial;
  return (
    <figure className={cn("w-full max-w-sm rounded-3xl border border-line bg-card p-7 shadow-lg shadow-forest/[0.06] md:max-w-xs", className)} {...props}>
      {rating ? (
        <div className="flex gap-0.5 text-pine" role="img" aria-label={`${rating} out of 5 stars`}>
          {Array.from({ length: rating }, (_, i) => (
            <Star key={i} size={15} fill="currentColor" aria-hidden />
          ))}
        </div>
      ) : null}
      <blockquote className="mt-3 text-[0.97rem] leading-relaxed text-ink">“{quote}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <Avatar className="size-10">
          {image && <AvatarImage alt="" src={image} />}
          <AvatarFallback>{initials(name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <cite className="font-semibold not-italic leading-5 text-ink">{name}</cite>
          <span className="text-sm leading-5 text-muted">
            {role}
            {company && `, ${company}`}
          </span>
        </div>
      </figcaption>
    </figure>
  );
}

export default TestimonialsSection;
