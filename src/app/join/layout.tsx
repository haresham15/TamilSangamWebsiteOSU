import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join Sangam & Auditions",
  description:
    "Become a member of OSU Tamil Sangam! Zero membership dues. Join our GroupMe, follow on Instagram, and sign up for collegiate dance, music, and board committees.",
  openGraph: {
    title: "Join Sangam & Auditions | OSU Tamil Sangam",
    description:
      "Become a member of OSU Tamil Sangam! Zero dues. Join our GroupMe, follow on Instagram, and sign up for dance, music, and committees.",
    url: "https://osutamilsangam.org/join",
  },
  alternates: {
    canonical: "https://osutamilsangam.org/join",
  },
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
