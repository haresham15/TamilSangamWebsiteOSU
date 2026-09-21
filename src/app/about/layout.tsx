import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us & FAQ",
  description:
    "Learn about the mission, 2000-year classical heritage, history at Ohio State, student constitution, campus partners, and frequently asked questions about OSU Tamil Sangam.",
  openGraph: {
    title: "About Us & FAQ | OSU Tamil Sangam",
    description:
      "Learn about the mission, classical heritage, student constitution, campus partners, and frequently asked questions about OSU Tamil Sangam.",
    url: "https://osutamilsangam.org/about",
  },
  alternates: {
    canonical: "https://osutamilsangam.org/about",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
