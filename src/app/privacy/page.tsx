import type { Metadata } from "next";
import Link from "next/link";
import { buildRouteMetadata, ROUTE_METADATA } from "@/lib/seo";
import { Eyebrow } from "@/components/muttram/Eyebrow";

export const metadata: Metadata = buildRouteMetadata({
  title: ROUTE_METADATA.privacy.title,
  description: ROUTE_METADATA.privacy.description,
  path: ROUTE_METADATA.privacy.path,
});

export default function PrivacyPage() {
  return (
    <div className="texture-khadi min-h-[100dvh] bg-bg-ivory pt-32 pb-28 text-ink-earth selection:bg-brand-teal/20">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <article
          aria-labelledby="privacy-title"
          className="max-w-[65ch] border-l-2 border-accent-bronze pl-6 sm:pl-10"
        >
          <Eyebrow as="p">OSU Tamil Sangam · Privacy note</Eyebrow>
          <h1
            id="privacy-title"
            className="mt-5 font-serif text-[clamp(2.25rem,7vw,4.8rem)] leading-[0.98] text-ink-earth"
          >
            Anonymous FAQ popularity
          </h1>
          <div className="mt-10 space-y-6 font-sans text-base leading-8 text-ink-umber">
            <p>
              When you intentionally open an FAQ, select it on the departure board, or submit a matching search, the site may add one anonymous aggregate count for that FAQ.
            </p>
            <p>
              We do not store raw IP addresses, cookies, account identities, FAQ reading histories, or third-party analytics data for this feature. A short-lived daily HMAC-derived value prevents repeated counting of the same FAQ by the same visitor for 24 hours.
            </p>
            <p>
              These daily aggregates are kept locally to rank the{" "}
              <Link
                href="/guide"
                className="font-medium text-brand-teal underline decoration-brand-teal/40 underline-offset-4 hover:decoration-brand-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
              >
                guide&apos;s
              </Link>{" "}
              most useful FAQ. Counts decay over time and the board falls back to the editorial &ldquo;How do I join?&rdquo; answer when there is not enough activity to form a meaningful ranking.
            </p>
            <p>
              This implementation is local to the site&apos;s server. If the club later adopts hosted storage, this disclosure and the implementation will be reviewed before that change ships.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
