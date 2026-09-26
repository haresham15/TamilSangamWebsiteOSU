import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/global/JsonLd";

export const metadata: Metadata = {
  title: "Official Bio Links & Social Channels",
  description:
    "Fast link-in-bio gateway for OSU Tamil Sangam. Quick access to our student GroupMe, Instagram page, Linktree alternatives, event tickets, and feedback forms.",
  keywords: [
    "OSU Tamil Sangam Links",
    "Tamil Sangam Instagram",
    "OSU Tamil Sangam Linktree",
    "Tamil Sangam GroupMe link",
    "Ohio State Tamil social media",
  ],
  alternates: {
    canonical: "https://osutamilsangam.org/links",
  },
  openGraph: {
    title: "Official Bio Links & Socials | OSU Tamil Sangam",
    description:
      "Fast link-in-bio gateway for OSU Tamil Sangam. Quick access to GroupMe, Instagram, event tickets, and forms.",
    url: "https://osutamilsangam.org/links",
    siteName: "OSU Tamil Sangam",
    type: "website",
    images: [
      {
        url: "/emblem.svg",
        width: 500,
        height: 500,
        alt: "OSU Tamil Sangam Link-in-Bio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Official Bio Links & Socials | OSU Tamil Sangam",
    description:
      "Fast link-in-bio gateway for OSU Tamil Sangam social channels and event tickets.",
    images: ["/emblem.svg"],
  },
};

export default function LinksLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbItems = [
    { name: "Home", url: "https://osutamilsangam.org" },
    { name: "Official Links", url: "https://osutamilsangam.org/links" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {children}
    </>
  );
}
