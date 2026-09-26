import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/global/JsonLd";

export const metadata: Metadata = {
  title: "Campus Blueprint & Student Suggestions",
  description:
    "Explore our interactive 3D architectural campus blueprint. Shape the future of OSU Tamil Sangam by submitting your ideas, event concepts, and community feedback directly to our student board.",
  keywords: [
    "OSU Tamil Sangam suggestions",
    "Tamil Sangam student ideas",
    "Ohio State Tamil community feedback",
    "Tamil campus blueprint",
    "student organization governance Ohio State",
  ],
  alternates: {
    canonical: "https://osutamilsangam.org/suggestions",
  },
  openGraph: {
    title: "Blueprint & Suggestions | OSU Tamil Sangam",
    description:
      "Explore our interactive 3D architectural campus blueprint. Shape the future of OSU Tamil Sangam by submitting your ideas directly to our student board.",
    url: "https://osutamilsangam.org/suggestions",
    siteName: "OSU Tamil Sangam",
    type: "website",
    images: [
      {
        url: "/emblem.svg",
        width: 500,
        height: 500,
        alt: "OSU Tamil Sangam Campus Blueprint",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blueprint & Suggestions | OSU Tamil Sangam",
    description:
      "Submit ideas, event feedback, and community proposals to OSU Tamil Sangam.",
    images: ["/emblem.svg"],
  },
};

export default function SuggestionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbItems = [
    { name: "Home", url: "https://osutamilsangam.org" },
    { name: "Suggestions & Blueprint", url: "https://osutamilsangam.org/suggestions" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {children}
    </>
  );
}
