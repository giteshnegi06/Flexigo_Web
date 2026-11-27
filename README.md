# Flexigo_Web: FlexiGo Stays website

The public website for **FlexiGo Stays**, three holiday homes in Shimla run by Flexigo Holidays. Guests browse the homes, see live prices, pick dates on a calendar that highlights Indian holidays, and send a booking request.

This repository holds the **frontend only**. Prices, availability, holidays, reviews and booking requests come from the separate FlexiGo Stays backend API (Hono + Neon Postgres). The site needs that API running to build and work.

## Built with

- [Next.js 16](https://nextjs.org) (App Router, Cache Components) with React 19 and TypeScript
- [Tailwind CSS 4](https://tailwindcss.com) with the site's colour tokens in `src/app/globals.css`
- [GSAP](https://gsap.com) and [Lenis](https://lenis.darkroom.engineering) for animation and smooth scrolling
- [Lucide](https://lucide.dev) icons, and Radix Avatar for the review cards

## Getting started

You need Node.js 20 or newer, and the backend API running (by default at `http://localhost:4000`).

```bash
npm install
cp .env.example .env.local   # then set the API address if it is not localhost:4000
npm run dev                  # http://localhost:3000
```

### Settings (`.env.local`)

| Name | What it is |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Address of the backend API, for example `http://localhost:4000` |
| `NEXT_PUBLIC_SITE_URL` | Public address of this website, used for links and social previews |

Never commit `.env.local`. It is already ignored by git.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production (the API must be reachable, because pages are prerendered from it) |
| `npm run start` | Serve the production build |
| `npm run lint` | Check the code with ESLint |

On a machine with little memory, build with `NODE_OPTIONS=--max-old-space-size=2048 npm run build`.

## Pages

| Path | Page |
| --- | --- |
| `/` | Home: hero slideshow with search, the homes, a day in Shimla, moving guest reviews |
| `/homes/[slug]` | One home: photo tour, section menu, rooms, amenities, reviews, booking card |
| `/book` | Check availability and send a booking request |
| `/compare` | The three homes side by side |
| `/stays/[type]` | Stays for families, couples, workation, friends |
| `/guide` | Shimla guide |
| `/about` | About the host |
| `/privacy-policy`, `/cancellation-policy`, `/terms` | Policies (`/policies` links to all three) |

## Folder layout

```
src/
  app/                 pages (Next.js App Router)
  components/
    home/              hero, search bar, home cards, photo tour, section menu
    search/            date-range calendar with holidays, home and guest pickers
    booking/           booking card with live quote and request form
    layout/            header, footer, floating WhatsApp and call buttons
    legal/             shared layout for the policy pages
    motion/            smooth scrolling and reveal-on-scroll
    ui/                buttons, icons, avatar, infinite slider, testimonials
  lib/                 API calls, types, formatting and small hooks
```

## Before launch

- The cancellation and refund rules and the house rules in `/cancellation-policy` and `/terms` are drafts, marked `CONFIRM` in the code. The client must approve them, and a lawyer should review all three policy pages.
- Holiday dates are managed in the admin panel. Festivals that follow the moon can move by a day, so check each new year's government list.
