import { notFound } from "next/navigation";
import { EVENTS } from "@/data/events";
import { getRandomizedEventPhotos } from "@/lib/event-photos";
import { EventDossierView } from "@/components/events/EventDossierView";

// Ensure Next.js App Router performs fresh server-side shuffle on every request
export const dynamic = "force-dynamic";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Event Dossier Page (/events/[slug]).
 * Server Component executing Phase 1 Server-Side Randomizer:
 * Reads local event photo pool, shuffles array, slices 5-8 images,
 * and passes down to client components without layout shifting or runtime scraping.
 */
export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = EVENTS.find((e) => e.slug === slug);

  if (!event) {
    return notFound();
  }

  // Server-side randomizer: reads public/events/[slug], shuffles, slices 5-8 photos
  const randomizedPhotos = await getRandomizedEventPhotos(slug, 5, 8);

  return <EventDossierView key={event.slug} event={event} photos={randomizedPhotos} />;
}
