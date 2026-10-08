import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy for FAQ popularity",
  description: "How OSU Tamil Sangam uses anonymous aggregate FAQ engagement to improve its guide board.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-[100dvh] bg-surface-base px-5 py-28 text-ink-primary sm:px-8">
      <article className="mx-auto max-w-3xl border-l-2 border-action-primary pl-6 sm:pl-10">
        <p className="font-mono text-xs tracking-[0.16em] text-action-primary">OSU TAMIL SANGAM · PRIVACY NOTE</p>
        <h1 className="mt-5 font-display text-[clamp(2.25rem,7vw,4.8rem)] leading-[0.94]">Anonymous FAQ popularity</h1>
        <div className="mt-10 space-y-6 font-body text-base leading-8 text-ink-secondary">
          <p>
            When you intentionally open an FAQ, select it on the departure board, or submit a matching search, the site may add one anonymous aggregate count for that FAQ.
          </p>
          <p>
            We do not store raw IP addresses, cookies, account identities, FAQ reading histories, or third-party analytics data for this feature. A short-lived daily HMAC-derived value prevents repeated counting of the same FAQ by the same visitor for 24 hours.
          </p>
          <p>
            These daily aggregates are kept locally to rank the guide&apos;s most useful FAQ. Counts decay over time and the board falls back to the editorial &ldquo;How do I join?&rdquo; answer when there is not enough activity to form a meaningful ranking.
          </p>
          <p>
            This implementation is local to the site&apos;s server. If the club later adopts hosted storage, this disclosure and the implementation will be reviewed before that change ships.
          </p>
        </div>
      </article>
    </main>
  );
}
