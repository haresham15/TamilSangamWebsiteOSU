import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events & Festivals",
  description:
    "Explore upcoming festivals, ticket drops, and campus gatherings hosted by OSU Tamil Sangam. Join us for cultural celebrations, lawn picnics, and street food nights.",
  openGraph: {
    title: "Events & Festivals | OSU Tamil Sangam",
    description:
      "Explore upcoming festivals, ticket drops, and campus gatherings hosted by OSU Tamil Sangam. Join us for cultural celebrations, lawn picnics, and street food nights.",
    url: "https://osutamilsangam.org/events",
  },
  alternates: {
    canonical: "https://osutamilsangam.org/events",
  },
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
