// A line icon inside a small outlined circle, like the amenity icons on StayVista.
import type { LucideIcon } from "lucide-react";
import {
  Armchair,
  ArrowUpDown,
  Baby,
  Bath,
  BedDouble,
  BookOpen,
  Mountain,
  Sofa,
  Utensils,
  BriefcaseMedical,
  Building2,
  Car,
  Check,
  CookingPot,
  Flame,
  Laptop,
  Refrigerator,
  ShieldAlert,
  Trees,
  Tv,
  WashingMachine,
  Wifi,
  Zap,
} from "lucide-react";

const rules: [RegExp, LucideIcon][] = [
  [/balcony|view|mountain|valley/i, Mountain],
  [/reading|library|book/i, BookOpen],
  [/swing/i, Armchair],
  [/living room|chandelier|sofa/i, Sofa],
  [/dining|bar rack|meals/i, Utensils],
  [/bathroom|geyser/i, Bath],
  [/bedroom/i, BedDouble],
  [/heater|warm|fireplace/i, Flame],
  [/tv|ott/i, Tv],
  [/linen|towel/i, WashingMachine],
  [/refrigerator|induction|kettle/i, Refrigerator],
  [/cookware|plates|cutlery|kitchen/i, CookingPot],
  [/wi-?fi/i, Wifi],
  [/workspace|desk/i, Laptop],
  [/gas/i, ShieldAlert],
  [/first aid/i, BriefcaseMedical],
  [/power/i, Zap],
  [/gated|reception|community/i, Building2],
  [/terrace|garden|gazebo/i, Trees],
  [/parking/i, Car],
  [/lift/i, ArrowUpDown],
  [/children|play/i, Baby],
];

export function iconFor(label: string): LucideIcon {
  return rules.find(([re]) => re.test(label))?.[1] ?? Check;
}

export function IconCircle({ icon: Icon, size = 40, tone = "light" }: { icon: LucideIcon | React.ComponentType<{ size?: number }>; size?: number; tone?: "light" | "dark" }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full border ${tone === "dark" ? "border-white/20 text-pine" : "border-forest/10 bg-card text-forest"}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Icon size={Math.round(size * 0.45)} />
    </span>
  );
}
