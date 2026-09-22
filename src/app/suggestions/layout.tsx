import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blueprint & Suggestions",
  description:
    "Explore our interactive 3D architectural campus blueprint. Shape the future of OSU Tamil Sangam by submitting your ideas, event concepts, and community feedback directly to our student board.",
  openGraph: {
    title: "Blueprint & Suggestions | OSU Tamil Sangam",
    description:
      "Explore our interactive 3D architectural campus blueprint. Shape the future of OSU Tamil Sangam by submitting your ideas directly to our student board.",
    url: "https://osutamilsangam.org/suggestions",
  },
  alternates: {
    canonical: "https://osutamilsangam.org/suggestions",
  },
};

export default function SuggestionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
