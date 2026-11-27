// "Location" section on a home's page: a Google map from the pin saved in the database, with links to open it
// in Google Maps. Until the host sets the exact pin (admin panel > Homes), the map shows the area only,
// zoomed out a little, and says the exact address is shared after booking.
import { Car, ExternalLink, MapPin, Navigation } from "lucide-react";

type Props = {
  name: string;
  town: string;
  inShimla: boolean;
  lat: number;
  lng: number;
  exact: boolean;
};

export function LocationMap({ name, town, inShimla, lat, lng, exact }: Props) {
  const point = `${lat},${lng}`;
  const embed = `https://maps.google.com/maps?q=${point}&z=${exact ? 16 : 14}&hl=en&output=embed`;
  const open = `https://www.google.com/maps/search/?api=1&query=${point}`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${point}`;

  return (
    <>
      <p className="mt-3 flex items-start gap-2 text-muted">
        <MapPin
          size={18}
          className="mt-0.5 shrink-0 text-pine-dark"
          aria-hidden
        />
        {exact
          ? `${name} is in ${town}.`
          : `${name} is in ${town}. The map shows the area; the exact address is shared once your booking is confirmed.`}
      </p>
      <div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-card border border-line bg-stone sm:aspect-[16/9]">
        <iframe
          src={embed}
          title={`Map showing where ${name} is in ${town}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 size-full border-0"
          allowFullScreen
        />
      </div>
      {/* Travel notes for the Shimla homes; homes in other places show just the map. */}
      {inShimla && (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          <li className="flex items-center gap-3 rounded-xl border border-line bg-card p-3.5 text-sm">
            <Car size={18} className="shrink-0 text-pine-dark" aria-hidden />{" "}
            About 25 to 30 min by car to Mall Road and the Ridge
          </li>
          <li className="flex items-center gap-3 rounded-xl border border-line bg-card p-3.5 text-sm">
            <MapPin size={18} className="shrink-0 text-pine-dark" aria-hidden />{" "}
            Free parking inside the gated community
          </li>
        </ul>
      )}
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-forest">
        <a
          href={open}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 underline-offset-4 hover:underline"
        >
          <ExternalLink size={16} aria-hidden /> Open in Google Maps
        </a>
        {exact && (
          <a
            href={directions}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 underline-offset-4 hover:underline"
          >
            <Navigation size={16} aria-hidden /> Get directions
          </a>
        )}
      </div>
    </>
  );
}
