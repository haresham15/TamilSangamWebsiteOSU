import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/global/JsonLd";

export const metadata: Metadata = {
  title: "Photo Gallery & Festival Archives",
  description:
    "Browse high-resolution event photographs, festival memories, and performance albums from OSU Tamil Sangam celebrations at Ohio State.",
  keywords: [
    "OSU Tamil Sangam Gallery",
    "Tamil Sangam photo archives",
    "Ohio State cultural festival photos",
    "Diwali night photos Ohio State",
    "Bharatanatyam performances Columbus photos",
    "Tamil student community gallery",
    "Aatam Paatam Kondatam photos",
  ],
  alternates: {
    canonical: "https://osutamilsangam.org/gallery",
  },
  openGraph: {
    title: "Photo Gallery & Archives | OSU Tamil Sangam",
    description:
      "Browse high-resolution event photographs, festival memories, and performance albums from OSU Tamil Sangam celebrations at Ohio State.",
    url: "https://osutamilsangam.org/gallery",
    siteName: "OSU Tamil Sangam",
    type: "website",
    images: [
      {
        url: "/gallery/diwali-2025/diwali_1.webp",
        width: 1200,
        height: 800,
        alt: "OSU Tamil Sangam Event Photography Showcase",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Photo Gallery & Archives | OSU Tamil Sangam",
    description:
      "Browse high-resolution event photographs and cultural performances from OSU Tamil Sangam.",
    images: ["/gallery/diwali-2025/diwali_1.webp"],
  },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbItems = [
    { name: "Home", url: "https://osutamilsangam.org" },
    { name: "Photo Gallery", url: "https://osutamilsangam.org/gallery" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {children}
    </>
  );
}
