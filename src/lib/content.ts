// Fixed marketing content. Everything that changes (homes, prices, reviews) comes from the backend.
import type { GuestType } from "./types";

export const IMG = "https://www.flexigoholidays.com/assets/img/room/";

export const heroPhoto = { src: IMG + "card-room-6.avif", alt: "Terrace gazebo looking across the Shimla hills", width: 1200, height: 800 };

export const dayStory = [
  { time: "7:00", title: "Sunrise chai on the balcony", text: "Mist lifts off the valley while the kettle sings. No alarms, no checkout rush.", src: IMG + "3BHK5.avif", alt: "Balcony swing and chairs" },
  { time: "10:30", title: "A slow breakfast at home", text: "A fully equipped kitchen, or a home-cooked meal arranged by the host.", src: IMG + "card-room-1.avif", alt: "Living and dining area" },
  { time: "14:00", title: "Work, read or explore", text: "Fast Wi-Fi and a quiet desk, the mini library, or a drive to Kufri and Mashobra.", src: IMG + "card-room-7.webp", alt: "Reading corner with books" },
  { time: "18:30", title: "Evening on the terrace", text: "The shared terrace garden and gazebo, with lights coming on across the hills.", src: IMG + "card-room-6.avif", alt: "Terrace gazebo at dusk" },
  { time: "21:30", title: "Warm and quiet nights", text: "Heaters, soft lighting and fresh linen. The only sound is the wind in the pines.", src: IMG + "bress-1.jpg", alt: "Bedroom with balcony door" },
];

export const stayTypes: { type: Exclude<GuestType, "general">; title: string; text: string; slug: string }[] = [
  { type: "family", slug: "families", title: "Families", text: "Space to spread out, a full kitchen, a lift and a play area in the society." },
  { type: "couple", slug: "couples", title: "Couples", text: "Private balconies, warm interiors and quiet nights away from the crowds." },
  { type: "workation", slug: "workation", title: "Workation", text: "High-speed Wi-Fi, a desk with a view and power backup for long stays." },
  { type: "friends", slug: "groups", title: "Friends and groups", text: "Up to eight guests in the 3BHK, with a big table for long dinners." },
];

export const seasons = [
  { name: "Spring", months: "March to May", temp: "8°C to 22°C", text: "Blossom, clear skies and the best walking weather.", src: IMG + "3BHK1.jpg" },
  { name: "Monsoon", months: "July to September", temp: "15°C to 24°C", text: "Green hills, clouds drifting below the balcony and quiet roads.", src: IMG + "card-room-3.avif" },
  { name: "Autumn", months: "October to November", temp: "6°C to 20°C", text: "Crisp air and the longest views of the year.", src: IMG + "bress-1.jpg" },
  { name: "Winter", months: "December to February", temp: "-2°C to 12°C", text: "Chances of snow, heaters on and hot chocolate by the window.", src: IMG + "2bhk-5.avif" },
];

export const faqs = [
  { q: "How far are the homes from Mall Road?", a: "Guests usually reach Mall Road and the Ridge in about 25 to 30 minutes by car. The homes are in a quiet gated community away from the crowds." },
  { q: "What are the check-in and check-out times?", a: "Check-in is from 1 pm and check-out is by 11 am. Early check-in or late check-out can be arranged when the home is free." },
  { q: "Is food available?", a: "Each home has a fully equipped kitchen. The host can also arrange home-cooked meals or help you order in." },
  { q: "Are the homes warm in winter?", a: "Yes. Every home has room heaters, geysers and warm bedding, and power backup keeps them running." },
  { q: "Can I book directly instead of on Airbnb?", a: "Yes. Choose your dates on this website to see the total price, then send a request or pay an advance. The homes are also listed on Airbnb." },
];
