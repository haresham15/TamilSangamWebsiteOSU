import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Official Bio Links & Socials",
  description:
    "Fast link-in-bio gateway for OSU Tamil Sangam. Quick access to GroupMe, Instagram, event ticket reservations, and dance audition forms.",
  openGraph: {
    title: "Official Bio Links & Socials | OSU Tamil Sangam",
    description:
      "Fast link-in-bio gateway for OSU Tamil Sangam. Quick access to GroupMe, Instagram, event tickets, and forms.",
    url: "https://osutamilsangam.org/links",
  },
  alternates: {
    canonical: "https://osutamilsangam.org/links",
  },
};

export default function LinksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
