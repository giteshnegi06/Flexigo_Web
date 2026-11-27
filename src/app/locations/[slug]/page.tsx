// A location's page: every home there, with filters (price, type, bedrooms), sorting and photo cards.
// Opened from the location cards under the home page hero.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getLocation, getLocations } from "@/lib/api";
import { LocationListing } from "@/components/location/LocationListing";

export async function generateStaticParams() {
  const locations = await getLocations();
  return locations.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/locations/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = await getLocation(slug);
  if (!data) return { title: "Location not found" };
  const { location, homes } = data;
  return {
    title: `Holiday homes in ${location.name}`,
    description: location.description || `${homes.length} holiday homes in ${location.name} by FlexiGo Stays. See live prices and book direct with the host.`,
    openGraph: { images: [{ url: location.image }] },
  };
}

async function LocationContent({ params }: { params: PageProps<"/locations/[slug]">["params"] }) {
  const { slug } = await params;
  const data = await getLocation(slug);
  if (!data) notFound();
  return <LocationListing location={data.location} homes={data.homes} />;
}

export default function LocationPage(props: PageProps<"/locations/[slug]">) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-site px-4 pt-28 text-muted">Loading the homes...</div>}>
      <LocationContent params={props.params} />
    </Suspense>
  );
}
